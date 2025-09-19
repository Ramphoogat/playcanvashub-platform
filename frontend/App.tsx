import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuthStore } from './stores/auth';
import { useEffect } from 'react';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Gallery } from './pages/Gallery';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { Dashboard } from './pages/creator/Dashboard';
import { CreateProject } from './pages/creator/CreateProject';
import { ProjectSettings } from './pages/creator/ProjectSettings';
import { Player } from './pages/Player';
import { CreatorProfile } from './pages/CreatorProfile';
import { ProjectDetail } from './pages/ProjectDetail';

export default function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Router>
        <Header />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create" element={<CreateProject />} />
            <Route path="/projects/:id/settings" element={<ProjectSettings />} />
            <Route path="/play/:slug" element={<Player />} />
            <Route path="/u/:username" element={<CreatorProfile />} />
            <Route path="/p/:slug" element={<ProjectDetail />} />
          </Routes>
        </main>
        <Toaster />
      </Router>
    </div>
  );
}
