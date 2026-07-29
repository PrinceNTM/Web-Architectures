# Habit Tracker - Project Setup Instructions

## Project Overview
Full-stack Habit Tracker application with:
- **Frontend**: React + Vite (Port 5173)
- **Backend**: Express (Port 3000)
- **Features**: Create habits, check off daily tasks, view today's tasks, track performance

## Setup Checklist

- [x] Verify copilot-instructions.md file exists
- [x] Scaffold project structure
- [x] Install dependencies
- [x] Configure environment variables
- [x] Set up database (if applicable)
- [x] Verify project compiles
- [x] Create run tasks
- [x] Launch project

Validated locally:
- VS Code run tasks added in `.vscode/tasks.json`
- Development env files created in `backend/.env` and `frontend/.env.local`
- Prisma generate/migrate runs successfully against SQLite
- Frontend build passes with `npm run build`
- Backend tests pass with `npm --prefix backend run test`
- Full E2E flow passes with `npm run e2e:ci`

## Project Structure

```
habit-tracker/
├── frontend/                 (React + Vite)
│   ├── src/
│   │   ├── components/      (UI components)
│   │   ├── pages/           (page components)
│   │   ├── hooks/           (custom hooks)
│   │   ├── services/        (API calls)
│   │   ├── styles/          (CSS/styling)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── .env.local
│
├── backend/                  (Express)
│   ├── src/
│   │   ├── routes/          (API routes)
│   │   ├── controllers/      (handlers)
│   │   ├── models/          (data models)
│   │   ├── middleware/      (custom middleware)
│   │   ├── config/          (configuration)
│   │   └── server.js        (entry point)
│   ├── package.json
│   └── .env
│
└── README.md
```

## Key Dependencies

**Frontend:**
- react
- react-dom
- vite
- axios (for API calls)

**Backend:**
- express
- cors
- dotenv
- (optional: sequelize/mongoose for DB)
