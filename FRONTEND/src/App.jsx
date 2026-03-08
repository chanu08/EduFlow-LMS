import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './login';
import Register from './Register';
import Dashboard from './components/Dashboard';
import MyCourses from './components/MyCourses';
import Navbar from './components/Navbar';
import ManageCourse from './components/ManageCourse';
import CoursePlayer from './components/CoursePlayer';
import TakeQuiz from './components/TakeQuiz';
import CreateCourse from './components/CreateCourse';
import CourseDetails from './components/CourseDetails';
import LandingPage from './components/LandingPage';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public landing page — has its own navbar; no global Navbar */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth pages — no global Navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* App pages — wrapped with global Navbar */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen flex flex-col bg-gray-50">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/my-courses" element={<MyCourses />} />
                  <Route path="/create-course" element={<CreateCourse />} />
                  <Route path="/courses/:courseId" element={<CourseDetails />} />
                  <Route path="/manage-course/:courseId" element={<ManageCourse />} />
                  <Route path="/courses/:courseId/player" element={<CoursePlayer />} />
                  <Route path="/courses/:courseId/quiz" element={<TakeQuiz />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<AdminPanel />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
