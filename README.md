# CampusFix - Smart Campus Maintenance & Complaint Prioritization System

**CampusFix** is a complete, production-grade Next.js web platform built for university campus maintenance management and automated priority triage. Students and staff can report campus faults (electrical, plumbing, HVAC, network, sanitation, equipment, etc.), track repair timelines in real-time, while administrators monitor priority queues, allocate staff, and analyze recurring facility problems.

---

## 🚀 Key Features

### 🎓 Student / User Features
- **Complaint Submission Form**: 5-section form with category selection, room/bench specification, severity selection, detailed problem description, and photo/media evidence upload preview.
- **Dynamic Priority Score Display**: Renders computed 0-100 Priority Score (0-25 Low, 26-50 Medium, 51-75 High, 76-100 Critical) with visual indicators.
- **My Complaints Portal**: Instant search, multi-field filtering (Status, Priority, Category, Location), and sorting.
- **Live Audit Timeline**: Vertical step timeline showing real-time stage progress (`SUBMITTED` → `REVIEWED` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED`).

### 🔧 Maintenance Staff / Technician Features
- **Staff Dashboard**: Overview of assigned tickets, pending dispatch review, and tasks completed today.
- **Priority Queue View**: Prominent ranking of critical safety tickets assigned to technicians.
- **Interactive Workflows**:
  - `Accept Complaint` → Accepts dispatch into active queue.
  - `Start Work` → Updates status to `IN_PROGRESS`.
  - `Mark as Resolved` → Opens modal to input technical resolution details, actual repair cost, and notes.

### ⚡ Administration Features
- **Admin Dashboard**: Comprehensive KPI cards, Recharts 14-day velocity trend lines, status donut charts, category breakdown bars, and location distribution.
- **Priority Queue Triage**: Real-time list of all complaints ranked descending by backend priority score.
- **Department & Staff Assignment Modal**: Allocate electrical, plumbing, HVAC, IT, or civil departments and assign specific technicians.
- **Recurring Problems Analysis**: Identification of frequent complaint hotspots (e.g. Laboratory transformer loads, Block B risers) with trend indicators (`UP`, `STABLE`, `DOWN`).
- **Analytics & Reports**: Monthly performance summary tables and resolution turnaround times.
- **User Management**: Student, Staff, and Admin account lists with activation/deactivation controls.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Validation**: Zod
- **Analytics & Charts**: Recharts
- **State & Persistence**: LocalStorage API Abstraction (`src/lib/api.ts`) + React Context

---

## 🔐 Demo Credentials

Quick 1-Click Role Switcher is available in the top navigation bar during demonstration:

| Role | Demo Email | Password | Default Redirect |
| :--- | :--- | :--- | :--- |
| **Student** | `student@campus.edu` | `password123` | `/dashboard` |
| **Staff Technician** | `staff@campus.edu` | `password123` | `/staff` |
| **Admin Triage** | `admin@campus.edu` | `password123` | `/admin` |

---

## 🔄 Step-by-Step Viva Demonstration Flow

Follow this exact demonstration flow during presentation:

1. **Student Submission**:
   - Log in as **Student** (`student@campus.edu`).
   - Go to `/complaints/new` and submit:
     - **Title**: `Electrical sparking in Lab 3`
     - **Category**: `Electrical Fault`
     - **Location**: `Laboratory Complex`
     - **Severity**: `CRITICAL`
   - Observe the generated **Complaint ID** (e.g., `CMP-1025`), **Priority Level: CRITICAL**, and **Priority Score: 94/100**.

2. **Admin Priority Triage & Staff Assignment**:
   - Use top-right header role switcher to switch to **Admin** (`admin@campus.edu`).
   - Open `/admin/priority-queue` to view the critical complaint ranked at the top of the queue.
   - Click **Assign** → Select **Electrical Maintenance** department and **Rahul Kumar** technician.

3. **Staff Acceptance & Resolution**:
   - Switch role to **Staff** (`staff@campus.edu`).
   - Open `/staff` to view the newly assigned ticket.
   - Click ticket details → Click **Accept Complaint** → Click **Start Work** → Click **Mark as Resolved**.
   - Fill resolution description (e.g. *"Replaced main fuse and repaired Bench 4 switchboard wiring"*) and actual repair cost (`₹1200`).

4. **Student Audit Verification**:
   - Switch back to **Student** mode.
   - Open `/complaints` to confirm the complaint status is now **`RESOLVED`**.
   - Open details to view the complete vertical timeline and resolution record.

---

## 💻 Installation & Local Execution

1. Clone or extract the codebase:
   ```bash
   cd "smart campus"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. Build for production:
   ```bash
   npm run build
   ```

5. Run production server:
   ```bash
   npm run start
   ```

---

## 🔌 API Integration Architecture

The frontend uses a clean API client abstraction layer in `src/lib/api.ts`.

Environment variable configuration in `.env.example`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Prepared API Endpoint Contracts:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `GET /api/complaints`
- `POST /api/complaints`
- `GET /api/complaints/:id`
- `POST /api/complaints/:id/assign`
- `PUT /api/complaints/:id/status`
- `GET /api/admin/analytics`
- `GET /api/admin/priority-queue`
- `GET /api/admin/recurring-problems`
