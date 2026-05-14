# Project Management Tool — Full Stack Build Plan
### Trello/Asana-style Collaborative Tool with Real-Time Updates

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, Zustand, React Query, Socket.io-client |
| Backend | Node.js, Express.js, Socket.io |
| Auth | Passport.js, JWT, bcrypt |
| Database | PostgreSQL (Prisma ORM) |
| Cache / Queue | Redis (ioredis) |
| Real-time | Socket.io with rooms |
| File Storage | Cloudinary (avatars/attachments) |
| DevOps | Docker, Docker Compose, GitHub Actions |

---

## Phase Overview

| Phase | Focus | Est. Time |
|---|---|---|
| 1 | Project setup & monorepo scaffolding | 1–2 hrs |
| 2 | Database schema & Prisma models | 1–2 hrs |
| 3 | Auth system (register, login, JWT) | 2–3 hrs |
| 4 | Projects & Members API | 2 hrs |
| 5 | Task Boards, Cards & Columns | 3 hrs |
| 6 | Comments & @Mentions | 2 hrs |
| 7 | Real-time with WebSockets | 2–3 hrs |
| 8 | Notifications system | 2 hrs |
| 9 | Frontend — Auth UI | 2 hrs |
| 10 | Frontend — Project & Board UI | 4–5 hrs |
| 11 | Frontend — Task Cards & Comments UI | 3 hrs |
| 12 | Frontend — Notifications & Real-time | 2 hrs |
| 13 | Polish, Docker, Deployment | 2 hrs |

---

---

# PHASE 1 — Project Setup & Monorepo Scaffolding

## Prompt

```
Create a full-stack monorepo for a project management tool (like Trello/Asana) with the following structure:

project-root/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── socket/
│   │   └── index.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── docker-compose.yml
└── README.md

Requirements:
1. Backend: Express.js with CORS, helmet, morgan, express-rate-limit. Port 5000.
2. Frontend: Vite + React 18 + TailwindCSS. Port 5173. Proxy /api to backend.
3. docker-compose.yml with services: postgres (port 5432), redis (port 6379), backend, frontend.
4. Backend .env.example with: DATABASE_URL, REDIS_URL, JWT_SECRET, JWT_REFRESH_SECRET, CLOUDINARY_URL, CLIENT_URL, PORT.
5. backend/package.json dependencies: express, cors, helmet, morgan, express-rate-limit, @prisma/client, prisma, passport, passport-local, passport-jwt, jsonwebtoken, bcryptjs, socket.io, ioredis, zod, multer, cloudinary, nodemailer.
6. frontend/package.json dependencies: react, react-dom, react-router-dom, @tanstack/react-query, zustand, axios, socket.io-client, @dnd-kit/core, @dnd-kit/sortable, react-hook-form, zod, @hookform/resolvers, date-fns, react-hot-toast, lucide-react.
7. Add a root package.json with workspaces and scripts: dev (concurrently runs both), build, start.
8. Backend src/index.js: set up Express app with all middleware, connect to Prisma, set up Socket.io, connect to Redis, then start server.

Output all files with full content, no placeholders.
```

---

# PHASE 2 — Database Schema (Prisma)

## Prompt

