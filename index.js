const express = require('express');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const axios = require('axios');

app.set('view engine', 'ejs');

// Set up session middleware
app.use(session({
  secret: 'mysecretkey', // Change this to a secure key
  resave: false,
  saveUninitialized: true
}));

// Use body-parser middleware to parse request body
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware function to check for authentication
function requireAuth(req, res, next) {
  if (req.session.authenticated) {
    next(); // User is authenticated, allow access to the protected route
  } else {
    res.redirect('/login'); // User is not authenticated, redirect to login page
  }
}

// Render the login page
app.get('/login', function(req, res) {
  res.render('login', { title: 'Login Page' });
});

// Handle login form submission
app.post('/login', function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  // Authenticate the user using username and password
  if (username === 'myusername' && password === 'mypassword') {
    // User authenticated, set session variable and redirect to splash page
    req.session.authenticated = true;
    res.redirect('/tables');
  } else {
    // User not authenticated, redirect to login page
    res.redirect('/login');
  }
});

// Protected route that requires authentication
app.get('/splash', requireAuth, function(req, res) {
  res.render('splash', { title: 'Splash Page', message: 'Welcome to my Splash page!' });
});

app.get('/tables', function(req, res) {
  axios.get('http://localhost:5000/tables')
    .then(response => {
      let tableList = '';
      for (let i = 0; i < response.data.length; i++) {
        tableList += `<li>${response.data[i].Tables_in_DemoDB}</li>`;
      }
      res.send(`<h1>List of Tables</h1><ul>${tableList}</ul>`);
    })
    .catch(error => {
      console.log(error);
      res.send(error);
    });
});


app.get('/tables/:name', function(req, res) {
  const tableName = req.params.name;
  axios.get(`http://localhost:5000/tables/${tableName}`)
  
    .then(response => {
      const tableContents = convertDataToTable(response.data, tableName);
      res.send(tableContents);
      
    })
    .catch(error => {
      console.log(error);
      res.send(error);
    });

});
function convertDataToTable(data, tableName) {
  let tableContents = '<thead><tr>';
  for (let i = 0; i < data.columns.length; i++) {
    tableContents += `<th>${data.columns[i]}</th>`;
  }
  tableContents += '</tr></thead><tbody>';
  for (let i = 0; i < data.data.length; i++) {
    const row = data.data[i];
    tableContents += `<tr>`;
    for (const [key, value] of Object.entries(row)) {
      tableContents += `<td>${value}</td>`;
    }
    tableContents += `</tr>`;
  }
  tableContents += '</tbody>';
  return `<h1>Table Contents: ${tableName}</h1><table>${tableContents}</table>`;
}






app.get('/views', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/views');
    res.send(response.data);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// Start the server
app.listen(3000, function() {
  console.log('Server started on port 3000');
});
