from fastapi import APIRouter, HTTPException, Depends
from ..database import get_db
from ..matching import calculate_project_student_match, calculate_peer_student_match
from .auth import get_current_user_id

router = APIRouter(prefix="/api/matching", tags=["Matching"])

@router.get("/projects-for-student")
def get_recommended_projects_for_student(current_user_id: str = Depends(get_current_user_id)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE user_id = ?", (current_user_id,))
        student = cursor.fetchone()
        if not student: raise HTTPException(status_code=404, detail="Student not found")
        student_dict = dict(student)

        cursor.execute("""
            SELECT s.skill_id, s.name, us.proficiency, us.can_contribute, us.wants_to_learn
            FROM user_skills us JOIN skills s ON us.skill_id = s.skill_id
            WHERE us.user_id = ?
        """, (current_user_id,))
        student_skills = [dict(r) for r in cursor.fetchall()]

        cursor.execute("SELECT i.interest_id, i.name FROM user_interests ui JOIN interests i ON ui.interest_id = i.interest_id WHERE ui.user_id = ?", (current_user_id,))
        student_interests = [dict(r) for r in cursor.fetchall()]

        cursor.execute("""
            SELECT p.*, u.name as creator_name, c.short_name as creator_college
            FROM projects p
            JOIN users u ON p.creator_id = u.user_id
            LEFT JOIN colleges c ON u.college_id = c.college_id
            WHERE p.visibility = 'Public' AND p.status IN ('Recruiting', 'Active')
            AND p.creator_id != ?
            AND p.project_id NOT IN (SELECT project_id FROM project_memberships WHERE user_id = ?)
        """, (current_user_id, current_user_id))
        candidate_projects = [dict(r) for r in cursor.fetchall()]

        matches = []
        for proj in candidate_projects:
            pid = proj["project_id"]
            cursor.execute("""
                SELECT psr.*, s.name as skill_name
                FROM project_skill_requirements psr JOIN skills s ON psr.skill_id = s.skill_id
                WHERE psr.project_id = ?
            """, (pid,))
            reqs = [dict(r) for r in cursor.fetchall()]

            res = calculate_project_student_match(proj, reqs, student_dict, student_skills, student_interests)
            proj["match_score"] = res["score"]
            proj["role_fit"] = res["role_fit"]
            proj["interest_fit"] = res["interest_fit"]
            proj["learning_fit"] = res["learning_fit"]
            proj["availability_fit"] = res["availability_fit"]
            proj["matched_skills"] = res["matched_skills"]
            proj["matched_roles"] = res["matched_roles"]
            proj["explanations"] = res["explanations"]
            proj["summary_explanation"] = res["summary_explanation"]
            proj["requirements"] = reqs
            matches.append(proj)

        matches.sort(key=lambda x: x["match_score"], reverse=True)
        return matches

@router.get("/students-for-project/{project_id}")
def get_recommended_students_for_project(project_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM projects WHERE project_id = ?", (project_id,))
        proj = cursor.fetchone()
        if not proj: raise HTTPException(status_code=404, detail="Project not found")
        proj_dict = dict(proj)

        cursor.execute("""
            SELECT psr.*, s.name as skill_name
            FROM project_skill_requirements psr JOIN skills s ON psr.skill_id = s.skill_id
            WHERE psr.project_id = ?
        """, (project_id,))
        reqs = [dict(r) for r in cursor.fetchall()]

        cursor.execute("SELECT user_id FROM project_memberships WHERE project_id = ?", (project_id,))
        excluded = {r["user_id"] for r in cursor.fetchall()}
        excluded.add(proj_dict["creator_id"])

        cursor.execute("""
            SELECT u.*, c.name as college_name, c.short_name as college_short_name, c.location as college_location
            FROM users u LEFT JOIN colleges c ON u.college_id = c.college_id
            WHERE u.user_id NOT IN ({})
        """.format(",".join("?" * len(excluded))), list(excluded))
        candidates = [dict(r) for r in cursor.fetchall()]

        results = []
        for cand in candidates:
            cid = cand["user_id"]
            cursor.execute("SELECT s.name, us.can_contribute, us.wants_to_learn FROM user_skills us JOIN skills s ON us.skill_id = s.skill_id WHERE us.user_id = ?", (cid,))
            c_skills = [dict(r) for r in cursor.fetchall()]
            cursor.execute("SELECT i.name FROM user_interests ui JOIN interests i ON ui.interest_id = i.interest_id WHERE ui.user_id = ?", (cid,))
            c_interests = [dict(r) for r in cursor.fetchall()]

            res = calculate_project_student_match(proj_dict, reqs, cand, c_skills, c_interests)
            cand["match_score"] = res["score"]
            cand["role_fit"] = res["role_fit"]
            cand["interest_fit"] = res["interest_fit"]
            cand["learning_fit"] = res["learning_fit"]
            cand["availability_fit"] = res["availability_fit"]
            cand["matched_skills"] = res["matched_skills"]
            cand["matched_roles"] = res["matched_roles"]
            cand["explanations"] = res["explanations"]
            cand["summary_explanation"] = res["summary_explanation"]
            cand["skills"] = c_skills
            cand["interests"] = c_interests
            results.append(cand)

        results.sort(key=lambda x: x["match_score"], reverse=True)
        return results

@router.get("/peers")
def get_recommended_peers(current_user_id: str = Depends(get_current_user_id)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT u.*, c.short_name as college_short_name FROM users u LEFT JOIN colleges c ON u.college_id = c.college_id WHERE u.user_id = ?", (current_user_id,))
        me = cursor.fetchone()
        if not me: raise HTTPException(status_code=404, detail="Student not found")
        me_dict = dict(me)

        cursor.execute("SELECT s.name, us.can_contribute, us.wants_to_learn FROM user_skills us JOIN skills s ON us.skill_id = s.skill_id WHERE us.user_id = ?", (current_user_id,))
        my_skills = [dict(r) for r in cursor.fetchall()]
        cursor.execute("SELECT i.name FROM user_interests ui JOIN interests i ON ui.interest_id = i.interest_id WHERE ui.user_id = ?", (current_user_id,))
        my_interests = [dict(r) for r in cursor.fetchall()]

        cursor.execute("SELECT u.*, c.name as college_name, c.short_name as college_short_name FROM users u LEFT JOIN colleges c ON u.college_id = c.college_id WHERE u.user_id != ?", (current_user_id,))
        others = [dict(r) for r in cursor.fetchall()]

        recs = []
        for other in others:
            oid = other["user_id"]
            cursor.execute("SELECT s.name, us.can_contribute, us.wants_to_learn FROM user_skills us JOIN skills s ON us.skill_id = s.skill_id WHERE us.user_id = ?", (oid,))
            o_skills = [dict(r) for r in cursor.fetchall()]
            cursor.execute("SELECT i.name FROM user_interests ui JOIN interests i ON ui.interest_id = i.interest_id WHERE ui.user_id = ?", (oid,))
            o_interests = [dict(r) for r in cursor.fetchall()]

            res = calculate_peer_student_match(me_dict, my_skills, my_interests, other, o_skills, o_interests)
            other["match_score"] = res["score"]
            other["shared_interests"] = res["shared_interests"]
            other["shared_skills"] = res["shared_skills"]
            other["explanations"] = res["explanations"]
            other["summary_explanation"] = res["summary_explanation"]
            other["skills"] = o_skills
            other["interests"] = o_interests
            recs.append(other)

        recs.sort(key=lambda x: x["match_score"], reverse=True)
        return recs
