# Learning Management System (LMS) - Complete Project Documentation

This document provides a comprehensive map, tech-stack breakdown, system design overview, role-based permissions directory, backend REST API catalog, model schema details, environment configurations, local deployment instructions, and bug fixes log for the LMS application.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Technology Stack & System Dependencies](#2-technology-stack--system-dependencies)
3. [Directory & File Structure Mapping](#3-directory--file-structure-mapping)
4. [Role-Based Access Control & Features](#4-role-based-access-control--features)
5. [Backend REST API Endpoint Catalog](#5-backend-rest-api-endpoint-catalog)
6. [Database Models & Schema Documentation](#6-database-models--schema-documentation)
7. [Environment Variables Configuration](#7-environment-variables-configuration)
8. [Local Deployment & Dev Server Setup](#8-local-deployment--dev-server-setup)
9. [Project Integration Fixes & Database Seeding Log](#9-project-integration-fixes--database-seeding-log)

---

## 1. Project Overview
This Learning Management System (LMS) is a full-stack, role-based education platform designed to facilitate online course delivery, lesson streaming, student progress tracking, automatic quiz evaluation, and admin system controls.

The architecture comprises:
- An **Express.js REST API server** connecting to a MongoDB database using Mongoose.
- A modern **Single Page Application (SPA) frontend** built using React, Vite, and React Router v7, styled with CSS and augmented with animations (Framer Motion) and analytics charts (Recharts).

---

## 2. Technology Stack & System Dependencies

### Backend (Express.js Dev Stack)
- **Core**: Node.js, Express.js (v5.2.1)
- **Database**: Mongoose (v9.3.1) - MongoDB Object Modeler
- **Security**: 
  - `jsonwebtoken` (v9.0.3) - token signing & decoding
  - `bcryptjs` (v3.0.3) - password hashing
- **Middleware**: `cors` (v2.8.6), `dotenv` (v17.3.1)
- **Dev Tools**: `nodemon` (v3.1.14) for auto-restart

### Frontend (React Client Stack)
- **Bundler & Runner**: Vite (v8.0.1)
- **Engine**: React (v19.2.4), React DOM (v19.2.4)
- **Routing**: React Router DOM (v7.13.2)
- **Network**: Axios (v1.18.1) for centralized and intercepted REST requests
- **Feedback & UI**: 
  - `react-hot-toast` (v2.6.0) for in-app alert notifications
  - `framer-motion` (v12.38.0) for transitions and structural interactive animations
  - `recharts` (v3.8.1) for dashboard progress and student statistics visualization
- **Quality Check**: ESLint (v9.39.4), Globals (v17.4.0)

---

## 3. Directory & File Structure Mapping

```text
LMS/
├── server/                           - Backend API Application
│   ├── config/
│   │   └── db.js                     - Database connector for MongoDB
│   │
│   ├── controllers/
│   │   ├── courseController.js       - Course publishing, lesson CRUD, and arrangement handlers
│   │   ├── notificationController.js - Notification alerts fetching and read updates
│   │   ├── progressController.js     - Student progress tracking and admin/teacher dashboard metrics
│   │   ├── quizController.js         - MCQ quiz builder, candidate answer grading, and analytics reports
│   │   └── userController.js         - Registration, JWT auth, credentials validations, and admin tools
│   │
│   ├── middleware/
│   │   └── authMiddleware.js         - JWT validation and role-based route guard middleware
│   │
│   ├── models/
│   │   ├── Course.js                 - Course model ref'ed to User
│   │   ├── Enrollment.js             - Enrollment linking Student + Course + progress ratio
│   │   ├── Lesson.js                 - Lesson model containing contents, video URL, order ref'ed to Course
│   │   ├── Notification.js           - In-app notification models (enum type, message, read flag)
│   │   ├── Progress.js               - Progress log for student's completed lessons
│   │   ├── Quiz.js                   - Quiz schema enclosing an embedded MCQ Question schema
│   │   ├── QuizAttempt.js            - Student submit records, answers, and scored points
│   │   └── User.js                   - Users auth details, roles, HOD candidacy flags, and status properties
│   │
│   ├── routes/
│   │   ├── courseRoutes.js           - Course endpoint mappings
│   │   ├── lessonRoutes.js           - Syllabus lesson CRUD endpoints
│   │   ├── notificationRoutes.js     - In-app notifications endpoints
│   │   ├── progressRoutes.js         - Progress reports endpoints
│   │   ├── quizRoutes.js             - Quiz, attempts, and admin statistics endpoints
│   │   └── userRoutes.js             - Auth services, approvals, deletions, and user directories
│   │
│   ├── utils/
│   │   └── seedAdmin.js              - Bootstrapping script to register the initial Super Admin account
│   │
│   ├── .env                          - Backend secret configurations (port, DB URI, cryptographic secrets)
│   ├── package.json                  - Backend library manifest
│   └── server.js                     - Core API initialization and middleware mounting point
│
└── frontend/                         - React Client Application
    ├── public/                       - Static assets
    ├── src/
    │   ├── assets/                   - React image templates
    │   ├── context/
    │   │   └── AuthContext.jsx       - Centralized context module (user, token state, roles flags, login)
    │   │
    │   ├── components/
    │   │   ├── layout/
    │   │   │   └── DashboardLayout.jsx - Shared sidebar layout with role-based links
    │   │   │
    │   │   ├── courses/
    │   │   │   ├── CourseCard.css
    │   │   │   └── CourseCard.jsx      - Compact courses listing visualization
    │   │   │
    │   │   ├── dashboard/
    │   │   │   ├── AdminDashboard.jsx  - Admin user search, pending approvals lists, system KPIs
    │   │   │   ├── StudentDashboard.jsx- Student enrollment trackers, notification feed, current courses
    │   │   │   └── TeacherDashboard.jsx- Teacher courses builder list, stats cards, and candidate metrics
    │   │   │
    │   │   └── ProtectedRoute.jsx    - Session validation router guard
    │   │
    │   ├── pages/
    │   │   ├── About.jsx             - App overview, creators, features, and specs
    │   │   ├── Auth.jsx              - Registration & Auth entry gate (switching mode Student/Teacher)
    │   │   ├── BrowseCourses.jsx     - Searchable public course repository
    │   │   ├── CourseDetail.jsx      - Course page with lessons list, quiz buttons, and teacher options
    │   │   ├── CreateQuiz.jsx        - Multi-option Quiz form builder for Instructors
    │   │   ├── Dashboard.jsx         - Profile-decider dispatch layout
    │   │   ├── Home.jsx              - Landing page with features highlight
    │   │   ├── LessonPlayer.jsx      - Video playback interface with mark-completed checkboxes
    │   │   ├── ManageLessons.jsx     - Lesson creator and drag-and-drop order layout
    │   │   ├── Notifications.jsx     - Dedicated user notifications list
    │   │   ├── Profile.jsx           - Bio, credentials, status details editor
    │   │   ├── QuizPage.jsx          - Realtime quiz test platform with timers
    │   │   └── QuizResultPage.jsx    - Graded scores, questions review, and answer breakdown
    │   │
    │   ├── services/
    │   │   └── api.js                - Central Axios module with auth header and error interceptor setup
    │   │
    │   ├── App.css                   - Styling helpers
    │   ├── App.jsx                   - Routing registry and Context Providers mounting point
    │   ├── index.css                 - Global designs system tokens
    │   └── main.jsx                  - Vite react entry mounting point
    │
    ├── .env                          - Frontend backend API endpoint definitions
    ├── eslint.config.js              - Linter rules
    ├── index.html                    - Global index framework
    ├── package.json                  - Frontend dependencies manifest
    └── vite.config.js                - Vite runtime options
```

---

## 4. Role-Based Access Control & Features

### Student Role
* **Browse Course Catalog**: Explore public courses, search, and view categories.
* **Course Registration**: Enroll in courses, unlocking lesson playlists.
* **Lesson Progress Tracks**: Watch lesson videos. Mark lessons completed/uncompleted to incrementally raise course completion percent.
* **Interactive Quiz Submissions**: Take tests linked to courses. Graded instantly on submit.
* **Gradebook Review**: Review score breakdown, time taken, correct answers, and feedback.
* **In-App Alerts Feed**: Poll and view immediate notices on grades, course modifications, or approvals.
* **Profile Page**: Update avatar, biodata, details.

### Teacher Role
* **Create & Edit Courses**: Build course card listings (title, course category, bio, thumbnails).
* **Lesson Management**: Upload, edit, delete lessons. Manage lesson play sequence.
* **Quiz Builder**: Create custom multi-choice assessments specifying score limits and quiz timers.
* **Score Analytics**: View student attempts and grade performance inside courses owned.
* **Promotion Applications**: Request "Head of Department" promotion status (HOD).
* **Await Approval**: New teacher accounts are flagged as "pending" at registration. They can only publish course updates once approved by an Admin.

### HOD (Head of Department) Role (Sub-role of Teacher)
* Possesses all Teacher capabilities.
* Performs department management actions (e.g., viewing registration requests) depending on HOD rules.

### Admin Role (includes Super Admin)
* **System Analytics KPIs**: Track total user count, global courses count, class lists metrics.
* **Approval Dashboard**: Approve or reject Pending Teachers/HOD applicants, activating their rights.
* **User Directory Management**: Query and search the entire database of students, teachers, and admins.
* **Create Teacher Accounts**: Instantiate teacher configurations pre-approved.
* **Role Toggling**: Manually toggle a Teacher's HOD status.
* **Safe Evictions**: Delete profiles of inactive or misbehaving accounts safely.

---

## 5. Backend REST API Endpoint Catalog

### User Authentication & Directories (`/api/users`)
* `POST /api/users/register` - Create new account (Student/Teacher/Admin)
* `POST /api/users/login` - Verify credentials and generate JWT
* `GET /api/users/profile` - Get authenticated user identity validation details
* `GET /api/users/:id` - Retrieve details of a specific user
* `GET /api/users/student` - Test endpoint (Student accessibility verify)
* `GET /api/users/teacher` - Test endpoint (Teacher accessibility verify)
* `GET /api/users/admin` - Test endpoint (Admin accessibility verify)
* `GET /api/users/all` - Admin only list of all user records
* `GET /api/users/pending-teachers` - Admin interface to list pending teacher registrations
* `PUT /api/users/approve-teacher/:userId` - Admin endpoint to approve or reject a teacher registration
* `GET /api/users/pending-hods` - Admin interface listing HOD candidacy applications
* `POST /api/users/request-hod` (or `request-hoc`) - Teacher request for Promotion to Head of Department (HOD)
* `PUT /api/users/approve-hod/:userId` - Admin endpoint approving or rejecting an HOD request
* `GET /api/users/search` - Search user database profiles
* `POST /api/users/admin/create-teacher` - Admin capability to register pre-approved Teacher directly
* `PUT /api/users/admin/toggle-hod/:userId` - Admin capability to promote/demote Teacher to HOD role status
* `DELETE /api/users/admin/delete-user/:userId` - Admin capability to purge a user account from database

### Course Management Service (`/api/courses`)
* `GET /api/courses` - Get all courses (public catalog exploration)
* `GET /api/courses/enrolled` - Retrieve courses enrolled by current Student
* `GET /api/courses/my` - Get courses created by current Teacher
* `GET /api/courses/:id` - Retrieve information on a specific course
* `POST /api/courses/:id/enroll` - Allow Student to enroll in a course
* `POST /api/courses` - Teacher endpoint to create a course profile
* `PUT /api/courses/:id` - Teacher endpoint to modify course details
* `DELETE /api/courses/:id` - Teacher endpoint to delete course configuration

### Lesson Planners Service (`/api/lessons`)
* `POST /api/lessons` - Teacher publishes a lesson containing video links for a course
* `GET /api/lessons/course/:courseId` - Retrieve all lessons belonging to a specific course
* `PUT /api/lessons/:lessonId` - Teacher edits a lesson title, text body, video link
* `DELETE /api/lessons/:lessonId` - Teacher removes a lesson record
* `PUT /api/lessons/reorder` - Teacher reorders lesson sequence order

### Student Progress Metrics (`/api/progress`)
* `POST /api/progress/complete` - Toggle student lesson state indicator to COMPLETED
* `POST /api/progress/uncomplete` - Toggle student lesson state indicator back to UNCOMPLETED
* `GET /api/progress/my/:courseId` - Get logged-in student progress ratio for a course
* `GET /api/progress/course/:courseId` - Fetch completion ratios of all students registered in course
* `GET /api/progress/teacher/overview` - General dashboard aggregates for instructor
* `GET /api/progress/teacher/courses` - Detailed overview of progress charts for instructor's courses
* `GET /api/progress/admin/overview` - Overall stats totals for administrator dashboard
* `GET /api/progress/admin/teachers` - Detailed grid of teachers tracking class completions

### Interactive Quiz Runner (`/api/quizzes`)
* `POST /api/quizzes` - Teacher builds MCQ Quiz containing questions lists
* `GET /api/quizzes` - Get quizzes available to take
* `POST /api/quizzes/:id/attempt` - Submit quiz session answers. Returns instantly evaluated grade.
* `GET /api/quizzes/attempt/:attemptId` - Return details, answers, and scores of a specific quiz attempt
* `GET /api/quizzes/:id/attempts` - Get attempts index for a specific quiz (Teacher lookups)
* `GET /api/quizzes/attempts` - Retrieve all quiz attempts on teacher-designed quizzes
* `GET /api/quizzes/admin` - Admin view of all quiz definitions
* `GET /api/quizzes/admin/attempts` - Admin view tracking all quiz attempts globally

### In-App Notifications Alerts (`/api/notifications`)
* `GET /api/notifications` - Get logs lists of all alerts for logged profile
* `PUT /api/notifications/:id/read` - Mark specific notice document read flag to TRUE

---

## 6. Database Models & Schema Documentation

### 1. User Model (`User`)
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  profilePic: { type: String },
  bio: { type: String },
  adminType: { type: String, enum: ['super', 'hod', null], default: null },
  hodStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: null }
}
// Timestamps enabled
```

### 2. Course Model (`Course`)
```javascript
{
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String },
  thumbnail: { type: String },
  teacher: { type: Schema.Types.ObjectId, ref: "User", required: true }
}
// Timestamps enabled
```

### 3. Lesson Model (`Lesson`)
```javascript
{
  title: { type: String, required: true },
  content: { type: String, required: true },
  videoUrl: { type: String },
  course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  order: { type: Number, required: true }
}
// Timestamps enabled
```

### 4. Enrollment Model (`Enrollment`)
```javascript
{
  student: { type: Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  progress: { type: Number, default: 0 }
}
// Unique compound index: { student: 1, course: 1 }
// Timestamps enabled
```

### 5. Progress Model (`Progress`)
```javascript
{
  student: { type: Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  completedLessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
  lastAccessedLesson: { type: Schema.Types.ObjectId, ref: "Lesson" }
}
// Timestamps enabled
```

### 6. Quiz Model (`Quiz`)
```javascript
{
  title: { type: String, required: true },
  description: { type: String },
  course: { type: Schema.Types.ObjectId, ref: "Course", default: null },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  questions: [
    {
      questionText: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctAnswer: { type: String, required: true } // validated to exist in options
    }
  ],
  totalMarks: { type: Number },
  timeLimit: { type: Number } // in minutes
}
// Timestamps enabled
```

### 7. Quiz Attempt Model (`QuizAttempt`)
```javascript
{
  student: { type: Schema.Types.ObjectId, ref: "User", required: true },
  quiz: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
  answers: [{ type: String }],
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now }
}
// Timestamps enabled
```

### 8. Notification Model (`Notification`)
```javascript
{
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: [
      "teacher_approved",
      "teacher_rejected",
      "hod_approved",
      "hod_rejected",
      "quiz_submitted",
      "course_created",
      "admin_action"
    ]
  },
  isRead: { type: Boolean, default: false }
}
// Timestamps enabled
```

---

## 7. Environment Variables Configuration

Both repository components require local `.env` configuration files to establish API routing variables and secure local database credentials.

### Server (Place in `server/.env`)
```ini
MONGO_URI=mongodb://127.0.0.1:27017/lms
PORT=5000
JWT_SECRET=mysupersecretkey
```
* `MONGO_URI`: The connection URI for the local MongoDB database instance (default port 27017).
* `PORT`: Server listener port. Dev configuration expects `5000`.
* `JWT_SECRET`: Random seed string utilized to encrypt local user login tokens.

### Frontend (Place in `frontend/.env`)
```ini
VITE_API_URL=http://localhost:5000
```
* `VITE_API_URL`: Root path of the back-end Express API. Vite binds this value to construct paths (e.g., `http://localhost:5000/api`).

---

## 8. Local Deployment & Dev Server Setup

Follow these steps to run the application in a local developer environment:

### Prerequisites
* **Node.js** installed (v18+ recommended)
* **MongoDB** installed and running on the default protocol (`mongodb://127.0.0.1:27017`)

### Step 1: Install and Run Server Backend
1. Open a terminal and navigate to the server folder:
   ```bash
   cd server
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Spin up the API server in developer nodemon hot-reload mode:
   ```bash
   npm run dev
   ```
4. The console should log:
   ```text
   MongoDB Connected: ...
   Server is running on port http://localhost:5000
   ```

### Step 2: Seed Super Admin Account
To perform administrative actions (approving users/HOD requests), seed the database with the default admin user:
1. Open a new terminal in the `server/` directory.
2. Run the seeding tool script:
   ```bash
   node utils/seedAdmin.js
   ```
3. This inserts an account with login:
   * **Email**: `admin@lms.com`
   * **Password**: `admin123`
   * **Role**: `admin`, **Status**: `approved`, **adminType**: `super`

### Step 3: Install and Run Frontend Client
1. Open a terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React client local server:
   ```bash
   npm run dev
   ```
4. Access the application in your browser at:
   * `http://localhost:5173/` (or the customized port listed in terminal)

### Step 4: Access and Test Roles
* Register as a Student or Register as a Teacher.
* Log in as Admin (`admin@lms.com` / `admin123`) to approve the new Teacher or the Teacher HOD status requests.
* Log in as the approved Teacher to build courses, add lesson items, and construct quizzes.
* Log in as Student to enroll in courses, mark progress checkpoints, and submit quiz evaluations.

---

## 9. Project Integration Fixes & Database Seeding Log

During full-stack integration verification, key backend refactoring steps were implemented to ensure frontend modules interact correctly with APIs:

1. **Quiz Schema/Controller Mismatch Fix**:
   * *File*: `server/models/Quiz.js` & `server/controllers/quizController.js`
   - *Action*: Harmonized property `correctAnswers` to singular `correctAnswer` in Mongoose definition to prevent quiz validation checks from failing during submission grading.
2. **Lesson Creation Mismatch Fix**:
   * *File*: `server/controllers/courseController.js`
   - *Action*: Resolved validation crashes in `createLesson` by passing `order: finalOrder` instead of invalid `finalOrder` parameter.
3. **Notification Routing Fix**:
   * *File*: `server/routes/notificationRoutes.js`
   - *Action*: Corrected Express route path formatting typo from `./:id/read` to `/:id/read`.
4. **Quiz Notification Crash Fix**:
   * *File*: `server/controllers/quizController.js`
   - *Action*: Imported `User` model and fetched student credentials inside `submitQuizAttempt` to prevent ReferenceError crash on `student.name` string operations.
5. **"quizes" Property Definition Fix**:
   * *File*: `server/controllers/quizController.js`
   - *Action*: Corrected typos mapping database fetch query responses (`quizes` to `quizzes`).
6. **Unhandled Catch-Block Fixes**:
   - *Action*: Wrapped catch blocks in `getAttemptDetails` and `getAllTeacherAttempts` to correctly return 500 statuses rather than ignoring execution runtime faults.
