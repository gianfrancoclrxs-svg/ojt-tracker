# 📊 OJT Tracker

![GitHub repo size](https://img.shields.io/github/repo-size/gianfrancoclrxs-svg/ojt-tracker)
![GitHub last commit](https://img.shields.io/github/last-commit/gianfrancoclrxs-svg/ojt-tracker)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow)

A modern, student-built **On-the-Job Training (OJT) tracking system** that helps users monitor attendance, log hours, and visualize productivity, burnout risk, and progress in real-time.

---

## 🚀 Overview

OJT Tracker is a full-featured web application designed to help students easily track their OJT progress with smart analytics and visual dashboards.

It goes beyond simple time logging by introducing:
- 📈 Progress tracking (hours vs target)
- 🔥 Burnout detection system
- 📊 Weekly activity visualization
- 🧠 Work pattern insights
- 🎯 Smart completion forecasting

---

## ✨ Features

### 🧾 Logbook System
- Daily AM/PM time-in and time-out tracking
- Half-day and absent marking
- Automatic hour computation
- Monthly filtering support

### 📊 Dashboard Analytics
- Total hours vs required hours
- Remaining hours tracker
- Expected completion date prediction
- Progress status indicator

### 🔥 Burnout Insights Engine
- Detects workload intensity patterns
- Classifies user state:
  - Healthy pace
  - Steady progress
  - Burnout risk
  - Low energy pattern
- 9-day rolling analysis system

### 📅 Weekly Activity Chart
- Visual bar chart (Mon–Fri)
- Click tooltips for daily breakdown
- Dark mode support

### ⭕ Ring Progress Tracker
- Animated circular progress indicator
- Percentage completion visualization
- Milestone detection system

### 🌙 UI / UX
- Dark mode support
- Responsive mobile-first layout
- Card-based dashboard design
- Smooth animations & transitions

---

## 🧠 Smart System Highlights

### 🔥 Burnout Engine Logic
Tracks:
- Heavy workload spikes (9+ hours)
- Rest imbalance detection
- Activity distribution patterns

### ⏱️ Completion Predictor
```
Remaining Hours ÷ 8-hour workday
→ Estimated finish date (weekend-aware)
```

### 📊 Pattern Intelligence
- Last 9-day behavioral analysis
- Energy trend estimation
- Work consistency scoring

---

## 📂 Project Structure

```
/ (root)
├── assets/
│   ├── css/
│   │   ├── dtr.css
│   │   └── style.css
│   │
│   ├── js/
│   │   ├── app.js
│   │   ├── config.js
│   │   ├── dtr.js
│   │   ├── logbook.js
│   │   └── components/
│   │       ├── dashboard-cards.js
│   │       ├── footer.js
│   │       ├── ring.js
│   │       ├── topbar.js
│   │       ├── warning.js
│   │       ├── weeklychart.js
│   │       └── whatsnew.js
│
├── node_modules/
├── burnout.html
├── dtr.html
├── homepage.html
├── index.html
├── logbook.html
├── privacy.html
├── ring.html
├── settings.html
├── terms.html
├── package.json
├── package-lock.json
```

---

## ⚙️ How It Works

1. User logs in / signs up
2. Attendance data is stored in Firebase Firestore
3. System computes:
   - Daily hours
   - Total OJT progress
   - Remaining hours
4. Dashboard renders:
   - Progress ring animation
   - Burnout insights
   - Weekly activity chart
5. Rule-based engine analyzes behavior patterns

---

## 🎯 Purpose

Built for **students doing OJT**, this system helps:
- Track daily attendance easily
- Visualize workload
- Avoid burnout
- Stay motivated toward completion

---

## ⚠️ Disclaimer

This is a **student project** created for educational purposes only and is not affiliated with any institution or organization.

---

## 👨‍💻 Developer

**Grayson (@gianxxsz)**  
📧 gianfranco.clrxs@gmail.com

---

## 🚀 GitHub Landing Preview Section

### 📌 OJT Tracker — Smarter Training Progress System

A powerful student OJT tracking platform with **real-time analytics, burnout detection, and visual progress monitoring**.

✔ Track daily attendance effortlessly  
✔ Visualize progress with animated rings  
✔ Detect burnout before it happens  
✔ Predict completion date automatically  
✔ Understand your work patterns over time  

> “Not just a logbook — a smart productivity companion.”

---

## 💡 Future Improvements

- Firebase Authentication upgrade
- Export logs (PDF / Excel)
- Mobile app version
- AI-based productivity prediction

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub.

