# ShopElite E-Commerce Platform

A full-stack e-commerce platform built with React, Node.js, Express, MongoDB, and Stripe.

## Features

- 🔐 JWT Authentication
- 🛒 Shopping Cart & Wishlist
- 💳 Stripe Payment Integration
- 📦 Order Management
- ⭐ Product Reviews
- 👤 User Profiles
- 🔧 Admin Dashboard

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Stripe Account

### Installation

```bash
# Install all dependencies
npm run install:all

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI and Stripe keys

# Seed database with sample data
npm run seed

# Development
npm run dev          # Backend on :5000
npm run dev:frontend # Frontend on :5173

# Production build
npm run build
npm start
```

## Test Credentials

| Role  | Email               | Password    |
|-------|---------------------|-------------|
| Admin | admin@example.com   | admin123    |
| User  | john@example.com    | password123 |

## Environment Variables

| Variable               | Description                    |
|-----------------------|--------------------------------|
| `NODE_ENV`            | development / production       |
| `PORT`                | Server port (default: 5000)    |
| `MONGO_URI`           | MongoDB connection string      |
| `JWT_SECRET`          | Secret for JWT tokens          |
| `STRIPE_SECRET_KEY`   | Stripe secret key              |
| `CLIENT_URL`          | Frontend URL for CORS          |

## Deployment

### Render.com

1. Create a new Web Service
2. Connect your GitHub repo
3. Set Build Command: `cd frontend && npm install && npm run build`
4. Set Start Command: `cd backend && npm start`
5. Add environment variables

### Railway

1. Create new project from GitHub
2. Add MongoDB plugin or use Atlas
3. Set root directory to `/backend`
4. Add environment variables
5. Deploy

### Vercel (Frontend) + Railway (Backend)

Frontend:
```bash
cd frontend
vercel
```

Backend: Deploy to Railway with MongoDB plugin

## Project Structure

```
├── backend/
│   ├── controllers/    # API logic
│   ├── models/         # Database schemas
│   ├── routes/         # API endpoints
│   ├── middleware/     # Auth, error handling
│   └── server.js       # Express app
│
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Route pages
│   │   ├── context/    # React context
│   │   └── services/   # API client
│   └── index.html
│
└── package.json        # Root scripts
```

## License

MIT
