import hashlib
from .database import get_db, init_db

def hash_pw(pwd: str) -> str:
    return hashlib.sha256(pwd.encode("utf-8")).hexdigest()

def seed():
    init_db()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM users")
        if cursor.fetchone()["count"] > 0:
            return

        colleges = [
            ("clg_dtu", "Delhi Technological University", "DTU", "Delhi, India", "https://dtu.ac.in"),
            ("clg_iitd", "Indian Institute of Technology Delhi", "IIT Delhi", "New Delhi, India", "https://iitd.ac.in"),
            ("clg_bits", "BITS Pilani", "BITS Pilani", "Pilani, Rajasthan", "https://bits-pilani.ac.in"),
            ("clg_iiith", "International Institute of Information Technology", "IIIT Hyderabad", "Hyderabad, India", "https://iiit.ac.in"),
            ("clg_nsut", "Netaji Subhas University of Technology", "NSUT", "Delhi, India", "http://nsut.ac.in"),
            ("clg_sxc", "St. Xavier's College", "St. Xavier's", "Mumbai, India", "https://xaviers.edu"),
        ]
        cursor.executemany("INSERT INTO colleges VALUES (?, ?, ?, ?, ?)", colleges)

        skills = [
            ("sk_python", "Python", "Technical"),
            ("sk_fastapi", "FastAPI", "Technical"),
            ("sk_react", "React", "Technical"),
            ("sk_ts", "TypeScript", "Technical"),
            ("sk_java", "Java", "Technical"),
            ("sk_springboot", "Spring Boot", "Technical"),
            ("sk_pytorch", "PyTorch", "Data & AI"),
            ("sk_ml", "Machine Learning", "Data & AI"),
            ("sk_nlp", "NLP", "Data & AI"),
            ("sk_cv", "Computer Vision", "Data & AI"),
            ("sk_uiux", "UI/UX Design", "Design"),
            ("sk_figma", "Figma", "Design"),
            ("sk_tailwind", "Tailwind CSS", "Technical"),
            ("sk_docker", "Docker", "Technical"),
            ("sk_kubernetes", "Kubernetes", "Technical"),
            ("sk_postgresql", "PostgreSQL", "Technical"),
            ("sk_cplusplus", "C++", "Technical"),
            ("sk_ros", "ROS & Robotics", "Technical"),
            ("sk_product", "Product Management", "Management"),
            ("sk_technical_writing", "Technical Writing", "Soft Skill"),
        ]
        cursor.executemany("INSERT INTO skills VALUES (?, ?, ?)", skills)

        interests = [
            ("int_ai", "Artificial Intelligence", "Technology"),
            ("int_health", "HealthTech & MedTech", "Industry"),
            ("int_fintech", "FinTech & Web3", "Industry"),
            ("int_edtech", "EdTech & Learning", "Industry"),
            ("int_climate", "ClimateTech & Sustainability", "Industry"),
            ("int_robotics", "Robotics & Hardware", "Technology"),
            ("int_opensource", "Open Source", "Community"),
            ("int_startups", "Startups & Ventures", "Entrepreneurship"),
            ("int_gaming", "Game Development", "Creative"),
            ("int_social", "Social Impact", "Community"),
        ]
        cursor.executemany("INSERT INTO interests VALUES (?, ?, ?)", interests)

        users = [
            (
                "usr_aarav_01", "Aarav Sharma", "aarav@dtu.ac.in", hash_pw("password123"), "clg_dtu",
                "3rd Year Software Engineering at DTU. Passionate about distributed backends, clean REST/gRPC APIs, and applying machine learning to real student challenges.",
                "Backend Engineer & Distributed Systems Lead",
                12, "Remote", "Verified",
                "https://github.com/aarav-sharma-demo", "https://linkedin.com/in/aarav-sharma-demo", "https://aarav.dev",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
            ),
            (
                "usr_priya_02", "Priya Patel", "priya@iitd.ac.in", hash_pw("password123"), "clg_iitd",
                "2nd Year CS at IIT Delhi. Researcher in multimodal deep learning and computer vision. Looking for experienced backend developers to co-build MedScan AI.",
                "AI/ML Researcher & Computer Vision Developer",
                15, "Remote", "Verified",
                "https://github.com/priyapatel-ai", "https://linkedin.com/in/priya-patel-iitd", "https://priya-research.ai",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150"
            ),
            (
                "usr_rohan_03", "Rohan Mehta", "rohan@bits.ac.in", hash_pw("password123"), "clg_bits",
                "Electronics & CS at BITS Pilani. Obsessed with snappy UI interactions, TypeScript, and micro-animations. Active hackathon frontend lead.",
                "Frontend Architect & UI/UX Designer",
                10, "Remote", "Verified",
                "https://github.com/rohanm-ui", "https://linkedin.com/in/rohan-mehta-bits", "https://rohanmehta.design",
                "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
            ),
            (
                "usr_ananya_04", "Ananya Sengupta", "ananya@iiith.ac.in", hash_pw("password123"), "clg_iiith",
                "Dual degree student at IIIT Hyderabad focusing on Language Technologies. Building retrieval-augmented generation tools for accessible student research.",
                "NLP & Language Models Specialist",
                10, "Hybrid", "Verified",
                "https://github.com/ananya-nlp", "https://linkedin.com/in/ananya-sengupta-iiith", "https://ananya.info",
                "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150"
            ),
            (
                "usr_vikram_05", "Vikram Joshi", "vikram@nsut.ac.in", hash_pw("password123"), "clg_nsut",
                "Final year at NSUT. Built Kubernetes staging clusters for 4 collegiate hackathons. Ready to mentor and assist project teams with deployment pipelines.",
                "DevOps & Cloud Infrastructure Lead",
                8, "Remote", "Verified",
                "https://github.com/vj-cloud", "https://linkedin.com/in/vikram-joshi-devops", "https://vjops.cloud",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
            ),
            (
                "usr_sneha_06", "Sneha Roy", "sneha@xaviers.edu", hash_pw("password123"), "clg_sxc",
                "Visual Communication & Psychology student at St. Xavier's. I design user journeys that solve genuine student friction points.",
                "Product Designer & UX Researcher",
                10, "Remote", "Self-Declared",
                "https://dribbble.com/sneharoy-ux", "https://linkedin.com/in/sneha-roy-design", "https://sneharoy.portfolio",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
            ),
            (
                "usr_kabir_07", "Kabir Verma", "kabir@iitd.ac.in", hash_pw("password123"), "clg_iitd",
                "Robotics enthusiast at IIT Delhi. Designing autonomous navigation and embedded edge perception for agricultural robotics.",
                "Robotics & Embedded Systems Engineer",
                14, "In-person", "Verified",
                "https://github.com/kabirv-robotics", "https://linkedin.com/in/kabir-verma-iitd", "https://kabirverma.tech",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
            ),
            (
                "usr_diya_08", "Diya Nair", "diya@dtu.ac.in", hash_pw("password123"), "clg_dtu",
                "1st Year student eager to collaborate! Learned foundational Python and web development basics, looking to contribute and learn from experienced peers.",
                "Aspiring Fullstack Developer & Open Source Novice",
                8, "Remote", "Self-Declared",
                "https://github.com/diya-nair-codes", "https://linkedin.com/in/diya-nair-dtu", "https://diya.site",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
            )
        ]
        cursor.executemany("""
            INSERT INTO users (user_id, name, email, password_hash, college_id, bio, headline, availability_hours, collaboration_mode, verification_status, github_url, linkedin_url, portfolio_url, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, users)

        user_skills = [
            ("usr_aarav_01", "sk_java", "Advanced", 1, 0),
            ("usr_aarav_01", "sk_springboot", "Advanced", 1, 0),
            ("usr_aarav_01", "sk_fastapi", "Intermediate", 1, 0),
            ("usr_aarav_01", "sk_postgresql", "Advanced", 1, 0),
            ("usr_aarav_01", "sk_pytorch", "Beginner", 0, 1),
            ("usr_aarav_01", "sk_ml", "Beginner", 0, 1),

            ("usr_priya_02", "sk_pytorch", "Advanced", 1, 0),
            ("usr_priya_02", "sk_ml", "Advanced", 1, 0),
            ("usr_priya_02", "sk_cv", "Advanced", 1, 0),
            ("usr_priya_02", "sk_python", "Advanced", 1, 0),
            ("usr_priya_02", "sk_react", "Beginner", 0, 1),
            ("usr_priya_02", "sk_fastapi", "Beginner", 0, 1),

            ("usr_rohan_03", "sk_react", "Advanced", 1, 0),
            ("usr_rohan_03", "sk_ts", "Advanced", 1, 0),
            ("usr_rohan_03", "sk_tailwind", "Advanced", 1, 0),
            ("usr_rohan_03", "sk_figma", "Advanced", 1, 0),
            ("usr_rohan_03", "sk_uiux", "Advanced", 1, 0),
            ("usr_rohan_03", "sk_docker", "Beginner", 0, 1),

            ("usr_ananya_04", "sk_nlp", "Advanced", 1, 0),
            ("usr_ananya_04", "sk_python", "Advanced", 1, 0),
            ("usr_ananya_04", "sk_ml", "Intermediate", 1, 0),
            ("usr_ananya_04", "sk_uiux", "Beginner", 0, 1),

            ("usr_vikram_05", "sk_docker", "Expert", 1, 0),
            ("usr_vikram_05", "sk_kubernetes", "Advanced", 1, 0),
            ("usr_vikram_05", "sk_postgresql", "Intermediate", 1, 0),
            ("usr_vikram_05", "sk_pytorch", "Beginner", 0, 1),

            ("usr_sneha_06", "sk_uiux", "Advanced", 1, 0),
            ("usr_sneha_06", "sk_figma", "Expert", 1, 0),
            ("usr_sneha_06", "sk_product", "Intermediate", 1, 0),
            ("usr_sneha_06", "sk_react", "Beginner", 0, 1),

            ("usr_kabir_07", "sk_cplusplus", "Advanced", 1, 0),
            ("usr_kabir_07", "sk_ros", "Advanced", 1, 0),
            ("usr_kabir_07", "sk_python", "Intermediate", 1, 0),

            ("usr_diya_08", "sk_python", "Beginner", 1, 0),
            ("usr_diya_08", "sk_react", "Beginner", 0, 1),
        ]
        cursor.executemany("INSERT INTO user_skills VALUES (?, ?, ?, ?, ?)", user_skills)

        user_interests = [
            ("usr_aarav_01", "int_ai"),
            ("usr_aarav_01", "int_fintech"),
            ("usr_aarav_01", "int_opensource"),
            ("usr_priya_02", "int_ai"),
            ("usr_priya_02", "int_health"),
            ("usr_priya_02", "int_climate"),
            ("usr_rohan_03", "int_edtech"),
            ("usr_rohan_03", "int_gaming"),
            ("usr_rohan_03", "int_startups"),
            ("usr_ananya_04", "int_ai"),
            ("usr_ananya_04", "int_edtech"),
            ("usr_vikram_05", "int_opensource"),
            ("usr_vikram_05", "int_climate"),
            ("usr_sneha_06", "int_edtech"),
            ("usr_sneha_06", "int_social"),
            ("usr_kabir_07", "int_robotics"),
            ("usr_kabir_07", "int_climate"),
            ("usr_diya_08", "int_opensource"),
            ("usr_diya_08", "int_ai"),
        ]
        cursor.executemany("INSERT INTO user_interests VALUES (?, ?)", user_interests)

        projects = [
            (
                "prj_medscan_01", "usr_priya_02",
                "MedScan AI — Multimodal Radiology Assist",
                "AI-assisted preliminary radiograph screening with instant anomaly bounding boxes",
                "Hospital departments in underserved community health centers face acute radiologist shortages. MedScan AI assists frontline doctors with instantaneous preliminary screening for pneumonia, cardiomegaly, and fractures.",
                "Chest X-Ray interpretation takes 18-36 hours in tiered clinics. We are training an ensemble vision-transformer model capable of flagging emergency anomalies under 12 seconds with explainable heatmaps.",
                "AI/ML", "Prototype", "Recruiting", "10-12 hrs/week", "Remote", "Public",
                "https://github.com/medscan-ai/core", "https://medscan-demo.web.app", 0
            ),
            (
                "prj_campuscred_02", "usr_aarav_01",
                "CampusCred — Verifiable Inter-College Credentials",
                "Tamper-proof, cryptographically signed student achievement & hackathon portfolio pass",
                "College competition certificates are frequently PDF files prone to forgery, lacking standardized proof of team contribution or verifiable skill credentials across university registries.",
                "CampusCred provides cryptographic proof-of-contribution badges linked to students' public portfolios, verifiable in one click by hiring partners and hackathon organizers.",
                "Web", "In Development", "Recruiting", "8-10 hrs/week", "Remote", "Public",
                "https://github.com/campuscred/core", "https://campuscred.io", 0
            ),
            (
                "prj_signbridge_03", "usr_rohan_03",
                "SignBridge — Realtime Two-Way Sign Language Translator",
                "Browser-based sign language translation powered by WebGL and lightweight vision models",
                "Hard-of-hearing students in classrooms lack affordable, lag-free real-time translation tools for peer group discussions.",
                "SignBridge runs entirely in the browser using MediaPipe and TensorFlow.js, converting Indian Sign Language (ISL) gestures to live captions and synthesized speech.",
                "Social Impact", "Completed", "Completed", "5-8 hrs/week", "Remote", "Public",
                "https://github.com/signbridge/app", "https://signbridge-showcase.org", 1
            ),
            (
                "prj_agrirover_04", "usr_kabir_07",
                "AgriRover — Autonomous Solar Weed-Detection Rover",
                "Edge-AI robotic rover for precision pesticide spraying in micro-farms",
                "Overuse of chemical spray harms soil biome and inflates smallholder farmer costs.",
                "We built an autonomous rover utilizing ROS2, RTK-GPS, and an edge Jetson Nano that detects weeds via YOLOv8 and sprays micro-droplets with 92% chemical reduction.",
                "IoT", "Prototype", "Recruiting", "12-15 hrs/week", "Hybrid", "Public",
                "https://github.com/agrirover/hardware-ros", None, 0
            )
        ]
        cursor.executemany("""
            INSERT INTO projects (
                project_id, creator_id, title, tagline, description, problem_statement,
                category, project_stage, status, expected_commitment, collaboration_mode,
                visibility, repository_url, demo_url, showcase_featured
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, projects)

        requirements = [
            ("req_ms_01", "prj_medscan_01", "sk_fastapi", "Backend Engineer", 1, 0),
            ("req_ms_02", "prj_medscan_01", "sk_react", "Frontend Engineer", 1, 0),
            ("req_ms_03", "prj_medscan_01", "sk_uiux", "UI/UX Designer", 1, 0),

            ("req_cc_01", "prj_campuscred_02", "sk_react", "Frontend Developer", 1, 0),
            ("req_cc_02", "prj_campuscred_02", "sk_docker", "DevOps Engineer", 1, 0),

            ("req_ar_01", "prj_agrirover_04", "sk_cv", "Computer Vision Specialist", 1, 0),
            ("req_ar_02", "prj_agrirover_04", "sk_python", "Telemetry Backend", 1, 0),
        ]
        cursor.executemany("INSERT INTO project_skill_requirements VALUES (?, ?, ?, ?, ?, ?)", requirements)

        memberships = [
            ("mem_01", "prj_medscan_01", "usr_priya_02", "Lead AI Researcher", "Active"),
            ("mem_02", "prj_campuscred_02", "usr_aarav_01", "Backend Architect & Lead", "Active"),
            ("mem_03", "prj_signbridge_03", "usr_rohan_03", "Frontend Lead", "Completed"),
            ("mem_04", "prj_signbridge_03", "usr_ananya_04", "Model Optimization", "Completed"),
            ("mem_05", "prj_signbridge_03", "usr_sneha_06", "Accessibility UX", "Completed"),
            ("mem_06", "prj_agrirover_04", "usr_kabir_07", "Hardware & Robotics Lead", "Active"),
        ]
        cursor.executemany("INSERT INTO project_memberships (membership_id, project_id, user_id, role, status) VALUES (?, ?, ?, ?, ?)", memberships)

        tasks = [
            ("tsk_01", "prj_medscan_01", "Build DICOM image ingestion pipeline", "Expose FastAPI endpoint accepting multipart/form-data with 16-bit grayscale DICOM validation", "usr_priya_02", "2026-10-25", "In Progress"),
            ("tsk_02", "prj_medscan_01", "Benchmark Vision Transformer inference on CPU", "Evaluate ONNX runtime quantizations to ensure <1.5s latency on commodity edge servers", "usr_priya_02", "2026-10-30", "Todo"),
            ("tsk_03", "prj_medscan_01", "Draft clinical anomaly heatmap visualizer in React", "Interactive canvas displaying Grad-CAM overlay with adjustable opacity slider", None, "2026-11-05", "Todo"),
        ]
        cursor.executemany("INSERT INTO project_tasks (task_id, project_id, title, description, assigned_user_id, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)", tasks)

        milestones = [
            ("mls_01", "prj_medscan_01", "Model Validation on NIH Chest X-ray Dataset", "2026-10-20", "Completed"),
            ("mls_02", "prj_medscan_01", "Core FastAPI Diagnostic Endpoint Release", "2026-11-01", "Pending"),
            ("mls_03", "prj_medscan_01", "Inter-College Pilot Trial at Medical Clinics", "2026-11-20", "Pending"),
        ]
        cursor.executemany("INSERT INTO project_milestones VALUES (?, ?, ?, ?, ?)", milestones)

        resources = [
            ("res_01", "prj_medscan_01", "Model Architecture Paper & Weights", "https://arxiv.org/abs/2103.14030", "Document"),
            ("res_02", "prj_medscan_01", "Figma Clinical UI Prototypes", "https://figma.com/file/medscan-wireframes", "Figma"),
            ("res_03", "prj_campuscred_02", "W3C Verifiable Credentials Data Model", "https://www.w3.org/TR/vc-data-model/", "Document"),
        ]
        cursor.executemany("INSERT INTO project_resources VALUES (?, ?, ?, ?, ?)", resources)

        requests_data = [
            (
                "req_demo_01", "usr_rohan_03", "usr_aarav_01", "prj_campuscred_02", "Frontend Developer",
                "join_project", "Hey Aarav! Loved the CampusCred vision. I have built several high-performance React + TypeScript webapps at BITS and would love to build the frontend dashboard.",
                "Pending"
            ),
            (
                "req_demo_02", "usr_aarav_01", "usr_priya_02", "prj_medscan_01", "Backend Engineer",
                "join_project", "Hi Priya! I saw your post looking for a backend engineer for MedScan AI. I specialize in FastAPI & PostgreSQL and would love to co-build the API pipeline with you.",
                "Accepted"
            )
        ]
        cursor.executemany("""
            INSERT INTO collaboration_requests (request_id, sender_id, recipient_id, project_id, role_name, request_type, message, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, requests_data)

        clubs = [
            (
                "clb_01", "clg_dtu", "usr_aarav_01", "Developer Student Club (DSC)",
                "Coding & Tech", "DTU's flagship student developer community fostering open-source software, hackathons, and cross-campus technical workshops.",
                "Verified", "dsc@dtu.ac.in", 320, "https://dsc-dtu.org"
            ),
            (
                "clb_02", "clg_iitd", "usr_priya_02", "AI & Robotics Society (AIRS)",
                "AI/Data", "IIT Delhi's premier student hub for machine learning research, autonomous systems, and interdisciplinary hackathon teams.",
                "Verified", "airs@iitd.ac.in", 185, "https://airs-iitd.org"
            ),
            (
                "clb_03", "clg_bits", "usr_rohan_03", "Design & Creative Computing Guild",
                "Design & Media", "Bridging human-centered interaction design, WebGL art, and UI architecture across BITS campuses.",
                "Verified", "design@bits-pilani.ac.in", 140, "https://designguild.bits.org"
            ),
            (
                "clb_04", "clg_iiith", "usr_ananya_04", "Open Source Initiative (OSI)",
                "Coding & Tech", "Encouraging student contributions to Linux kernel, PyTorch, Apache, and community-led open software projects.",
                "Verified", "osi@iiith.ac.in", 210, "https://osi.iiith.ac.in"
            )
        ]
        cursor.executemany("""
            INSERT INTO clubs (club_id, college_id, lead_user_id, name, category, description, verification_status, contact_email, member_count, website)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, clubs)

        partnerships = [
            (
                "prt_01", "clb_01", "clb_02", "Cross-Campus AI Hackfest Joint Hosting",
                "DSC DTU and AIRS IIT Delhi partnering to host a 36-hour cross-college AI hackathon with shared mentorship and hardware compute grants.",
                "Accepted"
            )
        ]
        cursor.executemany("INSERT INTO club_partnerships (partnership_id, sender_club_id, recipient_club_id, title, proposal, status) VALUES (?, ?, ?, ?, ?, ?)", partnerships)

        events = [
            (
                "evt_01", "usr_aarav_01", "HackShift 2026 — 24-Hour Inter-College Hackathon",
                "Hackathon", "Build student-first cross-college software solutions. Tracks in AI/ML, Decentralized Web, HealthTech, and Campus Utilities. Grand prize compute credits & seed grants.",
                "2026-10-24 09:00", "Online & DTU Campus Auditorium", "Hybrid",
                "Open to all enrolled undergraduate and postgraduate students",
                "https://hackshift.dev/register", "2026-10-22"
            ),
            (
                "evt_02", "usr_priya_02", "National Medical Imaging AI Datathon",
                "Competition", "Collaborative 48-hour model training challenge on anonymized chest CT & ultrasound datasets. Inter-college teams highly encouraged!",
                "2026-11-12 10:00", "Virtual / Kaggle Platform", "Online",
                "Interdisciplinary teams of 2-4 students (Medical + Engineering)",
                "https://medai-datathon.org", "2026-11-05"
            ),
            (
                "evt_03", "usr_rohan_03", "Next-Gen Web UX & Accessibility Workshop",
                "Workshop", "Hands-on masterclass on building accessible, high-performance web applications using modern Tailwind CSS and WCAG 2.1 AAA standards.",
                "2026-10-28 17:00", "Google Meet & Live Stream", "Online",
                "Open to all students interested in frontend engineering and design",
                "https://bits-design.org/workshop", "2026-10-27"
            )
        ]
        cursor.executemany("""
            INSERT INTO events (event_id, organizer_id, title, category, description, start_time, venue, mode, eligibility, registration_url, deadline)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, events)

        notifs = [
            (
                "notif_01", "usr_aarav_01", "join_request",
                "Rohan Mehta from BITS Pilani submitted a request to join 'CampusCred' as Frontend Developer.",
                "req_demo_01", 0
            ),
            (
                "notif_02", "usr_aarav_01", "status_update",
                "Priya Patel accepted your collaboration request! You are now Backend Architect on 'MedScan AI'.",
                "req_demo_02", 0
            ),
            (
                "notif_03", "usr_priya_02", "match_alert",
                "Matching Engine found 3 new high-fit backend candidates for 'MedScan AI' from DTU and NSUT.",
                "prj_medscan_01", 1
            )
        ]
        cursor.executemany("INSERT INTO notifications (notification_id, recipient_id, type, message, related_entity_id, read_status) VALUES (?, ?, ?, ?, ?, ?)", notifs)

        conn.commit()

if __name__ == "__main__":
    seed()
