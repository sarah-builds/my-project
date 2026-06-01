import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X } from "lucide-react";
import { supabase } from "../lib/supabase";

const emptyMedicine = () => ({ name: "", dosage: "", time: "" });
const emptySchedule = () => ({ activity: "", time: "" });
const emptyContact  = () => ({ name: "", relationship: "", phone: "" });
const emptyMemory   = () => ({ title: "", description: "", image_url: "", uploading: false });

export default function Setup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [medicines, setMedicines] = useState([emptyMedicine()]);
  const [schedules, setSchedules] = useState([emptySchedule()]);
  const [contacts,  setContacts]  = useState([emptyContact()]);
  const [memories,  setMemories]  = useState([emptyMemory()]);

  // One fileInput ref per memory row (stored as array of refs)
  const fileRefs = useRef([]);

  // ── Generic helpers ───────────────────────────────────────────────
  const update = (setter) => (index, field, value) =>
    setter((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));

  const add = (setter, empty) => () => setter((prev) => [...prev, empty()]);
  const remove = (setter) => (index) => setter((prev) => prev.filter((_, i) => i !== index));

  const updateMedicine = update(setMedicines);
  const updateSchedule = update(setSchedules);
  const updateContact  = update(setContacts);
  const updateMemory   = update(setMemories);

  // ── Photo upload (same logic as Memories.jsx) ─────────────────────
  async function uploadPhoto(file, index) {
    updateMemory(index, "uploading", true);
    try {
      const ext  = file.name.split(".").pop() || "jpg";
      const path = `memory-setup-${Date.now()}-${index}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("memories")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("memories")
        .getPublicUrl(path);

      updateMemory(index, "image_url", urlData.publicUrl);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Photo upload failed. Please try again.");
    } finally {
      updateMemory(index, "uploading", false);
    }
  }

  function handleFileChange(e, index) {
    const file = e.target.files?.[0];
    if (file) uploadPhoto(file, index);
  }

  function removePhoto(index) {
    updateMemory(index, "image_url", "");
    // reset the hidden input so same file can be re-selected
    if (fileRefs.current[index]) fileRefs.current[index].value = "";
  }

  // ── Save ──────────────────────────────────────────────────────────
  const saveSetup = async () => {
  setLoading(true);

  try {
   const { data, error } = await supabase.auth.getUser();
const user = data?.user;
    if (!user) {
      alert("Session not found. Please login again.");
     navigate("/login", { replace: true });
return;
    }

    const validMedicines = medicines.filter((m) => m.name.trim());
    if (validMedicines.length > 0) {
      await supabase.from("medicines").insert(
        validMedicines.map((m) => ({
          user_id: user.id,
          name: m.name,
          dosage: m.dosage,
          time: m.time,
          taken: false,
        }))
      );
    }

    const validSchedules = schedules.filter((s) => s.activity.trim());
    if (validSchedules.length > 0) {
      await supabase.from("schedules").insert(
        validSchedules.map((s) => ({
          user_id: user.id,
          activity: s.activity,
          time: s.time,
          completed: false,
        }))
      );
    }

    const validContacts = contacts.filter((c) => c.name.trim());
    if (validContacts.length > 0) {
      await supabase.from("contacts").insert(
        validContacts.map((c) => ({
          user_id: user.id,
          name: c.name,
          relationship: c.relationship,
          phone: c.phone,
          is_favorite: true,
        }))
      );
    }

    const validMemories = memories.filter((m) => m.title.trim());
    if (validMemories.length > 0) {
      await supabase.from("memories").insert(
        validMemories.map((m) => ({
          user_id: user.id,
          title: m.title,
          description: m.description,
          image_url: m.image_url || null,
        }))
      );
    }

    navigate("/home");
  } catch (error) {
    console.error(error);
    alert("Something went wrong");
  } finally {
    setLoading(false);
  }
};
  // ── Reusable remove button ────────────────────────────────────────
  const RemoveBtn = ({ onClick }) => (
    <button
      onClick={onClick}
      className="px-3 py-2 rounded-xl border-2 border-red-200 text-red-400 hover:bg-red-50 text-xl font-bold"
      title="Remove"
    >
      ✕
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-10">

        <h1 className="text-4xl font-bold text-center text-teal-600 mb-2">
          Welcome to Memora AI
        </h1>
        <p className="text-center text-gray-500 mb-10 text-lg">
          Let's personalize your experience
        </p>

        {/* ── Medicine Reminders ── */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Medicine Reminder</h2>
          <div className="flex flex-col gap-3">
            {medicines.map((med, index) => (
              <div key={index} className="grid md:grid-cols-3 gap-4 items-center">
                <input type="text" placeholder="Medicine Name" value={med.name}
                  onChange={(e) => updateMedicine(index, "name", e.target.value)}
                  className="border p-4 rounded-xl" />
                <input type="text" placeholder="Dosage" value={med.dosage}
                  onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                  className="border p-4 rounded-xl" />
                <div className="flex gap-2">
                  <input type="time" value={med.time}
                    onChange={(e) => updateMedicine(index, "time", e.target.value)}
                    className="border p-4 rounded-xl flex-1" />
                  {medicines.length > 1 && <RemoveBtn onClick={() => remove(setMedicines)(index)} />}
                </div>
              </div>
            ))}
          </div>
          <button onClick={add(setMedicines, emptyMedicine)}
            className="mt-4 px-5 py-2 rounded-xl border-2 border-teal-400 text-teal-600 font-semibold hover:bg-teal-50 text-sm">
            + Add Another Medicine
          </button>
        </div>

        {/* ── Daily Schedule ── */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Daily Schedule</h2>
          <div className="flex flex-col gap-3">
            {schedules.map((sch, index) => (
              <div key={index} className="grid md:grid-cols-2 gap-4 items-center">
                <input type="text" placeholder="Activity" value={sch.activity}
                  onChange={(e) => updateSchedule(index, "activity", e.target.value)}
                  className="border p-4 rounded-xl" />
                <div className="flex gap-2">
                  <input type="time" value={sch.time}
                    onChange={(e) => updateSchedule(index, "time", e.target.value)}
                    className="border p-4 rounded-xl flex-1" />
                  {schedules.length > 1 && <RemoveBtn onClick={() => remove(setSchedules)(index)} />}
                </div>
              </div>
            ))}
          </div>
          <button onClick={add(setSchedules, emptySchedule)}
            className="mt-4 px-5 py-2 rounded-xl border-2 border-teal-400 text-teal-600 font-semibold hover:bg-teal-50 text-sm">
            + Add Another Activity
          </button>
        </div>

        {/* ── Emergency Contacts ── */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Emergency Contact</h2>
          <div className="flex flex-col gap-3">
            {contacts.map((c, index) => (
              <div key={index} className="grid md:grid-cols-3 gap-4 items-center">
                <input type="text" placeholder="Contact Name" value={c.name}
                  onChange={(e) => updateContact(index, "name", e.target.value)}
                  className="border p-4 rounded-xl" />
                <input type="text" placeholder="Relationship" value={c.relationship}
                  onChange={(e) => updateContact(index, "relationship", e.target.value)}
                  className="border p-4 rounded-xl" />
                <div className="flex gap-2">
                  <input type="text" placeholder="Phone Number" value={c.phone}
                    onChange={(e) => updateContact(index, "phone", e.target.value)}
                    className="border p-4 rounded-xl flex-1" />
                  {contacts.length > 1 && <RemoveBtn onClick={() => remove(setContacts)(index)} />}
                </div>
              </div>
            ))}
          </div>
          <button onClick={add(setContacts, emptyContact)}
            className="mt-4 px-5 py-2 rounded-xl border-2 border-teal-400 text-teal-600 font-semibold hover:bg-teal-50 text-sm">
            + Add Another Contact
          </button>
        </div>

        {/* ── Favorite Memories ── */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Favorite Memory</h2>
          <div className="flex flex-col gap-8">
            {memories.map((mem, index) => (
              <div key={index} className="relative border border-gray-100 rounded-2xl p-5 bg-gray-50">

                {/* Row-level remove */}
                {memories.length > 1 && (
                  <div className="absolute -top-3 -right-3 z-10">
                    <RemoveBtn onClick={() => remove(setMemories)(index)} />
                  </div>
                )}

                {/* Photo upload */}
                <div className="mb-4">
                  {mem.image_url ? (
                    <div className="relative h-48 rounded-xl overflow-hidden">
                      <img src={mem.image_url} alt="Memory" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center"
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRefs.current[index]?.click()}
                      disabled={mem.uploading}
                      className="w-full h-36 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-teal-400 hover:text-teal-600 transition-colors bg-white"
                    >
                      {mem.uploading ? (
                        <>
                          <div className="w-7 h-7 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-base">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={26} />
                          <span className="text-base">Click to upload a photo</span>
                        </>
                      )}
                    </button>
                  )}
                  {/* Hidden file input */}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={(el) => (fileRefs.current[index] = el)}
                    onChange={(e) => handleFileChange(e, index)}
                  />
                </div>

                <input
                  type="text"
                  placeholder="Memory Title"
                  value={mem.title}
                  onChange={(e) => updateMemory(index, "title", e.target.value)}
                  className="border p-4 rounded-xl w-full mb-3 bg-white"
                />
                <textarea
                  placeholder="Describe this memory..."
                  value={mem.description}
                  onChange={(e) => updateMemory(index, "description", e.target.value)}
                  className="border p-4 rounded-xl w-full h-28 bg-white"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              add(setMemories, emptyMemory)();
            }}
            className="mt-4 px-5 py-2 rounded-xl border-2 border-teal-400 text-teal-600 font-semibold hover:bg-teal-50 text-sm">
            + Add Another Memory
          </button>
        </div>

        {/* ── Buttons ── */}
        <div className="flex flex-col md:flex-row gap-4">
          <button onClick={() => navigate("/home")}
            className="flex-1 py-4 rounded-xl border-2 border-gray-300 font-semibold text-lg hover:bg-gray-50">
            Skip For Now
          </button>
          <button onClick={saveSetup} disabled={loading}
            className="flex-1 py-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-lg">
            {loading ? "Saving..." : "Save & Continue"}
          </button>
        </div>

      </div>
    </div>
  );
}
