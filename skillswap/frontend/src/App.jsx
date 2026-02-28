import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Mentors from './pages/Mentors';
import MentorProfile from './pages/MentorProfile';
import Chat from './pages/Chat';
import VideoCall from './pages/VideoCall';
import Wallet from './pages/Wallet';
import Bookings from './pages/Bookings';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuthStore();
  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/users/:id" element={<MentorProfile />} />
        <Route path="/mentors" element={<Mentors />} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/chat/:conversationId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/call/:channelName" element={<ProtectedRoute><VideoCall /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
      </Route>
    </Routes>
  );
}