```
Create the complete Prisma schema file at backend/prisma/schema.prisma for a project management tool.

Models required:

1. User
   - id (cuid), email (unique), username (unique), passwordHash, displayName, avatarUrl
   - createdAt, updatedAt
   - Relations: projects (via ProjectMember), ownedProjects, assignedTasks, comments, notifications

2. Project
   - id (cuid), name, description, slug (unique), color (#hex), icon (emoji)
   - createdAt, updatedAt, archivedAt (nullable)
   - ownerId (FK → User)
   - Relations: owner, members (via ProjectMember), columns, tasks, invites

3. ProjectMember
   - id, userId, projectId, role (enum: OWNER, ADMIN, MEMBER, VIEWER)
   - joinedAt
   - Composite unique on [userId, projectId]

4. Column (Board column / list)
   - id, name, projectId, order (Int), color
   - createdAt, updatedAt
   - Relations: project, tasks

5. Task (Card)
   - id, title, description (rich text), projectId, columnId, assigneeId (nullable)
   - order (Int), priority (enum: LOW, MEDIUM, HIGH, URGENT)
   - dueDate (nullable), coverColor, coverImageUrl
   - createdAt, updatedAt, completedAt (nullable)
   - Relations: project, column, assignee, comments, labels (via TaskLabel), attachments, watchers (via TaskWatcher)

6. Label
   - id, name, color, projectId
   - Relations: tasks (via TaskLabel)

7. TaskLabel (join)
   - taskId, labelId — composite PK

8. Comment
   - id, content (text), taskId, authorId
   - createdAt, updatedAt, deletedAt (nullable)
   - Relations: task, author

9. Attachment
   - id, filename, url, size, mimeType, taskId, uploadedById
   - createdAt

10. Notification
    - id, type (enum: TASK_ASSIGNED, COMMENT_ADDED, MENTIONED, DUE_DATE, PROJECT_INVITE), 
    - recipientId, actorId (nullable), payload (Json), read (Boolean, default false)
    - createdAt

11. ProjectInvite
    - id, projectId, email, token (unique), role, expiresAt, usedAt (nullable)
    - createdAt

12. TaskWatcher (join)
    - userId, taskId — composite PK

Also create backend/prisma/seed.js that creates:
- 2 demo users (alice@demo.com / bob@demo.com, password: "Password123!")
- 1 project "Product Roadmap" owned by alice with bob as MEMBER
- 4 columns: Backlog, In Progress, In Review, Done
- 6 sample tasks distributed across columns with various priorities
- Sample labels: Bug, Feature, Design, Docs

Output the full schema.prisma and seed.js files.
```

---

# PHASE 3 — Auth System (Register, Login, JWT, Refresh)

## Prompt

```
Build the complete authentication system for the Express backend. 

Files to create:
- backend/src/middleware/auth.middleware.js
- backend/src/controllers/auth.controller.js
- backend/src/services/auth.service.js
- backend/src/routes/auth.routes.js
- backend/src/utils/tokens.js
- backend/src/utils/validators.js

Requirements:

1. tokens.js:
   - generateAccessToken(userId): JWT, 15 min expiry, payload: { sub: userId }
   - generateRefreshToken(userId): JWT, 7 days, payload: { sub: userId, type: 'refresh' }
   - storeRefreshToken(userId, token): store in Redis with 7 day TTL as key "refresh:{userId}:{tokenId}"
   - revokeRefreshToken(userId, tokenId): delete from Redis
   - verifyRefreshToken(token): verify + check Redis existence

2. auth.service.js:
   - register({ email, username, displayName, password }): hash password with bcrypt (12 rounds), create user in Prisma, return tokens
   - login({ email, password }): find user, compare hash, return tokens + user profile
   - refresh(refreshToken): verify, issue new access token
   - logout(refreshToken): revoke from Redis
   - getMe(userId): return user without passwordHash

3. auth.controller.js: POST /register, POST /login, POST /refresh, POST /logout, GET /me — all with try/catch, proper status codes

4. auth.middleware.js:
   - authenticate: extract Bearer token, verify JWT, attach req.user = { id, email }
   - optionalAuth: same but doesn't fail if no token

5. validators.js using Zod:
   - registerSchema: email valid, username 3-20 chars alphanumeric, password min 8 chars with 1 uppercase + 1 number
   - loginSchema, validate middleware factory

6. auth.routes.js: wire up all routes with validators

7. Rate limit: 10 requests/15min on /login and /register

8. All error responses: { error: { code, message } }
9. Success responses: { data: { user, accessToken, refreshToken } }

Output all files with complete implementation.
```

---

# PHASE 4 — Projects & Members API

## Prompt

