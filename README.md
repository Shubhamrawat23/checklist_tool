# Release Checklist Tool

A full-stack **Release Checklist Tool** built with **React**, **FastAPI**, and **PostgreSQL**. The application helps development teams manage software releases by tracking the completion status of predefined release checklist tasks.

## Features

- View all releases
- Create a new release
- View release details
- Mark checklist tasks as completed or incomplete
- Update release notes
- Automatically calculate release status
- Soft delete releases
- Single Page Application (SPA)
- RESTful API using FastAPI
- PostgreSQL database

---

# Tech Stack

## Frontend

- React 19
- React Router DOM
- Tailwind CSS
- Vite

## Backend

- FastAPI
- PostgreSQL
- psycopg2
- Pydantic
- Uvicorn

---

# Project Structure

```text
release-checklist-tool/
│
├── backend/
│   ├── app/
│   │   ├── db/
│   │   │   ├── db_connection.py
│   │   │   └── db_tables.py
│   │   │
│   │   ├── modules/
│   │   │   └── tkts/
│   │   │       ├── tkt_routes.py
│   │   │       ├── tkt_service.py
│   │   │       ├── tkt_repository.py
│   │   │       └── tkt_schema.py
│   │   │
│   │   └── main.py
│   │
│   ├── .env
│   ├── requirements.txt
│   └── venv/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── listing.jsx
│   │   │   ├── releaseForm.jsx
│   │   │   └── tktDetails.jsx
│   │   │
│   │   ├── config.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .env
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
│
├── .gitignore
└── README.md
```

---

# Backend Architecture

The backend follows a layered architecture to separate responsibilities and improve maintainability.

```text
                Client
                   │
                   ▼
           FastAPI Routes
                   │
                   ▼
             Service Layer
                   │
                   ▼
           Repository Layer
                   │
                   ▼
          PostgreSQL Database
```

### Layer Responsibilities

| Layer | Responsibility |
|--------|----------------|
| `main.py` | FastAPI application entry point |
| `tkt_routes.py` | Defines API endpoints |
| `tkt_service.py` | Contains business logic |
| `tkt_repository.py` | Performs database operations |
| `tkt_schema.py` | Defines request/response schemas |
| `db_connection.py` | Creates PostgreSQL connection |
| `db_tables.py` | Creates database tables and seeds default checklist tasks |

---

# Frontend Architecture

The frontend is built as a Single Page Application (SPA) using React.

```text
App
│
├── ReleaseForm
│
├── Listing
│
└── TktDetails
```

### Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| `App.jsx` | Main application layout |
| `releaseForm.jsx` | Create new release |
| `listing.jsx` | Display all releases |
| `tktDetails.jsx` | View and update checklist tasks |
| `config.js` | Stores backend API configuration |

---

# Prerequisites

Before running the application, make sure you have installed:

- Python 3.12+
- Node.js 20+
- PostgreSQL
- Git

---

# Backend Setup

Clone the repository

```bash
git clone https://github.com/your-username/release-checklist-tool.git

cd release-checklist-tool/backend
```

Create virtual environment

### Windows

```bash
python -m venv venv

venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv

source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

---

## Configure Environment Variables

Create a `.env` file inside the **backend** folder.

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=release_checklist
DB_USER=postgres
DB_PASSWORD=your_password
```

---

## Create Database Tables

Run the database initialization script.

```bash
python app/db/db_tables.py
```

This will:

- Create all required tables
- Insert the default release checklist tasks

---

## Start Backend Server

```bash
uvicorn app.main:app --reload
```

Backend URL

```
http://localhost:8000
```

Swagger Documentation

```
http://localhost:8000/docs
```

---

# Frontend Setup

Navigate to frontend

```bash
cd ../frontend
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
VITE_API_URL=http://localhost:8000
```

Run frontend

```bash
npm run dev
```

Frontend URL

```
http://localhost:5173
```

---

# API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/tkt/list` | Retrieve all releases |
| POST | `/tkt/create` | Create a new release |
| GET | `/tkt/{id}` | Retrieve release details |
| PATCH | `/tkt/update/{id}` | Update release notes and checklist |
| DELETE | `/tkt/delete/{id}` | Soft delete a release |

---

# Database Schema

## Table: `tkt_list`

Stores release information.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Release ID |
| name | VARCHAR(100) | Release name |
| release_date | TIMESTAMP | Release date |
| notes | TEXT | Additional information |
| is_delete | BOOLEAN | Soft delete flag |
| created_on | TIMESTAMP | Record creation timestamp |
| updated_on | TIMESTAMP | Last updated timestamp |

---

## Table: `tkts_task`

Stores the predefined release checklist.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Task ID |
| task_name | VARCHAR(100) | Checklist task |
| created_on | TIMESTAMP | Created timestamp |

### Default Checklist

- All relevant Github pull requests have been merged
- CHANGELOG.md files have been updated
- All tests are passing
- Releases in Github created
- Deployed in demo
- Tested thoroughly in demo
- Deployed in production

---

## Table: `tkt_completed_tasks`

Maps releases with checklist tasks.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Mapping ID |
| tkt_id | INTEGER | References `tkt_list.id` |
| task_id | INTEGER | References `tkts_task.id` |
| is_completed | BOOLEAN | Completion status |
| created_on | TIMESTAMP | Created timestamp |
| updated_on | TIMESTAMP | Updated timestamp |

---

# Entity Relationship

```text
tkt_list
   │
   │ 1
   │
   │ N
tkt_completed_tasks
   │
   │ N
   │
   │ 1
tkts_task
```

---

# Release Status Logic

The application automatically calculates the release status based on the completion of checklist tasks.

| Completed Tasks | Status |
|-----------------|--------|
| No tasks completed | Planned |
| One or more tasks completed | Ongoing |
| All tasks completed | Done |

The status is calculated dynamically and is not stored in the database.

---

# Design Decision

Although the assignment specifies that the checklist remains fixed for every release, the checklist has been stored in a dedicated `tkts_task` table instead of being hardcoded in the frontend.

This approach provides the following advantages:

- Maintains a normalized database design.
- Prevents duplication of checklist data across releases.
- Makes the application easier to maintain if checklist items need to change in the future.
- Keeps the checklist static from the end-user perspective while allowing future extensibility.

---

# Deployment

## Frontend

Hosted on **Vercel**

```
https://your-frontend-url.vercel.app
```

## Backend

Hosted on **Railway** or **Render**

```
https://your-backend-url.up.railway.app
```

## Database

Hosted on PostgreSQL (Neon / Railway / Supabase)

---

# Future Improvements

- User Authentication
- Role-based access control
- Search and filtering
- Pagination
- Docker support
- Automated tests
- GraphQL API
- Email notifications
- Release history

---

# License

This project was developed as part of a Full Stack Developer technical assessment.