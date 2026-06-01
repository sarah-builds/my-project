import { useEffect, useState } from 'react';
import { DEMO_DATA } from '../lib/demoData';
import { isDemoMode } from "../lib/appMode";
import { useAuth } from "../lib/AuthContext";

import {
  Pill,
  Plus,
  Volume2,
  Clock,
  Check,
  X,
  Pencil,
  Trash2,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Medicine } from '../types/database';

type ModalMode = 'add' | 'edit' | 'details' | 'delete' | null;

const emptyMedicine: Omit<Medicine, 'id' | 'created_at' | 'updated_at'> = {
  name: '',
  dosage: '',
  time: '',
  frequency: 'daily',
  taken: false,
  notes: '',
};

export default function Medicines() {

  const { user } = useAuth();
  const isDemo = isDemoMode();

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [form, setForm] = useState(emptyMedicine);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notifiedToday, setNotifiedToday] = useState<string[]>([]);

  // ✅ user dependency add kiya — user aane ke baad fetch karo
  useEffect(() => {
    if (isDemo) {
      setMedicines(DEMO_DATA.medicines as any);
      setLoading(false);
      return;
    }
    if (user) fetchMedicines();
  }, [isDemo, user]);

  useEffect(() => {
  setNotifiedToday([]);
}, [user?.id]);
  // ✅ Notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(p => {
        console.log('Notification permission:', p);
      });
    }
  }, []);
