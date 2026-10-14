# GroundUp (CampusConnect)

&lt;div align=&quot;center&quot;&gt;



**The Student-First Cross-College Collaboration & Algorithmic Teaming Platform**  
*HackShift 2026 Submission • Software Requirements Specification (SRS) v0.2 Compliant*

[Python](https://www.google.com/search?q=https%3A%2F%2Fpython.org)
[FastAPI](https://www.google.com/search?q=https%3A%2F%2Ffastapi.tiangolo.com)
[React](https://www.google.com/search?q=https%3A%2F%2Freact.dev)
[TailwindCSS](https://www.google.com/search?q=https%3A%2F%2Ftailwindcss.com)
[SQLite](https://www.google.com/search?q=https%3A%2F%2Fsqlite.org)
[License: MIT](https://www.google.com/search?q=LICENSE)
[PRs Welcome](https://www.google.com/search?q=CONTRIBUTING.md)

[Quickstart](#-quickstart-zero-configuration) • [Live Demo Workflow](#-evaluator--judge-walkthrough) • [Matching Engine](#-algorithmic-matching-engine-srs-44) • [Architecture](#-system-architecture--relational-schema) • [API Docs](#-api-specification--endpoints) • [GitHub Setup](#-pushing-to-github)

&lt;/div&gt;

---

## 📌 Executive Summary

Every hackathon season, thousands of motivated students face identical bottlenecks: **siloed campus networks**, **unbalanced team skillsets** (e.g., three frontend engineers and no backend lead), **ghosting during active sprints**, and **lack of verified proof-of-work** for completed builds.

**GroundUp** bridges inter-college boundaries to create a transparent, execution-focused builder ecosystem. Powered by a deterministic, **explainable multi-factor matching engine**, GroundUp algorithmically balances team roles, tracks sprint tasks through native **BuildSpace Kanban workspaces**, facilitates **bilateral peer skill swaps**, and verifies team achievements through permanent public project showcases.

---

## ✨ Key Platform Features

* **🧠 Explainable Algorithmic Matching:** Computes a transparent compatibility score ($M \in [0, 100]$) based on role skill fit, domain interests, reciprocal learning goals, and weekly availability bandwidth. Anti-black-box modal displays individual factor progress bars and natural-language rationales.
* **⚡ Dynamic Weight Renormalization:** Automatically reallocates scoring weights when candidates have undeclared availability hours ($H = \text{null}$), eliminating unfair penalties while rewarding complete profiles.
* **🔄 Peer-to-Peer Reciprocal SkillShare:** Identifies bilateral peer learning opportunities where Student A teaches a skill Student B wants to learn, and vice versa ($(S_{A,\text{teach}} \cap S_{B,\text{learn}} \neq \emptyset) \land (S_{B,\text{teach}} \cap S_{A,\text{learn}} \neq \emptyset)$).
* **🏢 BuildSpace Team Workspaces:** Full project lifecycle management including open role quota counters, join-request approval state machines (Pending $\to$ Accepted $\to$ Active), milestone timelines, and interactive Kanban boards (Todo $\to$ In Progress $\to$ Done).
* **💬 Polymorphic Messaging & Team Discussions:** Unified communication layer supporting project-wide technical discussions, private direct messages, and real-time collaboration updates.
* **🎨 AWS Builder Center UI Experience:** Modern developer-grade interface featuring a sticky utility bar, side drawer page index, pixelated design accents, and an active Light / Dark / System theme toggle engine.
* **👥 1-Click Multi-College Persona Switcher:** Switch between 8 pre-seeded student personas across Delhi Technological University (DTU), IIT Delhi, NSUT, BITS Pilani, and IIIT Hyderabad to instantly test multi-campus permissions and collaboration flows.
* **🏛️ Collegiate Club Network & Hackathon Hub:** Directory of verified campus technical societies, inter-college partnership proposals, and active hackathon opportunity listings.

---

## ⚡ Quickstart (Zero Configuration)

GroundUp is engineered to run out-of-the-box with pre-seeded cross-college mock data, requiring no external database servers or complex environment setups.

### Option 1: Direct Python Launcher (Recommended)

Requires Python 3.10+ installed.

```bash
# 1. Clone the repository
git clone https://github.com/daksh29-dot/IIITD-submission.git
cd IIITD-submission

# 2. Install lightweight dependencies
pip install -r backend/requirements.txt

# 3. Start the unified server (FastAPI + Embedded SPA)
python3 run.py
# Or on Linux/macOS:
./run.sh
```

* **Web Application:** [http://localhost:8000](https://www.google.com/search?q=http%3A%2F%2Flocalhost%3A8000)
* **Interactive Swagger API Docs:** [http://localhost:8000/docs](https://www.google.com/search?q=http%3A%2F%2Flocalhost%3A8000%2Fdocs)
* **ReDoc Contract:** [http://localhost:8000/redoc](https://www.google.com/search?q=http%3A%2F%2Flocalhost%3A8000%2Fredoc)

---

### Option 2: Standalone React + Vite Development Server

For frontend developers working with Hot Module Replacement (HMR):

```bash
# In terminal 1: Start backend API
python3 run.py

# In terminal 2: Start Vite Dev Server
cd frontend
npm install
npm run dev
```

* **Vite Dev Server:** [http://localhost:5173](https://www.google.com/search?q=http%3A%2F%2Flocalhost%3A5173)  
*(API proxy is pre-configured in `vite.config.ts` to seamlessly forward `/api` requests to port `8000`).*

---

### Option 3: Docker & Docker Compose

Deploy the containerized stack in a isolated production environment:

```bash
docker compose up --build -d
```

---

## 🧪 Evaluator & Judge Walkthrough

To verify the end-to-end cross-campus workflow during hackathon evaluation:

```
[Aarav Sharma (DTU)] ───► Discovers "MedScan AI" ───► Applies for Backend Role
                                                             │
                                                     (Persona Switch)
                                                             ▼
[Priya Patel (IIT Delhi)] ◄─── Receives Join Request ◄───────┘
          │
          └───► Accepts Request ───► Workspace Unlocked ───► Kanban Task Board Active
```

1. **Open the Application:** Navigate to [http://localhost:8000](https://www.google.com/search?q=http%3A%2F%2Flocalhost%3A8000). The active persona defaults to **Aarav Sharma (DTU, 3rd Year Software Eng)**.
2. **Explore Algorithmic Recommendations:** On the Dashboard under **"Projects Looking For You"**, observe **MedScan AI (IIT Delhi)** ranked at the top. Click the match badge to inspect the **Match Explanation Modal** (50% role fit in FastAPI, 20% shared interest in Healthcare AI, 15% reciprocal PyTorch learning goals).
3. **Submit a Collaboration Request:** Click **Apply to Join** on MedScan AI, select the open **Backend Engineer** role, enter a note, and submit.
4. **Switch Persona (1-Click Switcher):** In the top navigation bar, open the Persona Switcher dropdown and switch to **Priya Patel (IIT Delhi, 2nd Year CS)** — the project lead of MedScan AI.
5. **Accept Collaboration Request:** Notice the notification badge and the pending request from Aarav Sharma. Click **Accept & Add to Team**. The open role quota for Backend Engineer decrements automatically.
6. **Enter Project Workspace:** Navigate to **BuildSpace $\to$ MedScan AI $\to$ Workspace**. Aarav is now listed as an active team member.
7. **Manage Sprint Tasks:** On the Kanban board, add a task (`"Build FastAPI inference endpoint"`), assign it to Aarav, and drag it from **Todo** $\to$ **In Progress** $\to$ **Done**.

---

## 👥 Pre-Seeded Student Personas

The platform includes 8 authentic, diverse student personas representing multiple academic tiers and technical disciplines:

| Persona | College & Branch | Primary Skills | Learning Goals | Role in Platform |
| :--- | :--- | :--- | :--- | :--- |
| **Aarav Sharma** | DTU • Software Eng (3rd Yr) | Java, Spring Boot, FastAPI, PostgreSQL | PyTorch, Machine Learning | Project Lead (*CampusCred*), Candidate |
| **Priya Patel** | IIT Delhi • Computer Science (2nd Yr) | PyTorch, Computer Vision, Python | React, FastAPI | Project Lead (*MedScan AI*) |
| **Rohan Mehta** | BITS Pilani • Computer Science (3rd Yr) | React, TypeScript, Tailwind CSS, UI/UX | Docker, Cloud Arch | Shipped Project Creator (*SignBridge*) |
| **Ananya Sengupta** | IIIT Hyderabad • AI/ML (2nd Yr) | NLP, Transformers, Python | UI/UX, Product Design | SkillShare Mentor & Candidate |
| **Vikram Joshi** | NSUT Delhi • Information Tech (4th Yr) | Docker, Kubernetes, CI/CD, Go | PyTorch, MLOps | Infrastructure Specialist |
| **Sneha Roy** | St. Xavier's Mumbai • Design (2nd Yr) | Figma, Wireframing, User Research | Frontend Basics | Design Lead & Cross-Campus Partner |
| **Kabir Verma** | IIT Delhi • Electrical & Robotics (3rd Yr) | ROS2, C++, Embedded Systems, IoT | WebSockets, Dashboard Dev | Robotics Hardware Lead |
| **Diya Nair** | DTU • Computer Science (1st Yr) | HTML/CSS, JavaScript, Git | Python, Backend Dev | Junior Explorer & Open Source Contributor |

---

## 🧠 Algorithmic Matching Engine (SRS §4.4)

GroundUp replaces opaque machine-learning black boxes with a **deterministic, fully explainable mathematical scoring engine**.

### Composite Compatibility Formulation

$$M = 100 \times (0.50 \cdot R + 0.20 \cdot I + 0.15 \cdot L + 0.15 \cdot A)$$

| Factor | Name | Weight | Mathematical Formulation | Description |
| :---: | :--- | :---: | :--- | :--- |
| **$R$** | **Role & Skill Fit** | **50%** | $R = \frac{\|S_{\text{contribute}} \cap S_{\text{required}}\|}{\|S_{\text{required}}\|}$ | Direct overlap between candidate technical skills and unfilled project role requirements. |
| **$I$** | **Shared Interests** | **20%** | $I = \min\left(1.0, \frac{\|I_{\text{user}} \cap I_{\text{project}}\|}{2} + \delta_{\text{cat}}\right)$ | Shared domain interest tags (AI/ML, Web3, FinTech, Robotics, HealthTech). |
| **$L$** | **Learning Goals** | **15%** | $L = \frac{\|S_{\text{learn}} \cap S_{\text{project}}\|}{\|S_{\text{learn}}\|}$ | Reciprocal growth potential where project technologies match candidate learning goals. |
| **$A$** | **Availability & Mode** | **15%** | $A = \begin{cases} 1.0 & \text{if mode matches and } H \ge 10 \\ 0.7 & \text{if mode compatible and } H \ge 6 \\ 0.4 & \text{otherwise} \end{cases}$ | Alignment of weekly commitment hours and preferred collaboration mode. |

### Dynamic Weight Renormalization

When a student has not declared availability hours ($H = \text{null}$), GroundUp avoids unfairly penalizing them. The algorithm redistributes weights across the remaining three factors:

$$w'_R = \frac{0.50}{0.85} \approx 0.588, \quad w'_I = \frac{0.20}{0.85} \approx 0.235, \quad w'_L = \frac{0.15}{0.85} \approx 0.176, \quad w'_A = 0.0$$

### Reciprocal Peer Complementarity (SkillShare)

For 1-on-1 peer matching, bilateral complementarity is guaranteed by evaluating:

$$(S_{A,\text{teach}} \cap S_{B,\text{learn}} \neq \emptyset) \;\land\; (S_{B,\text{teach}} \cap S_{A,\text{learn}} \neq \emptyset)$$

---

## 🏗️ System Architecture & Relational Schema

GroundUp utilizes a **modular monolith** topology designed for maximum developer velocity, zero operational friction, and strict relational integrity.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER (SPA)                        │
│   React 18 • TypeScript • Tailwind CSS • Lucide Icons • Theme Engine   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ JSON over HTTP REST
┌───────────────────────────────────▼────────────────────────────────────┐
│                       FASTAPI APPLICATION SERVER                       │
│  ├── Auth & Personas   ├── Matching Engine   ├── Project Workspaces   │
│  ├── SkillShare        ├── Club Partnerships ├── Kanban & Milestones  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SQLAlchemy 2.0 (Sync Engine)
┌───────────────────────────────────▼────────────────────────────────────┐
│                    PERSISTENCE LAYER (SQLITE 3 WAL)                    │
│   16 Relational Tables • Foreign Key Constraints • Indexed Lookups     │
└────────────────────────────────────────────────────────────────────────┘
```

### 16-Table Relational Schema

| # | Table Name | Purpose & Relationships |
| :---: | :--- | :--- |
| **1** | `students` | Core user identity, university credentials, graduation year, bio, contact links. |
| **2** | `student_skills` | Normalized mapping of skills categorized into `contribute` (teach) and `learn` goals. |
| **3** | `student_interests` | Specialized domain and industry tags associated with individual profiles. |
| **4** | `projects` | Team build repository containing problem statement, stage, mode, lead ID, and repo URLs. |
| **5** | `project_roles` | Unfilled positions with target skill requirements and max quota allocation. |
| **6** | `project_tags` | Technical stack and domain tags tagged to active projects. |
| **7** | `project_members` | Active team roster linking student IDs to accepted roles and join timestamps. |
| **8** | `collaboration_requests` | Formal join requests with state machine status (`pending`, `accepted`, `rejected`). |
| **9** | `tasks` | Kanban task items with state columns (`todo`, `in_progress`, `done`) and assignees. |
| **10** | `milestones` | Chronological sprint targets with delivery target dates and completion flags. |
| **11** | `messages` | Team discussion thread and direct message records with polymorphic parent references. |
| **12** | `clubs` | Verified collegiate technical societies, student leads, and campus chapters. |
| **13** | `club_partnerships` | Inter-collegiate joint initiative proposals and event co-hosting records. |
| **14** | `opportunities` | Curated hackathons and competitions with dates, cash prizes, and registration links. |
| **15** | `showcase_projects` | Curated public directory of shipped, verified student builds and demo links. |
| **16** | `notifications` | User alert feed for join request decisions, task assignments, and club invitations. |

---

## 📡 API Specification & Endpoints

GroundUp provides over 40 structured REST endpoints documented via OpenAPI 3.0:

| Module | Method & Route | Description |
| :--- | :--- | :--- |
| **Auth** | `POST /api/auth/persona-login/{id}` | Instant session authentication using pre-seeded persona ID. |
| | `GET /api/auth/me` | Fetch active authenticated student profile with populated relations. |
| **Students** | `GET /api/students` | Search and filter students by university, skill, role, or mode. |
| | `GET /api/students/{id}` | Detailed profile view including contribution skills and learning goals. |
| **Projects** | `GET /api/projects` | Discover projects with filter support (stage, mode, domain tags). |
| | `POST /api/projects` | Publish a new build with required roles and open position quotas. |
| | `GET /api/projects/{id}` | Fetch full project workspace metadata, team members, and open roles. |
| **Matching** | `GET /api/matching/projects-for-me` | Returns projects ranked by compatibility score $M$ with explainable rationales. |
| | `GET /api/matching/candidates-for-project/{id}` | Returns ranked candidates for a project's open roles. |
| | `GET /api/matching/peers` | Discovers reciprocal SkillShare learning partners. |
| **Requests** | `POST /api/requests` | Submit formal join request with custom note and target role. |
| | `POST /api/requests/{id}/respond` | Accept or reject join request; automatically decrements open role slots. |
| **Workspace** | `GET /api/projects/{id}/tasks` | Retrieve Kanban task board items grouped by status. |
| | `POST /api/projects/{id}/tasks` | Create or update Kanban task status (`todo`, `in_progress`, `done`). |
| | `GET /api/projects/{id}/messages` | Retrieve team discussion messages. |
| | `POST /api/projects/{id}/messages` | Post a message to the project workspace discussion board. |
| **Network** | `GET /api/clubs` | Collegiate technical club directory and active initiatives. |
| | `GET /api/opportunities` | Live hackathons, grant opportunities, and competitions. |
| | `GET /api/showcase` | Shipped cross-campus project showcase gallery. |

---

## 📂 Project Directory Structure

```
IIITD-submission/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app initialization, CORS, static mounting
│   │   ├── database.py          # SQLite connection manager with WAL configuration
│   │   ├── models.py            # 16 SQLAlchemy ORM models matching SRS Section 7
│   │   ├── schemas.py           # Pydantic v2 validation schemas
│   │   ├── matching.py          # Section 4.4 Multi-Factor Weighted Matching Engine
│   │   ├── seed_data.py         # 8 multi-college personas & realistic mock records
│   │   ├── routers/
│   │   │   ├── auth.py          # Persona switching & session management
│   │   │   ├── students.py      # Student profile CRUD & directory filtering
│   │   │   ├── projects.py      # BuildSpace publishing, roles, & memberships
│   │   │   ├── matching.py      # Explainable recommendation engine endpoints
│   │   │   ├── requests.py      # Team join request state machine
│   │   │   ├── tasks.py         # Kanban boards & sprint milestone management
│   │   │   ├── messages.py      # Team discussions & polymorphic chat
│   │   │   ├── skillshare.py    # Reciprocal peer learning partner exchange
│   │   │   ├── clubs.py         # Technical societies & cross-campus partnerships
│   │   │   ├── opportunities.py # Hackathons & competition listings
│   │   │   ├── notifications.py # Notification dispatch & read receipts
│   │   │   └── showcase.py      # Shipped project directory & portfolio links
│   │   └── static/              # Compiled, production-ready embedded SPA
│   │       ├── index.html       # AWS Builder Center layout with pixel accents
│   │       ├── styles.css       # Tokenized design system & dark/light theme engine
│   │       └── app.js           # Client routing, state store, & modal controllers
│   └── requirements.txt         # Pinned backend dependencies
├── frontend/                    # Standalone React 18 + TypeScript + Vite project
│   ├── src/
│   │   ├── components/          # Navbar, FeatureBar, Modals, MatchBadge, ThemeToggle
│   │   ├── pages/               # Dashboard, Discover, BuildSpace, Workspace, Showcase
│   │   ├── services/            # Type-safe Axios REST API client
│   │   ├── types/               # Full TypeScript interface definitions
│   │   ├── App.tsx              # Application root & tab routing
│   │   └── main.tsx             # DOM mount point & global styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts           # Development proxy routing to port 8000
│   └── tailwind.config.js       # Slate/Teal color palette & custom tokens
├── artifacts/                   # Pitch decks, SRS specifications, & project documentation
│   ├── GroundUp_Project_Document.pdf # 10-page comprehensive engineering specification
│   └── CampusConnect_Pitch_Deck.pptx # 6-slide presentation deck
├── run.py                       # Zero-config root Python launcher
├── run.sh                       # Executable bash script launcher
├── Dockerfile                   # Multi-stage production container build
├── docker-compose.yml           # Unified container stack
├── LICENSE                      # MIT Open Source License
└── README.md                    # Project documentation
```

---

## 🚀 Pushing to GitHub

If you are setting up this repository on your local system or deploying to GitHub:

### 1. Initialize & Configure Remote

```bash
# In your local project folder (e.g., D:\campusconnect\campusconnect)
git init
git add .
git commit -m "feat: complete GroundUp platform with matching engine, workspaces & UI"
git branch -M main
```

### 2. Connect Remote Repository

```bash
# Using HTTPS:
git remote add origin https://github.com/daksh29-dot/IIITD-submission.git

# Or using SSH (recommended if you have SSH keys configured):
git remote set-url origin git@github.com:daksh29-dot/IIITD-submission.git
```

### 3. Push to GitHub

```bash
# Push main branch and set upstream tracking
git push -u origin main
```

> **Troubleshooting Git Authentication:**  
> If you encounter `fatal: Could not read from remote repository`:
> 1. **Verify repository creation:** Ensure the repository `daksh29-dot/IIITD-submission` is created under your GitHub account.
> 2. **Personal Access Token (PAT):** GitHub no longer accepts account passwords for HTTPS git operations. Generate a token via **GitHub $\to$ Settings $\to$ Developer Settings $\to$ Personal Access Tokens (Classic)** with the `repo` scope selected, and use the token as your password when prompted.
> 3. **SSH Keys:** Alternatively, add your SSH key (`cat ~/.ssh/id_ed25519.pub`) under **GitHub $\to$ Settings $\to$ SSH and GPG keys**.

---

## ⚖️ License & Hackathon Submission

This project was built for the **HackShift Hackathon (IIIT Delhi)** under the **Open Innovation & Campus Collaboration** track.

Distributed under the **MIT License**. See `LICENSE` for more information.

---

&lt;div align=&quot;center&quot;&gt;
Built with determination from the GroundUp by &lt;strong&gt;Daksh &amp; Team&lt;/strong&gt; for &lt;strong&gt;HackShift 2026&lt;/strong&gt;.
&lt;/div&gt;
