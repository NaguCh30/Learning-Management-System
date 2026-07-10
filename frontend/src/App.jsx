import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import BrowseCourses from "./pages/BrowseCourses";
import CourseDetail from "./pages/CourseDetail";
import LessonPlayer from "./pages/LessonPlayer";
import QuizPage from "./pages/QuizPage";
import QuizResultPage from "./pages/QuizResultPage";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import ManageLessons from "./pages/ManageLessons";
import CreateQuiz from "./pages/CreateQuiz";
import About from "./pages/About";

import DashboardLayout from "./components/layout/DashboardLayout";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />

          {/* Protected + Layout Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<BrowseCourses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/lessons/:lessonId" element={<LessonPlayer />} />
            <Route path="/quizzes/:id" element={<QuizPage />} />
            <Route path="/quizzes/attempt/:attemptId" element={<QuizResultPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/about" element={<About />} />
            
            {/* Teacher Course Management Routes */}
            <Route path="/teacher/courses/:id/lessons" element={<ManageLessons />} />
            <Route path="/teacher/courses/:id/add-quiz" element={<CreateQuiz />} />
            <Route path="/teacher/quizzes/new" element={<CreateQuiz />} />

            {/* Admin Management Routes */}
            <Route path="/admin/users" element={<Dashboard />} />
            <Route path="/admin/approvals" element={<Dashboard />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;