```
Build the Projects and Members REST API for the backend.

Files to create:
- backend/src/controllers/projects.controller.js
- backend/src/services/projects.service.js
- backend/src/routes/projects.routes.js
- backend/src/middleware/project.middleware.js

Endpoints:

GET    /api/projects              — list all projects for current user (owned + member)
POST   /api/projects              — create project (owner = req.user)
GET    /api/projects/:projectId   — get project details with columns + member count
PATCH  /api/projects/:projectId   — update name/description/color/icon (OWNER, ADMIN only)
DELETE /api/projects/:projectId   — soft-delete (set archivedAt) (OWNER only)
GET    /api/projects/:projectId/members       — list members with roles
POST   /api/projects/:projectId/members       — invite by email (creates ProjectInvite, emails token)
PATCH  /api/projects/:projectId/members/:uid  — change role (OWNER only)
DELETE /api/projects/:projectId/members/:uid  — remove member (OWNER or self)
POST   /api/projects/join/:token              — accept invite via token

project.middleware.js:
- requireProjectAccess(minRole): loads project, checks ProjectMember role, attaches req.project, req.membership
- Roles hierarchy: VIEWER < MEMBER < ADMIN < OWNER
- 403 if not member, 404 if project not found

projects.service.js:
- All Prisma queries
- For invite: generate crypto random 32-byte hex token, set expiry 48h, send email via nodemailer (use console.log if no SMTP in dev)
- For list: include member count, task counts per column, user's own role

All responses wrapped in { data: ... }, errors in { error: { code, message } }
All write operations require authenticate middleware.
Output complete implementation.
```

---

# PHASE 5 — Task Boards, Columns & Cards API

## Prompt

```
Build the Columns and Tasks (cards) REST API.

Files to create:
- backend/src/controllers/columns.controller.js
- backend/src/controllers/tasks.controller.js
- backend/src/services/columns.service.js
- backend/src/services/tasks.service.js
- backend/src/routes/columns.routes.js
- backend/src/routes/tasks.routes.js

COLUMNS endpoints (all under /api/projects/:projectId/columns):
GET    /            — list columns ordered by `order` field, include tasks count
POST   /            — create column (name, color)
PATCH  /:columnId   — rename / recolor column
DELETE /:columnId   — delete column (moves tasks to first column or deletes if empty)
POST   /reorder     — body: { columns: [{ id, order }] } — batch update column order

TASKS endpoints:
GET    /api/projects/:projectId/tasks           — list all tasks; filter by: assigneeId, priority, labelIds, dueBefore, search (title)
GET    /api/projects/:projectId/columns/:cid/tasks — tasks in specific column, sorted by order
POST   /api/projects/:projectId/columns/:cid/tasks — create task
GET    /api/tasks/:taskId                       — get full task with comments, assignee, labels, attachments, watchers
PATCH  /api/tasks/:taskId                       — update task fields
DELETE /api/tasks/:taskId                       — delete task
POST   /api/tasks/:taskId/move                  — { columnId, order } — move card across columns
POST   /api/tasks/reorder                       — { columnId, tasks: [{id, order}] } — reorder within column
POST   /api/tasks/:taskId/labels                — attach label { labelId }
DELETE /api/tasks/:taskId/labels/:labelId       — remove label
POST   /api/tasks/:taskId/watch                 — current user watches task
DELETE /api/tasks/:taskId/watch                 — unwatch

tasks.service.js special logic:
- On task move: recalculate order for source and destination columns
- On create: if assigneeId set, create TASK_ASSIGNED notification
- On update dueDate: create DUE_DATE notification for assignee and watchers

Include requireProjectAccess('MEMBER') on all write ops, 'VIEWER' on reads.
After any task mutation, emit socket event to project room: 'task:updated' with full task data.
Output complete implementation.
```

---

# PHASE 6 — Comments & @Mentions

## Prompt

```
Build the Comments system with @mention support.

Files to create:
- backend/src/controllers/comments.controller.js
- backend/src/services/comments.service.js
- backend/src/routes/comments.routes.js

Endpoints under /api/tasks/:taskId/comments:
GET    /              — list comments (ordered by createdAt ASC), include author.displayName, author.avatarUrl
POST   /              — create comment, body: { content } (plain text with @username mentions)
PATCH  /:commentId    — edit comment (author only, within 15 min of creation)
DELETE /:commentId    — soft-delete: set deletedAt, replace content with '[deleted]'

comments.service.js:
- parseMentions(content, projectId): regex /@(\w+)/, look up matching usernames who are project members, return array of User ids
- On create: call parseMentions, for each mentioned user create Notification { type: 'MENTIONED', recipientId, actorId: author, payload: { taskId, commentId, preview: content.slice(0,100) } }
- Also create COMMENT_ADDED notification for all task watchers (excluding author)
- After comment create, emit socket event to project room: 'comment:added' with comment data including parsed mentions

GET / response shape:
{
  data: [{
    id, content, createdAt, updatedAt, deletedAt,
    author: { id, displayName, avatarUrl },
    isEdited: boolean,
    canEdit: boolean (true if req.user is author and < 15 min old)
  }]
}

Also add:
GET /api/projects/:projectId/members/search?q=username  — for @mention autocomplete in frontend
Output complete implementation.
```

