import app from './app.js';
import { env } from './config/env.js';

const PORT = env.PORT || 4000;

const server = app.listen(PORT, () => {
    console.log(`🚀 GMass API server is running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
});

// Graceful shutdown handling
const shutdown = () => {
    console.log('\n🛑 Shutting down server gracefully...');
    server.close(() => {
        console.log('💤 HTTP server closed.');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);