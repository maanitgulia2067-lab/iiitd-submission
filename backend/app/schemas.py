from pydantic import BaseModel
from typing import List, Optional, Any

class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    college_id: Optional[str] = None
    bio: Optional[str] = None
    headline: Optional[str] = None
    availability_hours: int = 10
    collaboration_mode: str = "Remote"
    skills: Optional[List[str]] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    college_id: Optional[str] = None
    availability_hours: Optional[int] = None
    collaboration_mode: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    skills_contribute: Optional[List[str]] = None
    skills_learn: Optional[List[str]] = None
    interests: Optional[List[str]] = None

class ProjectRequirementCreate(BaseModel):
    role_name: str
    skill_name: str
    positions_required: int = 1

class ProjectCreate(BaseModel):
    title: str
    tagline: Optional[str] = None
    description: str
    problem_statement: Optional[str] = None
    category: str
    project_stage: str = "Idea"
    expected_commitment: str = "5-10 hrs/week"
    collaboration_mode: str = "Remote"
    visibility: str = "Public"
    repository_url: Optional[str] = None
    demo_url: Optional[str] = None
    requirements: List[ProjectRequirementCreate] = []

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_user_id: Optional[str] = None
    due_date: Optional[str] = None
    status: str = "Todo"

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_user_id: Optional[str] = None
    due_date: Optional[str] = None
    status: Optional[str] = None

class MilestoneCreate(BaseModel):
    title: str
    due_date: Optional[str] = None

class ResourceCreate(BaseModel):
    title: str
    url: str
    resource_type: str = "Link"

class RequestCreate(BaseModel):
    recipient_id: str
    project_id: Optional[str] = None
    role_name: Optional[str] = None
    request_type: str
    message: Optional[str] = None

class RequestStatusUpdate(BaseModel):
    status: str

class ClubPartnershipCreate(BaseModel):
    recipient_club_id: str
    title: str
    proposal: str
    sender_club_id: Optional[str] = None

class SkillOfferCreate(BaseModel):
    skill_name: str
    category: Optional[str] = "Technical"
    proficiency: Optional[str] = "Intermediate"

class SkillRequestCreate(BaseModel):
    skill_name: str
    category: Optional[str] = "Technical"

class ProjectInviteCreate(BaseModel):
    recipient_id: str
    role_name: str
    message: Optional[str] = None

class EventCreate(BaseModel):
    title: str
    category: str
    description: str
    start_time: str
    venue: str
    mode: str = "Online"
    eligibility: str = "Open to all students"
    registration_url: Optional[str] = None
    deadline: Optional[str] = None

class ReportCreate(BaseModel):
    reported_entity_type: str
    reported_entity_id: str
    reason: str
