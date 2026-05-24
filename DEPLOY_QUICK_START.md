# 🚀 Deployment in 3 Steps - Super Simple

> Your app failed on Vercel because it has both Python backend + Node frontend. We need to deploy them separately.

## Step 1: Deploy Frontend (Vercel) - 5 mins

```bash
# 1. Go to https://vercel.com/dashboard
# 2. Click "Add New" → "Project"
# 3. Select your GitHub repo
# 4. Set "Root Directory" to Frontend/
# 5. Click "Deploy"
# 6. Wait... ✅ Done
```

**Your frontend URL:** `https://your-app.vercel.app` (copy this)

---

## Step 2: Deploy Backend (Railway) - 5 mins

```bash
# 1. Go to https://railway.app
# 2. Sign up with GitHub (if not already)
# 3. Click "Create New Project"
# 4. Select "Deploy from GitHub"
# 5. Choose rent-home-agency repo
# 6. Railway auto-detects Flask ✅
# 7. Wait... ✅ Done
```

**Your backend URL:** Railway will show it (copy this too)

---

## Step 3: Connect Them - 2 mins

### In Vercel (Frontend)
1. Go to Project Settings → Environment Variables
2. Add: `VITE_API_URL = https://your-railway-backend.up.railway.app`
3. Click Save
4. Go to Deployments → Click latest → Redeploy

### In Railway (Backend)
1. Go to Variables
2. Add: `FRONTEND_URL = https://your-app.vercel.app`
3. Add: `DATABASE_URL = postgresql://user:password@host:port/dbname`
4. Add the first admin user:
   - `ADMIN_EMAIL = admin@your-app.com`
   - `ADMIN_USERNAME = admin`
   - `ADMIN_PASSWORD = your-secure-password`
5. Click Deploy
3. Click Deploy

---

## ✅ Done!

```
Frontend: https://your-app.vercel.app
Backend:  https://your-backend.up.railway.app
```

Your app is live! 🎉

---

## Test It

1. Open frontend URL in browser
2. Try to login with:
   - Email: `admin@rentease.com`
   - Password: `admin123`
3. You should see the admin dashboard
4. Create a property and see it appear on the listings page

---

## If Something Breaks

| Problem | Solution |
|---------|----------|
| CORS Error | Check both URLs are set in environment variables, then redeploy both |
| Admin login fails | Check `VITE_API_URL` is correct, check backend logs in Railway |
| Images not uploading | SQLite doesn't persist on Railway - add PostgreSQL later |
| Properties disappear | Same issue - database resets on redeploy |

---

## What's Next?

1. ✅ Deploy Frontend to Vercel
2. ✅ Deploy Backend to Railway
3. ✅ Connect them with env vars
4. 🎯 Test everything works
5. 📖 Read `DEPLOYMENT_GUIDE.md` for detailed docs
6. 🛠️ Check `DEPLOYMENT_TROUBLESHOOTING.md` if issues

---

**That's it! Your app is now live for everyone to use.** 🌍
