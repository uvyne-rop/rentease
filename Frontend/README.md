# 🏠 Rent Ease And Homes Agency

A full-stack property rental web application built with **React + Tailwind CSS** (frontend) and **Python Flask** (backend).

---

## 📁 Project Structure

```
rentease/
├── backend/
│   ├── app.py              # Flask API
│   ├── requirements.txt    # Python dependencies
│   └── rentease.db         # SQLite database (auto-created)
└── frontend/
    ├── src/
    │   ├── components/     # Reusable UI components
    │   │   ├── Navbar.jsx         # Responsive navbar with mobile hamburger
    │   │   ├── Footer.jsx
    │   │   ├── PropertyCard.jsx   # Card with Favourite + Compare
    │   │   ├── SearchBar.jsx      # Kenya-specific filters
    │   │   └── AuthModal.jsx      # Login / Register / Reset modal
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── ListingsPage.jsx
    │   │   ├── PropertiesForRentPage.jsx
    │   │   ├── PropertyDetailPage.jsx
    │   │   ├── AboutPage.jsx
    │   │   ├── ContactPage.jsx
    │   │   ├── MeetTheTeamPage.jsx
    │   │   ├── FavoritesPage.jsx
    │   │   └── ComparePage.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── ToastContext.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.js
    └── index.html
```

---

## 🚀 Getting Started

### 1. Backend (Flask)

```bash
cd backend

# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate      # macOS/Linux
venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Start the server (runs on http://localhost:5000)
python app.py
```

The database is auto-created with 8 seed properties on first run.

---

### 2. Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server (runs on http://localhost:5173)
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## ✅ Fixes Applied (from Analysis Report)

| Issue | Fix |
|-------|-----|
| Mobile nav not responsive | Hamburger menu with smooth slide toggle on all pages |
| Username enumeration | Generic error: "Invalid username or password." |
| Password reset reveals account existence | Always returns generic message |
| "State" filter (not applicable to Kenya) | Replaced with "County" filter with all 12 major counties |
| Unrealistic price dropdown (100 KES) | Free-text min/max price inputs (manual entry) |
| Compare/Favourite silent for guests | Flash messages with "Sign in to use this feature" |
| Dead Twitter link | Removed; only Facebook & Instagram kept |
| About Us page lacks narrative flow | Restructured: Who → What → How → Where |

---

## 🔌 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/reset-password` | Request password reset |

### Properties
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/properties` | List with filters |
| GET | `/api/properties/:id` | Single property |

**Query params:** `search`, `type`, `county`, `bedrooms`, `bathrooms`, `price_min`, `price_max`, `featured`, `sort`

### Favorites
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/favorites` | Get saved homes |
| POST | `/api/favorites/:id` | Save property |
| DELETE | `/api/favorites/:id` | Unsave property |

### Compare
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/compare` | Get compare list |
| POST | `/api/compare/:id` | Add to compare |
| DELETE | `/api/compare/:id` | Remove from compare |

### Other
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/counties` | List Kenya counties |
| POST | `/api/contact` | Submit contact form |

---

## 🛡️ Security

- Generic auth error messages (no username enumeration)
- Password reset never reveals if account exists
- Passwords hashed with Werkzeug (`pbkdf2:sha256`)
- Session-based auth (HTTP-only cookies)

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6 |
| Styling | Tailwind CSS 3 |
| Build tool | Vite 5 |
| Icons | Lucide React |
| Backend | Python Flask 3 |
| Database | SQLite (via Python sqlite3) |
| Auth | Flask sessions + Werkzeug |
| CORS | Flask-CORS |
