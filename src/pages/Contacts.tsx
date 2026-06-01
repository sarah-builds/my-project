import { useAuth } from "../lib/AuthContext";
import { useEffect, useState } from 'react';
// import { useLocation } from 'react-router-dom';
import { DEMO_DATA } from '../lib/demoData';
import { isDemoMode } from "../lib/appMode";

import {
  Phone,
  Plus,
  Star,
  AlertTriangle,
  Heart,
  User,
  X,
  Pencil,
  Trash2,
  Info,
  Shield
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Contact } from '../types/database';

type ModalMode = 'add' | 'edit' | 'details' | 'delete' | null;

const emptyContact: Omit<Contact, 'id' | 'created_at'> = {
  name: '',
  relationship: 'family',
  phone: '',
  is_emergency: false,
  is_favorite: false,
  photo_url: '',
};

const relationshipOptions = [
  'family', 'son', 'daughter', 'spouse', 'sibling',
  'doctor', 'caregiver', 'neighbor', 'friend', 'emergency', 'other'
];

export default function Contacts() {


const isDemo = isDemoMode();
const { user } = useAuth(); // ✅
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [form, setForm] = useState(emptyContact);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
  try {
   if (isDemo) {
  const demoContacts = [
    ...DEMO_DATA.contacts,
    {
      id: "112-demo",
      name: "Emergency Help",
      phone: "112",
      relationship: "emergency",
      is_emergency: true,
      is_favorite: false,
      created_at: new Date().toISOString(),
    },
  ];

  setContacts(demoContacts as any);
  setLoading(false);
  return;
}

 
if (!user) return;

// STEP 1: fetch contacts
let { data: contactsData } = await supabase
  .from('contacts')
  .select('*')
  .eq('user_id', user.id);

let finalData = contactsData || [];

// STEP 2: if empty → insert default 112 contact
if (finalData.length === 0) {
  const defaultContact = {
    user_id: user.id,
    name: "Emergency Help",
    phone: "112",
    relationship: "emergency",
    is_emergency: true,
    is_favorite: false,
    photo_url: "",
  };

  const { data: inserted } = await supabase
    .from('contacts')
    .insert(defaultContact)
    .select()
    .single();

  if (inserted) {
    finalData = [inserted];
  }
}



// STEP 3: set state
setContacts(finalData);
  } catch (error) {
    console.error('Error fetching contacts:', error);
  } finally {
    setLoading(false);
  }
}
function callContact(contact: Contact) {
  if (isDemo) {
    alert(`Demo Mode: Calling is disabled. Would call ${contact.phone}`);
    return;
  }

  if (contact.phone === "112") {
    window.location.href = "tel:112";
    return;
  }

  window.location.href = `tel:${contact.phone}`;
}

  // --- Modal handlers ---

  function openAddModal() {
    setForm(emptyContact);
    setSelectedContact(null);
    setModalMode('add');
  }

  function openEditModal(contact: Contact) {
    setForm({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      is_emergency: contact.is_emergency,
      is_favorite: contact.is_favorite,
      photo_url: contact.photo_url,
    });
    setSelectedContact(contact);
    setModalMode('edit');
  }

  function openDetailsModal(contact: Contact) {
    setSelectedContact(contact);
    setModalMode('details');
  }

  function openDeleteConfirm(contact: Contact) {
    setSelectedContact(contact);
    setModalMode('delete');
  }

  function closeModal() {
    setModalMode(null);
    setSelectedContact(null);
    setForm(emptyContact);
  }

