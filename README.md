# 🧠 Memora AI
### AI-Powered Elderly Care Companion
 
> Memora AI helps seniors manage medicines, schedules, memories, and family connections through a simple, intelligent, and voice-enabled experience.
 
---
 


---
 
## 📸 Screenshots
 
Landing Page
<img width="1659" height="909" alt="Screenshot 2026-06-01 134625" src="https://github.com/user-attachments/assets/38796bd5-eaf4-47fb-b8c1-897502aa3e78" />
Home<img width="1893" height="889" alt="Screenshot 2026-06-01 134702" src="https://github.com/user-attachments/assets/c7eac1a1-76b4-43ad-8bcd-e47c6613df08" />

 
Medicine Tracker<img width="1874" height="897" alt="Screenshot 2026-06-01 134730" src="https://github.com/user-attachments/assets/84f8f57f-23df-4b00-b398-3087c255c2fe" />
Memories<img width="1897" height="901" alt="Screenshot 2026-06-01 154232" src="https://github.com/user-attachments/assets/854c238b-057c-4772-b314-fa536e06c60a" />

 
---
 
## ✨ Features
 
### 💊 Medicine Reminders
- Add medicines with name, dosage, time, and frequency
- Automatic voice + browser notification reminders
- Mark medicines as taken / not taken
- Daily progress tracking
### 📅 Smart Schedule
- Add daily activities with categories (routine, meal, exercise, etc.)
- **Everyday** option — activity repeats daily automatically
- Day-wise view: Today, Mon–Sun
- Voice readout of full schedule
- Progress bar for completed activities
### 🧠 Memory Replay
- Upload photos and add descriptions to precious memories
- Beautiful **slideshow mode** with voice narration
- Tag memories (family, travel, celebration, etc.)
- Mark favorites with heart button
### 📞 Contacts
- Emergency contacts with one-tap calling
- Favorite contacts section
- SOS button — calls emergency contact instantly
- Auto-adds 112 as default emergency number
### 🎙️ Voice Assistant
- Speak naturally — ask about medicines, schedule, contacts
- Answers questions like "When is my medicine?" or "What's today's schedule?"
- Works with Chrome and Edge browsers
### 🔐 Authentication
- Secure login and signup via Supabase Auth
- Each user's data is completely private (Row Level Security)
- Demo mode — explore all features without creating an account
---
 
## 🛠️ Tech Stack
 
| Category | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS |
| **Routing** | React Router v6 |
| **Icons** | Lucide React |
| **Backend** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Storage** | Supabase Storage (photos) |
| **Voice** | Web Speech API |
| **Notifications** | Browser Notifications API |
| **Deployment** | Vercel |
 
---
 

 
## 📁 Project Structure
 
```
src/
├── components/
│   ├── Layout.tsx          # Sidebar + SOS button
│   └── ProtectedRoute.tsx  # Auth guard
├── lib/
│   ├── AuthContext.tsx     # Global auth state
│   ├── appMode.ts          # Demo / auth mode toggle
│   ├── demoData.ts         # Demo mode sample data
│   ├── logout.ts           # Logout helper
│   └── supabase.ts         # Supabase client
├── pages/
│   ├── Landing.tsx         # Landing page
│   ├── Login.tsx           # Login page
│   ├── Signup.tsx          # Signup page
│   ├── Setup.tsx           # First-time setup
│   ├── Home.tsx            # Dashboard
│   ├── Medicines.tsx       # Medicine tracker
│   ├── Schedule.tsx        # Daily schedule
│   ├── Memories.tsx        # Memory replay
│   ├── Contacts.tsx        # Contact management
│   └── VoiceAssistant.tsx  # Voice commands
└── types/
    └── database.ts         # TypeScript types
```
 
---
 
## 🔔 Notifications
 
Medicine and schedule reminders use the **Browser Notifications API**:
 
- ✅ Works on desktop Chrome, Edge, Firefox
- ✅ Works on Android Chrome
- ✅ Works after deployment (HTTPS required)
- ❌ Does not work on iOS Safari
- ⚠️ Tab must be open (no background service worker)
Users are prompted for notification permission on first visit.
 
---
 
## 🎯 Demo Mode
 
Click **"Live Demo"** on the landing page to explore all features without creating an account:
 
- Pre-loaded sample medicines, schedules, contacts, and memories
- All features work (add, edit, delete)
- No data is saved to the database
- SOS calling is disabled in demo mode
---
 
## 👥 Target Users
 
- **Seniors / Elderly individuals** — primary users
- **Family caregivers** — set up the app for loved ones
- **Healthcare assistants** — manage patient schedules
---
 

 
<div align="center">
  <p>Made with ❤️ for elderly care</p>
  <p><strong>Memora AI</strong> — Remember what matters</p>
</div>
