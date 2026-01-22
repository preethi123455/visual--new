# 🚀 Complete Deployment Guide - Visual Math Learning App

## Project Overview

This is a full-stack MERN application with face recognition authentication using Face-API.

**Tech Stack:**

- **Frontend:** React 18, React Router, Axios, React-Webcam
- **Backend:** Node.js, Express, MongoDB, Face-API, Canvas
- **Styling:** CSS3 with animations and gradients
- **Authentication:** Face Recognition (Biometric)

---

## 📋 Prerequisites

### Backend Requirements

```
Node.js >= 14.0.0
MongoDB Atlas account
npm or yarn package manager
```

### Frontend Requirements

```
Node.js >= 14.0.0
npm or yarn package manager
Modern web browser with webcam support
```

---

## 🔧 Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/preethi123455/visual--new.git
cd visual--new
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
touch .env
```

### 3. Backend .env Configuration

Create `backend/.env` file with the following:

```env
# MongoDB
MONGO_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/faceAuthDB

# Server
PORT=5002
NODE_ENV=development

# Optional - for production
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

### 4. Frontend Setup

```bash
# Navigate to frontend (root directory)
cd ..

# Install dependencies
npm install

# Create .env file
touch .env
```

### 5. Frontend .env Configuration

Create `.env` file with:

```env
REACT_APP_API_URL=http://localhost:5002
SKIP_PREFLIGHT_CHECK=true
```

---

## 🏃 Running Locally

### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

Backend runs on: `http://localhost:5002`

### Terminal 2 - Frontend

```bash
npm start
```

Frontend runs on: `http://localhost:3000`

---

## 🌐 Deployment to Production

### Step 1: Deploy Backend to Render

#### 1a. Push Code to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### 1b. Create Render Account

- Go to [render.com](https://render.com)
- Sign up with GitHub
- Create new "Web Service"
- Connect your GitHub repository

#### 1c. Configure Render Backend

**Settings:**

- **Name:** visual-math-backend
- **Region:** Singapore (or nearest to you)
- **Language:** Node
- **Build Command:** `npm install`
- **Start Command:** `node backend/server.js`

**Environment Variables:**

```
MONGO_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/faceAuthDB
NODE_ENV=production
PORT=5002
```

**Deploy!** ✅

---

### Step 2: Deploy Frontend to Render

#### 2a. Create New Static Site on Render

- Go to Render Dashboard
- New → Static Site
- Connect your GitHub repo
- Build settings:

**Settings:**

- **Name:** visual-math-frontend
- **Build Command:** `npm run build`
- **Publish Directory:** `build`

#### 2b. Add Environment Variables

- Go to Site Settings
- Environment variables:

```
REACT_APP_API_URL=https://visual-math-backend.onrender.com
```

**Deploy!** ✅

---

### Step 3: Verify Deployment

1. **Check Backend Health:**

   ```
   https://visual-math-backend.onrender.com
   ```

   Should respond with 404 (that's OK, server is running)

2. **Test Login Page:**

   ```
   https://visual-math-frontend.onrender.com/login
   ```

3. **Test Signup Page:**
   ```
   https://visual-math-frontend.onrender.com/signup
   ```

---

## ✅ Post-Deployment Checklist

### Frontend

- [ ] CSS styling works correctly (Login/Signup pages)
- [ ] Webcam access works
- [ ] Navigation between Login/Signup works
- [ ] Face capture displays correctly
- [ ] Buttons are styled and responsive
- [ ] Mobile layout responsive

### Backend

- [ ] MongoDB connection working
- [ ] Face models loading correctly
- [ ] CORS errors resolved
- [ ] Signup endpoint working
- [ ] Login endpoint working
- [ ] Face recognition accuracy acceptable

### CORS Configuration

The backend is configured with:

```javascript
// Allowed Origins:
- http://localhost:3000 (local dev)
- https://visual-new-frontend.onrender.com (production)
- https://visual-math-frontend.onrender.com (alt production)
- https://educonnect-platform-frontend.onrender.com (alt)

// Allowed Methods:
- GET, POST, PUT, DELETE, OPTIONS, PATCH

// Allowed Headers:
- Content-Type
- Authorization
- X-Requested-With
```

---

## 🐛 Troubleshooting

### CORS Errors

**Issue:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**

1. Check backend `.env` has correct MONGODB_URI
2. Verify frontend REACT_APP_API_URL matches backend URL
3. Ensure backend has all origins in allowedOrigins array
4. Backend must have `app.options('*', cors())` middleware

### Face Recognition Not Working

**Issue:** "No face detected" or face mismatch

**Solution:**

1. Ensure good lighting when capturing face
2. Keep face centered in webcam
3. Face must be clearly visible (no mask/sunglasses)
4. Check browser webcam permissions
5. Face models must load: Check backend logs

### MongoDB Connection Issues

**Issue:** `MongoNetworkError`

**Solution:**

1. Verify MONGO_URI is correct in `.env`
2. Add your IP to MongoDB Atlas whitelist
3. Check username/password in connection string
4. Ensure database name is correct

### Static Assets Not Loading

**Issue:** CSS/images return 404

**Solution:**

1. Clear browser cache (Ctrl+Shift+Delete)
2. Rebuild frontend: `npm run build`
3. Redeploy to Render
4. Check build folder exists with static files

---

## 📱 Responsive Design Features

### Breakpoints

```css
- Desktop: 1024px+
- Tablet: 768px - 1023px
- Mobile: 480px - 767px
- Small Mobile: <480px
```

### CSS Styling

- **Colors:** Purple gradient (#7c3aed to #5b21b6)
- **Animations:** Fade-up entrance, smooth transitions
- **Typography:** Poppins font family
- **Components:** Glassmorphism effect (blur background)

---

## 🔒 Security Best Practices

✅ **Implemented:**

- CORS properly configured
- Input validation on both frontend and backend
- Face descriptors stored securely (not raw images)
- Environment variables for sensitive data
- HTTPS enforced in production (Render provides this)

⚠️ **Recommended for Production:**

- Add rate limiting (express-rate-limit)
- Add input sanitization (xss)
- Use JWT tokens for session management
- Add helmet.js for security headers
- Enable HTTPS-only cookies
- Add password encryption for additional auth

---

## 📊 Performance Tips

1. **Frontend:**
   - Lazy load components using React.lazy()
   - Optimize images
   - Enable gzip compression
   - Cache static assets

2. **Backend:**
   - Index MongoDB collections
   - Use connection pooling
   - Cache face models after initial load
   - Compress API responses

3. **Database:**
   - Create indexes on email field
   - Regular backups
   - Monitor query performance

---

## 🔄 Continuous Deployment

### Auto-deploy on Push

1. Connect GitHub repo to Render
2. Set branch to `main`
3. Render automatically redeploys on each push
4. Builds take 2-5 minutes

---

## 📞 Support & Resources

- **Face-API Docs:** https://github.com/justadudewhohacks/face-api.js
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Render Docs:** https://render.com/docs
- **React Router:** https://reactrouter.com/

---

## 🎯 Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Render
3. ✅ Test all features
4. ✅ Monitor performance
5. ✅ Collect user feedback
6. ✅ Iterate and improve

---

**Last Updated:** January 22, 2026
**Status:** Production Ready ✅
