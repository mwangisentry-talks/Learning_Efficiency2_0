# Learning_Efficiency2_0

# Learning Efficiency Tracker 2.0
> A PhD research intelligence system for tracking, measuring, and optimising learning sessions across AI & Cyber Forensics research domains.

---

## Concept

Designed by a PhD candidate in **AI and Cyber Forensics**, this system automates the measurement of learning efficiency across study sessions. Rather than tracking time alone, it quantifies the relationship between productive output and unresolved friction — giving a scientific score to every research session.

---

## Efficiency Formula

```
Learning Efficiency = (Time Spent × Concept Links) / (Knowledge Gaps × Research Questions)
```

| Variable | Symbol | Role |
|---|---|---|
| Time Spent | `Ts` | Hours invested in the session |
| Concept Links | `Cl` | Number of concepts connected |
| Knowledge Gaps | `Kg` | Unresolved gaps remaining |
| Research Questions | `Rq` | Open questions raised |

**Max Efficiency** is calculated assuming all gaps and questions are resolved:
```
Max Efficiency = (Ts × Cl) / (1 × 1)
```

**Efficiency Percentage** shows how close the session is to its own maximum potential:
```
Efficiency % = (Learning Efficiency / Max Efficiency) × 100
```

### Rating Scale

| Rating | Threshold |
|---|---|
| Excellent | ≥ 80% |
| Good | ≥ 60% |
| Average | ≥ 40% |
| Needs Work | < 40% |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 4.x + Django REST Framework |
| Database | SQLite (development) |
| Frontend | React 18 + Vite |
| Charts | Recharts |
| Routing | React Router DOM |
| Styling | Custom CSS (terminal / forensics aesthetic) |

---

## Project Structure

```
Learning_Efficiency2.0/
├── config/                        # Django project configuration
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
│
├── research/                      # Core Django application
│   ├── models.py                  # LearningRecord, ResearchPillar, KnowledgeGapTracker
│   ├── views.py                   # ViewSets + Dashboard
│   ├── serializers.py             # API serializers
│   ├── urls.py                    # Router registration
│   └── migrations/
│
├── frontend/                      # React application
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       └── components/
│           ├── phd_dashboard.jsx       # Mock data version
│           └── phd_dashboard_full.jsx  # Live API version
│
├── start.sh                       # One-command startup script
├── manage.py
├── db.sqlite3
└── README.md
```

---

## Data Models

### LearningRecord
Represents a single study session.

| Field | Type | Description |
|---|---|---|
| `title` | CharField | Session title |
| `pillar` | ForeignKey | Research domain |
| `session_type` | CharField | PAPER, CODING, WRITING, SEMINAR, REVIEW, EXPERIMENT |
| `time_spent` | FloatField | Hours spent |
| `concept_links` | FloatField | Concepts connected |
| `knowledge_gaps` | FloatField | Gaps remaining |
| `research_questions` | FloatField | Open questions |
| `learning_efficiency` | FloatField | Auto-calculated on save |
| `max_efficiency` | FloatField | Auto-calculated on save |
| `output_type` | CharField | NOTES, DRAFT, CODE, HYPOTHESIS, DIAGRAM, NONE |
| `output_notes` | TextField | Description of output produced |
| `recurring_gap` | BooleanField | Flags a recurring knowledge gap |
| `gap_description` | TextField | Description of the gap |

### ResearchPillar
Top-level research domains.

| Pillar | Key |
|---|---|
| AI Forensics | `AI_FORENSICS` |
| Cyber Security | `CYBER_SECURITY` |
| Legal & Forensic Framework | `LEGAL_FRAMEWORK` |
| Adversarial Machine Learning | `ML_ADVERSARIAL` |
| AI Attack Attribution | `ATTRIBUTION` |
| Tools & Methodology | `TOOLS_METHODS` |

### KnowledgeGapTracker
Tracks recurring knowledge gaps across sessions.

| Field | Type | Description |
|---|---|---|
| `gap` | CharField | Gap description |
| `pillar` | ForeignKey | Research domain |
| `sessions` | ManyToManyField | Linked sessions |
| `status` | CharField | OPEN, IN_PROGRESS, RESOLVED |
| `resolution_notes` | TextField | How the gap was resolved |
| `resolved_at` | DateTimeField | Resolution timestamp |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET / POST | `/api/v1/records/` | List or create sessions |
| GET / PUT / DELETE | `/api/v1/records/{id}/` | Single session |
| GET | `/api/v1/records/top_sessions/` | Top 5 by efficiency |
| GET | `/api/v1/records/weak_sessions/` | Bottom 5 by efficiency |
| GET / POST | `/api/v1/pillars/` | List or create pillars |
| GET | `/api/v1/pillars/{id}/sessions/` | Sessions per pillar |
| GET | `/api/v1/pillars/{id}/gaps/` | Gaps per pillar |
| GET / POST | `/api/v1/gaps/` | List or create gaps |
| POST | `/api/v1/gaps/{id}/resolve/` | Resolve a gap |
| GET | `/api/v1/dashboard/summary/` | Full dashboard summary |

### Query Filters

```bash
GET /api/v1/records/?pillar=AI_FORENSICS
GET /api/v1/records/?session_type=PAPER
GET /api/v1/records/?recurring_gaps=true
GET /api/v1/records/?has_output=true
GET /api/v1/gaps/?status=OPEN
```

---

## Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- pip
- npm

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/your-username/Learning_Efficiency2_0.git
cd Learning_Efficiency2_0

# Install Python dependencies
pip install django djangorestframework django-cors-headers

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start Django
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### One Command Startup (after first install)

```bash
./start.sh
```

---

## Running the App

| Server | URL |
|---|---|
| React Dashboard | http://localhost:5173/live |
| Django API | http://localhost:8000/api/v1/ |
| Django Admin | http://localhost:8000/admin/ |

---

## CORS Configuration

Required for React to communicate with Django:

```python
# config/settings.py
INSTALLED_APPS = [
    ...
    "corsheaders",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # must be first
    ...
]

CORS_ALLOW_ALL_ORIGINS = True  # tighten in production
```

---

## start.sh

```bash
#!/bin/bash
echo "Running migrations..."
cd /path/to/Learning_Efficiency2_0
python manage.py makemigrations
python manage.py migrate

echo "Starting Django..."
python manage.py runserver &

echo "Starting React..."
cd /path/to/Learning_Efficiency2_0/frontend
npm run dev &

echo ""
echo "✅ Django  → http://localhost:8000"
echo "✅ React   → http://localhost:5173/live"
```

---

## Research Context

This system was built to support PhD research in **AI and Cyber Forensics**, with a focus on the following research pillars:

- How do you forensically attribute an attack when the attacker used an AI system to execute it?
- Can LLM-generated artifacts be forensically distinguished from human-written ones?
- Can you fingerprint which AI model was used in an attack?
- What is the legal framework for AI-assisted crime attribution?
- Can AI forensic tools out-think AI attack tools?

The learning tracker serves as both a productivity tool and a live map of the researcher's knowledge density across these domains.

---

## Roadmap

- [ ] Authentication (JWT)
- [ ] Mobile responsive view
- [ ] Export sessions to PDF / CSV
- [ ] Weekly efficiency reports
- [ ] Literature reference linking per session
- [ ] Deploy to production (Railway / Render)

---

## License

MIT License — open for academic and research use.

---

> *"The best research is the kind you can measure."*