---

# PHASE 7 — Real-time WebSocket System

## Prompt

```
Build the Socket.io real-time system for the backend.

Files to create:
- backend/src/socket/index.js          — socket server setup
- backend/src/socket/handlers.js       — event handlers
- backend/src/socket/rooms.js          — room management helpers

Setup (socket/index.js):
- Initialize Socket.io on the HTTP server with CORS from CLIENT_URL
- JWT auth middleware on socket connection: extract token from socket.handshake.auth.token, verify it, attach socket.userId
- On connection failure (bad/missing token): disconnect with error

Room system (rooms.js):
- Project rooms: "project:{projectId}" — user joins on opening a project board
- Task rooms: "task:{taskId}" — user joins on opening a task detail modal

Event handlers (handlers.js):
Client → Server events:
- 'room:join' { type: 'project'|'task', id } — verify user has access to this project/task, then join room
- 'room:leave' { type, id } — leave room
- 'typing:start' { taskId, commentId? } — broadcast 'typing' to task room (except sender)
- 'typing:stop' { taskId } — broadcast 'typing:stop'
- 'cursor:update' { projectId, taskId } — broadcast user's current task to project room

Server → Client events (emitted from REST controllers after mutations):
- 'task:created' { task } → project room
- 'task:updated' { task } → project room + task room
- 'task:moved' { taskId, fromColumnId, toColumnId, order } → project room
- 'task:deleted' { taskId } → project room
- 'comment:added' { comment, taskId } → task room
- 'comment:updated' { comment } → task room
- 'notification:new' { notification } → personal room "user:{userId}"
- 'member:joined' { member, projectId } → project room
- 'presence:update' { userId, displayName, avatarUrl, activeTaskId } → project room

Also emit to personal user rooms for notifications.
Create a socketService singleton exported from socket/index.js with methods: emitToProject(projectId, event, data), emitToTask(taskId, event, data), emitToUser(userId, event, data).
Export socketService from app so controllers can import it.
Output complete implementation.
```

---

# PHASE 8 — Notifications System

## Prompt

```
Build the Notifications system with Redis queue and REST endpoints.

Files to create:
- backend/src/controllers/notifications.controller.js
- backend/src/services/notifications.service.js
- backend/src/routes/notifications.routes.js
- backend/src/workers/notifications.worker.js

notifications.service.js:
- createNotification({ type, recipientId, actorId, payload }): 
  1. Save to PostgreSQL Notification table
  2. Push job to Redis list "notifications:queue" as JSON
  3. Emit 'notification:new' to user's personal socket room via socketService
- getNotifications(userId, { page, limit, unreadOnly }): paginated query, include actor details
- markRead(userId, notificationId): set read=true
- markAllRead(userId): bulk update
- getUnreadCount(userId): count query, cache in Redis with 60s TTL "notif:count:{userId}"

notifications.worker.js:
- Simple Redis BLPOP worker that processes "notifications:queue"
- For type TASK_ASSIGNED: send email via nodemailer "You've been assigned to {task.title}"
- For type MENTIONED: send email "@{actor} mentioned you in {task.title}"  
- For type PROJECT_INVITE: send email with invite link
- Use console.log in dev if no SMTP_HOST set
- Worker runs in same process, starts after server is ready

Endpoints (all require authenticate):
GET    /api/notifications              — { data: notifications[], meta: { total, unread, page } }
PATCH  /api/notifications/:id/read    — mark one read
PATCH  /api/notifications/read-all    — mark all read  
GET    /api/notifications/count       — { data: { unread: N } } (use Redis cache)
DELETE /api/notifications/:id         — delete notification

Add to GET /api/notifications query params: unreadOnly (bool), type (filter), page (default 1), limit (default 20)

Output complete implementation.
```

---

# PHASE 9 — Frontend: Auth UI (Login, Register, Route Guards)

## Prompt

