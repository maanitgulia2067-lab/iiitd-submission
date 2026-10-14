import uuid
from fastapi import APIRouter, HTTPException, Depends
from ..database import get_db
from ..schemas import RequestCreate, RequestStatusUpdate
from .auth import get_current_user_id

router = APIRouter(prefix="/api/requests", tags=["Requests"])

@router.post("")
def send_request(data: RequestCreate, current_user_id: str = Depends(get_current_user_id)):
    with get_db() as conn:
        cursor = conn.cursor()
        req_id = f"req_{uuid.uuid4().hex[:8]}"
        cursor.execute("""
            INSERT INTO collaboration_requests (request_id, sender_id, recipient_id, project_id, role_name, request_type, message, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
        """, (req_id, current_user_id, data.recipient_id, data.project_id, data.role_name, data.request_type, data.message))

        cursor.execute("SELECT name FROM users WHERE user_id = ?", (current_user_id,))
        s_name = cursor.fetchone()["name"]
        notif_msg = f"{s_name} sent you a {data.request_type.replace('_', ' ')} request."
        cursor.execute("INSERT INTO notifications VALUES (?, ?, 'join_request', ?, ?, 0, CURRENT_TIMESTAMP)", (f"notif_{uuid.uuid4().hex[:8]}", data.recipient_id, notif_msg, req_id))
        return {"status": "success", "request_id": req_id}

@router.get("/inbox")
def get_inbox(current_user_id: str = Depends(get_current_user_id)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT cr.*, u.name as sender_name, u.avatar_url as sender_avatar,
                   u.headline as sender_headline, c.short_name as sender_college,
                   p.title as project_title
            FROM collaboration_requests cr
            JOIN users u ON cr.sender_id = u.user_id
            LEFT JOIN colleges c ON u.college_id = c.college_id
            LEFT JOIN projects p ON cr.project_id = p.project_id
            WHERE cr.recipient_id = ?
            ORDER BY cr.created_at DESC
        """, (current_user_id,))
        return [dict(r) for r in cursor.fetchall()]

@router.get("/sent")
def get_sent(current_user_id: str = Depends(get_current_user_id)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT cr.*, u.name as recipient_name, u.avatar_url as recipient_avatar,
                   c.short_name as recipient_college, p.title as project_title
            FROM collaboration_requests cr
            JOIN users u ON cr.recipient_id = u.user_id
            LEFT JOIN colleges c ON u.college_id = c.college_id
            LEFT JOIN projects p ON cr.project_id = p.project_id
            WHERE cr.sender_id = ?
            ORDER BY cr.created_at DESC
        """, (current_user_id,))
        return [dict(r) for r in cursor.fetchall()]

@router.put("/{request_id}/status")
def update_status(request_id: str, data: RequestStatusUpdate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM collaboration_requests WHERE request_id = ?", (request_id,))
        req = cursor.fetchone()
        if not req: raise HTTPException(status_code=404, detail="Request not found")
        req_dict = dict(req)

        cursor.execute("UPDATE collaboration_requests SET status = ? WHERE request_id = ?", (data.status, request_id))
        if data.status == "Accepted":
            if req_dict["project_id"]:
                uid = req_dict["sender_id"] if req_dict["request_type"] == "join_project" else req_dict["recipient_id"]
                mid = f"mem_{uuid.uuid4().hex[:8]}"
                cursor.execute("INSERT OR REPLACE INTO project_memberships VALUES (?, ?, ?, ?, 'Active', CURRENT_TIMESTAMP)", (mid, req_dict["project_id"], uid, req_dict["role_name"] or "Contributor"))
                cursor.execute("UPDATE project_skill_requirements SET positions_filled = positions_filled + 1 WHERE project_id = ? AND role_name = ?", (req_dict["project_id"], req_dict["role_name"]))
            cursor.execute("INSERT INTO notifications VALUES (?, ?, 'status_update', 'Your collaboration request was accepted!', ?, 0, CURRENT_TIMESTAMP)", (f"notif_{uuid.uuid4().hex[:8]}", req_dict["sender_id"], request_id))
        return {"status": "success"}
