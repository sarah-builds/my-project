import { ReactNode, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { NavLink, useLocation } from 'react-router-dom';
import { isDemoMode } from "../lib/appMode";
import { useNavigate } from "react-router-dom";
import { logout } from "../lib/logout";


import {
  Home,
  Pill,
  Calendar,
  Mic,
  Image,
  Users,
  AlertTriangle
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/medicines', label: 'Medicines', icon: Pill },
  { path: '/schedule', label: 'Schedule', icon: Calendar },
  { path: '/voice', label: 'Voice Assistant', icon: Mic },
  { path: '/memories', label: 'Memories', icon: Image },
  { path: '/contacts', label: 'Contacts', icon: Users },
  
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const isDemo = isDemoMode();
  const [emergencyPhone, setEmergencyPhone] = useState("");

function playBeep() {
  const audio = new Audio(
    "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
  );
  audio.play();
}
async function handleLogout() {
  await logout(navigate);
  // window.location.href = "/";
}
useEffect(() => {
  loadEmergencyContact();
}, []);
async function loadEmergencyContact() {
  try {
    if (isDemoMode()) {
      setEmergencyPhone("112");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_favorite", true)
      .limit(1)
      .single();

    setEmergencyPhone(data?.phone || "112");
  } catch (err) {
    console.error(err);
  }
}
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex overflow-x-hidden">
      <aside
        className={`fixed left-0 top-0 h-full bg-white shadow-xl z-40 transition-all duration-300 ${
          sidebarOpen ? 'w-72' : 'w-24'
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-teal-100 bg-gradient-to-r from-teal-500 to-cyan-500">
          <h1 className={`font-bold text-white ${sidebarOpen ? 'text-3xl' : 'text-xl'}`}>
            {sidebarOpen ? 'Memora AI' : 'M'}
          </h1>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                 // ✅ state forward
                className={`flex items-center gap-4 px-4 py-5 rounded-xl mb-3 transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-teal-50 hover:text-teal-600'
                }`}
              >
                <Icon size={28} strokeWidth={2.5} />
                {sidebarOpen && (
                  <span className="text-xl font-medium">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

<button
  onClick={handleLogout}
  className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
>
  Logout
</button>
        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-teal-50 text-teal-600 rounded-lg font-medium hover:bg-teal-100 transition-colors"
        >
          {sidebarOpen ? '< Collapse' : '>'}
        </button>
      </aside>

      {/* Main content */}
     <main
  className={`flex-1 min-w-0 transition-all duration-300 ${
    sidebarOpen ? 'ml-72' : 'ml-24'
  }`}
>
        <div className="p-4 sm:p-6 lg:p-8 pb-32">
          {children}
        </div>
      </main>

      {/* SOS Button */}
      <button
        className="fixed bottom-8 right-8 w-24 h-24 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 z-50 animate-pulse"
 onClick={() => {
  if (isDemo) {
    alert("Demo mode: SOS disabled");
    return;
  }

  playBeep();

  const phoneToCall = emergencyPhone || "112";

  const ok = window.confirm(
    phoneToCall === "112"
      ? "No emergency contact found. Call 112?"
      : `Call emergency contact (${phoneToCall})?`
  );

  if (ok) {
    window.location.href = `tel:${phoneToCall}`;
  }
}}
      >
        <AlertTriangle size={32} />
        <span className="text-sm font-bold mt-1">SOS</span>
      </button>
    </div>
  );
}
