const fastify = require('fastify')({ logger: true });
const path = require('path');
const cors = require('@fastify/cors');
const fastifyStatic = require('@fastify/static');
const fastifyMultipart = require('@fastify/multipart');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  fastify.log.error('FATAL ERROR: JWT_SECRET environment variable is not configured!');
  process.exit(1);
}

// Setup CORS
const origins = (process.env.CORS_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
fastify.register(cors, {
  origin: origins.length > 0 ? origins : true,
  credentials: true
});

// Setup Multipart support for file uploads
fastify.register(fastifyMultipart, {
  limits: {
    fieldNameSize: 100,
    fieldSize: 100,
    fields: 10,
    fileSize: 20 * 1024 * 1024,
    files: 1
  }
});

// Serve uploads folder statically
fastify.register(fastifyStatic, {
  root: path.join(__dirname, '../uploads'),
  prefix: '/uploads/',
  id: 'uploads'
});

// Serve admin SPA dist folder statically
fastify.register(fastifyStatic, {
  root: path.join(__dirname, '../dist'),
  prefix: '/admin/',
  id: 'admin',
  decorateReply: false
});

// Register public routes
const publicRoutes = require('./routes/public');
fastify.register(publicRoutes, { prefix: '/api/v1' });

// Register admin routes
const adminRoutes = require('./routes/admin');
fastify.register(adminRoutes, { prefix: '/api/v1/admin' });

// SPA Fallback for /admin/* (returns index.html for React Router compatibility)
fastify.get('/admin/*', (request, reply) => {
  return reply.sendFile('index.html', path.join(__dirname, '../dist'));
});

// Health check
fastify.get('/health', async (request, reply) => {
  return { status: 'OK', uptime: process.uptime() };
});

const port = process.env.PORT_INTERNAL || process.env.PORT || 3000;
const host = '0.0.0.0';

const start = async () => {
  try {
    await fastify.listen({ port: parseInt(port), host });
    fastify.log.info(`Server listening on ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
