const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./db/models');

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

async function bootstrap() {
  const server = app.listen(env.port, () => {
    console.log(`API running on http://localhost:${env.port}`);
  });

  try {
    console.log('Connecting to database...');
    await withTimeout(
      sequelize.authenticate(),
      20000,
      'Database connection timed out after 20 seconds'
    );
    console.log('Database connection established');

    if (env.db.sync) {
      console.log('Syncing database schema...');
      await withTimeout(
        sequelize.sync({ alter: false }),
        30000,
        'Database sync timed out after 30 seconds'
      );
      console.log('Database synchronized');
    }
  } catch (error) {
    console.error('Failed to start server:', error.message);
    server.close(() => process.exit(1));
  }
}

bootstrap();
