import sqlite3
import os
from contextlib import contextmanager

DB_PATH = os.environ.get("DATABASE_PATH", os.path.join(os.path.dirname(__file__), "campusconnect.db"))

def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS colleges (
        college_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        short_name TEXT NOT NULL,
        location TEXT NOT NULL,
        website TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        college_id TEXT,
        bio TEXT,
        headline TEXT,
        availability_hours INTEGER DEFAULT 10,
        collaboration_mode TEXT DEFAULT 'Remote',
        verification_status TEXT DEFAULT 'Self-Declared',
        github_url TEXT,
        linkedin_url TEXT,
        portfolio_url TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS skills (
        skill_id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_skills (
        user_id TEXT,
        skill_id TEXT,
        proficiency TEXT DEFAULT 'Intermediate',
        can_contribute BOOLEAN DEFAULT 1,
        wants_to_learn BOOLEAN DEFAULT 0,
        PRIMARY KEY (user_id, skill_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS interests (
        interest_id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_interests (
        user_id TEXT,
        interest_id TEXT,
        PRIMARY KEY (user_id, interest_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (interest_id) REFERENCES interests(interest_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS projects (
        project_id TEXT PRIMARY KEY,
        creator_id TEXT NOT NULL,
        title TEXT NOT NULL,
        tagline TEXT,
        description TEXT NOT NULL,
        problem_statement TEXT,
        category TEXT NOT NULL,
        project_stage TEXT DEFAULT 'Idea',
        status TEXT DEFAULT 'Recruiting',
        expected_commitment TEXT DEFAULT '5-10 hrs/week',
        collaboration_mode TEXT DEFAULT 'Remote',
        visibility TEXT DEFAULT 'Public',
        repository_url TEXT,
        demo_url TEXT,
        showcase_featured BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_skill_requirements (
        requirement_id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        skill_id TEXT NOT NULL,
        role_name TEXT NOT NULL,
        positions_required INTEGER DEFAULT 1,
        positions_filled INTEGER DEFAULT 0,
        FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_memberships (
        membership_id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT DEFAULT 'Active',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (project_id, user_id),
        FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS collaboration_requests (
        request_id TEXT PRIMARY KEY,
        sender_id TEXT NOT NULL,
        recipient_id TEXT NOT NULL,
        project_id TEXT,
        role_name TEXT,
        request_type TEXT NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (recipient_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_tasks (
        task_id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        assigned_user_id TEXT,
        due_date TEXT,
        status TEXT DEFAULT 'Todo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_user_id) REFERENCES users(user_id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS project_milestones (
        milestone_id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        title TEXT NOT NULL,
        due_date TEXT,
        status TEXT DEFAULT 'Pending',
        FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_resources (
        resource_id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        resource_type TEXT DEFAULT 'Link',
        FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS clubs (
        club_id TEXT PRIMARY KEY,
        college_id TEXT NOT NULL,
        lead_user_id TEXT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        verification_status TEXT DEFAULT 'Verified',
        contact_email TEXT,
        member_count INTEGER DEFAULT 25,
        website TEXT,
        FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE CASCADE,
        FOREIGN KEY (lead_user_id) REFERENCES users(user_id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS club_partnerships (
        partnership_id TEXT PRIMARY KEY,
        sender_club_id TEXT NOT NULL,
        recipient_club_id TEXT NOT NULL,
        title TEXT NOT NULL,
        proposal TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_club_id) REFERENCES clubs(club_id) ON DELETE CASCADE,
        FOREIGN KEY (recipient_club_id) REFERENCES clubs(club_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS events (
        event_id TEXT PRIMARY KEY,
        organizer_id TEXT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        start_time TEXT NOT NULL,
        venue TEXT NOT NULL,
        mode TEXT DEFAULT 'Online',
        eligibility TEXT DEFAULT 'Open to all college students',
        registration_url TEXT,
        deadline TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organizer_id) REFERENCES users(user_id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
        notification_id TEXT PRIMARY KEY,
        recipient_id TEXT NOT NULL,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        related_entity_id TEXT,
        read_status BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recipient_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reports (
        report_id TEXT PRIMARY KEY,
        reporter_id TEXT NOT NULL,
        reported_entity_type TEXT NOT NULL,
        reported_entity_id TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reporter_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
        message_id TEXT PRIMARY KEY,
        sender_id TEXT NOT NULL,
        recipient_id TEXT,
        project_id TEXT,
        club_id TEXT,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (recipient_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
        FOREIGN KEY (club_id) REFERENCES clubs(club_id) ON DELETE CASCADE
    );
    """)

    conn.commit()
    conn.close()
