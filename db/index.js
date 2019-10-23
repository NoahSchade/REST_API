const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'fsjstd-restapi.db',
  logging: false,
  // global options
  // define: {
  //   freezeTableName: true,
  //   timestamps: false,
  // },
});

const db = {
  sequelize,
  Sequelize,
  models: {},
};

// db.models.Movie = require('./models/user.js')(sequelize);
// db.models.Person = require('./models/course.js')(sequelize);

module.exports = db;