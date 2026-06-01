import { useEffect, useState, useRef, useCallback } from 'react';
// import { useLocation } from 'react-router-dom';
import { DEMO_DATA } from '../lib/demoData';
import { isDemoMode } from "../lib/appMode";
import { useAuth } from "../lib/AuthContext";
import {
  Image,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Heart,
  Calendar,
  Tag,
  Plus,
  Pencil,
  Trash2,
  Info,
  X,
  Upload,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Camera
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Memory } from '../types/database';

type ModalMode = 'add' | 'edit' | 'details' | 'delete' | 'slideshow' | null;

const stockPhotos = [
  'https://images.pexels.com/photos/3810798/pexels-photo-3810798.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1114789/pexels-photo-1114789.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1648296/pexels-photo-1648296.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/2873207/pexels-photo-2873207.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=800',
];

const tagSuggestions = [
  'family', 'celebration', 'milestone', 'birthday', 'travel',
  'couple', 'pride', 'holiday', 'childhood', 'friends',
  'nature', 'home', 'tradition', 'love', 'achievement'
];

const emptyMemory: Omit<Memory, 'id' | 'created_at'> = {
  title: '',
  description: '',
  date: '',
  image_url: '',
  tags: [],
  is_favorite: false,
};

export default function Memories() {


const isDemo = isDemoMode();
const { user } = useAuth(); 
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [form, setForm] = useState(emptyMemory);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Slideshow state
  const [slideIndex, setSlideIndex] = useState(0);
  const [slidePlaying, setSlidePlaying] = useState(false);
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMemories();
    return () => {
      if (slideTimer.current) clearInterval(slideTimer.current);
    };
  }, []);

  async function fetchMemories() {
  try {
    if (isDemo) {
      setMemories(DEMO_DATA.memories as any);
      setLoading(false);
      return;
    }

    
    if (!user) return;

    const { data } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', user.id) // ✅
      .order('date', { ascending: false });
    setMemories(data || []);
  } catch (error) {
    console.error('Error fetching memories:', error);
  } finally {
    setLoading(false);
  }
}

  // --- Photo upload ---

  async function uploadPhoto(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `memory-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('memories')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('memories')
        .getPublicUrl(path);

      setForm(prev => ({ ...prev, image_url: urlData.publicUrl }));
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadPhoto(file);
  }

  // --- Voice ---

  function speakMemory(memory: Memory) {
    const text = `${memory.title}. ${memory.description}. This memory is from ${memory.date || 'a special day'}.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 0.9;
    utterance.onend = () => setSpeaking(null);
    speechSynthesis.speak(utterance);
    setSpeaking(memory.id);
  }

  function speakSlide(memory: Memory) {
    speechSynthesis.cancel();
    const text = `${memory.title}. ${memory.description}.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.75;
    utterance.pitch = 0.9;
    speechSynthesis.speak(utterance);
  }

  // --- Slideshow ---

  function startSlideshow(startIndex = 0) {
    setSlideIndex(startIndex);
    setSlidePlaying(true);
    setModalMode('slideshow');
  }

  function stopSlideshow() {
    setSlidePlaying(false);
    if (slideTimer.current) {
      clearInterval(slideTimer.current);
      slideTimer.current = null;
    }
    speechSynthesis.cancel();
  }

  function nextSlide() {
    const next = (slideIndex + 1) % memories.length;
    setSlideIndex(next);
    speakSlide(memories[next]);
  }

  function prevSlide() {
    const prev = (slideIndex - 1 + memories.length) % memories.length;
    setSlideIndex(prev);
    speakSlide(memories[prev]);
  }

  useEffect(() => {
    if (slidePlaying && modalMode === 'slideshow' && memories.length > 0) {
      if (slideTimer.current) clearInterval(slideTimer.current);
      speakSlide(memories[slideIndex]);
      slideTimer.current = setInterval(() => {
        nextSlide();
      }, 8000);
    }
    return () => {
      if (slideTimer.current) clearInterval(slideTimer.current);
    };
  }, [slidePlaying, slideIndex, modalMode]);

  // --- Modal handlers ---

  function openAddModal() {
    setForm(emptyMemory);
    setTagInput('');
    setSelectedMemory(null);
    setModalMode('add');
  }

  function openEditModal(memory: Memory) {
    setForm({
      title: memory.title,
      description: memory.description,
      date: memory.date,
      image_url: memory.image_url,
      tags: memory.tags || [],
      is_favorite: memory.is_favorite,
    });
    setTagInput('');
    setSelectedMemory(memory);
    setModalMode('edit');
  }

  function openDetailsModal(memory: Memory) {
    setSelectedMemory(memory);
    setModalMode('details');
  }

  function openDeleteConfirm(memory: Memory) {
    setSelectedMemory(memory);
    setModalMode('delete');
  }

  function closeModal() {
    setModalMode(null);
    setSelectedMemory(null);
    setForm(emptyMemory);
    setTagInput('');
    if (modalMode === 'slideshow') stopSlideshow();
  }

  // --- Tags ---

  function addTag(tag: string) {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !form.tags.includes(trimmed)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
    }
    setTagInput('');
  }

  function removeTag(tag: string) {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  }

  // --- CRUD ---

  async function handleSave() {
  if (!form.title.trim()) return;

  setSaving(true);
  try {
    if (isDemo) {
      // ✅ Sirf state mein — no Supabase
      const fakeEntry = {
        ...form,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };
      setMemories(prev => [fakeEntry as any, ...prev]);
      closeModal();
      return;
    }

    
    if (!user) return;

    if (modalMode === 'add') {
      const { data } = await supabase
        .from('memories')
        .insert({ ...form, user_id: user.id })
        .select()
        .maybeSingle();
      if (data) {
        setMemories(prev => [data, ...prev]);
      }
    } else if (modalMode === 'edit' && selectedMemory) {
      const { data } = await supabase
        .from('memories')
        .update({ ...form })
        .eq('id', selectedMemory.id)
        .eq('user_id', user.id)
        .select()
        .maybeSingle();
      if (data) {
        setMemories(prev => prev.map(m => m.id === data.id ? data : m));
      }
    }
    closeModal();
  } catch (error) {
    console.error('Error saving memory:', error);
  } finally {
    setSaving(false);
  }
}

  async function handleDelete() {
  if (!selectedMemory) return;

  setSaving(true);

  try {
    // ---------------- DEMO MODE ----------------
    if (isDemo) {
      setMemories(prev =>
        prev.filter(m => m.id !== selectedMemory.id)
      );
      closeModal();
      return;
    }

    // ---------------- REAL MODE ----------------
    await supabase
      .from('memories')
      .delete()
      .eq('id', selectedMemory.id);

    setMemories(prev =>
      prev.filter(m => m.id !== selectedMemory.id)
    );

    closeModal();

  } catch (error) {
    console.error('Error deleting memory:', error);
  } finally {
    setSaving(false);
  }
}
  async function toggleFavorite(memory: Memory) {
    try {
      const newVal = !memory.is_favorite;
      await supabase
        .from('memories')
        .update({ is_favorite: newVal })
        .eq('id', memory.id);
      setMemories(prev => prev.map(m =>
        m.id === memory.id ? { ...m, is_favorite: newVal } : m
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }

  function getPhotoUrl(memory: Memory, index: number) {
    if (memory.image_url) return memory.image_url;
    return stockPhotos[index % stockPhotos.length];
  }

  const favoriteCount = memories.filter(m => m.is_favorite).length;

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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800">Memory Replay</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mt-2">{memories.length} precious memories saved</p>
        </div>
       <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button
            onClick={() => startSlideshow(0)}
            disabled={memories.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-lg sm:text-xl font-medium transition-colors shadow-lg disabled:opacity-40"
          >
            <Play size={24} />
            Slideshow
          </button>
          <button
            onClick={openAddModal}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-lg sm:text-xl font-medium transition-colors shadow-lg"
          >
            <Plus size={28} />
            Add Memory
          </button>
        </div>
      </div>

      {/* Daily Memory Moment */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-8 border-2 border-teal-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Daily Memory Moment</h2>
        <p className="text-xl text-gray-700 leading-relaxed">
          Today, let's remember your wonderful moments. You have {memories.length} precious memories
          and {favoriteCount} favorites. Each one is a treasure from your life's journey.
        </p>
      </div>

      {/* Memory Cards */}
      {memories.length === 0 ? (
        <div className="text-center py-16">
          <Camera size={64} className="text-gray-300 mx-auto mb-4" />
          <p className="text-2xl text-gray-500">No memories yet</p>
          <p className="text-lg text-gray-400 mt-2">Add your first memory to start preserving moments</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {memories.map((memory, index) => (
            <div
              key={memory.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-teal-300 group"
            >
              {/* Image */}
              <div className="relative h-56 bg-gradient-to-br from-teal-200 to-cyan-200 overflow-hidden">
<img
  src={getPhotoUrl(memory, index)}
  alt={memory.title}
  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
  onClick={(e) => {
    e.stopPropagation();
    setPreviewImage(() => getPhotoUrl(memory, index));
  }}
/>
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />

                {/* Favorite badge */}
                <button
                  onClick={() => toggleFavorite(memory)}
                  className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                    memory.is_favorite
                      ? 'bg-rose-500 scale-100'
                      : 'bg-white/80 scale-90 hover:scale-100'
                  }`}
                >
                  <Heart
                    size={24}
                    className={memory.is_favorite ? 'text-white' : 'text-gray-500'}
                    fill={memory.is_favorite ? 'white' : 'none'}
                  />
                </button>

                {/* Date badge */}
                {memory.date && (
                  <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-white/90 rounded-lg flex items-center gap-2">
                    <Calendar size={16} className="text-teal-600" />
                    <span className="text-base font-medium text-gray-700">
                      {new Date(memory.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-2xl font-bold text-gray-800 flex-1 mr-3">{memory.title}</h3>
                </div>

                <p className="text-lg text-gray-600 mb-4 line-clamp-2">{memory.description}</p>

                {/* Tags */}
                {memory.tags && memory.tags.length > 0 && (
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <Tag size={16} className="text-gray-400 flex-shrink-0" />
                    {memory.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-base"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action row */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speakMemory(memory)}
                    disabled={speaking === memory.id}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <Volume2 size={20} />
                    Replay
                  </button>
                  <button
                    onClick={() => openDetailsModal(memory)}
                    className="w-11 h-11 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center transition-colors"
                    title="Details"
                  >
                    <Info size={20} />
                  </button>
                  <button
                    onClick={() => openEditModal(memory)}
                    className="w-11 h-11 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition-colors"
                    title="Edit"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => openDeleteConfirm(memory)}
                    className="w-11 h-11 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------- MODALS ---------- */}

      {modalMode && (
        <div
          className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ---- Slideshow Modal ---- */}
            {modalMode === 'slideshow' && memories.length > 0 && (
              <div className="relative bg-black rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Close button */}
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors"
                >
                  <X size={24} className="text-white" />
                </button>

                {/* Image */}
                <div className="h-[60vh] relative">
                  <img
                    src={getPhotoUrl(memories[slideIndex], slideIndex)}
                    alt={memories[slideIndex].title}
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient overlay */}
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />

                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 className="text-4xl font-bold text-white mb-3">{memories[slideIndex].title}</h3>
                    <p className="text-xl text-white/90 mb-3">{memories[slideIndex].description}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      {memories[slideIndex].date && (
                        <span className="flex items-center gap-2 text-white/80 text-lg">
                          <Calendar size={18} />
                          {new Date(memories[slideIndex].date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      )}
                      {memories[slideIndex].tags?.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-white/20 text-white rounded-full text-base">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 pb-4 pointer-events-none">
                </div>

                {/* Navigation controls bar */}
                <div className="bg-black/90 p-4 flex items-center justify-center gap-6">
                  <button
                    onClick={prevSlide}
                    className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft size={28} className="text-white" />
                  </button>
                  <button
                    onClick={() => slidePlaying ? stopSlideshow() : setSlidePlaying(true)}
                    className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center transition-colors shadow-lg"
                  >
                    {slidePlaying ? <Pause size={28} className="text-white" /> : <Play size={28} className="text-white ml-1" />}
                  </button>
                  <button
                    onClick={nextSlide}
                    className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  >
                    <ChevronRight size={28} className="text-white" />
                  </button>
                  <span className="text-white/70 text-lg ml-4">
                    {slideIndex + 1} / {memories.length}
                  </span>
                </div>
              </div>
            )}

            {/* ---- Details Modal ---- */}
            {modalMode === 'details' && selectedMemory && (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-3xl font-bold text-gray-800">Memory Details</h2>
                  <button onClick={closeModal} className="w-12 h-12 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <X size={24} className="text-gray-600" />
                  </button>
                </div>
                {/* Image preview */}
                {selectedMemory.image_url && (
                  <div className="h-48 bg-gray-100">
                    <img
                      src={selectedMemory.image_url}
                      alt={selectedMemory.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-3xl font-bold text-gray-800">{selectedMemory.title}</h3>
                    {selectedMemory.is_favorite && (
                      <Heart size={28} className="text-rose-500" fill="currentColor" />
                    )}
                  </div>
                  <p className="text-xl text-gray-600 leading-relaxed">{selectedMemory.description}</p>
                  <div className="space-y-3">
                    <DetailRow label="Date" value={selectedMemory.date
                      ? new Date(selectedMemory.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      : 'Not specified'} />
                    <DetailRow label="Favorite" value={selectedMemory.is_favorite ? 'Yes' : 'No'} />
                    <DetailRow label="Added" value={new Date(selectedMemory.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
                  </div>
                  {selectedMemory.tags && selectedMemory.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-2">
                      <Tag size={18} className="text-gray-400" />
                      {selectedMemory.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-lg">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={() => speakMemory(selectedMemory)}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-lg font-medium transition-colors"
                  >
                    <Volume2 size={22} />
                    Replay
                  </button>
                  <button
                    onClick={() => { closeModal(); openEditModal(selectedMemory); }}
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
                    {modalMode === 'add' ? 'Add Memory' : 'Edit Memory'}
                  </h2>
                  <button onClick={closeModal} className="w-12 h-12 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <X size={24} className="text-gray-600" />
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  {/* Photo upload */}
                  <FormField label="Photo">
                    <div className="space-y-3">
                      {form.image_url ? (
                        <div className="relative h-48 rounded-xl overflow-hidden">
                          <img
                            src={form.image_url}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, image_url: '' }))}
                            className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center"
                          >
                            <X size={16} className="text-white" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 text-gray-500 hover:border-teal-400 hover:text-teal-600 transition-colors"
                        >
                          {uploading ? (
                            <>
                              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                              <span className="text-lg">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload size={32} />
                              <span className="text-lg">Click to upload a photo</span>
                            </>
                          )}
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </FormField>

                  <FormField label="Title" required>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Family Reunion 2025"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-xl focus:border-teal-400 focus:outline-none transition-colors"
                    />
                  </FormField>

                  <FormField label="Description">
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Describe this memory..."
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-xl focus:border-teal-400 focus:outline-none transition-colors resize-none"
                    />
                  </FormField>

                  <FormField label="Date">
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-xl focus:border-teal-400 focus:outline-none transition-colors"
                    />
                  </FormField>

                  {/* Tags */}
                  <FormField label="Tags">
                    <div className="space-y-3">
                      {/* Current tags */}
                      {form.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {form.tags.map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-lg"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="w-5 h-5 rounded-full hover:bg-teal-200 flex items-center justify-center"
                              >
                                <X size={14} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Tag input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && tagInput.trim()) {
                              e.preventDefault();
                              addTag(tagInput);
                            }
                          }}
                          placeholder="Type a tag and press Enter"
                          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl text-lg focus:border-teal-400 focus:outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => addTag(tagInput)}
                          disabled={!tagInput.trim()}
                          className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-xl text-lg font-medium transition-colors disabled:opacity-40"
                        >
                          Add
                        </button>
                      </div>
                      {/* Suggested tags */}
                      <div className="flex flex-wrap gap-2">
                        {tagSuggestions
                          .filter(t => !form.tags.includes(t))
                          .slice(0, 8)
                          .map(tag => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => addTag(tag)}
                              className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full text-base transition-colors"
                            >
                              + {tag}
                            </button>
                          ))}
                      </div>
                    </div>
                  </FormField>

                  {/* Favorite toggle */}
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, is_favorite: !prev.is_favorite }))}
                    className="w-full flex items-center justify-between py-3 px-1"
                  >
                    <div className="flex items-center gap-3">
                      <Heart
                        size={24}
                        className={form.is_favorite ? 'text-rose-500' : 'text-gray-400'}
                        fill={form.is_favorite ? 'currentColor' : 'none'}
                      />
                      <span className="text-lg font-medium text-gray-800">Mark as Favorite</span>
                    </div>
                    <div className={`w-14 h-8 rounded-full transition-colors relative ${
                      form.is_favorite ? 'bg-rose-500' : 'bg-gray-300'
                    }`}>
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${
                        form.is_favorite ? 'left-7' : 'left-1'
                      }`} />
                    </div>
                  </button>
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
                    disabled={saving || !form.title.trim()}
                    className="flex-1 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-lg font-medium transition-colors disabled:opacity-40"
                  >
                    {saving ? 'Saving...' : modalMode === 'add' ? 'Add Memory' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}

            {/* ---- Delete Confirmation Modal ---- */}
            {modalMode === 'delete' && selectedMemory && (
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
                        Delete <strong>{selectedMemory.title}</strong>?
                      </p>
                      <p className="text-lg text-red-600 mt-2">This precious memory will be lost forever.</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-lg font-medium transition-colors"
                  >
                    Keep Memory
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
      {/* Image Preview Modal */}
{previewImage && (
  <div
    className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4"
    onClick={() => setPreviewImage(null)}
  >
    <img
      src={previewImage}
      alt="Preview"
      className="max-w-full max-h-full rounded-xl shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    />
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