```
Build the complete frontend authentication UI in React.

Files to create:
- frontend/src/api/client.js            — axios instance with interceptors
- frontend/src/api/auth.api.js          — auth API calls
- frontend/src/store/auth.store.js      — Zustand auth store
- frontend/src/hooks/useAuth.js         — auth hook
- frontend/src/pages/LoginPage.jsx
- frontend/src/pages/RegisterPage.jsx
- frontend/src/components/ProtectedRoute.jsx
- frontend/src/App.jsx                  — router setup

Design requirements — Dark, sleek, professional:
- Background: #0F1117 (near-black)
- Card: #1A1D27 with 1px border #2D3149
- Accent: #6366F1 (indigo)
- Font: "Inter" from Google Fonts (load in index.html)
- Full-height centered layout, subtle grid-pattern background SVG
- Auth card: 420px wide, rounded-xl, padding 40px
- Logo: stylized "PM" monogram in indigo at top of card
- Smooth fade-in animation on card appear (CSS keyframes)

api/client.js:
- Base URL: /api
- Request interceptor: attach Authorization: Bearer {token} from store
- Response interceptor: on 401, attempt token refresh via /auth/refresh, retry original request once, on second 401 logout + redirect to /login

auth.store.js (Zustand):
- State: user (null | User), accessToken, isAuthenticated, isLoading
- Actions: login(credentials), register(data), logout(), setUser(user), refreshToken()
- Persist accessToken + user in localStorage via zustand/middleware/persist
- On app init: if stored token, call /auth/me to validate

LoginPage.jsx:
- react-hook-form + Zod validation (email required, password required)
- Show inline field errors
- Loading spinner on button during request
- Show toast on error (react-hot-toast)
- "Don't have an account? Register" link
- Forgot password placeholder link

RegisterPage.jsx:
- Fields: displayName, username, email, password, confirmPassword
- Password strength indicator (4 colored bars: weak/fair/good/strong)
- All validation inline with Zod

App.jsx:
- React Router v6 with routes: /login, /register, / (redirect to /dashboard), /dashboard, /projects/:projectId, /tasks/:taskId (modal route)
- ProtectedRoute wraps authenticated routes
- Wrap app in QueryClientProvider, Toaster

Output all files with complete implementation and full Tailwind styling.
```

---

# PHASE 10 — Frontend: Project & Board UI

## Prompt

```
Build the main project management UI: Dashboard, Project Board (Kanban).

Files to create:
- frontend/src/api/projects.api.js
- frontend/src/api/tasks.api.js  
- frontend/src/pages/DashboardPage.jsx
- frontend/src/pages/ProjectBoardPage.jsx
- frontend/src/components/layout/Sidebar.jsx
- frontend/src/components/layout/Header.jsx
- frontend/src/components/layout/AppLayout.jsx
- frontend/src/components/projects/ProjectCard.jsx
- frontend/src/components/projects/CreateProjectModal.jsx
- frontend/src/components/board/KanbanBoard.jsx
- frontend/src/components/board/KanbanColumn.jsx
- frontend/src/components/board/TaskCard.jsx
- frontend/src/store/board.store.js

Design: Continue the dark theme (#0F1117 bg). 
- Sidebar: 240px, #13161F bg, border-right #2D3149
- Board columns: #1A1D27 bg, rounded-xl, min-width 280px max-width 320px
- Task cards: #212537 bg, border #2D3149, hover: #262A3D border #4C51BF (indigo)
- Column header: color dot + column name + task count badge
- Use a horizontal scrollable board area

Sidebar.jsx:
- User avatar + display name at top
- Navigation: Dashboard (home icon), My Tasks (checkbox), Notifications (bell with badge)
- Projects section: list all user's projects with color dot + emoji icon + name
- + New Project button at bottom
- Active state: indigo background pill

DashboardPage.jsx:
- "Good morning, {name}" greeting with current date
- Stats row: My Tasks Today, Overdue, Projects Active, Completed This Week (metric cards)
- Recent Projects grid (ProjectCard components, 2 cols)
- My Assigned Tasks list (5 most recent, with project name + priority badge)

ProjectBoardPage.jsx:
- Header with project name, emoji, description, member avatars (stacked, +N overflow), settings icon
- KanbanBoard with horizontal scroll
- "Add Column" button at end of board

KanbanBoard.jsx + KanbanColumn.jsx + TaskCard.jsx using @dnd-kit:
- Full drag-and-drop: cards within column + across columns
- Drag overlay (ghost card while dragging)
- On drag end: optimistic update in Zustand store, then call POST /tasks/:id/move
- Column has "+ Add Task" button at bottom → inline quick-create input
- TaskCard shows: title, priority badge (colored dot), due date (red if overdue), assignee avatar, comment count, label chips, cover color strip (if set)
- Priority colors: LOW=#64748B, MEDIUM=#3B82F6, HIGH=#F59E0B, URGENT=#EF4444

board.store.js (Zustand):
- State: columns (Map<id, Column>), tasks (Map<id, Task>)
- Actions: moveTask, reorderTask, addTask, updateTask, deleteTask
- Optimistic updates pattern: update store immediately, rollback on API error

CreateProjectModal.jsx:
- Name, description, choose from 12 color swatches, choose from 8 emoji icons
- On submit: POST /projects, navigate to new board

Output all files with complete implementation and Tailwind styling.
```

