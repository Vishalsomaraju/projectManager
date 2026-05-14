require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const { prisma } = require('./config/db');

const { initSocket } = require('./socket/index');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = initSocket(server);

// Middleware
app.use(helmet());
app.use(morgan('dev'));

// Configure CORS
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(origin => origin.trim().replace(/\/$/, ''))
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
});
app.use('/api', limiter);

// Routes
const authRoutes = require('./routes/auth.routes');
const projectsRoutes = require('./routes/projects.routes');
const columnsRoutes = require('./routes/columns.routes');
const tasksRoutes = require('./routes/tasks.routes');
const commentsRoutes = require('./routes/comments.routes');
const notificationRoutes = require('./routes/notifications.routes');
const commentsController = require('./controllers/comments.controller');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/projects/:projectId/columns', columnsRoutes);
app.use('/api', tasksRoutes);
app.use('/api/tasks/:taskId/comments', commentsRoutes);
app.get('/api/projects/:projectId/members/search', commentsController.searchMembers);

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      db: 'connected',
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export for use in other modules
module.exports = { app, io, prisma };
