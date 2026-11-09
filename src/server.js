const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./db/models');

// Importamos todos los modelos para que Sequelize los registre
// y podamos hacer sync de todas las tablas al iniciar
require('./db/models/user.model');
require('./db/models/appointment.model');
require('./db/models/quote.model');
require('./db/models/service-price.model');
require('./db/models/gallery-image.model');
require('./db/models/testimonial.model');

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

    // Siempre sincronizamos con alter:true para crear tablas nuevas
    // y agregar columnas faltantes sin borrar datos existentes
    console.log('Syncing database schema...');
    await withTimeout(
      sequelize.sync({ alter: true }),
      30000,
      'Database sync timed out after 30 seconds'
    );
    console.log('Database schema synchronized');
  } catch (error) {
    console.error('Failed to start server:', error.message);
    server.close(() => process.exit(1));
  }
}

bootstrap();
