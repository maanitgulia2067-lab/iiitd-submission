"""
CampusConnect Matching Engine
SRS Section 4.4 Rule-Based Algorithm:
M = 100 * (0.50 * R + 0.20 * I + 0.15 * L + 0.15 * A)
"""
from typing import Dict, List, Any

def calculate_project_student_match(
    project: Dict[str, Any],
    project_requirements: List[Dict[str, Any]],
    student: Dict[str, Any],
    student_skills: List[Dict[str, Any]],
    student_interests: List[Dict[str, Any]]
) -> Dict[str, Any]:
    explanations = []

    # 1. Role and Skill Fit (R)
    contribute_skills = {s["name"].lower(): s for s in student_skills if s.get("can_contribute", True)}
    required_skill_names = [r["skill_name"].lower() for r in project_requirements if "skill_name" in r]
    
    matched_skills = []
    matched_roles = []
    for req in project_requirements:
        s_name = req.get("skill_name", "").lower()
        role = req.get("role_name", "Contributor")
        if s_name in contribute_skills:
            matched_skills.append(req.get("skill_name"))
            if role not in matched_roles:
                matched_roles.append(role)

    if required_skill_names:
        r_score = min(1.0, len(matched_skills) / max(1, len(required_skill_names)))
    else:
        r_score = 0.5

    if matched_skills:
        roles_str = ", ".join(matched_roles) if matched_roles else "open positions"
        explanations.append(f"Skill Fit: Proficient in {', '.join(matched_skills[:3])} matching {roles_str}.")
    else:
        explanations.append("Complementary Potential: General capability aligned with project direction.")

    # 2. Shared Interests (I)
    proj_cat = (project.get("category") or "").lower()
    proj_desc = f"{project.get('title', '')} {project.get('description', '')}".lower()
    student_interest_names = [i["name"].lower() for i in student_interests]
    
    shared_interests = []
    for int_item in student_interests:
        name = int_item.get("name", "")
        if name.lower() in proj_cat or name.lower() in proj_desc:
            shared_interests.append(name)
            
    if student_interest_names:
        i_score = min(1.0, (len(shared_interests) * 0.4) + (0.3 if proj_cat in " ".join(student_interest_names) else 0.1))
    else:
        i_score = 0.2

    if shared_interests:
        explanations.append(f"Shared Domain: Strong passion for {', '.join(shared_interests[:2])}.")
    elif proj_cat:
        explanations.append(f"Domain Focus: Interested in {project.get('category')} innovation.")

    # 3. Learning Goals (L)
    learning_skills = [s["name"].lower() for s in student_skills if s.get("wants_to_learn", False)]
    learning_overlap = [r["skill_name"] for r in project_requirements if r.get("skill_name", "").lower() in learning_skills]
    
    if learning_skills:
        l_score = min(1.0, len(learning_overlap) / max(1, len(learning_skills))) if learning_overlap else 0.2
    else:
        l_score = 0.4

    if learning_overlap:
        explanations.append(f"Learning Alignment: Project uses {', '.join(learning_overlap[:2])}, supporting their stated learning goals.")

    # 4. Availability (A)
    user_hours = student.get("availability_hours")
    user_mode = (student.get("collaboration_mode") or "").lower()
    proj_mode = (project.get("collaboration_mode") or "").lower()

    if user_hours is None or user_hours <= 0:
        w_r, w_i, w_l, w_a = 0.50 / 0.85, 0.20 / 0.85, 0.15 / 0.85, 0.0
        a_score = 0.5
    else:
        w_r, w_i, w_l, w_a = 0.50, 0.20, 0.15, 0.15
        mode_match = (user_mode == proj_mode) or ("remote" in user_mode or "remote" in proj_mode)
        a_score = 1.0 if mode_match and user_hours >= 5 else 0.6
        if mode_match:
            explanations.append(f"Schedule: Compatible {student.get('collaboration_mode', 'Remote')} collaboration (~{user_hours} hrs/week).")

    raw_m = 100.0 * (w_r * r_score + w_i * i_score + w_l * l_score + w_a * a_score)
    final_score = max(15, min(99, round(raw_m)))

    return {
        "score": final_score,
        "role_fit": round(r_score, 2),
        "interest_fit": round(i_score, 2),
        "learning_fit": round(l_score, 2),
        "availability_fit": round(a_score, 2),
        "matched_skills": matched_skills,
        "matched_roles": matched_roles,
        "explanations": explanations,
        "summary_explanation": " • ".join(explanations)
    }

