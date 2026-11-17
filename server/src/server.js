import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[Server] Health check available at http://localhost:${PORT}/api/health`);
    });

    const gracefulShutdown = () => {
      console.log('\n[Server] Received kill signal, shutting down gracefully...');
      server.close(() => {
        console.log('[Server] Closed out remaining connections.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error(`[Server] Startup error: ${error.message}`);
    process.exit(1);
  }
};

startServer();
