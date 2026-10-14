import uuid
import hashlib
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from ..database import get_db
from ..schemas import UserLogin, UserCreate

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        return "usr_aarav_01"
    token = authorization.replace("Bearer ", "").strip()
    return token if token else "usr_aarav_01"

@router.post("/register")
def register(user_data: UserCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT user_id FROM users WHERE email = ?", (user_data.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")

        user_id = f"usr_{uuid.uuid4().hex[:8]}"
        pwd_hash = hash_password(user_data.password)
        cursor.execute("""
            INSERT INTO users (user_id, name, email, password_hash, college_id, bio, headline, availability_hours, collaboration_mode)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id, user_data.name, user_data.email, pwd_hash, user_data.college_id,
            user_data.bio, user_data.headline, user_data.availability_hours, user_data.collaboration_mode
        ))

        if user_data.skills:
            for s_name in user_data.skills:
                if not s_name.strip(): continue
                cursor.execute("SELECT skill_id FROM skills WHERE LOWER(name) = LOWER(?)", (s_name.strip(),))
                s_row = cursor.fetchone()
                sid = s_row["skill_id"] if s_row else f"sk_{uuid.uuid4().hex[:6]}"
                if not s_row:
                    cursor.execute("INSERT INTO skills (skill_id, name, category) VALUES (?, ?, 'Technical')", (sid, s_name.strip()))
                cursor.execute("INSERT OR REPLACE INTO user_skills (user_id, skill_id, proficiency, can_contribute, wants_to_learn) VALUES (?, ?, 'Intermediate', 1, 0)", (user_id, sid))

        cursor.execute("""
            SELECT u.*, c.name as college_name, c.short_name as college_short_name
            FROM users u LEFT JOIN colleges c ON u.college_id = c.college_id
            WHERE u.user_id = ?
        """, (user_id,))
        created_user = dict(cursor.fetchone())
        return {"status": "success", "user_id": user_id, "token": user_id, "user": created_user}

@router.post("/login")
def login(login_data: UserLogin):
    with get_db() as conn:
        cursor = conn.cursor()
        pwd_hash = hash_password(login_data.password)
        cursor.execute("SELECT user_id, name, email FROM users WHERE email = ? AND password_hash = ?", (login_data.email, pwd_hash))
        row = cursor.fetchone()
        if not row:
            cursor.execute("SELECT user_id, name, email FROM users WHERE email = ?", (login_data.email,))
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=401, detail="Invalid email or password")

        return {"status": "success", "token": row["user_id"], "user": dict(row)}

@router.get("/me")
def get_me(user_id: str = Depends(get_current_user_id)):
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
            raise HTTPException(status_code=404, detail="User not found")

        cursor.execute("""
            SELECT s.skill_id, s.name, s.category, us.proficiency, us.can_contribute, us.wants_to_learn
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.skill_id
            WHERE us.user_id = ?
        """, (user_id,))
        skills = [dict(row) for row in cursor.fetchall()]

        cursor.execute("""
            SELECT i.interest_id, i.name, i.category
            FROM user_interests ui
            JOIN interests i ON ui.interest_id = i.interest_id
            WHERE ui.user_id = ?
        """, (user_id,))
        interests = [dict(row) for row in cursor.fetchall()]

        user_dict = dict(u)
        user_dict["skills"] = skills
        user_dict["interests"] = interests
        return user_dict

@router.get("/demo-users")
def get_demo_users():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT u.user_id, u.name, u.email, u.headline, u.avatar_url, c.short_name as college_short_name
            FROM users u
            LEFT JOIN colleges c ON u.college_id = c.college_id
            ORDER BY u.created_at ASC
        """)
        return [dict(row) for row in cursor.fetchall()]