async function handleSave() {
  if (!form.name.trim() || !form.phone.trim()) return;

  setSaving(true);
  try {
    if (isDemo) {
      // ✅ Sirf state mein — no Supabase
      const fakeEntry = {
        ...form,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };
      setContacts(prev => [...prev, fakeEntry as any]);
      closeModal();
      return;
    }

   
    if (!user) return;

    if (modalMode === 'add') {
      const { data } = await supabase
        .from('contacts')
        .insert({ ...form, user_id: user.id })
        .select()
        .maybeSingle();
      if (data) {
        setContacts(prev => [...prev, data]);
      }
    } else if (modalMode === 'edit' && selectedContact) {
      const { data } = await supabase
        .from('contacts')
        .update({ ...form })
        .eq('id', selectedContact.id)
        .eq('user_id', user.id)
        .select()
        .maybeSingle();
      if (data) {
        setContacts(prev => prev.map(c => c.id === data.id ? data : c));
      }
    }
    closeModal();
  } catch (error) {
    console.error('Error saving contact:', error);
  } finally {
    setSaving(false);
  }
}
async function handleDelete() {
  if (!selectedContact) return;
  setSaving(true);

  try {
    // DEMO MODE
    if (isDemo) {
      setContacts(prev =>
        prev.filter(c => c.id !== selectedContact.id)
      );
      closeModal();
      return;
    }

    // REAL MODE
    await supabase
      .from('contacts')
      .delete()
      .eq('id', selectedContact.id);

    setContacts(prev =>
      prev.filter(c => c.id !== selectedContact.id)
    );

    closeModal();
  } catch (error) {
    console.error('Error deleting contact:', error);
  } finally {
    setSaving(false);
  }
}
  async function toggleEmergency(contact: Contact) {
    try {
      const newVal = !contact.is_emergency;
      await supabase
        .from('contacts')
        .update({ is_emergency: newVal })
        .eq('id', contact.id);
      setContacts(prev => prev.map(c =>
        c.id === contact.id ? { ...c, is_emergency: newVal } : c
      ));
      if (selectedContact && selectedContact.id === contact.id) {
        setSelectedContact({ ...selectedContact, is_emergency: newVal });
      }
    } catch (error) {
      console.error('Error toggling emergency:', error);
    }
  }

  // --- Derived lists ---
  const emergencyContacts = contacts.filter(c => c.is_emergency);
  const favoriteContacts = contacts.filter(c => c.is_favorite && !c.is_emergency);
  const otherContacts = contacts.filter(c => !c.is_favorite && !c.is_emergency);

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
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-5xl font-bold text-gray-800">Contacts</h1>
          <p className="text-xl text-gray-600 mt-2">Reach out to your loved ones</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-3 px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xl font-medium transition-colors shadow-lg"
        >
          <Plus size={28} />
          Add Contact
        </button>
      </div>

      {/* Emergency Contacts */}
      {emergencyContacts.length > 0 && (
        <div className="space-y-4">
          <SectionHeader icon={<AlertTriangle size={28} className="text-red-500" />} title="Emergency" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyContacts.map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                variant="emergency"
                onCall={callContact}
                onDetails={openDetailsModal}
                onEdit={openEditModal}
                onDelete={openDeleteConfirm}
                onToggleEmergency={toggleEmergency}
              />
            ))}
          </div>
        </div>
      )}

      {/* Favorite Contacts */}
      {favoriteContacts.length > 0 && (
        <div className="space-y-4">
          <SectionHeader icon={<Star size={28} className="text-orange-500" fill="currentColor" />} title="Favorites" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteContacts.map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                variant="favorite"
                onCall={callContact}
                onDetails={openDetailsModal}
                onEdit={openEditModal}
                onDelete={openDeleteConfirm}
                onToggleEmergency={toggleEmergency}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Contacts */}
      {otherContacts.length > 0 && (
        <div className="space-y-4">
          <SectionHeader icon={<Heart size={28} className="text-gray-500" />} title="All Contacts" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherContacts.map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                variant="default"
                onCall={callContact}
                onDetails={openDetailsModal}
                onEdit={openEditModal}
                onDelete={openDeleteConfirm}
                onToggleEmergency={toggleEmergency}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {contacts.length === 0 && (
        <div className="text-center py-16">
          <User size={64} className="text-gray-300 mx-auto mb-4" />
          <p className="text-2xl text-gray-500">No contacts yet</p>
          <p className="text-lg text-gray-400 mt-2">Add your first contact to get started</p>
        </div>
      )}

      {/* ---------- MODALS ---------- */}

      {modalMode && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ---- Details Modal ---- */}
            {modalMode === 'details' && selectedContact && (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-3xl font-bold text-gray-800">Contact Details</h2>
                  <button onClick={closeModal} className="w-12 h-12 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <X size={24} className="text-gray-600" />
                  </button>
                </div>
                <div className="p-6">
                  {/* Avatar and name */}
                  <div className="flex items-center gap-5 mb-6">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                      selectedContact.is_emergency
                        ? 'bg-red-500'
                        : selectedContact.is_favorite
                          ? 'bg-gradient-to-br from-orange-400 to-rose-400'
                          : 'bg-gradient-to-br from-teal-400 to-cyan-400'
                    }`}>
                      <User size={40} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-gray-800">{selectedContact.name}</h3>
                      <p className="text-xl text-gray-600 capitalize">{selectedContact.relationship}</p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedContact.is_emergency && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-lg font-medium">
                        <AlertTriangle size={16} /> Emergency
                      </span>
                    )}
                    {selectedContact.is_favorite && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-lg font-medium">
                        <Star size={16} fill="currentColor" /> Favorite
                      </span>
                    )}
                  </div>

                  {/* Info rows */}
                  <div className="space-y-4">
                    <DetailRow label="Phone" value={selectedContact.phone} />
                    <DetailRow label="Relationship" value={selectedContact.relationship.charAt(0).toUpperCase() + selectedContact.relationship.slice(1)} />
                    <DetailRow label="Emergency Contact" value={selectedContact.is_emergency ? 'Yes' : 'No'} />
                    <DetailRow label="Favorite" value={selectedContact.is_favorite ? 'Yes' : 'No'} />
                    <DetailRow label="Added" value={new Date(selectedContact.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
                  </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={() => callContact(selectedContact)}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-lg font-medium transition-colors"
                  >
                    <Phone size={22} />
                    Call
                  </button>
                  <button
                    onClick={() => openEditModal(selectedContact)}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-lg font-medium transition-colors"
                  >
                    <Pencil size={22} />
                    Edit
                  </button>
                </div>
              </>
            )}

            {/* ---- Add / Edit Modal ---- */}
            {(modalMode === 'add' || modalMode === 'edit') && (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-3xl font-bold text-gray-800">
                    {modalMode === 'add' ? 'Add Contact' : 'Edit Contact'}
                  </h2>
                  <button onClick={closeModal} className="w-12 h-12 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <X size={24} className="text-gray-600" />
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  <FormField label="Name" required>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Sarah Johnson"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-xl focus:border-teal-400 focus:outline-none transition-colors"
                    />
                  </FormField>
                  <FormField label="Phone Number" required>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="e.g. +1 (555) 123-4567"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-xl focus:border-teal-400 focus:outline-none transition-colors"
                    />
                  </FormField>
                  <FormField label="Relationship">
                    <select
                      value={form.relationship}
                      onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-xl focus:border-teal-400 focus:outline-none transition-colors bg-white"
                    >
                      {relationshipOptions.map(opt => (
                        <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                      ))}
                    </select>
                  </FormField>

                  {/* Toggle switches */}
                  <div className="space-y-4 pt-2">
                    <ToggleRow
                      label="Emergency Contact"
                      description="Will appear in the emergency section at the top"
                      enabled={form.is_emergency}
                      onToggle={() => setForm({ ...form, is_emergency: !form.is_emergency })}
                      color="red"
                    />
                    <ToggleRow
                      label="Favorite"
                      description="Will appear in the favorites section"
                      enabled={form.is_favorite}
                      onToggle={() => setForm({ ...form, is_favorite: !form.is_favorite })}
                      color="orange"
                    />
                  </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.name.trim() || !form.phone.trim()}
                    className="flex-1 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-lg font-medium transition-colors disabled:opacity-40"
                  >
                    {saving ? 'Saving...' : modalMode === 'add' ? 'Add Contact' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}

            {/* ---- Delete Confirmation Modal ---- */}
            {modalMode === 'delete' && selectedContact && (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-3xl font-bold text-gray-800">Confirm Delete</h2>
                  <button onClick={closeModal} className="w-12 h-12 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <X size={24} className="text-gray-600" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 bg-red-50 rounded-xl p-6 mb-4">
                    <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Trash2 size={28} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xl text-gray-800">
                        Are you sure you want to delete <strong>{selectedContact.name}</strong>?
                      </p>
                      <p className="text-lg text-red-600 mt-2">This action cannot be undone.</p>
                    </div>
                  </div>
                  {selectedContact.is_emergency && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <AlertTriangle size={20} className="text-amber-600" />
                      <p className="text-lg text-amber-700">This is an emergency contact. Removing it may affect safety.</p>
                    </div>
                  )}
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl text-lg font-medium transition-colors disabled:opacity-40"
                  >
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

/* ---- Sub-components ---- */

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
    </div>
  );
}

interface ContactCardProps {
  contact: Contact;
  variant: 'emergency' | 'favorite' | 'default';
  onCall: (c: Contact) => void;
  onDetails: (c: Contact) => void;
  onEdit: (c: Contact) => void;
  onDelete: (c: Contact) => void;
  onToggleEmergency: (c: Contact) => void;
}

function ContactCard({ contact, variant, onCall, onDetails, onEdit, onDelete, onToggleEmergency }: ContactCardProps) {
  const isEmergency = variant === 'emergency';

  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 ${
        isEmergency
          ? 'border-red-300 bg-red-50/40'
          : variant === 'favorite'
            ? 'border-orange-200 hover:border-orange-300'
            : 'border-gray-100 hover:border-teal-300'
      }`}
    >
      {/* Top: avatar + info */}
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
          isEmergency
            ? 'bg-red-500'
            : variant === 'favorite'
              ? 'bg-gradient-to-br from-orange-400 to-rose-400'
              : 'bg-gradient-to-br from-teal-400 to-cyan-400'
        }`}>
          {isEmergency ? (
            <AlertTriangle size={32} className="text-white" />
          ) : (
            <User size={32} className="text-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-bold text-gray-800 truncate">{contact.name}</h3>
          <p className="text-lg text-gray-600 capitalize">{contact.relationship}</p>
        </div>
        {contact.is_favorite && !isEmergency && (
          <Star size={24} className="text-orange-500 flex-shrink-0" fill="currentColor" />
        )}
      </div>

      {/* Phone number */}
      <p className="text-xl text-teal-600 mb-4 ml-1">{contact.phone}</p>

      {/* Large call button */}
      <button
        onClick={() => onCall(contact)}
        className={`w-full flex items-center justify-center gap-3 py-5 rounded-xl text-xl font-medium transition-colors mb-3 ${
          isEmergency
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-teal-500 hover:bg-teal-600 text-white'
        }`}
      >
        <Phone size={26} />
        Call
      </button>

      {/* Action row */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onDetails(contact)}
          className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-base font-medium transition-colors"
        >
          <Info size={16} />
          Details
        </button>
        <button
          onClick={() => onEdit(contact)}
          className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-base font-medium transition-colors"
        >
          <Pencil size={16} />
          Edit
        </button>

        {/* Emergency toggle */}
        <button
          onClick={() => onToggleEmergency(contact)}
          className={`flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
            contact.is_emergency
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
          }`}
          title={contact.is_emergency ? 'Remove from emergency' : 'Mark as emergency'}
        >
          <Shield size={16} />
        </button>

        <button
          onClick={() => onDelete(contact)}
          className="flex items-center justify-center px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-base font-medium transition-colors"
          title="Delete contact"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

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

function ToggleRow({ label, description, enabled, onToggle, color }: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  color: 'red' | 'orange';
}) {
  const trackColor = enabled
    ? color === 'red' ? 'bg-red-500' : 'bg-orange-500'
    : 'bg-gray-300';

  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between py-3 px-1 group"
    >
      <div className="text-left">
        <p className="text-lg font-medium text-gray-800">{label}</p>
        <p className="text-base text-gray-500">{description}</p>
      </div>
      <div className={`w-14 h-8 rounded-full transition-colors relative ${trackColor}`}>
        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${
          enabled ? 'left-7' : 'left-1'
        }`} />
      </div>
    </button>
  );
}
