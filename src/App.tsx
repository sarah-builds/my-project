import { useEffect } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { setAppMode } from './lib/appMode';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Setup from "./pages/Setup";
import Home from './pages/Home';
import Medicines from './pages/Medicines';
import Schedule from './pages/Schedule';
import VoiceAssistant from './pages/VoiceAssistant';
import Memories from './pages/Memories';
import Contacts from './pages/Contacts';

function DemoEntry() {
  setAppMode('demo'); // ✅ synchronous, runs before Navigate
  return <Navigate to="/home" replace />;
}
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/demo" element={<DemoEntry />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/setup" element={<Setup />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/medicines" element={<Layout><Medicines /></Layout>} />
        <Route path="/schedule" element={<Layout><Schedule /></Layout>} />
        <Route path="/voice" element={<Layout><VoiceAssistant /></Layout>} />
        <Route path="/memories" element={<Layout><Memories /></Layout>} />
        <Route path="/contacts" element={<Layout><Contacts /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