---

# PHASE 11 — Frontend: Task Detail Modal & Comments

## Prompt

```
Build the Task Detail slide-over panel (right side modal) with full edit and comment functionality.

Files to create:
- frontend/src/components/tasks/TaskDetailModal.jsx    — main container
- frontend/src/components/tasks/TaskHeader.jsx         — title edit, breadcrumb
- frontend/src/components/tasks/TaskProperties.jsx     — right sidebar: assignee, priority, due, labels
- frontend/src/components/tasks/TaskDescription.jsx    — rich text description editor
- frontend/src/components/tasks/CommentThread.jsx      — comment list
- frontend/src/components/tasks/CommentComposer.jsx    — new comment input with @mentions
- frontend/src/components/tasks/LabelPicker.jsx        — label selection popover
- frontend/src/components/tasks/MemberPicker.jsx       — assignee picker
- frontend/src/hooks/useTaskDetail.js                  — data fetching hook
- frontend/src/hooks/useComments.js                    — comments CRUD hook

TaskDetailModal layout:
- Full-height right slide-over panel, width: min(680px, 100vw)
- Smooth slide-in from right animation (CSS transform translateX)
- Backdrop overlay (click to close)
- Two-column layout inside: main content (left, flex-1) + properties sidebar (right, 240px)
- Task title: click to edit in place (contentEditable div, save on blur/Enter)

TaskDescription.jsx:
- Textarea that auto-resizes
- Markdown preview toggle (use a simple marked.js import for parsing)
- Save on Cmd+Enter, cancel on Escape

TaskProperties.jsx (right sidebar):
- Assignee: avatar + name, click opens MemberPicker popover
- Priority: colored badge + dropdown (LOW/MEDIUM/HIGH/URGENT)
- Due Date: date picker input, turns red if overdue
- Labels: color chips, + button opens LabelPicker
- Column: select dropdown to move between columns
- Watchers: avatars of watchers, toggle watch button
- Created by + date, Last updated

CommentThread.jsx:
- Show comments chronologically
- Each comment: avatar, displayName, relative time (date-fns formatDistanceToNow)
- Deleted comments show "[deleted]" in italic gray
- Edit button visible on hover if canEdit
- Edit inline: replaces content with textarea, save/cancel buttons
- @mentions highlighted as indigo badges in comment text

CommentComposer.jsx:
- Textarea with @mention autocomplete:
  - Detect @word-in-progress, call GET /projects/:id/members/search?q=word
  - Show floating dropdown of matching members (avatar + name)
  - Click or Tab to insert @username
- Submit on Cmd+Enter
- Show typing indicator ("@bob is typing...") from socket event

useTaskDetail.js:
- useQuery for task data, useMutation for updates (with optimistic update)
- Subscribe to socket room "task:{taskId}" on mount, unsubscribe on unmount
- Handle 'task:updated', 'comment:added', 'comment:updated' socket events

Output all files with complete implementation and Tailwind styling.
```

---

# PHASE 12 — Frontend: Notifications & Real-time Integration

## Prompt

