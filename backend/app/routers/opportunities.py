import uuid
from fastapi import APIRouter
from ..database import get_db
from ..schemas import EventCreate

router = APIRouter(prefix="/api/events", tags=["Events"])

@router.get("")
def list_events():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT e.*, u.name as organizer_name
            FROM events e LEFT JOIN users u ON e.organizer_id = u.user_id
            ORDER BY e.deadline ASC, e.start_time ASC
        """)
        return [dict(r) for r in cursor.fetchall()]

@router.post("")
def create_event(data: EventCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        eid = f"evt_{uuid.uuid4().hex[:8]}"
        cursor.execute("INSERT INTO events VALUES (?, 'usr_aarav_01', ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", (eid, data.title, data.category, data.description, data.start_time, data.venue, data.mode, data.eligibility, data.registration_url, data.deadline))
        return {"status": "success", "event_id": eid}
