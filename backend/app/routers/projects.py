import uuid
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from ..database import get_db
from ..schemas import ProjectCreate, TaskCreate, TaskUpdate, MilestoneCreate, ResourceCreate, ProjectInviteCreate
from .auth import get_current_user_id

router = APIRouter(prefix="/api/projects", tags=["BuildSpace Projects"])

@router.get("")
def list_projects(
    search: Optional[str] = None,
    category: Optional[str] = None,
    stage: Optional[str] = None,
    status: Optional[str] = None,
    skill: Optional[str] = None
):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT p.*, u.name as creator_name, c.short_name as creator_college
            FROM projects p
            JOIN users u ON p.creator_id = u.user_id
            LEFT JOIN colleges c ON u.college_id = c.college_id
            WHERE p.visibility = 'Public'
        """
        params = []
        if category and category != "all":
            query += " AND LOWER(p.category) = LOWER(?)"
            params.append(category)
        if stage and stage != "all":
            query += " AND LOWER(p.project_stage) = LOWER(?)"
            params.append(stage)
        if status and status != "all":
            query += " AND LOWER(p.status) = LOWER(?)"
            params.append(status)
        if search:
            pat = f"%{search}%"
            query += " AND (p.title LIKE ? OR p.tagline LIKE ? OR p.description LIKE ?)"
            params.extend([pat, pat, pat])

        query += " ORDER BY p.created_at DESC"
        cursor.execute(query, params)
        raw_projects = [dict(r) for r in cursor.fetchall()]

        projects = []
        for p in raw_projects:
            pid = p["project_id"]
            cursor.execute("""
                SELECT psr.requirement_id, psr.role_name, psr.positions_required, psr.positions_filled,
                       s.skill_id, s.name as skill_name
                FROM project_skill_requirements psr
                JOIN skills s ON psr.skill_id = s.skill_id
                WHERE psr.project_id = ?
            """, (pid,))
            reqs = [dict(r) for r in cursor.fetchall()]

            cursor.execute("""
                SELECT pm.membership_id, pm.user_id, pm.role, pm.status, pm.joined_at,
                       u.name, u.avatar_url, c.short_name as college_name
                FROM project_memberships pm
                JOIN users u ON pm.user_id = u.user_id
                LEFT JOIN colleges c ON u.college_id = c.college_id
                WHERE pm.project_id = ?
            """, (pid,))
            members = [dict(r) for r in cursor.fetchall()]

            open_roles = sum(max(0, r["positions_required"] - r["positions_filled"]) for r in reqs)
            if skill and skill != "all":
                if skill.lower() not in [r["skill_name"].lower() for r in reqs]:
                    continue

            p["requirements"] = reqs
            p["members"] = members
            p["open_roles_count"] = open_roles
            projects.append(p)
        return projects

@router.post("")
def create_project(data: ProjectCreate, current_user_id: str = Depends(get_current_user_id)):
    with get_db() as conn:
        cursor = conn.cursor()
        pid = f"prj_{uuid.uuid4().hex[:8]}"
        cursor.execute("""
            INSERT INTO projects (
                project_id, creator_id, title, tagline, description, problem_statement,
                category, project_stage, status, expected_commitment, collaboration_mode,
                visibility, repository_url, demo_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Recruiting', ?, ?, ?, ?, ?)
        """, (
            pid, current_user_id, data.title, data.tagline, data.description,
            data.problem_statement, data.category, data.project_stage,
            data.expected_commitment, data.collaboration_mode, data.visibility,
            data.repository_url, data.demo_url
        ))

        mid = f"mem_{uuid.uuid4().hex[:8]}"
        cursor.execute("INSERT INTO project_memberships VALUES (?, ?, ?, 'Project Lead', 'Active', CURRENT_TIMESTAMP)", (mid, pid, current_user_id))

        for req in data.requirements:
            cursor.execute("SELECT skill_id FROM skills WHERE LOWER(name) = LOWER(?)", (req.skill_name.strip(),))
            row = cursor.fetchone()
            sid = row["skill_id"] if row else f"sk_{uuid.uuid4().hex[:6]}"
            if not row:
                cursor.execute("INSERT INTO skills VALUES (?, ?, 'Technical')", (sid, req.skill_name.strip()))
            rid = f"req_{uuid.uuid4().hex[:8]}"
            cursor.execute("INSERT INTO project_skill_requirements VALUES (?, ?, ?, ?, ?, 0)", (rid, pid, sid, req.role_name, req.positions_required))

        return {"status": "success", "project_id": pid}

@router.get("/{project_id}")
def get_project_details(project_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT p.*, u.name as creator_name, c.name as creator_college_full, c.short_name as creator_college
            FROM projects p
            JOIN users u ON p.creator_id = u.user_id
            LEFT JOIN colleges c ON u.college_id = c.college_id
            WHERE p.project_id = ?
        """, (project_id,))
        p = cursor.fetchone()
        if not p:
            raise HTTPException(status_code=404, detail="Project not found")

        data = dict(p)
        cursor.execute("""
            SELECT psr.*, s.name as skill_name, s.category as skill_category
            FROM project_skill_requirements psr
            JOIN skills s ON psr.skill_id = s.skill_id
            WHERE psr.project_id = ?
        """, (project_id,))
        data["requirements"] = [dict(r) for r in cursor.fetchall()]

        cursor.execute("""
            SELECT pm.*, u.name, u.avatar_url, u.headline, c.short_name as college_name
            FROM project_memberships pm
            JOIN users u ON pm.user_id = u.user_id
            LEFT JOIN colleges c ON u.college_id = c.college_id
            WHERE pm.project_id = ?
        """, (project_id,))
        data["members"] = [dict(r) for r in cursor.fetchall()]

        cursor.execute("""
            SELECT pt.*, u.name as assigned_user_name
            FROM project_tasks pt
            LEFT JOIN users u ON pt.assigned_user_id = u.user_id
            WHERE pt.project_id = ?
            ORDER BY pt.created_at DESC
        """, (project_id,))
        data["tasks"] = [dict(r) for r in cursor.fetchall()]

        cursor.execute("SELECT * FROM project_milestones WHERE project_id = ? ORDER BY due_date ASC", (project_id,))
        data["milestones"] = [dict(r) for r in cursor.fetchall()]

        cursor.execute("SELECT * FROM project_resources WHERE project_id = ?", (project_id,))
        data["resources"] = [dict(r) for r in cursor.fetchall()]
        return data

