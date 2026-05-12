# Quick Start - Testing Admin-Only Features

## Prerequisites
- Node.js and npm installed
- Python 3 with Flask installed
- The app running locally

## Step 1: Start the Backend

```bash
cd /home/uvynerop/work/rent-home-agency
python3 app.py
```

The Flask server will start on `http://localhost:5000`

## Step 2: Start the Frontend

```bash
cd /home/uvynerop/work/rent-home-agency/Frontend
npm run dev
```

The React app will start on `http://localhost:5173`

## Step 3: Login as Admin

1. Open `http://localhost:5173` in your browser
2. Click the **Login** button in the navbar
3. Enter admin credentials:
   - Email: `admin@rentease.com`
   - Password: `admin123`
4. Click "Sign in"
5. You should be redirected to `/admin` dashboard

## Step 4: Test Property CRUD Operations

### Create a Property
1. Click **+ Add Property** button
2. Fill in the form:
   - Title: "My Test Property"
   - Type: "Apartments"
   - Price: "50000"
   - County: "Nairobi"
   - Location: "Westlands"
   - Address: "Test Street"
   - Description: "A beautiful test property"
   - Bedrooms: 2
   - Bathrooms: 2
3. Click **Create Property**
4. You should see a success message
5. The property appears in the properties table

### Verify on User Side
1. Open a new private/incognito window or log out
2. Navigate to `http://localhost:5173/listings`
3. Your new property should appear in the list
4. Click it to see full details

### Edit a Property
1. Go back to admin dashboard
2. Find your test property in the table
3. Click **Edit** button
4. Change the price to "55000"
5. Click **Update Property**
6. Go to listings page and verify the price changed

### Delete a Property
1. Go back to admin dashboard
2. Find your test property
3. Click **Delete** button
4. Confirm the deletion
5. Verify it's gone from both admin and listings pages

## Step 5: Test Access Control

### Test Non-Admin Access
1. Logout (click logout in navbar)
2. Try accessing `http://localhost:5173/admin` directly
3. You should be redirected to the home page
4. You should NOT see the admin dashboard

### Test Protected Endpoints
Use curl to test unauthorized access:

```bash
# This should fail with 403
curl -X GET http://localhost:5000/api/admin/properties

# This should succeed (public access)
curl -X GET http://localhost:5000/api/properties
```

## Step 6: Test User Management

1. In admin dashboard, click the **Users** tab
2. You should see all registered users
3. Try clicking "Make Admin" on a user
4. User role should change to "Admin"
5. Click "Remove Admin" to revert

## Step 7: Test Image Upload

1. In admin dashboard, click **+ Add Property**
2. Scroll to the Images section
3. Click the upload area to select an image
4. Image should upload and show in the preview
5. Add the property and verify image appears in listings

## Expected Behavior

✅ **Should Work:**
- Admin can create properties
- Admin can edit properties
- Admin can delete properties
- Admin can upload images
- Changes appear immediately in public listings
- Admin can manage users and roles
- Non-admin cannot access `/admin`
- Non-admin cannot call admin API endpoints

❌ **Should NOT Work:**
- Non-admin accessing admin dashboard
- Non-admin calling `/api/admin/*` endpoints
- Unauthenticated users accessing admin features
- Admin with unverified email (if email_verified = 0)

## Troubleshooting

### "Admin access required" Error
- Make sure you're logged in as `admin@rentease.com`
- Check that email is verified (it should be by default)
- Try logging out and back in

### Properties not appearing in listings
- Make sure you created the property in admin dashboard
- Check that property has all required fields
- Try refreshing the listings page
- Click "Refresh" button in admin dashboard

### Images not uploading
- Check that file is in allowed format (PNG, JPG, GIF, WEBP)
- Check file size is reasonable
- Check browser console for errors
- Check Flask server logs

### Can't login
- Verify you're using correct credentials: `admin@rentease.com` / `admin123`
- Check that Flask backend is running
- Check browser console for CORS errors

## Database Reset

If you want to reset the database and re-seed with default data:

```bash
cd /home/uvynerop/work/rent-home-agency
rm rentease.db  # Remove existing database
python3 app.py  # Will recreate and seed database
```

This will recreate:
- Admin user (admin@rentease.com / admin123)
- 8 sample properties
- All required tables
