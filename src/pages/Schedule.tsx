
import { DEMO_DATA } from '../lib/demoData';
import { isDemoMode } from "../lib/appMode";
import { useAuth } from "../lib/AuthContext";
import { useEffect, useState, useRef } from 'react';
import {
  Calendar,
  Sun,
  Heart,
  Utensils,
  Moon,
  Volume2,
  Check,
  Plus,
  Pencil,
  Trash2,
  Info,
  X,
  Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Schedule } from '../types/database';

type ModalMode = 'add' | 'edit' | 'details' | 'delete' | null;

const categoryConfig: Record<string, { icon: typeof Sun; gradient: string; label: string }> = {
  routine:     { icon: Sun,      gradient: 'from-blue-400 to-cyan-400',     label: 'Routine' },
  meal:        { icon: Utensils,  gradient: 'from-orange-400 to-amber-400', label: 'Meal' },
  medicine:    { icon: Heart,    gradient: 'from-rose-400 to-pink-400',     label: 'Medicine' },
  exercise:    { icon: Heart,    gradient: 'from-green-400 to-emerald-400',  label: 'Exercise' },
  social:      { icon: Heart,    gradient: 'from-violet-400 to-purple-400', label: 'Social' },
  rest:        { icon: Moon,     gradient: 'from-indigo-400 to-blue-400',   label: 'Rest' },
  appointment: { icon: Calendar, gradient: 'from-teal-400 to-cyan-400',    label: 'Appointment' },
  activity:    { icon: Sun,      gradient: 'from-teal-400 to-emerald-400',  label: 'Activity' },
  leisure:     { icon: Moon,     gradient: 'from-amber-400 to-yellow-400', label: 'Leisure' },
};

