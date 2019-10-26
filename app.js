'use strict';

const { sequelize, models } = require('./db');
// Get references to our models.
const { User, Course } = models;

// load modules
const db = require('./db');
const express = require('express');
const morgan = require('morgan');

// (async () => {
//   await db.sequelize.sync({ force: true });

//   try {
//     await db.sequelize.authenticate();
//     console.log('Connection to the database successful!');
//   } catch (error) {
//     console.error('Error connecting to the database: ', error);
//   }
// })();

// Define variables for the people and courses.
// NOTE: We'll use these variables to assist with the creation
// of our related data after we've defined the relationships
// (or associations) between our models.
let bradBird;
let vinDiesel;
let eliMarienthal;
let craigTNelson;
let hollyHunter;
let theIronGiant;
let theIncredibles;

console.log('Testing the connection to the database...');

// Test the connection to the database.
sequelize
  .authenticate()
  .then(() => {
    console.log('Synchronizing the models with the database...');

    return sequelize.sync();
  })
  .then(() => {
    console.info('Adding people to the database...');

    return Promise.all([
      User.create({
        firstName: 'Brad',
        lastName: 'Bird',
        emailAddress: 'bradBird@gmail.com',
        password: "qwerty"
      }),
      // User.create({
      //   firstName: 'Vin',
      //   lastName: 'Diesel',
      // }),
      // User.create({
      //   firstName: 'Eli',
      //   lastName: 'Marienthal',
      // }),
      // User.create({
      //   firstName: 'Craig T.',
      //   lastName: 'Nelson',
      // }),
      // User.create({
      //   firstName: 'Holly',
      //   lastName: 'Hunter',
      // }),
    ]);
  })
  .then((data) => {
    console.log(JSON.stringify(data, null, 2));

    // Update the global variables for the people instances.
    [bradBird, vinDiesel, eliMarienthal, craigTNelson, hollyHunter] = data;

    console.log('Adding courses to the database...');

    // TODO Include the related user who directed each course.

    return Promise.all([
      Course.create({
        userId: bradBird.id,
        title: 'The Iron Giant',
        releaseYear: 1999,
        description: "blah blah blah"
      }),
      // Course.create({
      //   title: 'The Incredibles',
      //   releaseYear: 2004,
      // }),
    ]);
  })
  .then((data) => {
    console.log(JSON.stringify(data, null, 2));

    // Update the global variables for the course instances.
    [theIronGiant, theIncredibles] = data;

    // TODO Create the data for each course's actors.

    return Promise.resolve();
  })
  .then((data) => {
    console.log(JSON.stringify(data, null, 2));

    // TODO Update this query to include any related data.

    return Course.findAll();
  })
  .then((data) => {
    console.log(JSON.stringify(data, null, 2));

    // TODO Update this query to include any related data.

    return User.findAll();
  })
  .then((data) => {
    console.log(JSON.stringify(data, null, 2));

    process.exit();
  })
  .catch(err => console.error(err));

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// TODO setup your api routes here

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
