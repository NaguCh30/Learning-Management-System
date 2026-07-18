# Organize AI

A modern, full-stack task management, goal tracking, and calendar scheduling application powered by an integrated Groq AI Assistant.

Organize AI is designed to help users streamline their daily workflows, lay out long-term goals, schedule tasks onto a calendar without timing conflicts, and consult a smart, context-aware AI assistant to autogenerate goals/tasks and talk through productivity hurdles.

---

## Architecture Overview

Organize AI is divided into a robust, secure backend api and a clean, responsive frontend:

```
                  ┌──────────────────────┐
                  │   React 19 Frontend  │ (Vite, React Router v7)
                  └──────────┬───────────┘
                             │  HTTP / REST
                             ▼
                  ┌──────────────────────┐
                  │  Spring Boot Backend │ (Java 21, Spring Security, JWT)
                  └────┬────────────┬────┘
                       │            │
                       ▼            ▼
             ┌────────────┐      ┌────────────┐
             │ MongoDB DB │      │ Groq Cloud │ (llama-3.3-70b-versatile)
             └────────────┘      └────────────┘
```

*   **Frontend**: Built with **React 19**, **Vite** (for fast builds & modern dev server), and **React Router v7** for routing. Interface features custom CSS design, responsive layout, modal overlays, and Lucide React icons.
*   **Backend**: Java REST API using **Spring Boot 3.5**, secured with **Spring Security** and stateless **JWT authentication**.
*   **Database**: **MongoDB** for flexible document containment (Users, Goals, Tasks, ChatMessages).
*   **AI Engine**: Integrates with the **Groq Cloud API** using `llama-3.3-70b-versatile` to process assistant commands and chat dynamically.

---

## Tech Stack & Dependencies

### Backend (`/organize`)
*   **Language**: Java 21
*   **Framework**: Spring Boot 3.5.14
*   **Security**: Spring Security 6 (JWT-based Stateless Authentication)
*   **Database Integration**: Spring Data MongoDB
*   **AI Integration**: Groq API Custom client (`https://api.groq.com/openai/v1` via standard HTTP client calls)
*   **Lombok**: Annotation library for cleaner POJOs (Getters, Setters, Builders, etc.)
*   **Validation**: Spring Validation for robust input sanitation and format assertion.
*   **Key Libraries**: `io.jsonwebtoken:jjwt-api` (version 0.11.5) for secure token signature.

### Frontend (`/organize-frontend`)
*   **Runtime Environment**: Node.js
*   **Framework**: React 19.2.7 & React-DOM 19.2.7
*   **Build Bundler**: Vite 8.1.0
*   **Routing**: React Router DOM 7.18.0
*   **Markdown Rendering**: React-Markdown 10.1.0 & Remark GFM 4.0.1 (renders rich markdown responses from the AI chat)
*   **Icons**: Lucide React 1.24.0
*   **Linting**: Oxlint 1.69.0 for lightning-fast JavaScript/React quality analysis.

---

## Features

1.  **Secure Authentication**: JWT sign-in / registration with protected client-side routes (`ProtectedRoute.jsx`) and token parsing.
2.  **Dashboard**: Personal statistics, progress tracking, upcoming deadlines, and user task metrics.
3.  **Goal Hub**: Group tasks hierarchically under high-level "Goals" (e.g., "Learn Java 21"). Create, view, update, and track status.
4.  **Task Manager**: Control single tasks with properties like Category, Priority (High, Medium, Low), Status (Todo, In Progress, Completed), and due dates. Handles orphaned tasks and prevents duplicates with custom exceptions.
5.  **Smart Scheduler**: Custom calendar timeline to avoid overlapping tasks. Warns on scheduling conflicts.
6.  **AI Assistant Chat**: Sidebar AI chat interface. You can type commands like "create a goal to learn spring security" and the AI will parse your natural language intent into structured system actions, creating goals and tasks in real-time.

---

## Configuration & Environment Variables

The backend relies on the following environment variables. Ensure they are configured in your operating system or local profile when launching.

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `SPRING_DATA_MONGODB_URI` | Connection URI for the MongoDB instance | *(Required)* |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | *(Required)* |
| `JWT_EXPIRATION` | Duration of validity for JWT tokens (e.g., `86400000` for 24h) | *(Required)* |
| `GROQ_API_KEY` | API Key from Groq Cloud Console | *(Required)* |
| `PORT` | Local PORT for the Spring Boot application | `8080` |
| `FRONTEND_URL` | Base URL of the allowed frontend client (CORS configuration) | `http://localhost:5173` |

These are referenced directly in `organize/src/main/resources/application.properties`.

---

## Setup & Running Guide

### 1. MongoDB Database Setup
Ensure you have MongoDB running locally, or have access to a Mongo Atlas cluster:
```bash
# Example local mongo start (verify installation first)
mongod --dbpath /your/data/db
```
Set the `SPRING_DATA_MONGODB_URI` environment variable, for example:
```env
SPRING_DATA_MONGODB_URI=mongodb://localhost:27017/organize
```

### 2. Backend (Spring Boot)
1. Navigate to the backend directory:
   ```bash
   cd organize
   ```
2. Make sure environment variables (`SPRING_DATA_MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRATION`, `GROQ_API_KEY`) are set.
3. Build and package the application:
   ```bash
   mvn clean package
   ```
4. Run the boot application:
   ```bash
   # Linux/macOS
   ./mvnw spring-boot:run
   
   # Windows PowerShell
   .\mvnw spring-boot:run
   ```
   The backend API will verify DB connectivity and begin listening on `http://localhost:8080`.

### 3. Frontend (React + Vite)
1. Navigate to the frontend directory:
   ```bash
   cd organize-frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the development server (in development mode, hot module reloading):
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` (or the host Vite displays) in your browser.

---

## Core API Endpoints

### Auth (`/api/auth`)
*   `POST /api/auth/register` - Create new user account.
*   `POST /api/auth/login` - Secure login returning JWT token and user info.

### Goals (`/api/goals`)
*   `GET /api/goals` - Fetch all goals created by the current authenticated user.
*   `POST /api/goals` - Create a new goal.
*   `PUT /api/goals/{id}` - Update a goal status or details.
*   `DELETE /api/goals/{id}` - Delete a goal.

### Tasks (`/api/tasks`)
*   `GET /api/tasks` - Fetch all tasks for the user.
*   `POST /api/tasks` - Create a new task (can be standalone or linked to a `goalId`).
*   `PUT /api/tasks/{id}` - Modify status, priority, or details of a task.
*   `DELETE /api/tasks/{id}` - Delete a task.

### Schedule (`/api/schedule`)
*   `GET /api/schedule` - Fetch the calendar task timeline.
*   `POST /api/schedule/task` - Schedule tasks onto a set date/time. Returns scheduling status and alerts if there is a conflict.

### AI Assistant (`/api/ai`)
*   `POST /api/ai/chat` - Chat endpoint that connects to Groq API. Accepts chat query and outputs a tailored response while executing backend creations if requested by user commands.
