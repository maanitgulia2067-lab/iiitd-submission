import uuid
from fastapi import APIRouter, Depends
from typing import Optional
from ..database import get_db
from ..schemas import SkillOfferCreate, SkillRequestCreate, RequestCreate
from .auth import get_current_user_id

router = APIRouter(prefix="/api/skillshare", tags=["SkillShare"])

@router.get("/offers")
def get_offers(category: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT u.user_id, u.name, u.avatar_url, u.headline, c.short_name as college_name,
                   s.skill_id, s.name as skill_name, s.category as skill_category, us.proficiency
            FROM user_skills us
            JOIN users u ON us.user_id = u.user_id
            LEFT JOIN colleges c ON u.college_id = c.college_id
            JOIN skills s ON us.skill_id = s.skill_id
            WHERE us.can_contribute = 1
            ORDER BY s.name ASC
        """)
        return [dict(r) for r in cursor.fetchall()]

@router.get("/requests")
def get_requests(category: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT u.user_id, u.name, u.avatar_url, u.headline, c.short_name as college_name,
                   s.skill_id, s.name as skill_name, s.category as skill_category, us.proficiency
            FROM user_skills us
            JOIN users u ON us.user_id = u.user_id
            LEFT JOIN colleges c ON u.college_id = c.college_id
            JOIN skills s ON us.skill_id = s.skill_id
            WHERE us.wants_to_learn = 1
            ORDER BY s.name ASC
        """)
        return [dict(r) for r in cursor.fetchall()]

@router.get("/learning-partners")
def get_partners(current_user_id: str = Depends(get_current_user_id)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT s.skill_id, s.name FROM user_skills us JOIN skills s ON us.skill_id = s.skill_id WHERE us.user_id = ? AND us.wants_to_learn = 1", (current_user_id,))
        my_goals = [dict(r) for r in cursor.fetchall()]
        if not my_goals: return []

        cursor.execute("SELECT s.name FROM user_skills us JOIN skills s ON us.skill_id = s.skill_id WHERE us.user_id = ? AND us.can_contribute = 1", (current_user_id,))
        my_offers = {r["name"] for r in cursor.fetchall()}

        g_ids = [g["skill_id"] for g in my_goals]
        cursor.execute("""
            SELECT DISTINCT u.user_id, u.name, u.avatar_url, u.headline, c.short_name as college_name, s.name as can_teach_skill
            FROM user_skills us
            JOIN users u ON us.user_id = u.user_id
            LEFT JOIN colleges c ON u.college_id = c.college_id
            JOIN skills s ON us.skill_id = s.skill_id
            WHERE us.skill_id IN ({}) AND us.can_contribute = 1 AND u.user_id != ?
        """.format(",".join("?" * len(g_ids))), g_ids + [current_user_id])
        rows = [dict(r) for r in cursor.fetchall()]

        for r in rows:
            cursor.execute("SELECT s.name FROM user_skills us JOIN skills s ON us.skill_id = s.skill_id WHERE us.user_id = ? AND us.wants_to_learn = 1", (r["user_id"],))
            p_wants = [row["name"] for row in cursor.fetchall()]
            reciprocal = [o for o in my_offers if o in p_wants]
            r["reciprocal_skills"] = reciprocal
            r["explanation"] = f"Offers {r['can_teach_skill']}" + (f" • Could learn {', '.join(reciprocal)} from you" if reciprocal else "")
        return rows

@router.post("/offer")
def offer_skill(data: SkillOfferCreate, current_user_id: str = Depends(get_current_user_id)):
    with get_db() as conn:
        cursor = conn.cursor()
        s_name = data.skill_name.strip()
        cursor.execute("SELECT skill_id FROM skills WHERE LOWER(name) = LOWER(?)", (s_name,))
        row = cursor.fetchone()
        sid = row["skill_id"] if row else f"sk_{uuid.uuid4().hex[:6]}"
        if not row:
            cursor.execute("INSERT INTO skills (skill_id, name, category) VALUES (?, ?, ?)", (sid, s_name, data.category or "Technical"))
        cursor.execute("""
            INSERT INTO user_skills (user_id, skill_id, proficiency, can_contribute, wants_to_learn)
            VALUES (?, ?, ?, 1, 0)
            ON CONFLICT(user_id, skill_id) DO UPDATE SET can_contribute = 1, proficiency = excluded.proficiency
        """, (current_user_id, sid, data.proficiency or "Intermediate"))
        return {"status": "success", "message": f"Offered {s_name}"}

@router.post("/request")
def request_skill(data: SkillRequestCreate, current_user_id: str = Depends(get_current_user_id)):
    with get_db() as conn:
        cursor = conn.cursor()
        s_name = data.skill_name.strip()
        cursor.execute("SELECT skill_id FROM skills WHERE LOWER(name) = LOWER(?)", (s_name,))
        row = cursor.fetchone()
        sid = row["skill_id"] if row else f"sk_{uuid.uuid4().hex[:6]}"
        if not row:
            cursor.execute("INSERT INTO skills (skill_id, name, category) VALUES (?, ?, ?)", (sid, s_name, data.category or "Technical"))
        cursor.execute("""
            INSERT INTO user_skills (user_id, skill_id, proficiency, can_contribute, wants_to_learn)
            VALUES (?, ?, 'Beginner', 0, 1)
            ON CONFLICT(user_id, skill_id) DO UPDATE SET wants_to_learn = 1
        """, (current_user_id, sid))
        return {"status": "success", "message": f"Requested guidance for {s_name}"}

@router.post("/guidance-request")
def send_guidance_request(data: RequestCreate, current_user_id: str = Depends(get_current_user_id)):
    with get_db() as conn:
        cursor = conn.cursor()
        req_id = f"req_{uuid.uuid4().hex[:8]}"
        cursor.execute("""
            INSERT INTO collaboration_requests (request_id, sender_id, recipient_id, project_id, role_name, request_type, message, status)
            VALUES (?, ?, ?, NULL, ?, 'skill_guidance', ?, 'Pending')
        """, (req_id, current_user_id, data.recipient_id, data.role_name or "Peer Learning Partner", data.message or "I would love to learn from your experience!"))

        cursor.execute("SELECT name FROM users WHERE user_id = ?", (current_user_id,))
        s_name = cursor.fetchone()["name"]
        notif_msg = f"{s_name} requested peer skill guidance from you."
        cursor.execute("INSERT INTO notifications VALUES (?, ?, 'skill_guidance', ?, ?, 0, CURRENT_TIMESTAMP)", (f"notif_{uuid.uuid4().hex[:8]}", data.recipient_id, notif_msg, req_id))
        return {"status": "success", "request_id": req_id}
