export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  time: string;
  frequency: string;
  taken: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  time: string;
  activity: string;
  category: string;
  completed: boolean;
  notes: string;
  day_of_week: string;
  created_at: string;
}

export interface Memory {
  id: string;
  title: string;
  description: string;
  date: string;
  image_url: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
}

export interface Contact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  is_emergency: boolean;
  is_favorite: boolean;
  photo_url: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
  notes: string;
  reminder_sent: boolean;
  created_at: string;
}
