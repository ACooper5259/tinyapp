// add dependancies
const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080;

// set the view engine to ejs
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

// synchronous code
function generateRandomString() {
  return Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(2, 6);
}

const findUserByEmail = function(email) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const urlsForUserId = function (user_id) {
  const singleUserUrls = {}
  for (let item in urlDatabase) {
    const shortURL = urlDatabase[item];
    if (shortURL['user_id'] === user_id) {
      const  userUrl = {
       shortURL_id: shortURL.shortURL_id,
       longURL: shortURL.longURL
      } 
      singleUserUrls[shortURL.shortURL]= userUrl
    };
  };
  return singleUserUrls;
};

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
  const registeredUser = findUserByEmail(email)
  if (registeredUser){
    return res.status(400).send('this email address is already registered');
  }
  const id = generateRandomString()
  const newUser = {
    id: id,
    email: req.body.email,
    password: req.body.password
  }
  users[id] = newUser;
  // set cookie at registration
  res.cookie('user_id', newUser.id);
  res.redirect('/urls');
})

// Login POST request
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const registeredUser = findUserByEmail(email)
  // user not found in the database 
  if (registeredUser === null) {
    return res.sendStatus(403)
  } 
  if (registeredUser.password !== password) {
    res.sendStatus(403)
  }
  res.cookie('user_id', registeredUser.id);
  res.redirect('/urls');
});

// Logout POST request
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});


// URLs POST Requests for a new short URL
app.post("/urls", (req, res) => {
  const userInfo = req.cookies['user_id'];
  const shortURL = generateRandomString();
  const userInput = req.body['longURL']
  const newURL = {
    shortURL_id: shortURL,
    longURL: userInput,
    user_id: userInfo
  };
  urlDatabase[shortURL] = newURL;
  
  res.redirect("/urls"); 
});

/////// GET REQUESTS

// root
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Login page
app.get('/login', (req, res) => {
  const userInfo = req.cookies['user_id'];
  let templateVars = {
    user: users[userInfo]
  };
  res.render('login', templateVars);
});

// main urls info page
app.get("/urls", (req, res) => {
  const userInfo = req.cookies['user_id'];
  const urlsForOneUser = urlsForUserId(userInfo)
  if (userInfo) {
    let templateVars = {
      user: users[userInfo],
      urls: urlsForOneUser
    };
    res.render('urls_index', templateVars);
  } else {
    res.send('Please register or login first')
  }
});

// request a new tiny url page
app.get("/urls/new", (req, res) => { 
  const userInfo = req.cookies['user_id']
  if (userInfo) {
    let templateVars = { user: users[userInfo],}
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login')
  }
});

// Registration page
app.get('/registration', (req, res) => {
  const userInfo = req.cookies['user_id']
  let templateVars = { user: users[userInfo], }
  res.render('registration', templateVars)
})

//////////// OTHER POSTS AND GETS

// Delete post request
app.post('/urls/:shortURL/delete',(req, res) => {
  const userInfo = req.cookies['user_id'];
  const shortURL = req.params.shortURL;
  const databaseUserId = urlDatabase[shortURL].user_id;
  if (databaseUserId === userInfo) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('/urls');
    console.log(urlDatabase)

  }
})

// EDIT longURL POST request
app.post('/urls/:shortURL', (req, res) => {
  const userInfo = req.cookies['user_id'];
  const updatedLongURL = req.body['updatedLongURL'];
  const shortURL = req.params.shortURL; 
  const databaseUserId = urlDatabase[shortURL].user_id;
  if (databaseUserId === userInfo) {
    urlDatabase[shortURL].longURL = updatedLongURL;
    res.redirect('/urls');
  } else {
    res.redirect('/urls')
  }
});

// GET requests with url variable
app.get("/urls/:shortURL", (req, res) => {
  const userInfo = req.cookies['user_id']
  const shortURL = req.params.shortURL
  if (userInfo) {
    let templateVars = {
      user: users[userInfo], 
      shortURL: shortURL, 
      longURL: urlDatabase[shortURL].longURL 
    };
    res.render('urls_show', templateVars);
    } else {
      res.redirect('/login')
    }
});

// 
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  // const shortURLinfo = urlDatabase[shortURL]
  const longURL = urlDatabase[shortURL].longURL;
res.redirect(longURL);
});


// Additional routes created at the project onset
// // app.get('/hello', (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// // app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });

// // app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});