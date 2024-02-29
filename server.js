// Create server for browser use w/ express
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const ObjectId = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;
// Import password
const password = require('./password.js');
const PASSWORD = password.getPassword();
const CONNECTION_STRING = `mongodb+srv://contacts:${PASSWORD}@contacts-cluster.xsvvs0g.mongodb.net/?retryWrites=true&w=majority`;



// Create Database Client Connection 
MongoClient.connect(CONNECTION_STRING)
  .then(client => {
    console.log('Connected to MongoDB Server')
    const db = client.db("contactsDB");
    const contactsCollection = db.collection('contacts');

    // we need to set view engine to ejs. This tells Express we’re using EJS as the template engine
    app.set('view engine', 'ejs');

    // Body Parser -----------------------------------------------------------
    /*
    Body-parser: is a middleware that helps express handle reading data from the <form> element.
    npm install body-parser --save
    
    They help tidy up request objects before use w/ use method:
    app.use(bodyParser.urlencoded({extended: true}))
    
    urlencoded: method within body-parser tells body-parser to extract data from the <form> element and add them to the body property in the request object:
    { inputName: inputValue }
    
    Make sure you place body-parser before your CRUD handlers!
    app.get()
    app.post()
    app.put()
    app.delete()
    */
    app.use(bodyParser.urlencoded({ extended: true }));
    // Read JSON --------------------------------------------------------------
    app.use(bodyParser.json());
    //  Serve Static Files ----------------------------------------------------
    app.use(express.static('public'));

    // ----------------------------------------------------------------------------

    // Create ---------------------------------------------------------------------
    /*
    Browsers can only perform a Create operation if they send a POST request:
    app.post(endpoint, callback);
    
    To the server though a <form> or javascript.
    
    To send a POST request the index.html needs a <form> element.
    The form should have an action, method attribute and a name attribute on each input element:
    action: tells the browser where to send the request: /endpoint
    method: tells the browser what kind of request to send: POST
    name: Descriptive name
    
    We can handle this POST request with a contact method in server.js. The path should be the value you placed in the action attribute.
    app.post('/path', (req, res) => { handle contact req});
    
    See: Body-parser
    */

    // POST route for adding a new contact
    app.post('/contacts', (req, res) => {
      // Log the request body
      console.log('rb', req.body);

      // Add the received contact to the database collection
      contactsCollection.insertOne(req.body)
        .then(result => {
          // Redirect the browser to the home page after successfully adding the contact
          res.redirect('/');
        })
        .catch(err => {
          // Log any errors to the console
          console.error(err);
        });
    });

    // API:---------------------
    app.post('/api', (req, res) => {
      // Log the request body
      console.log('rb', req.body);

      // Add the received contact to the database collection
      contactsCollection.insertOne(req.body)
        .then(result => {
          // Send back the inserted document as JSON
          res.json(req.body);
          console.log('rb2', result, req.body)
          // Redirect the browser to the home page after successfully adding the contact
        })
        .catch(err => {
          // Log any errors to the console
          console.error(err);
        });
    });
    // ---------------------------

    // ----------------------------------------------------------------------------

    // Read -----------------------------------------------------------------------
    /*
    We handle GET request w/ get method:
    app.get(endpoint, callback);
    
    domain_name: www.website.com/dir/file/
    endpoint: is anything after domain_name (/dir/file/)
    callback: tells the server what to do when the requested endpoint  matches the endpoint in the route.
    
    It takes (req, res) as parameters where req is the HTTP request and res is the  HTTP response.
    
    app.get('/', (req, res) => {handle get req})
    */

    // Home page route
    app.get('/', (req, res) => {

      // Retrieve contacts from the database
      contactsCollection.find()
        .toArray() // Convert MongoDB cursor to array
        .then(results => {
          // Render the home page with the retrieved contacts
          res.render('index', { contacts: results });

          // Alternative approach: Determine the response format based on the request accept header
          // if (req.accepts('html')) {
          //   res.status(200).render('index.ejs', { contacts: results });
          // } else {
          //   res.status(200).json({ contacts: results });
          // }
        })
        .catch(err => {
          // Log any errors to the console
          console.error(err);
          // Send a 500 response for any internal server errors
          res.status(500).send('Internal Server Error');
        });
    });

    // API: Route to retrieve all contacts as JSON
    app.get('/api/contacts', (req, res) => {
      // Retrieve all contacts from the database
      contactsCollection.find()
        .toArray() // Convert MongoDB cursor to array
        .then(results => {
          // Check if there are any contacts found
          (!results) ?
            // Send a 404 response if no contacts are found
            res.status(404).json({
              message: 'No entries found.',
              results // Include an empty results array in the response
            })
            :
            // Send a successful response with the contacts as JSON
            res.status(200).json(results);

        })
        .catch(err => {
          // Log any errors to the console
          console.error(err);
          // Send a 500 response for any internal server errors
          res.status(500).send('Internal Server Error');
        });
    });
    // ------------------------

    // API: Route to retrieve all contacts by ID as JSON
    app.get('/api/contacts/:id', (req, res) => {
      // Extract the contact ID from the request parameters
      let contactId = req.params.id;

      // Define the query to find the contact by its ID
      let contactQuery = { _id: new ObjectId(contactId) };

      // Use findOne to find the contact in the database
      contactsCollection.findOne(contactQuery)
        .then((result) => {

          // Check if the contact is not found
          if (!result) {
            // If contact is not found, send a 404 status with a JSON response
            return res.status(404).json({ message: `Cannot find contact with ID ${contactId}` });
          } else {
            // If the contact is found, send a 200 status with a JSON response containing the contact
            res.status(200).json(result);
          }
        })
        .catch((err) => {
          // Log any errors to the console and send a 500 status with a JSON response indicating internal server error
          console.log(err);
          res.status(500).json({ error: 'Internal Server Error' });
        });
    });
    // ------------------------

    // GET route for retrieving all contacts
    app.get('/contacts', (req, res) => {
      // Retrieve all contacts from the database collection
      contactsCollection.find()
        .toArray()
        .then(results => {
          // Log the results to the console
          console.log(results);

          // Check if there are no results
          if (!results) {
            // If no results found, send a 404 status with a JSON response
            return res.status(404).json({ message: 'No Results' });
          } else {
            // If results found, send a 200 status with a JSON response containing the results
            res.status(200).json(results);
          }
        })
        .catch(err => {
          // Log any errors to the console and send a 500 status with a JSON response containing the error
          console.error(err);
          res.status(500).json({ error: err })
        })
    });


    // Route to retrieve all contacts by ID
    app.get('/contacts/:id', (req, res) => {
      // Extract the contact ID from the request parameters
      let contactId = req.params.id;

      // Define the query to find the contact by its ID
      let contactQuery = { _id: new ObjectId(contactId) };

      // Use findOne to find the contact in the database
      contactsCollection.findOne(contactQuery)
        .then((result) => {
          // Log the result to the console
          // console.log('r', result);

          // Check if the contact is not found
          if (!result) {
            // If contact is not found, send a 404 status with a JSON response
            return res.status(404).json({ message: `Cannot find contact with ID ${contactId}` });
          } else {
            // If the contact is found, send a 200 status with a JSON response containing the contact
            res.status(200).json(result);
          }
        })
        .catch((err) => {
          // Log any errors to the console and send a 500 status with a JSON response indicating internal server error
          console.log(err);
          res.status(500).json({ error: 'Internal Server Error' });
        });
    });

    // Route to retrieve all contacts by ID
    app.get('/api/contacts/:id', (req, res) => {
      // Extract the contact ID from the request parameters
      let contactId = req.params.id;

      // Define the query to find the contact by its ID
      let contactQuery = { _id: new ObjectId(contactId) };

      // Use findOne to find the contact in the database
      contactsCollection.findOne(contactQuery)
        .then((result) => {
          // Log the result to the console
          // console.log('r', result);

          // Check if the contact is not found
          if (!result) {
            // If contact is not found, send a 404 status with a JSON response
            return res.status(404).json({ message: `Cannot find contact with ID ${contactId}` });
          } else {
            // If the contact is found, send a 200 status with a JSON response containing the contact
            res.status(200).json(result);
          }
        })
        .catch((err) => {
          // Log any errors to the console and send a 500 status with a JSON response indicating internal server error
          console.log(err);
          res.status(500).json({ error: 'Internal Server Error' });
        });
    });


    // GET route for editing a specific contact
    app.get('/contacts/:id/edit', (req, res) => {
      // Extract the contact ID from the request parameters
      let contactId = req.params.id;

      // Define the query to find the contact by its ID
      let contactQuery = { _id: new ObjectId(contactId) };

      // Log the contact ID to the console
      console.log(contactId, contactQuery);

      // Use findOne to find the contact in the database
      contactsCollection.findOne(contactQuery)
        .then((result) => {
          // Log the result to the console
          console.log('r', result);

          // Check if the contact is not found
          if (!result) {
            // If contact is not found, send a 404 status with a JSON response and redirect to the home page
            return res.status(404).json({ message: `Cannot find contact with ID ${contactId}` }).redirect("/");
          } else {

            // If HTML format is requested, render the edit-contact.ejs template with the contact data
            res.render("edit-contact.ejs", { contact: result });
            // If JSON format is requested, send a 200 status with a JSON response containing the contact
            res.status(200).json(result);

          }
        })
        .catch((err) => {
          // Log any errors to the console and send a 500 status with a JSON response indicating internal server error
          console.log(err);
          res.status(500).send('Internal Server Error');
        });
    });

    // API: GET route for editing a specific contact in API format
    app.get('/api/contacts/:id/edit', (req, res) => {
      // Extract the contact ID from the request parameters
      let contactId = req.params.id;

      // Define the query to find the contact by its ID
      let contactQuery = { _id: new ObjectId(contactId) };

      // Use findOne to find the contact in the database
      contactsCollection.findOne(contactQuery)
        .then((result) => {

          // Check if the contact is not found
          if (!result) {
            // If contact is not found, send a 404 status with a JSON response
            return res.status(404).json({ message: `Cannot find contact with ID ${contactId}` });
          } else {
            // If the contact is found, send a 200 status with a JSON response containing the contact
            res.status(200).json(result);
          }
        })
        .catch((err) => {
          // Log any errors to the console and send a 500 status with a JSON response indicating internal server error
          console.log(err);
          res.status(500).json({ error: 'Internal Server Error' });
        });
    });
    // ------------------------

    // ----------------------------------------------------------------------------

    // Update -----------------------------------------------------------------
    app.put('/contacts/:id', (req, res) => {
      const contactId = req.params.id;
      const contactQuery = { _id: new ObjectId(contactId) };
      const contactData = req.body;
      console.log('Updated Contact Data:', contactData);


      contactsCollection.findOneAndUpdate(contactQuery, { $set: contactData }, { upsert: true, returnOriginal: false })
        .then((result) => {
          console.log("updateResult", contactData);
          // res.send({contactData})
          result = Object.assign({}, contactQuery, contactData);
          if (!result) {
            return res.status(404).json({ message: `Cannot update contact with ID ${contactId}` });
          } else {
            return res.status(200).json(result);
          }
        })
        .catch((e) => {
          console.error(`Error updating contact ${contactId}`, e);
          res.status(500).send('Server error');
        });

    });

    // API: PUT route handler that is called when the /api/contacts/:id endpoint is hit 
    app.put('/api/contacts/:id', (req, res) => {
      const contactId = req.params.id;
      const contactQuery = { _id: new ObjectId(contactId) };
      const contactData = req.body;
      console.log('Updated Contact Data:', contactData);


      contactsCollection.findOneAndUpdate(contactQuery, { $set: contactData }, { upsert: true, returnOriginal: false })
        .then((result) => {
          console.log("updateResult",);
          // res.send({contactData})
          result = Object.assign({}, contactQuery, contactData);
          if (!result) {
            return res.status(404).json({ message: `Cannot update contact with ID ${contactId}` });
          } else {
            return res.status(200).json(result);
          }
        })
        .catch((e) => {
          console.error(`Error updating contact ${contactId}`, e);
          res.status(500).send('Server error');
        });

    });
    // ------------------------


    // ----------------------------------------------------------------------------

    // Delete ---------------------------------------------------------------------
    app.delete('/contacts/:id/delete', (req, res) => {
      console.log('DRR:', req.body)
      const contactId = req.params.id;
      const contactQuery = { _id: new ObjectId(contactId) };
      const contactData = req.body;
      console.log('Delete Contact Data:', contactData);

      contactsCollection.deleteOne(contactQuery, contactData)
        .then(result => {
          console.log('Delete Contact Data:', contactData);
          console.log('dr', { ...result })
          if (result.deletedCount === 0) {
            res.json({ message: 'No record of that contact was found.' });
          } else {
            console.log('Deleted', result, contactData);
            res.status(200).json(result);
          }
        })
        .catch((e) => {
          console.error(`Error deleting contact ${contactId}`, e);
          res.status(500).send('Server error');
        });
    });


    app.delete('/api/contacts/:id/delete', (req, res) => {
      console.log('DRR:', req.body)
      const contactId = req.params.id;
      const contactQuery = { _id: new ObjectId(contactId) };
      const contactData = req.body;
      console.log('Delete Contact Data:', contactData);

      contactsCollection.deleteOne(contactQuery, contactData)
        .then(result => {
          console.log('Delete Contact Data:', contactData);
          console.log('dr', { ...result })
          if (result.deletedCount === 0) {
            res.json({ message: 'No record of that contact was found.' });
          } else {
            console.log('Deleted', result, contactData);
            res.status(200).json(result)
          }
        })
        .catch((e) => {
          console.error(`Error deleting contact ${contactId}`, e);
          res.status(500).send('Server error');
        });
    });
    // ----------------------------------------------------------------------------

    // Listen for server on port localhost:3000
    app.listen(PORT, function () {
      console.log(`Listening on localhost:${PORT}`)
    });
  })
  .catch(error => console.error(error));

// Run server
// cd working_dir && node server.js
// ----------------------------------------------------------------------------

// Nodemon --------------------------------------------------------------------
/*
Nodemon: restarts the server automatically when you save a file that’s used by the server.js. 
npm install nodemon --save-dev

Update script in package.json
"scripts": {
  "dev": "nodemon server.js"
}

npm run dev to trigger nodemon server.js
*/

// ----------------------------------------------------------------------------

// Test server
console.log('Contacts:  Create, Read, Update & Delete');


// Run server
// cd working_dir && node server.js
// ----------------------------------------------------------------------------

// Nodemon --------------------------------------------------------------------
/*
Nodemon: restarts the server automatically when you save a file that’s used by the server.js. 
npm install nodemon --save-dev

Update script in package.json
"scripts": {
  "dev": "nodemon server.js"
}

npm run dev to trigger nodemon server.js
*/

// ----------------------------------------------------------------------------


// Test server
console.log('Address Book:  Create, Read, Update & Delete');