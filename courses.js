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

let addCourse;

// create the Express app
const app = express();

// Setup request body JSON parsing.
app.use(express.json());

module.exports = function(app){

  // Route that creates a new course.
  app.post('/api/courses', [

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

    // Get the course from the request body.
    const course = req.body;

    addCourse = course;

    addCourseToDatabase();

    res.location('/');

    // Set the status to 201 Created and end the response.
    return res.status(201).end();
  });

  function addCourseToDatabase() {
    console.log('Testing the connection to the database...');
    // Test the connection to the database.
    sequelize
      .authenticate()
      .then(() => {
        console.log('Synchronizing the models with the database...');
  
        return sequelize.sync({ force: false });
      })
      .then(() => {
  
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
  
        return Promise.all([
          // Course.create({
          //   "userId": 1,
          // 	 "title": "The Way",
	        //   "releaseYear": 1999,
	        //   "description": "The way we need"
          // }),
          Course.create({
            ...addCourse
          }),
        ]);
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
  
        return Course.findAll();
      })
      .then((data) => {
        console.log(JSON.stringify(data, null, 2));
  
        // process.exit();
      })
      .catch(err => console.error(err));
  }
  
  
  app.get('/api/courses', (req, res) => {
    (async () => {
      // let allCourses;
      
      await db.sequelize.sync({ force: false });
      try {
        let allCourses = await Course.findAll();

        let allUsers = await User.findAll();

        let user = await User.findOne({
          where: {
            id: 1
          }
        });

        // let stringifyAllCourses = '';

        // for (let i = 0; i < allCourses.length; i++)  {
        //   if(i === 0){
        //     stringifyAllCourses += JSON.stringify(allCourses[i]);
        //   } else {
        //     stringifyAllCourses += "," + JSON.stringify(allCourses[i]);
        //   }
        // }

        // let arrayFormatAllCourses = "[" +  stringifyAllCourses + "]";

        // let parseAllCourses = JSON.parse(arrayFormatAllCourses);

        ////////////////////////////////////////////////////////////////////////////

        // let stringifyAllCourseIds = '';

        // let stringifyAllCourseTitles = '';

        // for (let i = 0; i < allCourses.length; i++)  {
        //   if(i === 0){
        //     stringifyAllCourseIds += JSON.stringify(allCourses[i].id);
        //     stringifyAllCourseTitles += JSON.stringify(allCourses[i].title);
        //   } else {
        //     stringifyAllCourseIds += "," + JSON.stringify(allCourses[i].id);
        //     stringifyAllCourseTitles += "," + JSON.stringify(allCourses[i].title);
        //   }
        // }

        // let arrayFormatAllCourseIds = "[" +  stringifyAllCourseIds + "]";
        // let arrayFormatAllCourseTitles = "[" +  stringifyAllCourseTitles + "]";

        // let parseAllCourseIds = JSON.parse(arrayFormatAllCourseIds);
        // let parseAllCourseTitles = JSON.parse(arrayFormatAllCourseTitles);

        // res.json({
        //   id: parseAllCourseIds,
        //   title: parseAllCourseTitles,
        //   user: user
        // });

        ////////////////////////////////////////////////////////////////////////////

        let stringifyAllCourses = '';

        for (let i = 0; i < allCourses.length; i++)  {
          if(i === 0){
            stringifyAllCourses += JSON.stringify({ id: allCourses[i].id,
                                                    title: allCourses[i].title,
                                                    description: allCourses[i].description,
                                                    estimatedTime: allCourses[i].estimatedTime,
                                                    materialsNeeded: allCourses[i].materialsNeeded,
                                                    user: await User.findOne({where: {id: allCourses[i].userId}})
                                                  });
          } else {
            stringifyAllCourses += "," + JSON.stringify({ id: allCourses[i].id,
                                                          title: allCourses[i].title,
                                                          description: allCourses[i].description,
                                                          estimatedTime: allCourses[i].estimatedTime,
                                                          materialsNeeded: allCourses[i].materialsNeeded,
                                                          user: await User.findOne({where: {id: allCourses[i].userId}})
                                                        });
          }
        }

        let arrayFormatAllCourses = "[" +  stringifyAllCourses + "]";

        let parseAllCourses = JSON.parse(arrayFormatAllCourses);
        

        res.json({
          allCourses: parseAllCourses,
          // allUsers: allUsers
        });

        

        

      } catch (error) {
        if (error.name === 'SequelizeValidationError') {
          const errors = error.errors.map(err => err.message);
          console.error('Validation errors: ', errors);
        } else {
          throw error;
        }
      }
    })();
  });

  
}