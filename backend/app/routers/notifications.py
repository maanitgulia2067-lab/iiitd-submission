import uuid
from fastapi import APIRouter, Depends
from ..database import get_db
from ..schemas import ReportCreate
from .auth import get_current_user_id

router_notifs = APIRouter(prefix="/api/notifications", tags=["Notifications"])
router_mod = APIRouter(prefix="/api/moderation", tags=["Moderation"])

@router_notifs.get("")
def list_notifs(current_user_id: str = Depends(get_current_user_id)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM notifications WHERE recipient_id = ? ORDER BY created_at DESC LIMIT 50", (current_user_id,))
        return [dict(r) for r in cursor.fetchall()]

@router_notifs.put("/{notification_id}/read")
def mark_read(notification_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE notifications SET read_status = 1 WHERE notification_id = ?", (notification_id,))
        return {"status": "success"}

@router_mod.post("/report")
def report_item(data: ReportCreate, current_user_id: str = Depends(get_current_user_id)):
    with get_db() as conn:
        cursor = conn.cursor()
        rid = f"rep_{uuid.uuid4().hex[:8]}"
        cursor.execute("INSERT INTO reports VALUES (?, ?, ?, ?, ?, 'Pending', CURRENT_TIMESTAMP)", (rid, current_user_id, data.reported_entity_type, data.reported_entity_id, data.reason))
        return {"status": "success", "report_id": rid}
