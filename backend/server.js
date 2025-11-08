import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cron from 'node-cron';
import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { autoMarkLeaveAttendance } from './services/autoAttendanceService.js';

import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import wardenRoutes from './routes/wardenRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import messRoutes from './routes/messRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import studentReturnRoutes from './routes/studentReturnRoutes.js';
import passwordRoutes from './routes/passwordRoutes.js';
import adminHostelRoutes from './routes/adminHostelRoutes.js';

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

await connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/warden', wardenRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminHostelRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/student-return', studentReturnRoutes);
app.use('/api/password', passwordRoutes);

app.use(notFound);
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Auto-attendance cron job - runs daily at 12:01 AM
cron.schedule('1 0 * * *', async () => {
  console.log('🕐 Running auto-attendance job...');
  const result = await autoMarkLeaveAttendance();
  if (result.success) {
    console.log(`✅ Auto-attendance completed: ${result.count} students marked`);
  }
});

// Manual trigger for testing (run on server start)
setTimeout(async () => {
  console.log('🔄 Running initial auto-attendance check...');
  await autoMarkLeaveAttendance();
}, 5000);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`SHAMS API on :${PORT} with Socket.io enabled`));