```
Build the frontend real-time layer: Socket.io integration and Notification center.

Files to create:
- frontend/src/hooks/useSocket.js                    — socket singleton + connection
- frontend/src/hooks/useProjectRealtime.js           — board real-time updates
- frontend/src/components/notifications/NotificationBell.jsx
- frontend/src/components/notifications/NotificationDropdown.jsx
- frontend/src/components/notifications/NotificationItem.jsx
- frontend/src/components/board/PresenceAvatars.jsx   — who's currently viewing the board
- frontend/src/store/notification.store.js
- frontend/src/api/notifications.api.js

useSocket.js:
- Create socket singleton (one socket for the whole app)
- Connect with auth token from auth store
- Auto-reconnect with exponential backoff
- Export: socket instance, connected boolean, emit helper
- On token refresh, update socket auth and reconnect

useProjectRealtime.js:
- On mount: emit 'room:join' { type: 'project', id: projectId }
- On unmount: emit 'room:leave'
- Listen to 'task:created' → addTask to board store
- Listen to 'task:updated' → updateTask in board store
- Listen to 'task:moved' → moveTask in board store
- Listen to 'task:deleted' → deleteTask from board store
- Listen to 'presence:update' → update local presence map (Map<userId, { displayName, avatarUrl, activeTaskId }>)
- Every 10s: emit 'cursor:update' with current projectId and focused taskId

PresenceAvatars.jsx:
- Show stacked avatar circles for users currently viewing the board (from presence map)
- Exclude current user
- Each avatar: tooltip with displayName + "viewing [task name]" if on a task
- Pulse animation on avatar border to indicate active users

notification.store.js (Zustand):
- State: notifications[], unreadCount, isOpen
- Actions: addNotification, markRead, markAllRead, setUnreadCount
- On 'notification:new' socket event: addNotification + increment unreadCount + show toast

NotificationBell.jsx:
- Bell icon with red badge showing unreadCount (max 99+)
- Click to toggle NotificationDropdown
- Shake animation when new notification arrives (CSS keyframes)

NotificationDropdown.jsx:
- Max-height 480px scrollable panel (positioned below bell)
- Header: "Notifications" + "Mark all read" button
- Filter tabs: All | Unread | Mentions
- Infinite scroll (load more on scroll to bottom using IntersectionObserver)
- Empty state illustration when no notifications

NotificationItem.jsx:
- Actor avatar + message text (e.g. "@alice assigned you to 'Fix login bug'")
- Relative time
- Unread: left border indigo + slightly lighter background
- Click: mark read + navigate to relevant task (open TaskDetailModal)
- Notification type icons: TASK_ASSIGNED (user-check), COMMENT_ADDED (message), MENTIONED (@), DUE_DATE (clock)

Output all files with complete implementation and Tailwind styling.
```

---

# PHASE 13 — Polish, Docker & Deployment

## Prompt

```
Finalize the project management tool with production-ready configuration.

Tasks:

1. Error Boundary (frontend/src/components/ErrorBoundary.jsx):
   - Class component catching render errors
   - Shows friendly error card with "Try Again" and "Go Home" buttons

2. Loading States:
   - Board skeleton: column skeletons with shimmering task card placeholders
   - Task detail skeleton
   - Notification list skeleton
   - Use CSS animation: background: linear-gradient shimmer effect (var(--skeleton-gradient))

3. Empty States:
   - Empty board: illustration + "Create your first column" CTA
   - Empty column: dashed border "Drop tasks here" or "+ Add task"
   - No notifications: bell illustration + "You're all caught up!"

4. backend/Dockerfile:
   FROM node:20-alpine
   - Copy package.json, run npm ci --production
   - Copy src, prisma
   - RUN npx prisma generate
   - CMD: run migrations then start server
   - Healthcheck: GET /api/health every 30s

5. frontend/Dockerfile:
   - Multi-stage: build stage (node:20-alpine, npm run build), serve stage (nginx:alpine)
   - nginx.conf: serve dist/, proxy /api and /socket.io to backend, try_files for SPA routing

6. docker-compose.yml (production-ready update):
   - Services: postgres, redis, backend, frontend (nginx)
   - backend depends_on: postgres (healthy), redis (healthy)
   - postgres healthcheck: pg_isready
   - redis healthcheck: redis-cli ping
   - Named volumes for postgres data and redis data
   - Network: pm-network bridge

7. backend/src/routes/health.routes.js:
   GET /api/health → { status: 'ok', db: 'connected', redis: 'connected', timestamp }
   Check db with $queryRaw`SELECT 1`, check redis with ping

8. .github/workflows/deploy.yml:
   - Trigger on push to main
   - Jobs: lint (eslint), test (placeholder), build (docker build), deploy (docker compose up -d via SSH)

9. README.md — complete setup guide:
   - Prerequisites, local dev setup, env vars table (all variables explained), Docker commands, seed data credentials, API endpoint reference table (all 40+ endpoints), WebSocket events reference

Output all files with complete content.
```

