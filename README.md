# 🚀 Project Camp

A full-stack Task Management Web Application built using the IMERN stack (MongoDB, Express, React, Node.js) with secure authentication and email verification.

---

## 🧠 Overview

Project Camp is a task management platform where users can securely register, verify their email, and manage their daily tasks efficiently.

This project demonstrates real-world full-stack architecture, authentication workflows, and deployment practices.

---

## 🛠 Tech Stack

### Frontend
- React.js
- Axios
- CSS

### Backend
- Node.js
- Express.js
- JWT (JSON Web Tokens)
- Bcrypt (Password Hashing)
- Nodemailer (Email Verification)

### Database
- MongoDB (Atlas)

### Deployment
- Frontend: Vercel / Netlify
- Backend: Render / Railway
- Database: MongoDB Atlas

---

## ✨ Features

### 🔐 Authentication & Security
- User Registration
- Email Verification via secure token
- JWT-based Login
- Protected Routes
- Password Encryption using Bcrypt
- Environment-based configuration

### 📋 Task Management
- Create Tasks
- Edit Tasks
- Delete Tasks
- Mark Tasks as Completed
- User-specific Dashboard

### ⚙️ Backend Architecture
- RESTful API design
- Middleware-based authentication
- MVC structure
- Proper error handling
- CORS configuration

---

## 🔄 Email Verification Flow

1. User registers  
2. Verification email is sent  
3. User clicks verification link  
4. Account is activated  
5. User can now login  

---

## ⚙️ Installation & Setup

1️⃣ Clone Repository  
git clone https://github.com/surajkengar/project_camp-frontend/ 
cd project-camp  

---

2️⃣ Navigate to Backend Folder  
cd backend

---


3️⃣ Install Dependencies  
npm install  

---

4️⃣ Create .env File inside backend folder and add:

PORT=8000  
MONGO_URI=your_mongodb_connection_string  
JWT_SECRET=your_jwt_secret  
CLIENT_URL=http://localhost:3000  

MAIL_HOST=your_smtp_host  
MAIL_PORT=2525  
MAIL_USER=your_smtp_user  
MAIL_PASS=your_smtp_pass  

---

5️⃣ Start Backend Server  
npm start

---

6️⃣ Navigate to Frontend Folder  
cd ../frontend  

---

7️⃣ Install Dependencies  
npm install 

---

8️⃣ Start Frontend  
npm start 

---

Backend runs on: http://localhost:8000  
Frontend runs on: http://localhost:3000  

---








