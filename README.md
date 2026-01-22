# 🎓 Visual Math Learning App - Face Recognition Authentication

A modern full-stack web application featuring face recognition-based authentication using biometric technology.

## ✨ Features

✅ **Face Recognition Authentication**

- Unique face-based signup
- Facial recognition login
- Secure face descriptor storage
- No passwords required

✅ **Beautiful UI/UX**

- Modern glassmorphism design
- Smooth animations and transitions
- Fully responsive mobile-first design
- Purple gradient theme

✅ **Production Ready**

- Deployed on Render
- MongoDB Atlas integration
- CORS properly configured
- Error handling and validation

## 🎨 Screenshots

### Login Page

- Large webcam view (360px height)
- Email input field
- Face capture with preview
- Responsive design

### Signup Page

- Name, Age, Email inputs
- Large webcam preview
- Captured face display
- Loading states with button feedback

## 🚀 Quick Start

### Prerequisites

- Node.js >= 14.0.0
- MongoDB Atlas account
- npm or yarn

### Local Development (2 minutes)

```bash
# Clone repository
git clone https://github.com/preethi123455/visual--new.git
cd visual--new

# Backend setup
cd backend
npm install
# Create .env with MONGO_URI and PORT
npm run dev

# Frontend setup (new terminal)
npm install
# Create .env with REACT_APP_API_URL
npm start
```

Visit: `http://localhost:3000`

## 📦 Project Structure

```
visual--new/
├── src/
│   ├── components/
│   │   ├── Login.js (✨ updated with CSS)
│   │   ├── Login.css (✨ professional styling)
│   │   ├── Signup.js (✨ updated with CSS)
│   │   └── Signup.css (✨ professional styling)
│   ├── App.js
│   └── index.js
├── backend/
│   ├── server.js (✨ CORS fixed)
│   ├── models/
│   │   ├── User.js
│   │   ├── CartItem.js
│   │   └── face models (pre-loaded)
│   ├── routes/
│   │   ├── userRoutes.js
│   │   └── cartRoutes.js
│   └── .env (create this)
├── .env (create this)
├── DEPLOYMENT_GUIDE.md
├── .env.example
└── backend/.env.example
```

## 🎨 Styling Highlights

### CSS Features

- **Responsive Breakpoints:** Desktop, Tablet, Mobile, Small Mobile
- **Animations:** Fade-up entrance, slide-in effects
- **Color Scheme:** Purple gradient (#7c3aed to #5b21b6)
- **Typography:** Poppins font with proper hierarchy
- **Effects:** Glassmorphism, shadows, blur background
- **Interactions:** Hover effects, disabled states, focus states

### CSS Classes

```css
.login-container / .signup-container  /* Page wrapper */
.login-card / .signup-card            /* Card component */
.webcam-box                           /* Large webcam view */
.captured-img                         /* Preview image */
.login-btn / .signup-btn              /* Primary buttons */
.login-link / .signup-link            /* Navigation links */
.message                              /* Feedback messages */
```

## 🔒 API Endpoints

### Signup

```
POST /signup
Body: { name, age, email, image(base64) }
Response: { message: "✅ Signup successful" }
```

### Login

```
POST /login
Body: { email, image(base64) }
Response: { success: true/false, message: "..." }
```

## 🐛 Known Issues & Fixes

### ✅ CORS Issues - FIXED

**Before:** CORS errors when calling backend from frontend
**After:**

- Configured allowed origins
- Added preflight handler
- Set credentials: true

### ✅ CSS Styling - FIXED

**Before:** No styling, unstyled HTML
**After:**

- Professional purple gradient design
- Responsive mobile layout
- Smooth animations
- Proper button states

## 🌐 Deployment

### Frontend (Render)

```
Build Command: npm run build
Publish Directory: build
Environment: REACT_APP_API_URL=https://your-backend-url.onrender.com
```

### Backend (Render)

```
Build Command: npm install
Start Command: node backend/server.js
Environment: MONGO_URI, NODE_ENV=production
```

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed steps.

## 📊 Tech Stack

| Category           | Technology                    |
| ------------------ | ----------------------------- |
| **Frontend**       | React 18, React Router, Axios |
| **Backend**        | Node.js, Express, MongoDB     |
| **Authentication** | Face-API.js, Canvas           |
| **Styling**        | CSS3, Animations              |
| **Deployment**     | Render, MongoDB Atlas         |

## 🔧 Configuration

### Environment Variables - Frontend

```env
REACT_APP_API_URL=http://localhost:5002          # local dev
REACT_APP_API_URL=https://backend-url.onrender.com # production
SKIP_PREFLIGHT_CHECK=true                         # optional
```

### Environment Variables - Backend

```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
PORT=5002
NODE_ENV=development
```

## 🎯 Next Steps

1. **Local Testing**
   - Clone & setup locally
   - Test Login/Signup flow
   - Verify face recognition works
   - Check responsive design on mobile

2. **Deployment**
   - Push to GitHub
   - Connect to Render
   - Deploy backend first
   - Deploy frontend with backend URL
   - Test on production

3. **Enhancement Ideas**
   - Add password backup authentication
   - Implement session management
   - Add user profile page
   - Store face capture history
   - Add multi-face recognition

## 🤝 Contributing

Contributions welcome! Please feel free to submit PRs.

## 📝 License

This project is open source under the ISC license.

## 👨‍💻 Author

**Preethi**

- GitHub: [@preethi123455](https://github.com/preethi123455)
- Project: [visual--new](https://github.com/preethi123455/visual--new)

## 📞 Support

For issues or questions:

1. Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
2. Review error messages in browser console
3. Check backend logs on Render dashboard
4. Ensure MongoDB connection string is correct

## ✅ Checklist - Ready for Production

- ✅ Face recognition working
- ✅ Login/Signup pages styled beautifully
- ✅ CORS issues resolved
- ✅ MongoDB connected
- ✅ Responsive design implemented
- ✅ Error handling added
- ✅ Environment variables configured
- ✅ Deployment guide created
- ✅ Ready for production deployment

**Status:** 🚀 Production Ready

---

**Last Updated:** January 22, 2026
