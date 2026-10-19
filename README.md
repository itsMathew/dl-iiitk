# DutyLeaf • IIIT Kottayam Attendance & Policy Analyzer

A production-ready React (TypeScript + Tailwind CSS + Lucide Icons) attendance planner, policy modeler, and analytics dashboard designed specifically for college students following unique attendance credit and Duty Leave (DL) rules.

---

## 🚀 Key Features

### 1. Direct College Portal Authentication & Session Sync
- **Live Portal Login:** Enter your college email (`@iiitkottayam.ac.in`) and password. Authenticates directly against `https://attendance.iiitkottayam.ac.in/api/auth/login` and proxies requests seamlessly via Vite to bypass browser CORS restrictions.
- **Direct JWT Token Entry:** Option to paste an active Bearer token directly from DevTools for session debugging.
- **Console Scraper & JSON Tools:** Built-in copyable browser console snippet that traverses all courses via background `fetch` and outputs complete JSON payloads.

---

### 2. Internship Leaves & College Attendance Rules

The college attendance system follows specific administrative rules:
$$\text{Attendance \%} = \left(\frac{\text{Attended Sessions}}{\text{Counted Sessions}}\right) \times 100$$
$$\text{Counted Sessions} = \text{Held Sessions} - \text{Duty Leaves}$$

> **Note on Duty Leaves (DL):** A Duty Leave is an excused absence completely removed from the denominator (`Counted Sessions = Held - DL`). It does NOT count as attended; instead, it reduces the denominator, elevating attendance.

#### Internship Leaves & Cutoff Policy:
- **Internship Leaves Toggle:** Toggle to excuse pre-semester sessions held during internship.
- **Configurable Cutoff Date:** Select any cutoff date (defaulting to **1 August 2026**). All sessions held prior to this date are automatically excused as Duty Leaves from the denominator.

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
- **Summary Cards:** Courses under target ($< 80\%$), total DLs needed across lagging subjects, and total safe bunk hours available.
- **Course Breakdown (Grid & Dense Table Views):** Visual monochrome progress bars, category tags, and actionable badges (`Needs 2 DLs`, `Safe to skip 3 classes`).
- **Course Detail Drawer:** Comprehensive session history timeline with filters (All, Present, Absent, Internship), timing, topics, and simulation steppers.
- **Formal Duty Leave Application Generator:** Auto-generates formal leave application letters tailored with course deficit breakdown ready to print or copy for Faculty Advisors / HoDs.

---

## 🛠 Tech Stack

- **Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4 (Pure Monochrome Black & White)
- **Icons:** Lucide React

---

## 🏃 Running the Application

```bash
# 1. Install dependencies
npm install

# 2. Start local development server with IIIT Kottayam API proxy
npm run dev
```

Visit `http://localhost:5173/` in your browser.
