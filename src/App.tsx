import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Medicines from './pages/Medicines';
import Schedule from './pages/Schedule';
import VoiceAssistant from './pages/VoiceAssistant';
import Memories from './pages/Memories';
import Contacts from './pages/Contacts';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/voice" element={<VoiceAssistant />} />
          <Route path="/memories" element={<Memories />} />
          <Route path="/contacts" element={<Contacts />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