@router.put("/{project_id}/status")
def update_project_status(project_id: str, payload: dict):
    new_status = payload.get("status")
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE projects SET status = ? WHERE project_id = ?", (new_status, project_id))
        return {"status": "success"}

@router.post("/{project_id}/tasks")
def create_project_task(project_id: str, data: TaskCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        tid = f"tsk_{uuid.uuid4().hex[:8]}"
        cursor.execute("INSERT INTO project_tasks VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", (tid, project_id, data.title, data.description, data.assigned_user_id, data.due_date, data.status))
        return {"status": "success", "task_id": tid}

@router.put("/{project_id}/tasks/{task_id}")
def update_task_status(project_id: str, task_id: str, data: TaskUpdate):
    with get_db() as conn:
        cursor = conn.cursor()
        fields, params = [], []
        if data.status: fields.append("status = ?"); params.append(data.status)
        if data.title: fields.append("title = ?"); params.append(data.title)
        if data.assigned_user_id: fields.append("assigned_user_id = ?"); params.append(data.assigned_user_id)
        if fields:
            params.extend([task_id, project_id])
            cursor.execute(f"UPDATE project_tasks SET {', '.join(fields)} WHERE task_id = ? AND project_id = ?", params)
        return {"status": "success"}

@router.post("/{project_id}/milestones")
def create_milestone(project_id: str, data: MilestoneCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        mid = f"mls_{uuid.uuid4().hex[:8]}"
        cursor.execute("INSERT INTO project_milestones VALUES (?, ?, ?, ?, 'Pending')", (mid, project_id, data.title, data.due_date))
        return {"status": "success", "milestone_id": mid}

@router.post("/{project_id}/resources")
def add_resource(project_id: str, data: ResourceCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        rid = f"res_{uuid.uuid4().hex[:8]}"
        cursor.execute("INSERT INTO project_resources VALUES (?, ?, ?, ?, ?)", (rid, project_id, data.title, data.url, data.resource_type))
        return {"status": "success", "resource_id": rid}

@router.get("/user/my-projects")
def get_my_projects(current_user_id: str = Depends(get_current_user_id)):
    with get_db() as conn:
        cursor = conn.cursor()
        # Projects created by user
        cursor.execute("""
            SELECT p.*, u.name as creator_name, c.short_name as creator_college
            FROM projects p
            JOIN users u ON p.creator_id = u.user_id
            LEFT JOIN colleges c ON u.college_id = c.college_id
            WHERE p.creator_id = ?
            ORDER BY p.created_at DESC
        """, (current_user_id,))
        created = [dict(r) for r in cursor.fetchall()]
        for p in created:
            pid = p["project_id"]
            cursor.execute("""
                SELECT psr.requirement_id, psr.role_name, psr.positions_required, psr.positions_filled,
                       s.skill_id, s.name as skill_name
                FROM project_skill_requirements psr
                JOIN skills s ON psr.skill_id = s.skill_id
                WHERE psr.project_id = ?
            """, (pid,))
            p["requirements"] = [dict(r) for r in cursor.fetchall()]
            cursor.execute("""
                SELECT pm.membership_id, pm.user_id, pm.role, pm.status, pm.joined_at,
                       u.name, u.avatar_url, c.short_name as college_name
                FROM project_memberships pm
                JOIN users u ON pm.user_id = u.user_id
                LEFT JOIN colleges c ON u.college_id = c.college_id
                WHERE pm.project_id = ?
            """, (pid,))
            p["members"] = [dict(r) for r in cursor.fetchall()]
            p["open_roles_count"] = sum(max(0, r["positions_required"] - r["positions_filled"]) for r in p["requirements"])

        # Projects joined by user (where user is a member but not creator)
        cursor.execute("""
            SELECT p.*, u.name as creator_name, c.short_name as creator_college, pm.role as my_role
            FROM projects p
            JOIN project_memberships pm ON p.project_id = pm.project_id
            JOIN users u ON p.creator_id = u.user_id
            LEFT JOIN colleges c ON u.college_id = c.college_id
            WHERE pm.user_id = ? AND p.creator_id != ?
            ORDER BY pm.joined_at DESC
        """, (current_user_id, current_user_id))
        joined = [dict(r) for r in cursor.fetchall()]
        for p in joined:
            pid = p["project_id"]
            cursor.execute("""
                SELECT psr.requirement_id, psr.role_name, psr.positions_required, psr.positions_filled,
                       s.skill_id, s.name as skill_name
                FROM project_skill_requirements psr
                JOIN skills s ON psr.skill_id = s.skill_id
                WHERE psr.project_id = ?
            """, (pid,))
            p["requirements"] = [dict(r) for r in cursor.fetchall()]
            cursor.execute("""
                SELECT pm.membership_id, pm.user_id, pm.role, pm.status, pm.joined_at,
                       u.name, u.avatar_url, c.short_name as college_name
                FROM project_memberships pm
                JOIN users u ON pm.user_id = u.user_id
                LEFT JOIN colleges c ON u.college_id = c.college_id
                WHERE pm.project_id = ?
            """, (pid,))
            p["members"] = [dict(r) for r in cursor.fetchall()]

        # Incoming join requests for created projects
        cursor.execute("""
            SELECT cr.*, u.name as sender_name, u.headline as sender_headline,
                   c.short_name as sender_college, p.title as project_title
            FROM collaboration_requests cr
            JOIN projects p ON cr.project_id = p.project_id
            JOIN users u ON cr.sender_id = u.user_id
            LEFT JOIN colleges c ON u.college_id = c.college_id
            WHERE p.creator_id = ? AND cr.status = 'Pending'
            ORDER BY cr.created_at DESC
        """, (current_user_id,))
        pending_requests = [dict(r) for r in cursor.fetchall()]

        return {
            "created": created,
            "joined": joined,
            "pending_requests": pending_requests
        }

@router.post("/{project_id}/invite")
def invite_teammate(project_id: str, data: ProjectInviteCreate, current_user_id: str = Depends(get_current_user_id)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT title, creator_id FROM projects WHERE project_id = ?", (project_id,))
        proj = cursor.fetchone()
        if not proj: raise HTTPException(status_code=404, detail="Project not found")

        req_id = f"req_{uuid.uuid4().hex[:8]}"
        cursor.execute("""
            INSERT INTO collaboration_requests (request_id, sender_id, recipient_id, project_id, role_name, request_type, message, status)
            VALUES (?, ?, ?, ?, ?, 'invite_teammate', ?, 'Pending')
        """, (req_id, current_user_id, data.recipient_id, project_id, data.role_name, data.message or f"You are invited to join {proj['title']} as {data.role_name}!"))

        cursor.execute("SELECT name FROM users WHERE user_id = ?", (current_user_id,))
        s_name = cursor.fetchone()["name"]
        notif_msg = f"{s_name} invited you to join '{proj['title']}' as {data.role_name}."
        cursor.execute("INSERT INTO notifications VALUES (?, ?, 'invite', ?, ?, 0, CURRENT_TIMESTAMP)", (f"notif_{uuid.uuid4().hex[:8]}", data.recipient_id, notif_msg, req_id))
        return {"status": "success", "request_id": req_id}

@router.post("/{project_id}/showcase")
def feature_in_showcase(project_id: str, current_user_id: str = Depends(get_current_user_id)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE projects SET showcase_featured = 1, status = 'Completed', project_stage = 'Completed' WHERE project_id = ?", (project_id,))
        return {"status": "success", "message": "Project submitted to showcase!"}
