// add dependancies
const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const app = express();
const PORT = 8080;
const helperFunctions = require('./helpers.js');

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
}));

// app related information storage
const urlDatabase = {
  "b2xVn2": {
    shortURL_id: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    user_id: 'df34md'
  },
  "9sm5xK": {
    shortURL_id: "9sm5xK",
    longURL: "http://www.google.com",
    user_id: 'df34md'
  }
};

const users = {
  df34md: {
    id: 'df34md',
    email: 'c@c.com',
    password: 'hello'
  }
}

// POST REQUESTS

// Registration POST request
app.post('/registration', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    return res.status(400).send('Email and password can not be blank');
  };
  // send message if already registered or add new user to users
  const registeredUser = helperFunctions.findUserByEmail(email, users);
  if (registeredUser){
    return res.status(400).send('this email address is already registered');
  }
  const id = helperFunctions.generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: id,
    email: req.body.email,
    password: hashedPassword
  }
  users[id] = newUser;
  
  // set cookie at registration
  req.session.user_id = newUser.id;
  res.redirect('/urls');
})

// Login POST request
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  const registeredUser = helperFunctions.findUserByEmail(email, users);
  const hashedPassword = registeredUser.password;
  // user not found in the database 
  if (registeredUser === null) {
    return res.sendStatus(403);
  } 
  if (bcrypt.compareSync(password, hashedPassword)) {
    req.session.user_id = registeredUser.id;
    res.redirect('/urls');
  } else {
    res.sendStatus(403);
  }
  
});

// Logout POST request
app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/login');
});


// URLs POST Requests for a new short URL
app.post("/urls", (req, res) => {
  const userInfo = req.session.user_id;
  const shortURL = helperFunctions.generateRandomString();
  const userInput = req.body['longURL'];
  const newURL = {
    shortURL_id: shortURL,
    longURL: userInput,
    user_id: userInfo
  };
  urlDatabase[shortURL] = newURL;
  res.redirect("/urls/"+shortURL); 
});

/////// GET REQUESTS

// root
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Login page
app.get('/login', (req, res) => {
  const userInfo = req.session.user_id;
  let templateVars = {
    user: users[userInfo]
  };
  res.render('login', templateVars);
});

// main urls info page
app.get("/urls", (req, res) => {
  const userInfo = req.session.user_id;
  const urlsForOneUser = helperFunctions.urlsForUserId(userInfo, urlDatabase);
  if (userInfo) {
    let templateVars = {
      user: users[userInfo],
      urls: urlsForOneUser
    };
    res.render('urls_index', templateVars);
  } else {
    res.send('Please register or login first');
  }
});

// request a new tiny url page
app.get("/urls/new", (req, res) => { 
  const userInfo = req.session.user_id;
  if (userInfo) {
    let templateVars = { user: users[userInfo] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

// Registration page
app.get('/registration', (req, res) => {
  const userInfo = req.session.user_id;
  let templateVars = { user: users[userInfo] };
  res.render('registration', templateVars);
});

//////////// OTHER POSTS AND GETS

// Delete post request
app.post('/urls/:shortURL/delete',(req, res) => {
  const userInfo = req.session.user_id;
  const shortURL = req.params.shortURL;
  const databaseUserId = urlDatabase[shortURL].user_id;
  if (databaseUserId === userInfo) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('/urls');
  }
})

// EDIT longURL POST request
app.post('/urls/:shortURL', (req, res) => {
  const userInfo = req.session.user_id;
  const updatedLongURL = req.body['updatedLongURL'];
  const shortURL = req.params.shortURL; 
  const databaseUserId = urlDatabase[shortURL].user_id;
  if (databaseUserId === userInfo) {
    urlDatabase[shortURL].longURL = updatedLongURL;
    res.redirect('/urls');
  } else {
    res.redirect('/urls');
  }
});

// GET requests with url variable
app.get("/urls/:shortURL", (req, res) => {
  const userInfo = req.session.user_id;
  const shortURL = req.params.shortURL;
  const databaseUserId = urlDatabase[shortURL].user_id;
  if (databaseUserId === userInfo) {
    let templateVars = {
      user: users[userInfo], 
      shortURL: shortURL, 
      longURL: urlDatabase[shortURL].longURL 
    };
    res.render('urls_show', templateVars);
    } else {
      res.send('Sorry you must be logged in to access this area.');
    }
});

// universally accessible page
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const shortURLinfo = urlDatabase[shortURL];
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});