// add dependancies
const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
var cookieParser = require('cookie-parser')
app.use(cookieParser())

// set the view engine to ejs
app.set('view engine', 'ejs')

// synchronous code
function generateRandomString() {
  return Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(2, 6);
}
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Express requests/responses
//GET requests
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Login POST request
app.post('/login', (req, res) => {
  console.log(req.body)
  res.cookie('username', req.body['username']);
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  let templateVars = {
    'username': req.cookies['username'],
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {'username': req.cookies['username']}
  res.render("urls_new", templateVars);
});

// POST Requests

app.post("/urls", (req, res) => {
  // console.log(req.body);  
  const shortURL = generateRandomString();
  const userInput = req.body['longURL']
  if (userInput.includes('http://')) {
    urlDatabase[shortURL] = userInput
    // console.log(urlDatabase)
  }
  else{
    urlDatabase[shortURL] = "http://" + userInput
    // console.log(urlDatabase)
  }
  res.redirect("/urls"); 
  
});



// Delete post request
app.post('/urls/:shortURL/delete',(req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls')
})

// EDIT post request
app.post('/urls/:shortURL', (req, res) => {
  const longURL = req.body['updatedLongURL']
  const shortURL = req.params.shortURL; 
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});



// GET requests with url variable
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  // console.log(templateVars)
  res.render('urls_show', templateVars);

});

app.get("/u/:shortURL", (req, res) => {
const longURL = urlDatabase[req.params.shortURL];
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