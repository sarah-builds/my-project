import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Pill,
  Calendar,
  Mic,
  Image,
  Users,
  Clock,
  Phone,
  ChevronRight,
  Heart
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Medicine, Schedule, Contact } from '../types/database';

export default function Home() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [medsRes, schedRes, contactsRes] = await Promise.all([
        supabase.from('medicines').select('*').order('time'),
        supabase.from('schedules').select('*').eq('day_of_week', 'today').order('time'),
        supabase.from('contacts').select('*').eq('is_favorite', true).limit(3)
      ]);

      setMedicines(medsRes.data || []);
      setSchedules(schedRes.data || []);
      setContacts(contactsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const nextMedicine = medicines.find(m => !m.taken);
  const upcomingSchedule = schedules.find(s => !s.completed);

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-3xl text-teal-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl p-10 text-white shadow-2xl">
        <h1 className="text-5xl font-bold mb-3">{greeting}, Grandma!</h1>
        <p className="text-2xl opacity-90">Welcome to Memora AI. How can I help you today?</p>
        <div className="mt-6 flex items-center gap-2 text-xl opacity-80">
          <Heart className="animate-pulse" size={28} />
          <span>You have {medicines.filter(m => !m.taken).length} medicines to take today</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Voice Assistant Quick Access */}
        <Link
          to="/voice"
          className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-teal-100 hover:border-teal-300 group"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mic size={40} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Voice Assistant</h3>
              <p className="text-lg text-gray-600 mt-1">Tell me what you need</p>
            </div>
          </div>
        </Link>

        {/* Memory Replay Quick Access */}
        <Link
          to="/memories"
          className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-orange-100 hover:border-orange-300 group"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-rose-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Image size={40} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Memory Replay</h3>
              <p className="text-lg text-gray-600 mt-1">Remember special moments</p>
            </div>
          </div>
        </Link>

        {/* View Schedule */}
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

      {/* Main Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Medicine Reminder */}
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
              <div className="flex items-center justify-between">
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
            <p className="text-xl text-green-600 font-medium">All medicines taken for today!</p>
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
              <div className="flex items-center justify-between">
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
            <p className="text-xl text-green-600 font-medium">All activities completed!</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between bg-teal-50 rounded-xl p-5"
            >
              <div>
                <h4 className="text-xl font-bold text-gray-800">{contact.name}</h4>
                <p className="text-lg text-gray-600">{contact.relationship}</p>
              </div>
              <button
                onClick={() => alert(`Calling ${contact.name}...`)}
                className="w-14 h-14 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <Phone size={24} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
