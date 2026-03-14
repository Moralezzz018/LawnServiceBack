const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./db/models');

async function bootstrap() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    if (env.db.sync) {
      await sequelize.sync({ alter: false });
      console.log('Database synchronized');
    }

    app.listen(env.port, () => {
      console.log(`API running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

bootstrap();
