'use strict';

const { sequelize, models } = require('./db');
// Get references to our models.
const { User, Course } = models;

// load modules
const db = require('./db');
const express = require('express');
const morgan = require('morgan');
const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

let addUser;
let currentUser;
const users = [];

// create the Express app
const app = express();

const authenticateUser = (req, res, next) => {
  (async () => {
  let message = null;

  // Parse the user's credentials from the Authorization header.
  const credentials = auth(req);

  // If the user's credentials are available...
  if (credentials) {

      
      // Attempt to retrieve the user from the data store
      // by their username (i.e. the user's "key"
      // from the Authorization header).

      // const user = users.find(u => u.emailAddress === credentials.name);

      let user;
      
        await db.sequelize.sync({ force: false });
        try {
          user = await User.findOne({
            where: {
              emailAddress: credentials.name
            }
          });

          currentUser = user;

        } catch (error) {
          if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message);
            console.error('Validation errors: ', errors);
          } else {
            throw error;
          }
        }

      

      // If a user was successfully retrieved from the data store...
      if (user) {
        // Use the bcryptjs npm package to compare the user's password
        // (from the Authorization header) to the user's password
        // that was retrieved from the data store.
        const authenticated = bcryptjs
          .compareSync(credentials.pass, user.password);

        // If the passwords match...
        if (authenticated) {
          console.log(`Authentication successful for username: ${user.username}`);

          // Then store the retrieved user object on the request object
          // so any middleware functions that follow this middleware function
          // will have access to the user's information.
          req.currentUser = user;
        } else {
          message = `Authentication failure for username: ${user.username}`;
        }
      } else {
        message = `User not found for username: ${credentials.name}`;
      }
    } else {
      message = 'Auth header not found';
    }

    // If user authentication failed...
    if (message) {
      console.warn(message);

      // Return a response with a 401 Unauthorized HTTP status code.
      res.status(401).json({ message: 'Access Denied' });
    } else {
      // Or if user authentication succeeded...
      // Call the next() method.
      next();
    }
  })();
};

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// Setup request body JSON parsing.
app.use(express.json());

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// TODO setup your api routes here
// Route that returns the current authenticated user.
app.get('/api/users', authenticateUser, (req, res) => {
  const user = req.currentUser;

  res.json({
    "id": currentUser.id,
    "firstName": currentUser.firstName,
    "lastName": currentUser.lastName,
    "emailAddress": currentUser.emailAddress,
    "password": currentUser.password
  });
});

require('./courses')(app);

// Route that creates a new user.
app.post('/api/users', [
  // check('name')
  //   .exists({ checkNull: true, checkFalsy: true })
  //   .withMessage('Please provide a value for "name"'),
  // check('username')
  //   .exists({ checkNull: true, checkFalsy: true })
  //   .withMessage('Please provide a value for "username"'),
  // check('password')
  //   .exists({ checkNull: true, checkFalsy: true })
  //   .withMessage('Please provide a value for "password"'),
], (req, res) => {
  // Attempt to get the validation result from the Request object.
  const errors = validationResult(req);

  // If there are validation errors...
  if (!errors.isEmpty()) {
    // Use the Array `map()` method to get a list of error messages.
    const errorMessages = errors.array().map(error => error.msg);

    // Return the validation errors to the client.
    return res.status(400).json({ errors: errorMessages });
  }

  // Get the user from the request body.
  const user = req.body;

  // Hash the new user's password.
  user.password = bcryptjs.hashSync(user.password);

  addUser = user;

  addUserToDatabase();

  // Add the user to the `users` array.
  users.push(user);

  res.location('/');

  // Set the status to 201 Created and end the response.
  return res.status(201).end();
});

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

// Define variables for the people and courses.
// NOTE: We'll use these variables to assist with the creation
// of our related data after we've defined the relationships
// (or associations) between our models.
let bradBird;

function addUserToDatabase() {
  console.log('Testing the connection to the database...');
  // Test the connection to the database.
  sequelize
    .authenticate()
    .then(() => {
      console.log('Synchronizing the models with the database...');

      return sequelize.sync({ force: false });
    })
    .then(() => {
      console.info('Adding people to the database...');

      return Promise.all([
        // User.create({
        //   firstName: 'Brad',
        //   lastName: 'Bird',
        //   emailAddress: 'bradBird@gmail.com',
        //   password: 'qwerty'
        // }),
        User.create({
          ...addUser
        })
      ]);
    })
    .then((data) => {
      console.log(JSON.stringify(data, null, 2));

      // Update the global variables for the people instances.
      [bradBird] = data;

      console.log('Adding courses to the database...');

      // TODO Include the related user who directed each course.

      // return Promise.all([
      //   Course.create({
      //     userId: bradBird.id,
      //     title: 'The Iron Giant',
      //     releaseYear: 1999,
      //     description: "blah blah blah"
      //   })
      // ]);
    })
    .then((data) => {
      console.log(JSON.stringify(data, null, 2));

      // Update the global variables for the course instances.
      // [theIronGiant, theIncredibles] = data;

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

      // process.exit();
    })
    .catch(err => console.error(err));
}