---

## Quick Reference: All API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | — | Register new user |
| POST | /api/auth/login | — | Login |
| POST | /api/auth/refresh | — | Refresh access token |
| POST | /api/auth/logout | ✓ | Logout + revoke token |
| GET | /api/auth/me | ✓ | Get current user |
| GET | /api/projects | ✓ | List my projects |
| POST | /api/projects | ✓ | Create project |
| GET | /api/projects/:id | ✓ | Project detail |
| PATCH | /api/projects/:id | ✓ | Update project |
| DELETE | /api/projects/:id | ✓ | Archive project |
| GET | /api/projects/:id/members | ✓ | List members |
| POST | /api/projects/:id/members | ✓ | Invite member |
| PATCH | /api/projects/:id/members/:uid | ✓ | Change role |
| DELETE | /api/projects/:id/members/:uid | ✓ | Remove member |
| GET | /api/projects/:id/columns | ✓ | List columns |
| POST | /api/projects/:id/columns | ✓ | Create column |
| PATCH | /api/projects/:id/columns/:cid | ✓ | Update column |
| DELETE | /api/projects/:id/columns/:cid | ✓ | Delete column |
| POST | /api/projects/:id/columns/reorder | ✓ | Reorder columns |
| GET | /api/projects/:id/tasks | ✓ | List all tasks |
| POST | /api/projects/:id/columns/:cid/tasks | ✓ | Create task |
| GET | /api/tasks/:id | ✓ | Task detail |
| PATCH | /api/tasks/:id | ✓ | Update task |
| DELETE | /api/tasks/:id | ✓ | Delete task |
| POST | /api/tasks/:id/move | ✓ | Move task to column |
| POST | /api/tasks/:id/labels | ✓ | Add label |
| DELETE | /api/tasks/:id/labels/:lid | ✓ | Remove label |
| POST | /api/tasks/:id/watch | ✓ | Watch task |
| DELETE | /api/tasks/:id/watch | ✓ | Unwatch task |
| GET | /api/tasks/:id/comments | ✓ | List comments |
| POST | /api/tasks/:id/comments | ✓ | Add comment |
| PATCH | /api/tasks/:id/comments/:cid | ✓ | Edit comment |
| DELETE | /api/tasks/:id/comments/:cid | ✓ | Delete comment |
| GET | /api/notifications | ✓ | List notifications |
| GET | /api/notifications/count | ✓ | Unread count |
| PATCH | /api/notifications/:id/read | ✓ | Mark read |
| PATCH | /api/notifications/read-all | ✓ | Mark all read |
| DELETE | /api/notifications/:id | ✓ | Delete notification |
| GET | /api/health | — | Health check |

## WebSocket Events Reference

| Direction | Event | Payload | Room |
|---|---|---|---|
| C→S | room:join | { type, id } | — |
| C→S | room:leave | { type, id } | — |
| C→S | typing:start | { taskId } | — |
| C→S | typing:stop | { taskId } | — |
| C→S | cursor:update | { projectId, taskId } | — |
| S→C | task:created | { task } | project:{id} |
| S→C | task:updated | { task } | project:{id} |
| S→C | task:moved | { taskId, fromColumnId, toColumnId } | project:{id} |
| S→C | task:deleted | { taskId } | project:{id} |
| S→C | comment:added | { comment, taskId } | task:{id} |
| S→C | comment:updated | { comment } | task:{id} |
| S→C | notification:new | { notification } | user:{id} |
| S→C | presence:update | { userId, displayName, activeTaskId } | project:{id} |
| S→C | typing | { userId, displayName } | task:{id} |
| S→C | typing:stop | { userId } | task:{id} |