function normalizeTime(t: string) {
  if (!t) return '';

  if (/^\d{2}:\d{2}$/.test(t)) {
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
  }

  return t.trim();
}
  // ✅ Reminder interval — prev state use karo stale closure se bachne ke liye
 useEffect(() => {
  const interval = setInterval(() => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';

    if (hours === 0) hours = 12;
    else if (hours > 12) hours -= 12;

    const currentTime = `${hours}:${String(minutes).padStart(2, '0')} ${period}`;

    console.log('💊 Medicine check:', currentTime);

    medicines.forEach((medicine) => {
      console.log('  →', medicine.name, medicine.time, 'taken:', medicine.taken);

      if (
        normalizeTime(medicine.time) === normalizeTime(currentTime) &&
        !medicine.taken &&
        !notifiedToday.includes(medicine.id)
      ) {
        console.log('✅ MATCH:', medicine.name);

        if (Notification.permission === 'granted') {
          new Notification('💊 Medicine Reminder', {
            body: `${medicine.name} - ${medicine.dosage}`,
            icon: '/favicon.ico',
          });
        }

        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(
          `Time to take ${medicine.name}, ${medicine.dosage}`
        );
        speechSynthesis.speak(utterance);

        setNotifiedToday(prev => [...prev, medicine.id]);
      }
    });
  }, 10000);

  return () => clearInterval(interval);
}, [medicines, notifiedToday]);

  async function fetchMedicines() {
    try {
      if (!user) return;

      const { data } = await supabase
        .from('medicines')
        .select('*')
        .eq('user_id', user.id)
        .order('time');
      setMedicines(data || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleTaken(id: string, taken: boolean) {
    try {
      if (isDemo) {
        setMedicines(prev => prev.map(m =>
          m.id === id ? { ...m, taken: !taken } : m
        ));
        return;
      }
      await supabase
        .from('medicines')
        .update({ taken: !taken, updated_at: new Date().toISOString() })
        .eq('id', id);
      setMedicines(prev => prev.map(m =>
        m.id === id ? { ...m, taken: !taken } : m
      ));
    } catch (error) {
      console.error('Error updating medicine:', error);
    }
  }

  function speakReminder(medicine: Medicine) {
    const text = `Time to take ${medicine.name}, ${medicine.dosage}. ${medicine.notes || ''}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }

  function openAddModal() {
    setForm(emptyMedicine);
    setSelectedMedicine(null);
    setModalMode('add');
  }

  function openEditModal(medicine: Medicine) {
    setForm({
      name: medicine.name,
      dosage: medicine.dosage,
      time: medicine.time,
      frequency: medicine.frequency,
      taken: medicine.taken,
      notes: medicine.notes,
    });
    setSelectedMedicine(medicine);
    setModalMode('edit');
  }

  function openDetailsModal(medicine: Medicine) {
    setSelectedMedicine(medicine);
    setModalMode('details');
  }

  function openDeleteConfirm(medicine: Medicine) {
    setSelectedMedicine(medicine);
    setModalMode('delete');
  }

  function closeModal() {
    setModalMode(null);
    setSelectedMedicine(null);
    setForm(emptyMedicine);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.dosage.trim() || !form.time.trim()) return;

    setSaving(true);
    try {
      if (isDemo) {
        const fakeEntry = {
          ...form,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        if (modalMode === 'add') {
          setMedicines(prev => [...prev, fakeEntry as any]);
        } else if (modalMode === 'edit' && selectedMedicine) {
          setMedicines(prev => prev.map(m =>
            m.id === selectedMedicine.id ? { ...fakeEntry, id: selectedMedicine.id } as any : m
          ));
        }
        closeModal();
        return;
      }

      if (!user) return;

      if (modalMode === 'add') {
        const { data } = await supabase
          .from('medicines')
          .insert({ ...form, user_id: user.id })
          .select()
          .maybeSingle();
        if (data) setMedicines(prev => [...prev, data]);
      } else if (modalMode === 'edit' && selectedMedicine) {
        const { data } = await supabase
          .from('medicines')
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq('id', selectedMedicine.id)
          .eq('user_id', user.id)
          .select()
          .maybeSingle();
        if (data) setMedicines(prev => prev.map(m => m.id === data.id ? data : m));
      }
      closeModal();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedMedicine) return;
    setSaving(true);
    try {
      if (isDemo) {
        setMedicines(prev => prev.filter(m => m.id !== selectedMedicine.id));
        closeModal();
        return;
      }

      await supabase
        .from('medicines')
        .delete()
        .eq('id', selectedMedicine.id);

      setMedicines(prev => prev.filter(m => m.id !== selectedMedicine.id));
      closeModal();
    } catch (error) {
      console.error('Error deleting medicine:', error);
    } finally {
      setSaving(false);
    }
  }

  const frequencyOptions = ['daily', 'twice daily', 'weekly', 'as needed', 'with meals'];

  // ✅ Skeleton loading — medicines page ke liye sahi shape
  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-16 bg-gray-100 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-28 bg-teal-50 rounded-2xl" />
          <div className="h-28 bg-green-50 rounded-2xl" />
          <div className="h-28 bg-orange-50 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 bg-gray-100 rounded-2xl" />
          <div className="h-40 bg-gray-100 rounded-2xl" />
          <div className="h-40 bg-gray-100 rounded-2xl" />
          <div className="h-40 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  const takenCount = medicines.filter(m => m.taken).length;
  const remainingCount = medicines.filter(m => !m.taken).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-5xl font-bold text-gray-800">Medicines</h1>
          <p className="text-xl text-gray-600 mt-2">Manage your daily medications</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-3 px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xl font-medium transition-colors shadow-lg"
        >
          <Plus size={28} />
          Add Medicine
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-teal-500">
          <div className="flex items-center gap-4">
            <Pill size={40} className="text-teal-600" />
            <div>
              <p className="text-lg text-gray-600">Total</p>
              <p className="text-4xl font-bold text-gray-800">{medicines.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
          <div className="flex items-center gap-4">
            <Check size={40} className="text-green-600" />
            <div>
              <p className="text-lg text-gray-600">Taken</p>
              <p className="text-4xl font-bold text-gray-800">{takenCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center gap-4">
            <Clock size={40} className="text-orange-500" />
            <div>
              <p className="text-lg text-gray-600">Remaining</p>
              <p className="text-4xl font-bold text-gray-800">{remainingCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {medicines.length === 0 && (
        <div className="text-center py-16">
          <Pill size={64} className="text-gray-300 mx-auto mb-4" />
          <p className="text-2xl text-gray-500">No medicines added yet</p>
          <p className="text-lg text-gray-400 mt-2">Add your first medicine to get started</p>
        </div>
      )}

      {/* Medicine Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {medicines.map((medicine) => {
          const isExpanded = expandedId === medicine.id;

          return (
            <div
              key={medicine.id}
              className={`bg-white rounded-2xl shadow-lg border-2 transition-all ${
                medicine.taken
                  ? 'border-green-300 bg-green-50/40'
                  : 'border-teal-200 hover:border-teal-400 hover:shadow-xl'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-5 h-5 rounded-full flex-shrink-0 ${medicine.taken ? 'bg-green-500' : 'bg-teal-500'}`} />
                      <h3 className="text-2xl font-bold text-gray-800 truncate">{medicine.name}</h3>
                    </div>
                    <p className="text-lg text-gray-600 ml-8">{medicine.dosage}</p>
                    <div className="flex items-center gap-2 mt-2 ml-8 text-lg text-gray-700">
                      <Clock size={20} className="text-teal-500 flex-shrink-0" />
                      <span className="font-medium">{medicine.time}</span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded-full text-base">{medicine.frequency}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => speakReminder(medicine)}
                      className="w-12 h-12 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition-colors"
                      title="Voice Reminder">
                      <Volume2 size={22} />
                    </button>
                    <button onClick={() => toggleTaken(medicine.id, medicine.taken)}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                        medicine.taken ? 'bg-green-500 text-white' : 'bg-teal-50 hover:bg-teal-100 text-teal-600'
                      }`}
                      title={medicine.taken ? 'Mark as not taken' : 'Mark as taken'}>
                      <Check size={22} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 ml-8">
                  {medicine.notes && (
                    <p className={`text-base text-teal-700 ${isExpanded ? '' : 'truncate'}`}>
                      {medicine.notes}
                    </p>
                  )}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : medicine.id)}
                    className="flex items-center gap-1 text-base text-teal-600 hover:text-teal-700 ml-2 flex-shrink-0"
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="flex items-center gap-3 mt-4 ml-8 pt-4 border-t border-gray-100">
                    <button onClick={() => openDetailsModal(medicine)}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-base font-medium transition-colors">
                      <Info size={18} /> Details
                    </button>
                    <button onClick={() => openEditModal(medicine)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-base font-medium transition-colors">
                      <Pencil size={18} /> Edit
                    </button>
                    <button onClick={() => openDeleteConfirm(medicine)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-base font-medium transition-colors">
                      <Trash2 size={18} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODALS */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

            {/* Details Modal */}
            {modalMode === 'details' && selectedMedicine && (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-3xl font-bold text-gray-800">Medicine Details</h2>
                  <button onClick={closeModal} className="w-12 h-12 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <X size={24} className="text-gray-600" />
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  <DetailRow label="Name" value={selectedMedicine.name} />
                  <DetailRow label="Dosage" value={selectedMedicine.dosage} />
                  <DetailRow label="Time" value={selectedMedicine.time} />
                  <DetailRow label="Frequency" value={selectedMedicine.frequency} />
                  <DetailRow label="Status" value={selectedMedicine.taken ? 'Taken ✅' : 'Not taken yet'} />
                  <DetailRow label="Notes" value={selectedMedicine.notes || 'None'} />
                  <DetailRow label="Added" value={new Date(selectedMedicine.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button onClick={() => openEditModal(selectedMedicine)}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-lg font-medium transition-colors">
                    <Pencil size={22} /> Edit
                  </button>
                  <button onClick={() => speakReminder(selectedMedicine)}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-lg font-medium transition-colors">
                    <Volume2 size={22} /> Voice Reminder
                  </button>
                </div>
              </>
            )}

            {/* Add / Edit Modal */}
            {(modalMode === 'add' || modalMode === 'edit') && (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-3xl font-bold text-gray-800">
                    {modalMode === 'add' ? 'Add Medicine' : 'Edit Medicine'}
                  </h2>
                  <button onClick={closeModal} className="w-12 h-12 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <X size={24} className="text-gray-600" />
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  <FormField label="Medicine Name" required>
                    <input type="text" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Metformin"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-xl focus:border-teal-400 focus:outline-none transition-colors" />
                  </FormField>
                  <FormField label="Dosage" required>
                    <input type="text" value={form.dosage}
                      onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                      placeholder="e.g. 500mg"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-xl focus:border-teal-400 focus:outline-none transition-colors" />
                  </FormField>
                  <FormField label="Time" required>
                    <input type="time" value={convertTo24H(form.time)}
                      onChange={(e) => setForm({ ...form, time: convertTo12H(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-xl focus:border-teal-400 focus:outline-none transition-colors" />
                  </FormField>
                  <FormField label="Frequency">
                    <select value={form.frequency}
                      onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-xl focus:border-teal-400 focus:outline-none transition-colors bg-white">
                      {frequencyOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Notes">
                    <textarea value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="e.g. Take with breakfast" rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-xl focus:border-teal-400 focus:outline-none transition-colors resize-none" />
                  </FormField>
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button onClick={closeModal}
                    className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-lg font-medium transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSave}
                    disabled={saving || !form.name.trim() || !form.dosage.trim() || !form.time.trim()}
                    className="flex-1 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-lg font-medium transition-colors disabled:opacity-40">
                    {saving ? 'Saving...' : modalMode === 'add' ? 'Add Medicine' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}

            {/* Delete Modal */}
            {modalMode === 'delete' && selectedMedicine && (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-3xl font-bold text-gray-800">Confirm Delete</h2>
                  <button onClick={closeModal} className="w-12 h-12 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <X size={24} className="text-gray-600" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 bg-red-50 rounded-xl p-6 mb-6">
                    <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Trash2 size={28} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xl text-gray-800">
                        Are you sure you want to delete <strong>{selectedMedicine.name}</strong> ({selectedMedicine.dosage})?
                      </p>
                      <p className="text-lg text-red-600 mt-2">This action cannot be undone.</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3">
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
    <div className="flex items-start justify-between py-2 border-b border-gray-50">
      <span className="text-lg text-gray-500 font-medium">{label}</span>
      <span className="text-lg text-gray-800 font-medium text-right ml-4">{value}</span>
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
