# 🧠 Memora AI

### AI-Powered Elderly Care Companion

> Memora AI helps seniors manage medicines, schedules, memories, and family connections through a simple, intelligent, and voice-enabled experience.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Memora%20AI-0ea5e9?style=for-the-badge)](https://memora-ai-two.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge\&logo=github)](https://github.com/sarah-builds/my-project)

---

## 🎯 Problem

Managing medicines, daily routines, important contacts, and personal memories can become difficult for elderly users when these tasks are spread across multiple applications.

Many existing digital tools are also not designed with simplicity and accessibility as their primary focus.

**Memora AI brings these everyday needs together in one simple platform**, with voice interaction, reminders, memory management, and emergency contacts designed around elderly users.

---

## 💡 Solution

Memora AI provides a centralized digital companion where seniors can:

```text
                    ┌─────────────────────┐
                    │      Memora AI      │
                    └──────────┬──────────┘
                               │
       ┌───────────────┬───────┼────────┬───────────────┐
       ↓               ↓       ↓        ↓               ↓
   Medicines        Schedule Memories  Contacts    Voice Assistant
       │               │       │        │               │
       └───────────────┴───────┼────────┴───────────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Simple & Accessible │
                    │  Elderly Care Hub   │
                    └─────────────────────┘
```

---

## ✨ Features

### 💊 Medicine Reminders

* Add medicines with name, dosage, time, and frequency
* Automatic voice + browser notification reminders
* Mark medicines as **taken / not taken**
* Daily progress tracking

### 📅 Smart Schedule

* Add daily activities with categories such as routine, meal, and exercise
* **Everyday** option for automatically repeating activities
* Day-wise view: Today, Mon–Sun
* Voice readout of the full schedule
* Progress bar for completed activities

### 🧠 Memory Replay

* Upload photos and add descriptions to meaningful memories
* **Slideshow mode** with voice narration
* Tag memories by category such as family, travel, and celebrations
* Mark favorite memories with a heart button

### 📞 Emergency Contacts

* Emergency contacts with one-tap calling
* Favorite contacts section
* SOS button for quick emergency calling
* Automatically adds **112** as the default emergency number

### 🎙️ Voice Assistant

* Ask questions naturally using voice
* Get information about medicines, schedules, and contacts
* Example queries:

  * *"When is my medicine?"*
  * *"What's today's schedule?"*
* Supported on Chrome and Edge

### 🔐 Authentication & Privacy

* Secure login and signup using Supabase Auth
* User-specific data protection with Row Level Security
* Demo mode for exploring the application without creating an account

---

## 🛠️ Tech Stack

| Category               | Technology                |
| ---------------------- | ------------------------- |
| **Frontend**           | React 18 + TypeScript     |
| **Build Tool**         | Vite                      |
| **Styling**            | Tailwind CSS              |
| **Routing**            | React Router v6           |
| **Icons**              | Lucide React              |
| **Backend / Database** | Supabase + PostgreSQL     |
| **Authentication**     | Supabase Auth             |
| **Storage**            | Supabase Storage          |
| **Voice**              | Web Speech API            |
| **Notifications**      | Browser Notifications API |
| **Deployment**         | Vercel                    |

---

## 🏗️ How It Works

```text
User
 │
 ├── Medicine Management
 │        ↓
 │    Reminders + Progress
 │
 ├── Daily Schedule
 │        ↓
 │    Activities + Voice Readout
 │
 ├── Memories
 │        ↓
 │    Photos + Slideshow + Narration
 │
 ├── Contacts
 │        ↓
 │    Calling + SOS
 │
 └── Voice Assistant
          ↓
     Voice Input
          ↓
    Application Data
          ↓
     Voice Response
```

User authentication and application data are handled through **Supabase**, while browser-native APIs provide voice interaction and notifications.

---

## 📸 Screenshots

### 🏠 Landing Page

<img width="1659" height="909" alt="Memora AI Landing Page" src="https://github.com/user-attachments/assets/38796bd5-eaf4-47fb-b8c1-897502aa3e78" />

### 🏡 Home Dashboard

<img width="1893" height="889" alt="Memora AI Home Dashboard" src="https://github.com/user-attachments/assets/c7eac1a1-76b4-43ad-8bcd-e47c6613df08" />

### 💊 Medicine Tracker

<img width="1874" height="897" alt="Memora AI Medicine Tracker" src="https://github.com/user-attachments/assets/84f8f57f-23df-4b00-b398-3087c255c2fe" />

### 🧠 Memories

<img width="1897" height="901" alt="Memora AI Memories" src="https://github.com/user-attachments/assets/854c238b-057c-4772-b314-fa536e06c60a" />

---

## 🔔 Notifications

Medicine and schedule reminders use the **Browser Notifications API**.

| Platform       | Support |
| -------------- | ------- |
| Desktop Chrome | ✅       |
| Desktop Edge   | ✅       |
| Firefox        | ✅       |
| Android Chrome | ✅       |
| iOS Safari     | ❌       |

### Current implementation

* HTTPS is required in deployed environments
* Users must grant notification permission
* The application tab must remain open
* Background notifications are not currently supported because a service worker is not implemented

Users are prompted for notification permission when required.

---

## 🎯 Demo Mode

Click **"Live Demo"** on the landing page to explore the application without creating an account.

### Demo includes

* Pre-loaded medicines
* Sample schedules
* Sample contacts
* Sample memories
* Add, edit, and delete functionality
* Full navigation through the application

### Demo restrictions

* Data is not persisted to the database
* SOS calling is disabled in demo mode

This makes it easy for recruiters, evaluators, and visitors to explore the project without signing up.

---

## 📁 Project Structure

```text
src/
├── components/
│   ├── Layout.tsx          # Sidebar + SOS button
│   └── ProtectedRoute.tsx  # Authentication guard
│
├── lib/
│   ├── AuthContext.tsx     # Global authentication state
│   ├── appMode.ts          # Demo / authenticated mode
│   ├── demoData.ts         # Demo mode sample data
│   ├── logout.ts           # Logout helper
│   └── supabase.ts         # Supabase client
│
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
│   └── VoiceAssistant.tsx  # Voice interaction
│
└── types/
    └── database.ts         # TypeScript database types
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18+
* npm
* Git
* A Supabase project

### 1. Clone the repository

```bash
git clone https://github.com/sarah-builds/my-project.git
cd my-project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> ⚠️ Never commit your actual credentials or API keys to GitHub.

### 4. Start the development server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

### 5. Build for production

```bash
npm run build
```

---

## 🌐 Live Demo

### 👉 [Try Memora AI](https://memora-ai-two.vercel.app)

The live application includes **Demo Mode**, so you can explore the major features without creating an account.

---

## 👥 Target Users

### 👴 Seniors / Elderly Individuals

Primary users who need a simple way to manage:

* Medicines
* Daily routines
* Memories
* Important contacts

### 👨‍👩‍👧 Family Caregivers

Family members can help configure medicines, schedules, contacts, and other important information.

### 🧑‍⚕️ Healthcare Assistants

The platform can support assistants who help elderly individuals manage daily routines and medication schedules.

---

## 🧠 Design Principles

Memora AI focuses on four core principles:

**Simplicity**
Keep important actions easy to understand and access.

**Accessibility**
Use clear interfaces and voice interaction to reduce unnecessary complexity.

**Safety**
Make emergency contacts and SOS functionality easily accessible.

**Personalization**
Allow each user to manage their own medicines, routines, memories, and contacts.

---

## 🔮 Future Improvements

* [ ] Offline-first support
* [ ] Background notification service worker
* [ ] Improved iOS notification support
* [ ] Multilingual voice assistant
* [ ] AI-powered medication information
* [ ] Natural-language schedule creation
* [ ] Caregiver dashboard
* [ ] Medication adherence analytics
* [ ] Family sharing
* [ ] Calendar integration
* [ ] React Native mobile application
* [ ] More advanced accessibility features

---

## ⚠️ Limitations

Memora AI is currently a **prototype / demonstration project**.

* OCR/AI or voice-generated information, where applicable, should be verified before making important decisions.
* Browser voice support depends on browser capabilities.
* Browser notifications have platform-specific limitations.
* Notifications currently require the application tab to remain open.
* Demo mode does not persist user data.
* The application is not intended to replace professional medical advice or caregivers.

---

## 📚 What I Learned

Building Memora AI provided hands-on experience with:

* React + TypeScript
* Component-based architecture
* Supabase
* PostgreSQL
* Authentication
* Row Level Security
* Cloud storage
* Web Speech API
* Browser Notifications API
* Protected routes
* Demo-mode architecture
* Responsive UI development
* Vercel deployment

---

## 👩‍💻 Author

### Sarah Ansari

* GitHub: [@sarah-builds](https://github.com/sarah-builds)

