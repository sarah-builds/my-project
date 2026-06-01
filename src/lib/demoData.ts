export const DEMO_DATA = {
  medicines: [
    { id: '1', name: 'Paracetamol', dosage: '500mg', time: '8:00 AM', frequency: 'daily', taken: false, notes: 'Take after breakfast', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', name: 'Metformin', dosage: '1000mg', time: '1:00 PM', frequency: 'twice daily', taken: false, notes: 'Take with food', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '3', name: 'Amlodipine', dosage: '5mg', time: '9:00 PM', frequency: 'daily', taken: false, notes: 'Blood pressure medicine', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
  schedules: [
    { id: '1', activity: 'Morning Walk', time: '7:00 AM', category: 'exercise', completed: false, notes: 'Park near home', day_of_week: 'today', created_at: new Date().toISOString() },
    { id: '2', activity: 'Doctor Appointment', time: '11:00 AM', category: 'appointment', completed: false, notes: 'Dr. Sharma - Cardiology', day_of_week: 'today', created_at: new Date().toISOString() },
    { id: '3', activity: 'Evening Yoga', time: '6:00 PM', category: 'exercise', completed: false, notes: 'Online session', day_of_week: 'today', created_at: new Date().toISOString() },
  ],
  contacts: [
    { id: '1', name: 'Rahul', relationship: 'son', phone: '98765 43210', is_emergency: true, is_favorite: true, photo_url: '', created_at: new Date().toISOString() },
    { id: '2', name: 'Priya', relationship: 'daughter', phone: '91234 56789', is_emergency: false, is_favorite: true, photo_url: '', created_at: new Date().toISOString() },
    { id: '3', name: 'Dr. Sharma', relationship: 'doctor', phone: '90000 12345', is_emergency: false, is_favorite: true, photo_url: '', created_at: new Date().toISOString() },
  ],
  memories: [
    {  id: '1',
    title: 'Sunset Drive to Lonavala 🌄',
    description:
      'A spontaneous evening drive with music on full volume, windows down, and golden skies all around. One of those peaceful escapes from routine.',
    date: '2024-10-12',
    image_url:
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['travel', 'nature', 'freedom'],
    is_favorite: true,
    created_at: new Date().toISOString()},
    { id: '2', title: 'Golden Anniversary', description: '50 wonderful years together. A celebration full of love, joy, and memories that will last forever.', date: '2023-06-15', image_url: 'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=800', tags: ['milestone', 'couple'], is_favorite: true, created_at: new Date().toISOString() },
    {id: '3',
    title: 'Diwali at Home 🪔',
    description:
      'Lights everywhere, homemade sweets, family chaos, and that comforting feeling of being exactly where you belong.',
    date: '2023-11-12',
    image_url:
      'https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['family', 'festival', 'diwali'],
    is_favorite: true,
    created_at: new Date().toISOString(),}
  ],
};
