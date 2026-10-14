import uuid
from fastapi import APIRouter, Depends
from ..database import get_db
from ..schemas import ClubPartnershipCreate
from .auth import get_current_user_id

router = APIRouter(prefix="/api/clubs", tags=["Clubs"])

@router.get("")
def list_clubs():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT cl.*, c.name as college_name, c.short_name as college_short_name, u.name as lead_name
            FROM clubs cl
            JOIN colleges c ON cl.college_id = c.college_id
            LEFT JOIN users u ON cl.lead_user_id = u.user_id
            ORDER BY cl.name ASC
        """)
        return [dict(r) for r in cursor.fetchall()]

@router.post("/partnerships")
def propose_partnership(
    data: ClubPartnershipCreate,
    sender_club_id: str = None,
    current_user_id: str = Depends(get_current_user_id)
):
    with get_db() as conn:
        cursor = conn.cursor()
        s_club = data.sender_club_id or sender_club_id
        if not s_club:
            cursor.execute("SELECT college_id FROM users WHERE user_id = ?", (current_user_id,))
            u_row = cursor.fetchone()
            u_col = u_row["college_id"] if u_row else None
            cursor.execute("SELECT club_id FROM clubs WHERE lead_user_id = ? OR college_id = ? LIMIT 1", (current_user_id, u_col))
            club_row = cursor.fetchone()
            s_club = club_row["club_id"] if club_row else "clb_dtu_ai"

        pid = f"prt_{uuid.uuid4().hex[:8]}"
        cursor.execute("INSERT INTO club_partnerships VALUES (?, ?, ?, ?, ?, 'Pending', CURRENT_TIMESTAMP)", (pid, s_club, data.recipient_club_id, data.title, data.proposal))
        return {"status": "success", "partnership_id": pid}

@router.put("/partnerships/{partnership_id}/status")
def update_partnership_status(partnership_id: str, payload: dict):
    new_status = payload.get("status", "Accepted")
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE club_partnerships SET status = ? WHERE partnership_id = ?", (new_status, partnership_id))
        return {"status": "success"}

@router.get("/partnerships")
def list_partnerships():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT cp.*, c1.name as sender_club_name, col1.short_name as sender_college,
                   c2.name as recipient_club_name, col2.short_name as recipient_college
            FROM club_partnerships cp
            JOIN clubs c1 ON cp.sender_club_id = c1.club_id
            JOIN colleges col1 ON c1.college_id = col1.college_id
            JOIN clubs c2 ON cp.recipient_club_id = c2.club_id
            JOIN colleges col2 ON c2.college_id = col2.college_id
            ORDER BY cp.created_at DESC
        """)
        return [dict(r) for r in cursor.fetchall()]
