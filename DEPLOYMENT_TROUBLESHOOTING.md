# Deployment Troubleshooting Guide

## Error: Serverless Function has crashed (500 INTERNAL_SERVER_ERROR)

### Root Cause
Vercel tried to deploy Flask as a serverless function, which failed because:
- Flask isn't optimized for serverless architecture
- Missing proper configuration (vercel.json)
- Python dependencies not installed
- Environment variables not set

### Solution: 3 Easy Steps

## Step 1: Deploy Frontend to Vercel (5 minutes)

### Option A: Deploy Just the Frontend Folder
1. **In Vercel Dashboard:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repo
   - Set **Root Directory** to `Frontend`
   - Click "Deploy"
   - Wait for deployment to complete

2. **Copy your frontend URL** (example: `https://your-app.vercel.app`)

## Step 2: Deploy Backend to Railway (5 minutes) - Recommended

Railway is the easiest Python deployment platform.

### A. Go to Railway
- Visit [railway.app](https://railway.app)
- Sign up with GitHub

### B. Create New Project
- Click "Create New Project"
- Select "Deploy from GitHub"
- Choose your `rent-home-agency` repo
- Railway auto-detects Flask ✅
- Click "Deploy"

### C. Get Backend URL
- In Railway Dashboard, click your project
- Go to "Settings"
- Copy the **Public Domain URL** (example: `https://your-app.up.railway.app`)

### D. Set Environment Variables
In Railway Dashboard → Variables, add:
```
SECRET_KEY=your-secure-random-key
FRONTEND_URL=https://your-app.vercel.app
```

## Step 3: Connect Frontend to Backend (2 minutes)

Update your Vercel deployment with the backend URL:

1. **In Vercel → Your Project → Settings → Environment Variables**
   - Add: `VITE_API_URL=https://your-backend.up.railway.app`
   - Click "Save"

2. **Trigger redeploy:**
   - Go to "Deployments"
   - Click the three dots on latest deployment
   - Select "Redeploy"

## ✅ Done! Your App is Live

Test it:
```bash
# Frontend (public)
https://your-app.vercel.app

# Backend (API)
https://your-backend.up.railway.app/api/properties
```

---

## Alternative Options

### Option B: Heroku (Free tier ended, paid only)
- Pricing: $7/month minimum
- Deploy: `git push heroku main`
- Add `Procfile` and `gunicorn` to requirements.txt

### Option C: Render.com
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repo
4. Build command: `pip install -r requirements.txt`
5. Start command: `gunicorn app:app`

### Option D: PythonAnywhere
- Simple Python hosting
- Free tier available
- Upload files via web interface

---

## Common Issues & Fixes

### Issue 1: CORS Error
**Error Message:** "Access to XMLHttpRequest has been blocked by CORS policy"

**Fix:**
1. In Railway → Variables, set: `FRONTEND_URL=https://your-vercel-app.vercel.app`
2. Redeploy backend
3. In Vercel → Redeploy frontend

### Issue 2: 403 Unauthorized on Admin
**Error Message:** "Admin access required"

**Cause:** Wrong backend URL in frontend

**Fix:**
1. Verify `VITE_API_URL` in Vercel environment variables
2. Make sure it points to Railway backend
3. Redeploy Vercel

### Issue 3: Images Not Loading
**Cause:** Image uploads stored locally, need persistent storage

**Fix for Railway:**
- Add PostgreSQL database for image URLs
- Or switch to cloud storage (AWS S3, Cloudinary)

### Issue 4: Database Not Persisting
**Cause:** SQLite file lost after redeployment

**Fix:**
- In Railway → Add Service → PostgreSQL
- Update app.py to use PostgreSQL instead of SQLite
- Or use Railway's file storage

---

## Quick Verification Checklist

After deployment, test these:

```bash
# 1. Frontend loads
curl https://your-app.vercel.app
# Should return HTML

# 2. Backend is running
curl https://your-backend.up.railway.app/api/properties
# Should return JSON with properties

# 3. Admin can login
curl -X POST https://your-backend.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rentease.com","password":"admin123"}'
# Should return success message

# 4. CORS is working
# Open frontend in browser and check Network tab
# Should not see CORS errors
```

---

## Final Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway  
- [ ] Environment variables set in both
- [ ] `VITE_API_URL` set in Vercel
- [ ] `FRONTEND_URL` set in Railway
- [ ] Frontend redeployed after env vars
- [ ] Backend redeployed after env vars
- [ ] Can login as admin
- [ ] Can create/edit/delete properties
- [ ] Changes appear immediately
- [ ] No CORS errors in console

---

## Getting Help

If something fails:

1. **Check Vercel Logs:**
   - Dashboard → Deployments → Click deployment → View logs

2. **Check Railway Logs:**
   - Dashboard → Your project → Deployments → View logs

3. **Check Browser Console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for error messages

4. **Common Log Errors:**
   - `ModuleNotFoundError`: Missing Python dependency → add to requirements.txt
   - `NameError`: Code syntax error → check app.py
   - `Connection refused`: Backend not running → redeploy
   - `CORS error`: Frontend URL not in backend CORS → update env vars

---

## Production Security Tips

1. **Change default admin password:**
   ```bash
   # Update in app.py seed function or database
   # After first login, change password in admin settings
   ```

2. **Change SECRET_KEY:**
   - Set in Railway environment variables
   - Use a strong random string

3. **Use HTTPS Only:**
   - Both Vercel and Railway use HTTPS by default ✅

4. **Disable Debug Mode:**
   ```python
   app.run(debug=False)  # In production
   ```

5. **Add Rate Limiting:**
   ```python
   from flask_limiter import Limiter
   # Prevent brute force attacks
   ```

---

## Still Having Issues?

1. Delete all deployments and start fresh
2. Make sure Python 3.9+ is being used
3. Verify all dependencies in requirements.txt
4. Check that both URLs are correct
5. Clear browser cache and try again
