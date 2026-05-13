# Deployment Guide - Frontend & Backend

## Issue
Vercel can't deploy Python + Node.js projects together. We need to deploy them separately.

## Solution: Deploy Frontend & Backend Separately

### Option 1: Frontend on Vercel + Backend on Railway (Recommended)

#### Step 1: Deploy Frontend to Vercel

1. **Create a new Vercel project for the Frontend only:**
   ```bash
   cd Frontend
   npm run build
   ```

2. **In Vercel Dashboard:**
   - Click "Add New" → "Project"
   - Select your GitHub repo
   - Set **Root Directory** to `Frontend/`
   - Keep other settings as default
   - Deploy!

3. **After deployment, you'll get a URL like:** `https://your-app.vercel.app`

#### Step 2: Deploy Backend to Railway

Railway is perfect for Python/Flask backends:

1. **Go to [railway.app](https://railway.app) and sign up**

2. **Create a new project:**
   - Click "Create New Project"
   - Select "Deploy from GitHub"
   - Choose your `rent-home-agency` repo
   - Railway will detect Flask automatically

3. **Configure environment variables:**
   - In Railway Dashboard → Variables
   - No special config needed for SQLite

4. **Railway automatically exposes your backend URL** (something like `https://your-backend.up.railway.app`)

#### Step 3: Connect Frontend to Backend

Update your Frontend to use the Railway backend URL:

**File: `Frontend/src/context/AuthContext.jsx`**

Change all `fetch('/api/...` calls to use the full URL:

```javascript
// Replace this:
const res = await fetch('/api/auth/login', { ... })

// With this:
const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, { ... })
```

**Create `.env.production` in Frontend folder:**

```
VITE_API_URL=https://your-backend.up.railway.app
```

### Option 2: Deploy Both to Railway (Simpler)

Railway can host both frontend and backend:

1. Go to [railway.app](https://railway.app)
2. Create a new project from GitHub
3. Railway detects both Python (Flask) and Node (Frontend)
4. Deploy! Railway handles routing automatically

### Option 3: Use Heroku for Backend

1. **Install Heroku CLI**
2. **Create `Procfile` in root:**
   ```
   web: gunicorn app:app
   ```

3. **Add gunicorn to requirements.txt:**
   ```bash
   echo "gunicorn" >> requirements.txt
   ```

4. **Deploy:**
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

## Current Issue - How to Fix

The error you're seeing is because:
- Vercel tried to run Flask as a serverless function
- Flask doesn't work well as Vercel serverless functions
- We need a dedicated Python server

## Recommended: Use Railway (Easiest)

1. **Go to [railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Create new project → Deploy from GitHub**
4. **Select `rent-home-agency` repo**
5. **Click Deploy** - Railway auto-detects Python
6. Railway gives you a public URL immediately

## After Deployment

### Update Frontend API Calls

In your React app, update fetch URLs to use the backend URL:

**Frontend/src/context/AuthContext.jsx:**
```javascript
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-railway-backend.up.railway.app'
  : 'http://localhost:5000'

const res = await fetch(`${API_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email: identifier, password }),
})
```

### Update CORS in Backend

**app.py** - Update CORS to include production URLs:
```python
CORS(app, supports_credentials=True, origins=[
  'http://localhost:5173', 
  'http://localhost:3000',
  'https://your-frontend.vercel.app',  # Add your Vercel URL
  'https://your-railway-backend.up.railway.app'  # Add your backend URL
])
```

## Quick Fix - Right Now

If you want to undeploy and start over:

1. **Delete current Vercel project**
2. **Push only Frontend folder to new Vercel project:**
   ```bash
   # In your Frontend folder
   git remote add frontend-only <new-frontend-repo>
   git subtree push --prefix Frontend frontend-only main
   ```

Or simply:

3. **In Vercel Dashboard, just point to `Frontend` folder and rebuild**

## Checklist for Deployment

- [ ] Frontend builds without errors: `cd Frontend && npm run build`
- [ ] Backend runs locally: `python3 app.py`
- [ ] CORS is configured for your URLs
- [ ] API URL is set in frontend environment
- [ ] Database migrations (if any) are handled
- [ ] Environment variables are set in production

## After Both Are Deployed

Test with:
```bash
curl https://your-backend.up.railway.app/api/properties
# Should return JSON with properties

curl https://your-frontend.vercel.app
# Should load React app
```

---

**Need help choosing?** Railway is the easiest - just connect your GitHub repo and it works!
