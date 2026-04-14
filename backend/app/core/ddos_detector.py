import time
from collections import defaultdict, deque
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

RATE_LIMIT_WINDOW = 10
RATE_LIMIT_MAX_REQ = 20
BLOCK_DURATION = 60

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

def get_client_ip(request: Request) -> str:
    # Барлық мүмкін header-лерді тексер
    for header in ["X-Real-IP", "X-Forwarded-For", "CF-Connecting-IP", "True-Client-IP"]:
        value = request.headers.get(header)
        if value:
            return value.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

class DDoSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        now = time.time()
        ip = get_client_ip(request)
        path = request.url.path

        stats.total_requests += 1
        ip_data = stats.ip_stats[ip]
        ip_data.total_requests += 1

        # Блоктауды тексер
        if ip_data.blocked_until and now < ip_data.blocked_until:
            stats.total_blocked += 1
            remaining = int(ip_data.blocked_until - now)
            return JSONResponse(status_code=429, content={
                "error": "Too Many Requests",
                "message": f"IP блокталды. {remaining} секундтан кейін қайталаңыз.",
                "ip": ip,
                "retry_after": remaining
            })

        if ip_data.blocked_until and now > ip_data.blocked_until:
            ip_data.blocked_until = 0.0
            ip_data.request_times.clear()

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
                "message": f"IP {ip} блокталды ({req_count} сұраныс/{RATE_LIMIT_WINDOW}сек)"
            })
            if len(stats.attack_events) > 100:
                stats.attack_events = stats.attack_events[-100:]
            return JSONResponse(status_code=429, content={
                "error": "Too Many Requests",
                "message": f"Сіз блокталдыңыз. {BLOCK_DURATION} секундтан кейін қайталаңыз.",
                "ip": ip
            })

        return await call_next(request)


def get_ddos_stats():
    now = time.time()
    blocked_ips = [
        {
            "ip": ip,
            "remaining_seconds": int(data.blocked_until - now),
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
        "recent_attack_events": stats.attack_events[-20:],
        "all_ips": [
            {
                "ip": ip,
                "total_requests": data.total_requests,
                "blocked_count": data.blocked_count,
                "is_blocked": data.blocked_until > now
            }
            for ip, data in stats.ip_stats.items()
        ],
        "config": {
            "window_seconds": RATE_LIMIT_WINDOW,
            "max_requests": RATE_LIMIT_MAX_REQ,
            "block_duration": BLOCK_DURATION
        }
    }