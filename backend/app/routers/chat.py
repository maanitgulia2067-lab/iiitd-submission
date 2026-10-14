import uuid
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from ..database import get_db
from .auth import get_current_user_id

router = APIRouter(prefix="/api/messages", tags=["Messages & Interaction Spaces"])

class DirectMessageCreate(BaseModel):
    recipient_id: str
    content: str

class ChannelMessageCreate(BaseModel):
    content: str

@router.post("/direct")
def send_direct_message(data: DirectMessageCreate, current_user_id: str = Depends(get_current_user_id)):
    """FR: Send private 1-on-1 message between students."""
    if not data.content.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    with get_db() as conn:
        cursor = conn.cursor()
        msg_id = f"msg_{uuid.uuid4().hex[:8]}"
        cursor.execute("""
            INSERT INTO messages (message_id, sender_id, recipient_id, content)
            VALUES (?, ?, ?, ?)
        """, (msg_id, current_user_id, data.recipient_id, data.content.strip()))

        # Create notification for recipient
        cursor.execute("SELECT name FROM users WHERE user_id = ?", (current_user_id,))
        sender_name = cursor.fetchone()["name"]
        notif_id = f"notif_{uuid.uuid4().hex[:8]}"
        cursor.execute("""
            INSERT INTO notifications (notification_id, recipient_id, type, message, related_entity_id)
            VALUES (?, ?, 'general', ?, ?)
        """, (notif_id, data.recipient_id, f"New private message from {sender_name}: '{data.content.strip()[:40]}...'", current_user_id))

        return {"status": "success", "message_id": msg_id}

@router.get("/direct/{other_user_id}")
def get_direct_messages(other_user_id: str, current_user_id: str = Depends(get_current_user_id)):
    """FR: Fetch chat history for 1-on-1 private messaging."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
            FROM messages m
            JOIN users u ON m.sender_id = u.user_id
            WHERE (m.sender_id = ? AND m.recipient_id = ?)
               OR (m.sender_id = ? AND m.recipient_id = ?)
            ORDER BY m.created_at ASC
        """, (current_user_id, other_user_id, other_user_id, current_user_id))
        return [dict(r) for r in cursor.fetchall()]

@router.post("/project/{project_id}")
def send_project_message(project_id: str, data: ChannelMessageCreate, current_user_id: str = Depends(get_current_user_id)):
    """FR: Post a message, brief, or update to the Project Workspace team space."""
    if not data.content.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    with get_db() as conn:
        cursor = conn.cursor()
        msg_id = f"msg_{uuid.uuid4().hex[:8]}"
        cursor.execute("""
            INSERT INTO messages (message_id, sender_id, project_id, content)
            VALUES (?, ?, ?, ?)
        """, (msg_id, current_user_id, project_id, data.content.strip()))
        return {"status": "success", "message_id": msg_id}

@router.get("/project/{project_id}")
def get_project_messages(project_id: str):
    """FR: Retrieve discussion briefs and updates in Project Workspace."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar, c.short_name as college_short_name
            FROM messages m
            JOIN users u ON m.sender_id = u.user_id
            LEFT JOIN colleges c ON u.college_id = c.college_id
            WHERE m.project_id = ?
            ORDER BY m.created_at ASC
        """, (project_id,))
        return [dict(r) for r in cursor.fetchall()]

@router.post("/community/{club_id}")
def send_community_message(club_id: str, data: ChannelMessageCreate, current_user_id: str = Depends(get_current_user_id)):
    """FR: Post question, initiative brief, or announcement to Community space."""
    if not data.content.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    with get_db() as conn:
        cursor = conn.cursor()
        msg_id = f"msg_{uuid.uuid4().hex[:8]}"
        cursor.execute("""
            INSERT INTO messages (message_id, sender_id, club_id, content)
            VALUES (?, ?, ?, ?)
        """, (msg_id, current_user_id, club_id, data.content.strip()))
        return {"status": "success", "message_id": msg_id}

@router.get("/community/{club_id}")
def get_community_messages(club_id: str):
    """FR: Get community messages for a club/society."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar, c.short_name as college_short_name
            FROM messages m
            JOIN users u ON m.sender_id = u.user_id
            LEFT JOIN colleges c ON u.college_id = c.college_id
            WHERE m.club_id = ?
            ORDER BY m.created_at ASC
        """, (club_id,))
        return [dict(r) for r in cursor.fetchall()]

@router.get("/conversations")
def get_recent_conversations(current_user_id: str = Depends(get_current_user_id)):
    """List recent peers messaged with."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT DISTINCT
                CASE WHEN m.sender_id = ? THEN m.recipient_id ELSE m.sender_id END as peer_id,
                u.name as peer_name, u.headline as peer_headline, c.short_name as college_short_name
            FROM messages m
            JOIN users u ON u.user_id = (CASE WHEN m.sender_id = ? THEN m.recipient_id ELSE m.sender_id END)
            LEFT JOIN colleges c ON u.college_id = c.college_id
            WHERE (m.sender_id = ? OR m.recipient_id = ?) AND m.recipient_id IS NOT NULL
        """, (current_user_id, current_user_id, current_user_id, current_user_id))
        return [dict(r) for r in cursor.fetchall()]
