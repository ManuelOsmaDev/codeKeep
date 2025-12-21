import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import CodeKeep from './components/codeKeep';
import GoogleCallback from './components/GoogleCallback';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import SharedRoomView from './components/CodeKeep/ui/SharedRoomView';
import ScrumModule from './components/Scrum/ScrumModule';
import ApplicationDetail from './components/Scrum/ApplicationDetail';
import ProjectBoard from './components/Scrum/ProjectBoard';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<GoogleCallback />} />
          <Route path="/room/:token" element={<SharedRoomView />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <CodeKeep />
              </ProtectedRoute>
            }
          />
          {/* Scrum Module Routes */}
          <Route
            path="/scrum"
            element={
              <ProtectedRoute>
                <ScrumModule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scrum/app/:appId"
            element={
              <ProtectedRoute>
                <ApplicationDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scrum/project/:projectId"
            element={
              <ProtectedRoute>
                <ProjectBoard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