def calculate_peer_student_match(
    student_a: Dict[str, Any],
    skills_a: List[Dict[str, Any]],
    interests_a: List[Dict[str, Any]],
    student_b: Dict[str, Any],
    skills_b: List[Dict[str, Any]],
    interests_b: List[Dict[str, Any]]
) -> Dict[str, Any]:
    explanations = []

    a_contribute = {s["name"].lower(): s["name"] for s in skills_a if s.get("can_contribute", True)}
    b_contribute = {s["name"].lower(): s["name"] for s in skills_b if s.get("can_contribute", True)}
    
    a_learn = {s["name"].lower(): s["name"] for s in skills_a if s.get("wants_to_learn", False)}
    b_learn = {s["name"].lower(): s["name"] for s in skills_b if s.get("wants_to_learn", False)}

    a_helps_b = [name for k, name in a_contribute.items() if k in b_learn]
    b_helps_a = [name for k, name in b_contribute.items() if k in a_learn]
    shared_skills = [name for k, name in a_contribute.items() if k in b_contribute]

    if a_helps_b or b_helps_a:
        r_score = min(1.0, 0.5 + 0.25 * len(a_helps_b) + 0.25 * len(b_helps_a))
        comp_parts = []
        if b_helps_a: comp_parts.append(f"Offers {', '.join(b_helps_a[:2])} which you want to learn")
        if a_helps_b: comp_parts.append(f"Could learn {', '.join(a_helps_b[:2])} from you")
        explanations.append(f"Complementary Skills: {'; '.join(comp_parts)}.")
    elif shared_skills:
        r_score = min(1.0, 0.4 + 0.15 * len(shared_skills))
        explanations.append(f"Shared Tech Base: Both proficient in {', '.join(shared_skills[:3])}.")
    else:
        r_score = 0.3
        explanations.append("Diverse Skills: Potential for cross-disciplinary learning.")

    int_a = {i["name"].lower(): i["name"] for i in interests_a}
    int_b = {i["name"].lower(): i["name"] for i in interests_b}
    shared_interests = [name for k, name in int_a.items() if k in int_b]
    
    if int_a and int_b:
        i_score = min(1.0, len(shared_interests) / max(1, len(set(int_a.keys()).union(set(int_b.keys())))) * 2)
    else:
        i_score = 0.3

    if shared_interests:
        explanations.append(f"Shared Passions: Both interested in {', '.join(shared_interests[:3])}.")

    l_score = 0.85 if (a_helps_b or b_helps_a) else 0.35

    mode_a = (student_a.get("collaboration_mode") or "Remote").lower()
    mode_b = (student_b.get("collaboration_mode") or "Remote").lower()
    mode_match = (mode_a == mode_b) or ("remote" in mode_a or "remote" in mode_b)
    a_score = 0.9 if mode_match else 0.5
    if mode_match:
        explanations.append(f"Logistics: Compatible {student_b.get('collaboration_mode', 'Remote')} working style.")

    college_a = student_a.get("college_name") or student_a.get("college_id")
    college_b = student_b.get("college_name") or student_b.get("college_id")
    if college_a and college_b and college_a != college_b:
        explanations.append(f"Cross-Campus: Connects with {college_b}.")

    final_score = max(20, min(98, round(100.0 * (0.50 * r_score + 0.20 * i_score + 0.15 * l_score + 0.15 * a_score))))

    return {
        "score": final_score,
        "role_fit": round(r_score, 2),
        "interest_fit": round(i_score, 2),
        "learning_fit": round(l_score, 2),
        "availability_fit": round(a_score, 2),
        "shared_interests": shared_interests,
        "shared_skills": shared_skills,
        "explanations": explanations,
        "summary_explanation": " • ".join(explanations)
    }
