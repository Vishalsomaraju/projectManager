# Project Management Tool

A full-stack, real-time collaborative project management tool inspired by Trello and Asana. This application features drag-and-drop Kanban boards, real-time updates via WebSockets, task assignments, rich text descriptions, commenting with @mentions, notifications, and robust authentication.

## ✨ Features

- **Kanban Boards**: Drag-and-drop tasks across columns and reorder them intuitively.
- **Real-Time Collaboration**: Instant updates across all clients using Socket.io (see when others move tasks or type comments).
- **Authentication**: Secure JWT-based authentication with refresh tokens and role-based access control.
- **Rich Task Details**: Support for priorities, due dates, file attachments, labels, and rich-text descriptions.
- **Collaboration Tools**: Threaded comments with @mentions, activity tracking, and project roles (Owner, Admin, Member, Viewer).
- **Notifications**: Real-time notification bell and email alerts for mentions, assignments, and due dates via Redis queues.
- **Responsive Design**: A sleek, dark-themed UI built with TailwindCSS.

## 🛠 Tech Stack

### Frontend
- **React 18** + **Vite**
- **TailwindCSS** for styling
- **Zustand** for state management
- **React Query** for server state
- **Socket.io-client** for real-time events
- **@dnd-kit** for drag-and-drop

### Backend
- **Node.js** + **Express.js**
- **Socket.io** for WebSockets
- **Prisma ORM** for database interaction
- **PostgreSQL** as the primary database
- **Redis (ioredis)** for caching and job queues
- **Passport.js** & **JWT** for authentication
- **Cloudinary** for file/avatar storage
- **Nodemailer** for transactional emails

### DevOps
- **Docker** & **Docker Compose**
- **GitHub Actions** for CI/CD

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/) and Docker Compose (for running Postgres and Redis easily)
- [npm](https://www.npmjs.com/)

### 1. Clone the repository

```bash
git clone <repository-url>
cd project-management-tool
```

### 2. Environment Variables

Create a `.env` file in the `backend/` directory (you can copy `.env.example` if available) and add the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pm_tool?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
CLOUDINARY_URL="cloudinary://..." # Optional, for attachments
CLIENT_URL="http://localhost:5173"
PORT=5000
```

### 3. Start Database and Redis

Use Docker Compose to spin up the required backing services (PostgreSQL and Redis):

```bash
docker-compose up -d postgres redis
```

### 4. Install Dependencies

Install dependencies for the root, backend, and frontend concurrently:

```bash
npm install
```

### 5. Database Migration and Seeding

Set up the Prisma schema and seed the database with sample data (demo users and projects):

```bash
npm run prisma:migrate
npm run prisma:seed
```

### 6. Run the Application

Start the development servers for both the frontend and backend simultaneously:

```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

---

## 📦 Monorepo Scripts

From the root directory, you can run the following npm scripts:

- `npm run dev`: Starts both frontend and backend development servers concurrently.
- `npm run build`: Builds both workspaces for production.
- `npm run start`: Starts the backend server in production mode.
- `npm run prisma:generate`: Generates Prisma client in the backend.
- `npm run prisma:migrate`: Runs database migrations.
- `npm run prisma:seed`: Runs the database seed script.

---

## 🐋 Docker Production Deployment

To run the entire application (Frontend, Backend, DB, Redis) via Docker Compose for production:

```bash
docker-compose up -d --build
```

The Nginx container will serve the frontend and proxy API/Socket requests to the backend.

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
