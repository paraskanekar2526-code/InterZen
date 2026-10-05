# InterZen
AI-Powered Interview Preparation & Career Guidance Platform

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB/Mongoose
- Authentication: JWT + bcrypt
- Demo mode: works without MongoDB/AI API for basic UI demonstration

## Run
### Backend
```bash
cd backend
npm install
npm run dev
```
Backend: http://localhost:5000

### Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend: http://localhost:5173

## MongoDB
Create `backend/.env` from `.env.example`.
Never upload `.env` or database credentials to GitHub.

If MongoDB is unavailable, keep `DEMO_MODE=true`. Registration/login will use demo storage in memory for development.

## Test API
POST `http://localhost:5000/api/auth/register`
```json
{
  "name": "Test Student",
  "email": "teststudent@gmail.com",
  "password": "Test123456"
}
```
