import { BrowserRouter, Routes, Route } from "react-router-dom";
import FaceAuthPage from "./pages/faceAuth";
import Signup from "./pages/signup";
import Login from "./pages/login";
import { AuthProvider } from "./api/context";
import ProtectedRoute from "./api/protectedRoute";
import TeacherDashboard from "./pages/teacherDashboard";
import TeacherRoute from "./api/teacherRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import StudentDashboard from "./pages/studentDashboard";
import JitsiMeeting from "./pages/jitsiMeeting";
import ProfilePage from "./pages/profile";
import PasswordResetPage from "./pages/passwordReset";
import Default from "./pages/default";

function App() {

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>

      <BrowserRouter>
        <Routes>

          <Route path="/" element={<Default />} />

          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/save_face_encoding" element={<ProtectedRoute><FaceAuthPage /></ProtectedRoute>}></Route>
          <Route path="/teacher-dashboard" element={<TeacherRoute><TeacherDashboard /></TeacherRoute>}></Route>
          <Route path="/student-dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>}></Route>
          <Route path="/meeting/:sessionId" element={<ProtectedRoute><JitsiMeeting /></ProtectedRoute>}></Route>
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}></Route>
          <Route path="/password-reset" element={<PasswordResetPage />} />


        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