// ✅ "Today" tab alag hai header mein, yahan sirf Everyday + weekdays
const daysOfWeek = [
  { key: 'everyday', label: 'Everyday' },
  { key: 'monday',    label: 'Mon' },
  { key: 'tuesday',   label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday',  label: 'Thu' },
  { key: 'friday',    label: 'Fri' },
  { key: 'saturday',  label: 'Sat' },
  { key: 'sunday',    label: 'Sun' },
];

const emptySchedule: Omit<Schedule, 'id' | 'created_at'> = {
  time: '',
  activity: '',
  category: 'routine',
  completed: false,
  notes: '',
  day_of_week: 'everyday', // ✅ default everyday
};
function normalizeTime(t: string) {
  if (!t) return '';

  // already 24h format
  if (/^\d{2}:\d{2}$/.test(t)) return t;

  const match = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return '';

  let [, h, m, period] = match;
  let hour = parseInt(h, 10);

  if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;

  return `${String(hour).padStart(2, '0')}:${m}`;
}
export default function SchedulePage() {

  const isDemo = isDemoMode();
  const { user } = useAuth();

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState<string>('today');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [form, setForm] = useState(emptySchedule);
  const [saving, setSaving] = useState(false);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [notifiedToday, setNotifiedToday] = useState<string[]>([]);
  const lastTriggeredRef = useRef<Record<string, string>>({});

  // ✅ Notification permission maango
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(p => {
        console.log('Notification permission:', p);
      });
    }
  }, []);

  // ✅ Sirf ek useEffect fetch ke liye — user + isDemo + activeDay
  useEffect(() => {
    if (isDemo) {
      setSchedules(DEMO_DATA.schedules as any);
      setLoading(false);
      return;
    }
    if (user) fetchSchedules();
  }, [isDemo, user, activeDay]);

  // ✅ Reminder interval
 useEffect(() => {
  const interval = setInterval(() => {
    const now = new Date();
 const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    schedules.forEach((schedule) => {
      const scheduleTime = normalizeTime(schedule.time);

      if (!scheduleTime) return;

      // already completed skip
      if (schedule.completed) return;

      // already triggered this minute → skip
      if (lastTriggeredRef.current[schedule.id] === currentTime) return;

      if (scheduleTime === currentTime) {
        lastTriggeredRef.current[schedule.id] = currentTime;

        if (Notification.permission === 'granted') {
          new Notification('⏰ Schedule Reminder', {
            body: schedule.activity,
          });
        }

        speechSynthesis.cancel();
        speechSynthesis.speak(
          new SpeechSynthesisUtterance(`Reminder. ${schedule.activity}`)
        );
      }
    });
  }, 1000);

  return () => clearInterval(interval);
}, [schedules]);
  // ✅ Corrected fetchSchedules — today = aaj ka weekday + everyday
  async function fetchSchedules() {
    setLoading(true);
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      if (activeDay === 'today') {
        const todayName = ['sunday', 'monday', 'tuesday', 'wednesday',
          'thursday', 'friday', 'saturday'][new Date().getDay()];

        // ✅ Aaj ka weekday + everyday dono fetch karo
        const { data } = await supabase
          .from('schedules')
          .select('*')
          .eq('user_id', user.id)
          .in('day_of_week', [todayName, 'everyday'])
          .order('time');

        setSchedules(data || []);
      } else {
        // Specific day filter
        const { data } = await supabase
          .from('schedules')
          .select('*')
          .eq('user_id', user.id)
          .eq('day_of_week', activeDay)
          .order('time');

        setSchedules(data || []);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleCompleted(id: string, completed: boolean) {
    try {
      await supabase
        .from('schedules')
        .update({ completed: !completed })
        .eq('id', id);
      setSchedules(prev => prev.map(s =>
        s.id === id ? { ...s, completed: !completed } : s
      ));
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  }

  function readSchedule() {
    const text = schedules.map(s => `${s.time}, ${s.activity}`).join('. ');
    const utterance = new SpeechSynthesisUtterance(`Today's schedule. ${text}`);
    utterance.rate = 0.8;
    utterance.onend = () => setSpeaking(null);
    speechSynthesis.speak(utterance);
    setSpeaking('all');
  }

  function speakItem(schedule: Schedule) {
    const text = `${schedule.time}. ${schedule.activity}. ${schedule.notes || ''}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.onend = () => setSpeaking(null);
    speechSynthesis.speak(utterance);
    setSpeaking(schedule.id);
  }

  // ✅ openAddModal — today pe ho toh everyday default
  function openAddModal() {
    setForm({
      ...emptySchedule,
      day_of_week: activeDay === 'today' ? 'everyday' : activeDay,
    });
    setSelectedSchedule(null);
    setModalMode('add');
  }

  function openEditModal(schedule: Schedule) {
    setForm({
      time: schedule.time,
      activity: schedule.activity,
      category: schedule.category,
      completed: schedule.completed,
      notes: schedule.notes,
      day_of_week: schedule.day_of_week,
    });
    setSelectedSchedule(schedule);
    setModalMode('edit');
  }

  function openDetailsModal(schedule: Schedule) {
    setSelectedSchedule(schedule);
    setModalMode('details');
  }

  function openDeleteConfirm(schedule: Schedule) {
    setSelectedSchedule(schedule);
    setModalMode('delete');
  }

  function closeModal() {
    setModalMode(null);
    setSelectedSchedule(null);
    setForm(emptySchedule);
  }

  async function handleSave() {
    if (!form.activity.trim() || !form.time.trim()) return;

    setSaving(true);
    try {
      if (isDemo) {
        const fakeEntry = {
          ...form,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
        };
        // ✅ today tab pe everyday activities bhi dikhao
        const todayName = ['sunday', 'monday', 'tuesday', 'wednesday',
          'thursday', 'friday', 'saturday'][new Date().getDay()];
        const shouldShow =
          fakeEntry.day_of_week === activeDay ||
          (activeDay === 'today' && (fakeEntry.day_of_week === 'everyday' || fakeEntry.day_of_week === todayName));

        if (shouldShow) {
          setSchedules(prev => [...prev, fakeEntry as any]);
        }
        closeModal();
        return;
      }

      if (!user) return;

      if (modalMode === 'add') {
        const { data } = await supabase
          .from('schedules')
          .insert({ ...form, user_id: user.id })
          .select()
          .maybeSingle();

        if (data) {
          const todayName = ['sunday', 'monday', 'tuesday', 'wednesday',
            'thursday', 'friday', 'saturday'][new Date().getDay()];
          const shouldShow =
            data.day_of_week === activeDay ||
            (activeDay === 'today' && (data.day_of_week === 'everyday' || data.day_of_week === todayName));

          if (shouldShow) {
            setSchedules(prev => [...prev, data]);
          }
        }
      } else if (modalMode === 'edit' && selectedSchedule) {
        const { data } = await supabase
          .from('schedules')
          .update({ ...form })
          .eq('id', selectedSchedule.id)
          .eq('user_id', user.id)
          .select()
          .maybeSingle();
        if (data) {
          setSchedules(prev => prev.map(s => s.id === data.id ? data : s));
        }
      }
      closeModal();
    } catch (error) {
      console.error('Error saving schedule:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedSchedule) return;
    setSaving(true);
    try {
      if (isDemo) {
        setSchedules(prev => prev.filter(s => s.id !== selectedSchedule.id));
        closeModal();
        return;
      }

      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', selectedSchedule.id);

      if (error) { console.error(error); return; }

      setSchedules(prev => prev.filter(s => s.id !== selectedSchedule.id));
      closeModal();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  const completedCount = schedules.filter(s => s.completed).length;
  const dayLabel = activeDay === 'today'
    ? 'Today'
    : activeDay.charAt(0).toUpperCase() + activeDay.slice(1);

  // ✅ Skeleton loading
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-gray-100 rounded-2xl" />
        <div className="h-16 bg-white rounded-2xl" />
        <div className="space-y-4">
          <div className="h-24 bg-gray-100 rounded-2xl" />
          <div className="h-24 bg-gray-100 rounded-2xl" />
          <div className="h-24 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-800">Schedule</h1>
          <p className="text-base sm:text-xl text-gray-600 mt-2">
            {dayLabel} — {completedCount} of {schedules.length} completed
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <button
            onClick={readSchedule}
            disabled={speaking === 'all' || schedules.length === 0}
            className="flex items-center gap-3 px-6 py-4 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xl font-medium transition-colors disabled:opacity-40"
          >
            <Volume2 size={24} />
            Read Aloud
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-3 px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xl font-medium transition-colors shadow-lg"
          >
            <Plus size={28} />
            Add Activity
          </button>
        </div>
      </div>

      {/* ✅ Day Picker — Today alag, Everyday + Mon-Sun alag */}
      <div className="bg-white rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {/* Today button */}
          <button
            onClick={() => setActiveDay('today')}
            className={`flex-shrink-0 px-5 py-3 rounded-xl text-lg font-medium transition-colors ${
              activeDay === 'today'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Today
          </button>

          {/* Everyday + Mon-Sun */}
          {daysOfWeek.map(day => (
            <button
              key={day.key}
              onClick={() => setActiveDay(day.key)}
              className={`flex-shrink-0 px-5 py-3 rounded-xl text-lg font-medium transition-colors ${
                activeDay === day.key
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      {schedules.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg text-gray-600">Daily Progress</span>
            <span className="text-lg font-bold text-teal-600">
              {Math.round((completedCount / schedules.length) * 100)}%
            </span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 transition-all duration-500"
              style={{ width: `${(completedCount / schedules.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Schedule Items */}
      {schedules.length === 0 ? (
        <div className="text-center py-16">
          <Calendar size={64} className="text-gray-300 mx-auto mb-4" />
          <p className="text-2xl text-gray-500">No activities scheduled</p>
          <p className="text-lg text-gray-400 mt-2">Add your first activity for {dayLabel}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map(schedule => {
            const cfg = categoryConfig[schedule.category] || categoryConfig.routine;
            const Icon = cfg.icon;

            return (
              <div
                key={schedule.id}
                className={`bg-white rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 transition-all ${
                  schedule.completed ? 'opacity-60' : 'hover:shadow-xl'
                }`}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${cfg.gradient} rounded-xl flex items-center justify-center flex-shrink-0 ${schedule.completed ? 'opacity-50' : ''}`}>
                  <Icon size={28} className="text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base sm:text-xl font-bold text-teal-600">{schedule.time}</span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs sm:text-base">{cfg.label}</span>
                    {/* ✅ Everyday badge */}
                    {schedule.day_of_week === 'everyday' && (
                      <span className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded-full text-xs sm:text-base">Everyday</span>
                    )}
                  </div>
                  <h3 className={`text-lg sm:text-2xl font-bold text-gray-800 mt-1 break-words ${schedule.completed ? 'line-through' : ''}`}>
                    {schedule.activity}
                  </h3>
                  {schedule.notes && (
                    <p className="text-sm sm:text-base text-gray-500 mt-1 break-words">{schedule.notes}</p>
                  )}
                </div>

                <div className="flex flex-wrap sm:flex-nowrap justify-start sm:justify-end items-center gap-2 w-full sm:w-auto shrink-0">
                  <button onClick={() => speakItem(schedule)} disabled={speaking === schedule.id}
                    className="w-11 h-11 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50" title="Read aloud">
                    <Volume2 size={20} />
                  </button>
                  <button onClick={() => openDetailsModal(schedule)}
                    className="w-11 h-11 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center transition-colors" title="Details">
                    <Info size={20} />
                  </button>
                  <button onClick={() => openEditModal(schedule)}
                    className="w-11 h-11 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition-colors" title="Edit">
                    <Pencil size={20} />
                  </button>
                  <button onClick={() => toggleCompleted(schedule.id, schedule.completed)}
                    className={`w-11 h-11 rounded-lg flex items-center justify-center transition-colors ${schedule.completed ? 'bg-green-500 text-white' : 'bg-teal-50 hover:bg-teal-100 text-teal-600'}`}
                    title={schedule.completed ? 'Mark incomplete' : 'Mark complete'}>
                    <Check size={20} />
                  </button>
                  <button onClick={() => openDeleteConfirm(schedule)}
                    className="w-11 h-11 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition-colors" title="Delete">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODALS */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

            {/* Details Modal */}
            {modalMode === 'details' && selectedSchedule && (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Activity Details</h2>
                  <button onClick={closeModal} className="w-12 h-12 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <X size={24} className="text-gray-600" />
                  </button>
                </div>
                <div className="p-6">
                  {(() => {
                    const cfg = categoryConfig[selectedSchedule.category] || categoryConfig.routine;
                    const Icon = cfg.icon;
                    return (
                      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 text-center sm:text-left">
                        <div className={`w-16 h-16 bg-gradient-to-br ${cfg.gradient} rounded-xl flex items-center justify-center`}>
                          <Icon size={32} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800">{selectedSchedule.activity}</h3>
                          <span className="px-3 py-1 bg-gray-100 rounded-full text-lg">{cfg.label}</span>
                        </div>
                      </div>
                    );
                  })()}
                  <div className="space-y-3">
                    <DetailRow label="Time" value={selectedSchedule.time} />
                    <DetailRow label="Category" value={categoryConfig[selectedSchedule.category]?.label || selectedSchedule.category} />
                    <DetailRow label="Day" value={
                      selectedSchedule.day_of_week === 'everyday' ? 'Everyday' :
                      selectedSchedule.day_of_week === 'today' ? 'Today' :
                      selectedSchedule.day_of_week.charAt(0).toUpperCase() + selectedSchedule.day_of_week.slice(1)
                    } />
                    <DetailRow label="Status" value={selectedSchedule.completed ? 'Completed' : 'Pending'} />
                    <DetailRow label="Notes" value={selectedSchedule.notes || 'None'} />
                    <DetailRow label="Added" value={new Date(selectedSchedule.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
                  </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button onClick={() => { closeModal(); openEditModal(selectedSchedule); }}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-lg font-medium transition-colors">
                    <Pencil size={22} /> Edit
                  </button>
                  <button onClick={() => speakItem(selectedSchedule)}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-lg font-medium transition-colors">
                    <Volume2 size={22} /> Read Aloud
                  </button>
                </div>
              </>
            )}

            {/* Add / Edit Modal */}
            {(modalMode === 'add' || modalMode === 'edit') && (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    {modalMode === 'add' ? 'Add Activity' : 'Edit Activity'}
                  </h2>
                  <button onClick={closeModal} className="w-12 h-12 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <X size={24} className="text-gray-600" />
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  <FormField label="Activity" required>
                    <input type="text" value={form.activity}
                      onChange={(e) => setForm({ ...form, activity: e.target.value })}
                      placeholder="e.g. Morning walk in the park"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base sm:text-xl focus:border-teal-400 focus:outline-none transition-colors" />
                  </FormField>

                  <FormField label="Time" required>
                    <div className="flex items-center gap-2">
                      <Clock size={22} className="text-teal-500" />
                      <input type="time" value={convertTo24H(form.time)}
                        onChange={(e) => setForm({ ...form, time: convertTo12H(e.target.value) })}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-xl focus:border-teal-400 focus:outline-none transition-colors" />
                    </div>
                  </FormField>

                  <FormField label="Category">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(categoryConfig).map(([key, cfg]) => {
                        const Icon = cfg.icon;
                        const isSelected = form.category === key;
                        return (
                          <button key={key} type="button" onClick={() => setForm({ ...form, category: key })}
                            className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-base font-medium transition-all border-2 ${
                              isSelected ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            }`}>
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cfg.gradient} flex items-center justify-center`}>
                              <Icon size={20} className="text-white" />
                            </div>
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </FormField>

                  {/* ✅ Day picker — sirf Everyday + Mon-Sun, Today nahi */}
                  <FormField label="Day">
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map(day => (
                        <button key={day.key} type="button"
                          onClick={() => setForm({ ...form, day_of_week: day.key })}
                          className={`px-4 py-2 rounded-lg text-base font-medium transition-colors ${
                            form.day_of_week === day.key
                              ? 'bg-teal-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}>
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </FormField>

                  <FormField label="Notes">
                    <textarea value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="e.g. Bring water bottle" rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-xl focus:border-teal-400 focus:outline-none transition-colors resize-none" />
                  </FormField>
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button onClick={closeModal}
                    className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-lg font-medium transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving || !form.activity.trim() || !form.time.trim()}
                    className="flex-1 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-lg font-medium transition-colors disabled:opacity-40">
                    {saving ? 'Saving...' : modalMode === 'add' ? 'Add Activity' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}

            {/* Delete Modal */}
            {modalMode === 'delete' && selectedSchedule && (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-3xl font-bold text-gray-800">Confirm Delete</h2>
                  <button onClick={closeModal} className="w-12 h-12 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <X size={24} className="text-gray-600" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-red-50 rounded-xl p-6 mb-4 text-center sm:text-left">
                    <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Trash2 size={28} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xl text-gray-800">
                        Delete <strong>{selectedSchedule.activity}</strong> at {selectedSchedule.time}?
                      </p>
                      <p className="text-lg text-red-600 mt-2">This action cannot be undone.</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                  <button onClick={closeModal}
                    className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-lg font-medium transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleDelete} disabled={saving}
                    className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl text-lg font-medium transition-colors disabled:opacity-40">
                    {saving ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Helper components ---- */

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-2 border-b border-gray-50 gap-1">
      <span className="text-lg text-gray-500 font-medium">{label}</span>
      <span className="text-base sm:text-lg text-gray-800 font-medium text-left sm:text-right sm:ml-4">{value}</span>
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-lg font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function convertTo24H(time12: string): string {
  if (!time12) return '';
  if (/^\d{2}:\d{2}$/.test(time12) && !time12.includes('AM') && !time12.includes('PM')) return time12;
  const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return '';
  let [, h, m, period] = match;
  let hour = parseInt(h, 10);
  if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${m}`;
}

function convertTo12H(time24: string): string {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${String(hour12).padStart(1, '0')}:${String(m).padStart(2, '0')} ${period}`;
}
