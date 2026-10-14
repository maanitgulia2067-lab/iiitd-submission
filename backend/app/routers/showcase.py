from fastapi import APIRouter
from ..database import get_db

router = APIRouter(prefix="/api/showcase", tags=["Showcase"])

@router.get("")
def get_showcase():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT p.*, u.name as creator_name, c.short_name as creator_college
            FROM projects p
            JOIN users u ON p.creator_id = u.user_id
            LEFT JOIN colleges c ON u.college_id = c.college_id
            WHERE p.showcase_featured = 1 OR p.status = 'Completed' OR p.project_stage IN ('Showcase Ready', 'Completed')
            ORDER BY p.created_at DESC
        """)
        projects = [dict(r) for r in cursor.fetchall()]
        for p in projects:
            cursor.execute("SELECT psr.role_name, s.name as skill_name FROM project_skill_requirements psr JOIN skills s ON psr.skill_id = s.skill_id WHERE psr.project_id = ?", (p["project_id"],))
            p["requirements"] = [dict(r) for r in cursor.fetchall()]
            cursor.execute("SELECT pm.role, u.name, u.avatar_url, c.short_name as college_name FROM project_memberships pm JOIN users u ON pm.user_id = u.user_id LEFT JOIN colleges c ON u.college_id = c.college_id WHERE pm.project_id = ?", (p["project_id"],))
            p["members"] = [dict(r) for r in cursor.fetchall()]
        return projects
