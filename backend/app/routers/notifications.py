from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Dict
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.academic import Notification
from app.models.user import User
from app.schemas.academic import NotificationOut

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

class ConnectionManager:
    def __init__(self):
        self.active: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, ws: WebSocket):
        await ws.accept()
        self.active[user_id] = ws

    def disconnect(self, user_id: int):
        self.active.pop(user_id, None)

    async def send_to_user(self, user_id: int, message: dict):
        ws = self.active.get(user_id)
        if ws:
            await ws.send_json(message)

    async def broadcast(self, message: dict):
        for ws in self.active.values():
            await ws.send_json(message)

manager = ConnectionManager()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id)

@router.get("", response_model=List[NotificationOut])
def get_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()

@router.put("/{notif_id}/read")
def mark_read(notif_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    n = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == current_user.id
    ).first()
    if n:
        n.is_read = True
        db.commit()
    return {"message": "Marked as read"}

@router.put("/read-all")
def mark_all_read(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All read"}