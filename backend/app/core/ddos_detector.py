import time
from collections import defaultdict, deque
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

RATE_LIMIT_WINDOW = 10
RATE_LIMIT_MAX_REQ = 60
ATTACK_THRESHOLD = 40
BLOCK_DURATION = 30

EXCLUDED = ("/static", "/api/stats", "/api/logs", "/docs", "/openapi.json", "/")

class IPStats:
    def __init__(self):
        self.request_times = deque()
        self.blocked_until = 0.0
        self.total_requests = 0
        self.blocked_count = 0

class DDoSStats:
    total_requests = 0
    total_blocked = 0
    attack_events = []
    ip_stats = defaultdict(IPStats)

stats = DDoSStats()

class DDoSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        now = time.time()
        forwarded = request.headers.get("X-Forwarded-For")
        ip = forwarded.split(",")[0].strip() if forwarded else (
            request.client.host if request.client else "unknown"
        )
        endpoint = request.url.path
        stats.total_requests += 1

        if endpoint == "/" or any(endpoint.startswith(e) for e in EXCLUDED):
            return await call_next(request)

        ip_data = stats.ip_stats[ip]
        ip_data.total_requests += 1

        # Блоктауды тексер
        if ip_data.blocked_until and now < ip_data.blocked_until:
            stats.total_blocked += 1
            remaining = int(ip_data.blocked_until - now)
            return JSONResponse(status_code=429, content={
                "error": "Too Many Requests",
                "message": f"IP блокталды. {remaining} секундтан кейін қайталаңыз.",
                "retry_after": remaining
            })

        if ip_data.blocked_until and now > ip_data.blocked_until:
            ip_data.blocked_until = 0.0

        # Sliding window
        cutoff = now - RATE_LIMIT_WINDOW
        while ip_data.request_times and ip_data.request_times[0] < cutoff:
            ip_data.request_times.popleft()

        ip_data.request_times.append(now)
        req_count = len(ip_data.request_times)

        if req_count > RATE_LIMIT_MAX_REQ:
            ip_data.blocked_until = now + BLOCK_DURATION
            ip_data.blocked_count += 1
            stats.total_blocked += 1
            stats.attack_events.append({
                "time": now,
                "ip": ip,
                "req_count": req_count,
                "type": "BLOCK",
                "message": f"IP {ip} блокталды ({req_count} сұраныс)"
            })
            return JSONResponse(status_code=429, content={
                "error": "Too Many Requests",
                "message": "Сіз блокталдыңыз. 30 секундтан кейін қайталаңыз."
            })

        return await call_next(request)


def get_ddos_stats():
    now = time.time()
    blocked_ips = [
        {
            "ip": ip,
            "blocked_until": int(data.blocked_until - now),
            "total_requests": data.total_requests,
            "blocked_count": data.blocked_count
        }
        for ip, data in stats.ip_stats.items()
        if data.blocked_until and now < data.blocked_until
    ]
    return {
        "total_requests": stats.total_requests,
        "total_blocked": stats.total_blocked,
        "blocked_ips": blocked_ips,
        "blocked_ips_count": len(blocked_ips),
        "attack_detected": len(blocked_ips) > 0,
        "recent_attack_events": stats.attack_events[-10:],
        "config": {
            "window_seconds": RATE_LIMIT_WINDOW,
            "max_requests": RATE_LIMIT_MAX_REQ,
            "attack_threshold": ATTACK_THRESHOLD,
            "block_duration": BLOCK_DURATION
        }
    }