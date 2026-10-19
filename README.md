# DutyLeaf • IIIT Kottayam Attendance & Policy Analyzer

A production-ready React (TypeScript + Tailwind CSS + Lucide Icons) attendance planner, policy modeler, and analytics dashboard designed specifically for college students following unique attendance credit and Duty Leave (DL) rules.

---

## 🚀 Key Features

### 1. Direct College Portal Authentication & Session Sync
- **Live Portal Login:** Enter your college email (`@iiitkottayam.ac.in`) and password. Authenticates directly against `https://attendance.iiitkottayam.ac.in/api/auth/login` and proxies requests seamlessly via Vite to bypass browser CORS restrictions.
- **One-Click Demo Mode:** Instant access preloaded with real, verified 8-course session data (Mathew George Manachery, Roll No: `2024BCS0080`, CSE Semester 5).
- **Direct JWT Token Entry:** Paste active Bearer token directly from DevTools for session debugging.
- **Console Scraper & JSON Tools:** Built-in copyable browser console snippet that traverses all courses via background `fetch` and outputs complete JSON payloads.

---

### 2. College Business Rules & Pre-August 2026 Policies

The college attendance system follows specific administrative rules:
$$\text{Attendance \%} = \left(\frac{\text{Attended Sessions}}{\text{Counted Sessions}}\right) \times 100$$
$$\text{Counted Sessions} = \text{Held Sessions} - \text{Duty Leaves}$$

> **Note on Duty Leaves (DL):** A Duty Leave is an excused absence completely removed from the denominator (`Counted Sessions = Held - DL`). It does NOT count as attended; instead, it reduces the denominator, elevating attendance.

#### Pre-Semester Cutoff Policies:
Classes held prior to **August 1, 2026** can be toggled in real-time across three views:
1. **Raw Portal Baseline:** Unadjusted baseline directly from portal records.
2. **Scenario 1 (Pre-Aug as Present):** All sessions held prior to 1 Aug 2026 are granted full attendance (added to numerator/attended, denominator unchanged).
3. **Scenario 2 (Pre-Aug as Duty Leave):** All sessions held prior to 1 Aug 2026 are converted to Duty Leaves (subtracted entirely from denominator `Counted Sessions`).

---

### 3. Target Deficit & Buffer Calculations

For any configurable target attendance threshold $T$ (default: **80%**):

- **Deficit (DLs Needed):** If current attendance $< T$:
  $$\text{DL Needed} = \left\lceil \text{Counted} - \frac{\text{Attended}}{T} \right\rceil$$
- **Consecutive Classes to Attend:**
  $$\text{Classes to Attend} = \left\lceil \frac{T \cdot \text{Counted} - \text{Attended}}{1 - T} \right\rceil$$
- **Buffer (Safe Bunks):** If current attendance $\ge T$:
  $$\text{Safe Bunks} = \left\lfloor \frac{\text{Attended}}{T} - \text{Counted} \right\rfloor$$

---

### 4. Interactive Tools & Views
- **Global Summary Cards:** Overall average attendance, courses under target, total DLs needed across lagging subjects, and total safe bunk hours available.
- **Course Breakdown (Grid & Dense Table Views):** Visual color-coded progress bars (Red `< 75%`, Amber `75%–79.9%`, Emerald `≥ 80%`), category tags, and actionable badges (`Needs 2 DLs`, `Safe to skip 3 classes`).
- **Course Detail Drawer:** Comprehensive session history timeline with filters (All, Present, Absent, Pre-Aug), timing, topics, and side-by-side scenario comparison table with mathematical proofs.
- **Live What-If Simulator:** Interactive steppers to test hypotheses:
  - *"If I get $X$ duty leaves approved..."*
  - *"If I attend the next $N$ classes..."*
  - *"If I miss the next $M$ classes..."*
- **Formal Duty Leave Application Generator:** Auto-generates formal leave application letters tailored with course deficit breakdown ready to print or copy for Faculty Advisors / HoDs.

---

## 🛠 Tech Stack

- **Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4 (with `@tailwindcss/vite` and glassmorphic styling)
- **Icons:** Lucide React
- **Animations & Effects:** Canvas Confetti

---

## 🏃 Running the Application

```bash
# 1. Install dependencies
npm install

# 2. Start local development server with IIIT Kottayam API proxy
npm run dev
```

Visit `http://localhost:5173/` in your browser.
