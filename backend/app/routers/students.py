import uuid
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from ..database import get_db
from ..schemas import UserUpdate
from .auth import get_current_user_id

router = APIRouter(prefix="/api", tags=["Students"])

@router.get("/colleges")
def list_colleges():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM colleges ORDER BY name ASC")
        return [dict(r) for r in cursor.fetchall()]

@router.get("/skills")
def list_skills():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM skills ORDER BY category, name ASC")
        return [dict(r) for r in cursor.fetchall()]

@router.get("/interests")
def list_interests():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM interests ORDER BY category, name ASC")
        return [dict(r) for r in cursor.fetchall()]

@router.get("/students")
def discover_students(
    search: Optional[str] = None,
    skill: Optional[str] = None,
    interest: Optional[str] = None,
    college_id: Optional[str] = None,
    collaboration_mode: Optional[str] = None,
    exclude_user_id: Optional[str] = None
):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT u.user_id, u.name, u.email, u.headline, u.bio, u.college_id,
                   u.availability_hours, u.collaboration_mode, u.verification_status,
                   u.avatar_url, u.github_url, u.portfolio_url,
                   c.name as college_name, c.short_name as college_short_name, c.location as college_location
            FROM users u
            LEFT JOIN colleges c ON u.college_id = c.college_id
            WHERE 1=1
        """
        params = []
        if exclude_user_id:
            query += " AND u.user_id != ?"
            params.append(exclude_user_id)
        if college_id and college_id != "all":
            query += " AND u.college_id = ?"
            params.append(college_id)
        if collaboration_mode and collaboration_mode != "all":
            query += " AND LOWER(u.collaboration_mode) = LOWER(?)"
            params.append(collaboration_mode)
        if search:
            pat = f"%{search}%"
            query += " AND (u.name LIKE ? OR u.headline LIKE ? OR u.bio LIKE ?)"
            params.extend([pat, pat, pat])

        cursor.execute(query, params)
        students = [dict(r) for r in cursor.fetchall()]

        res = []
        for s in students:
            uid = s["user_id"]
            cursor.execute("""
                SELECT s.skill_id, s.name, s.category, us.proficiency, us.can_contribute, us.wants_to_learn
                FROM user_skills us JOIN skills s ON us.skill_id = s.skill_id
                WHERE us.user_id = ?
            """, (uid,))
            s_skills = [dict(r) for r in cursor.fetchall()]

            cursor.execute("""
                SELECT i.interest_id, i.name, i.category
                FROM user_interests ui JOIN interests i ON ui.interest_id = i.interest_id
                WHERE ui.user_id = ?
            """, (uid,))
            s_interests = [dict(r) for r in cursor.fetchall()]

            if skill and skill != "all":
                if skill.lower() not in [sk["name"].lower() for sk in s_skills]:
                    continue
            if interest and interest != "all":
                if interest.lower() not in [it["name"].lower() for it in s_interests]:
                    continue

            s["skills"] = s_skills
            s["interests"] = s_interests
            res.append(s)

        return res

@router.get("/students/{user_id}")
def get_student_profile(user_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT u.*, c.name as college_name, c.short_name as college_short_name, c.location as college_location
            FROM users u
            LEFT JOIN colleges c ON u.college_id = c.college_id
            WHERE u.user_id = ?
        """, (user_id,))
        u = cursor.fetchone()
        if not u:
            raise HTTPException(status_code=404, detail="Student not found")

        cursor.execute("""
            SELECT s.skill_id, s.name, s.category, us.proficiency, us.can_contribute, us.wants_to_learn
            FROM user_skills us JOIN skills s ON us.skill_id = s.skill_id
            WHERE us.user_id = ?
        """, (user_id,))
        skills = [dict(r) for r in cursor.fetchall()]

        cursor.execute("""
            SELECT i.interest_id, i.name, i.category
            FROM user_interests ui JOIN interests i ON ui.interest_id = i.interest_id
            WHERE ui.user_id = ?
        """, (user_id,))
        interests = [dict(r) for r in cursor.fetchall()]

        cursor.execute("""
            SELECT p.project_id, p.title, p.category, p.status, pm.role
            FROM project_memberships pm
            JOIN projects p ON pm.project_id = p.project_id
            WHERE pm.user_id = ?
        """, (user_id,))
        projects = [dict(r) for r in cursor.fetchall()]

        data = dict(u)
        data["skills"] = skills
        data["interests"] = interests
        data["projects"] = projects
        return data

@router.put("/students/{user_id}")
def update_student_profile(user_id: str, updates: UserUpdate, current_user_id: str = Depends(get_current_user_id)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT user_id FROM users WHERE user_id = ?", (user_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Student not found")

        fields = []
        params = []
        for attr in ["name", "headline", "bio", "college_id", "availability_hours", "collaboration_mode", "github_url", "linkedin_url", "portfolio_url"]:
            val = getattr(updates, attr, None)
            if val is not None:
                fields.append(f"{attr} = ?")
                params.append(val)
        if fields:
            params.append(user_id)
            cursor.execute(f"UPDATE users SET {', '.join(fields)} WHERE user_id = ?", params)

        if updates.skills_contribute is not None or updates.skills_learn is not None:
            cursor.execute("DELETE FROM user_skills WHERE user_id = ?", (user_id,))
            if updates.skills_contribute:
                for s_name in updates.skills_contribute:
                    cursor.execute("SELECT skill_id FROM skills WHERE LOWER(name) = LOWER(?)", (s_name.strip(),))
                    row = cursor.fetchone()
                    sid = row["skill_id"] if row else f"sk_{uuid.uuid4().hex[:6]}"
                    if not row:
                        cursor.execute("INSERT INTO skills (skill_id, name, category) VALUES (?, ?, 'Technical')", (sid, s_name.strip()))
                    cursor.execute("INSERT OR REPLACE INTO user_skills (user_id, skill_id, proficiency, can_contribute, wants_to_learn) VALUES (?, ?, 'Intermediate', 1, 0)", (user_id, sid))
            if updates.skills_learn:
                for s_name in updates.skills_learn:
                    cursor.execute("SELECT skill_id FROM skills WHERE LOWER(name) = LOWER(?)", (s_name.strip(),))
                    row = cursor.fetchone()
                    sid = row["skill_id"] if row else f"sk_{uuid.uuid4().hex[:6]}"
                    if not row:
                        cursor.execute("INSERT INTO skills (skill_id, name, category) VALUES (?, ?, 'Technical')", (sid, s_name.strip()))
                    cursor.execute("INSERT OR REPLACE INTO user_skills (user_id, skill_id, proficiency, can_contribute, wants_to_learn) VALUES (?, ?, 'Beginner', 0, 1)", (user_id, sid))

        if updates.interests is not None:
            cursor.execute("DELETE FROM user_interests WHERE user_id = ?", (user_id,))
            for i_name in updates.interests:
                cursor.execute("SELECT interest_id FROM interests WHERE LOWER(name) = LOWER(?)", (i_name.strip(),))
                row = cursor.fetchone()
                iid = row["interest_id"] if row else f"int_{uuid.uuid4().hex[:6]}"
                if not row:
                    cursor.execute("INSERT INTO interests (interest_id, name, category) VALUES (?, ?, 'General')", (iid, i_name.strip()))
                cursor.execute("INSERT OR REPLACE INTO user_interests (user_id, interest_id) VALUES (?, ?)", (user_id, iid))

        return {"status": "success", "message": "Profile updated"}
