# 🗺️ Touristic Route Planner – Frontend (React.js)

This project is a web-based application that helps users plan personalized tourist routes based on preferences such as time, budget, and interest using route optimization algorithms and Google Maps services.

## 📌 Stack
- **Frontend Framework:** React.js
- **Cloud Services:** Google Maps API (Directions, Places, Geocoding)
- **Backend:** ASP.NET Core Web API (hosted on Azure)

---

## ✅ To-Do List for Frontend

### 🔐 Authentication Pages
- [ ] **Sign Up Page**
  - Input fields: name, email, password
  - Form validation (client-side)
  - POST to backend: `/api/auth/register`
  - Redirect to login on success

- [ ] **Login Page**
  - Input fields: email, password
  - Form validation
  - POST to backend: `/api/auth/login`
  - Store JWT/token
  - Redirect to dashboard on success

---

### 🧭 Main Pages

- [ ] **Dashboard**
  - Welcome message
  - Option to start new trip or view saved plans

- [ ] **Trip Planner Form**
  - Input fields:
    - Destination city
    - Interests (e.g., history, food, nature)
    - Budget range
    - Available time (start & end date)
  - Submit button to fetch optimized route from backend

- [ ] **Map View**
  - Display recommended route using `@react-google-maps/api`
  - Markers for attractions
  - Route lines based on Directions API response

- [ ] **Trip Summary**
  - List of attractions (name, description, cost, rating, etc.)
  - Editable list with option to remove stops
  - Option to save trip or start over

- [ ] **User Profile**
  - Display user data
  - Option to update preferences
  - View saved trips (if backend supports it)

---
