import { DEMO_DATA } from '../lib/demoData';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // ✅ added useNavigate
import { isDemoMode } from "../lib/appMode";
import { logout } from "../lib/logout"; 
import { getUserFast } from "../lib/auth";// ✅ import logout
import {
  Heart, Pill, Calendar, Phone, Mic, Image,
  Users, Clock, ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from "../lib/AuthContext";
import type { Medicine, Schedule, Contact } from '../types/database';

export default function Home() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth(); // ✅ initialize navigate
  const isDemo = isDemoMode();

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  async function handleLogout() {
    await logout(navigate);
    window.location.href = "/";
  }

 async function fetchData() {
  setLoading(true);
  try {
    if (isDemo) {
      setMedicines(DEMO_DATA.medicines as any);
      setSchedules(DEMO_DATA.schedules as any);
      setContacts(DEMO_DATA.contacts as any);
      setLoading(false);
      return;
    }

    if (!user) return;

    const [medsRes, schedRes, contactsRes] = await Promise.all([
      supabase.from('medicines').select('*').eq('user_id', user.id).order('time'),
      supabase.from('schedules').select('*').eq('user_id', user.id).order('time'),
      supabase.from('contacts').select('*').eq('user_id', user.id).eq('is_favorite', true).limit(3),
    ]);

    setMedicines(medsRes.data || []);
    setSchedules(schedRes.data || []);
    setContacts(contactsRes.data || []);

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}

// ✅ Yeh useEffect replace karo
useEffect(() => {
  if (isDemo) {
    fetchData();
    return;
  }
  if (!authLoading && user) {
    fetchData();
  }
}, [authLoading, user, isDemo]);
  // ... rest of your JSX unchanged

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good Morning' :
    currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

  const nextMedicine = medicines.find(m => !m.taken);
  const upcomingSchedule = schedules.find(s => !s.completed);

// Home.tsx mein loading return replace karo
if (loading) {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="h-48 bg-teal-100 rounded-3xl" />
      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-40 bg-gray-100 rounded-2xl" />
        <div className="h-40 bg-gray-100 rounded-2xl" />
        <div className="h-40 bg-gray-100 rounded-2xl" />
      </div>
      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-56 bg-gray-100 rounded-2xl" />
        <div className="h-56 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  );
}

  return (
    <div className="space-y-8">

      {/* Hero */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl p-5 sm:p-8 lg:p-10 text-white shadow-2xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">{greeting}, Grandma!</h1>
        <p className="text-lg sm:text-xl lg:text-2xl opacity-90">Welcome to Memora AI. How can I help you today?</p>
        <div className="mt-6 flex items-center gap-2 text-xl opacity-80">
          <Heart className="animate-pulse" size={28} />
          <span>You have {medicines.filter(m => !m.taken).length} medicines to take today</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/voice"
          className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-teal-100 hover:border-teal-300 group"
        >
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mic size={40} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Voice Assistant</h3>
              <p className="text-lg text-gray-600 mt-1">Tell me what you need</p>
            </div>
          </div>
        </Link>

        <Link
          to="/memories"
          className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-orange-100 hover:border-orange-300 group"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-rose-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Image size={40} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Memory Replay</h3>
              <p className="text-lg text-gray-600 mt-1">Remember special moments</p>
            </div>
          </div>
        </Link>

        <Link
          to="/schedule"
          className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-100 hover:border-blue-300 group"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar size={40} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Today's Schedule</h3>
              <p className="text-lg text-gray-600 mt-1">View all activities</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Next Medicine + Schedule Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Next Medicine */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-teal-500">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Pill size={32} className="text-teal-600" />
              <h3 className="text-2xl font-bold text-gray-800">Next Medicine</h3>
            </div>
            <Link to="/medicines" className="text-teal-600 hover:text-teal-700 text-lg flex items-center gap-1">
              View all <ChevronRight size={20} />
            </Link>
          </div>
          {nextMedicine ? (
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h4 className="text-3xl font-bold text-gray-800">{nextMedicine.name}</h4>
                  <p className="text-xl text-gray-600 mt-2">{nextMedicine.dosage}</p>
                  {nextMedicine.notes && (
                    <p className="text-lg text-teal-700 mt-1">{nextMedicine.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-2xl text-teal-600">
                    <Clock size={28} />
                    <span className="font-bold">{nextMedicine.time}</span>
                  </div>
                  <button className="mt-4 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-lg font-medium transition-colors">
                    Mark as Taken
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xl text-green-600 font-medium">All medicines taken for today! 🎉</p>
          )}
        </div>

        {/* Today's Schedule Preview */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar size={32} className="text-blue-500" />
              <h3 className="text-2xl font-bold text-gray-800">Today's Schedule</h3>
            </div>
            <Link to="/schedule" className="text-blue-500 hover:text-blue-600 text-lg flex items-center gap-1">
              View all <ChevronRight size={20} />
            </Link>
          </div>
          {upcomingSchedule ? (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-blue-600 text-xl mb-2">
                    <Clock size={24} />
                    <span className="font-bold">{upcomingSchedule.time}</span>
                  </div>
                  <h4 className="text-3xl font-bold text-gray-800">{upcomingSchedule.activity}</h4>
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-lg capitalize">
                    {upcomingSchedule.category}
                  </span>
                </div>
                <button className="mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-lg font-medium transition-colors">
                  Mark Done
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xl text-green-600 font-medium">All activities completed! 🎉</p>
          )}
        </div>
      </div>

      {/* Quick Contacts */}
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users size={32} className="text-teal-600" />
            <h3 className="text-2xl font-bold text-gray-800">Quick Contacts</h3>
          </div>
          <Link to="/contacts" className="text-teal-600 hover:text-teal-700 text-lg flex items-center gap-1">
            View all <ChevronRight size={20} />
          </Link>
        </div>
        {contacts.length === 0 ? (
          <p className="text-gray-400 text-xl">No favourite contacts yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map(c => (
              <div key={c.id} className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-teal-50 rounded-xl p-5">
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{c.name}</h4>
                  <p className="text-lg text-gray-600">{c.relationship}</p>
                </div>
                <button
                  onClick={() => alert(`Calling ${c.name}...`)}
                  className="w-14 h-14 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <Phone size={24} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
