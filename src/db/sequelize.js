const { Sequelize } = require('sequelize');
const env = require('../config/env');

const baseConfig = {
  dialect: 'postgres',
  logging: env.db.logging ? console.log : false,
};

if (env.db.ssl) {
  baseConfig.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: env.db.sslRejectUnauthorized,
    },
  };
}

const sequelize = env.db.url
  ? new Sequelize(env.db.url, baseConfig)
  : new Sequelize(env.db.name, env.db.user, env.db.password, {
      ...baseConfig,
      host: env.db.host,
      port: env.db.port,
    });

module.exports = sequelize;
