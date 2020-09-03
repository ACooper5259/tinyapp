// add dependancies
const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')

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

// app related information storage
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    user_id: 'df34md'
  },
  "9sm5xK": {
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



// Express requests/responses
//GET requests
app.get("/", (req, res) => {
  res.send("Hello!");
});

// // New tiny URL POST request
// app.post('/urls/new', (req, res) => {
//    console.log (req.body)

//   res.redirect('/login')
// }

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
  console.log(users)

  // set cookie at registration
  res.cookie('user_id', newUser.id);
  res.redirect('/urls');
})

// Login POST request
app.post('/login', (req, res) => {
  // console.log(req.body)
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

// Login GET request
app.get('/login', (req, res) => {
  const userInfo = req.cookies['user_id'];
  let templateVars = {
    user: users[userInfo]
  };
  res.render('login', templateVars);
});

app.get("/urls", (req, res) => {
  const userInfo = req.cookies['user_id'];
  // console.log('the id is:', users[cookieUserId])
  let templateVars = {
    user: users[userInfo],
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => { 
  const userInfo = req.cookies['user_id']
  if (userInfo) {
    let templateVars = { user: users[userInfo],}
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login')
  }
});

// Registration GET Request request
app.get('/registration', (req, res) => {
  const userInfo = req.cookies['user_id']
  let templateVars = { user: users[userInfo], }
  res.render('registration', templateVars)
})


// URLs POST Requests for a new short URL
app.post("/urls", (req, res) => {
  // console.log(req.body);  
  const userInfo = req.cookies['user_id'];
  const shortURL = generateRandomString();
  const userInput = req.body['longURL']
  // if (!userInput.includes('http://')) {
  //   userInput = "http://" + userInput
  const newURL = {
    longURL: userInput,
    user_id: userInfo
  };
  urlDatabase[shortURL] = newURL;
  
  res.redirect("/urls"); 
  
});

// Delete post request
app.post('/urls/:shortURL/delete',(req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls')
})

// EDIT longURL POST request
app.post('/urls/:shortURL', (req, res) => {
  const longURL = req.body['updatedLongURL']
  const shortURL = req.params.shortURL; 
  urlDatabase[shortURL].longURL = longURL;
  res.redirect('/urls');
});



// GET requests with url variable
app.get("/urls/:shortURL", (req, res) => {
  const userInfo = req.cookies['user_id']
  const shortURL = req.params.shortURL
  let templateVars = {
    user: users[userInfo], 
    shortURL: shortURL, longURL: urlDatabase[shortURL].longURL };
  // console.log(templateVars)
  res.render('urls_show', templateVars);

});

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