const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// set the view engine to ejs
app.set('view engine', 'ejs')

function generateRandomString() {
  return Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(2, 6);
}
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  // console.log(req.body);  
  const shortURL = generateRandomString();
  const userInput = req.body['longURL']
  if (userInput.includes('http://')) {
    urlDatabase[shortURL] = userInput
    console.log(urlDatabase)
  }
  else{
    urlDatabase[shortURL] = "http://" + userInput
    console.log(urlDatabase)
  }
  res.redirect("/urls/" + shortURL); 
  
});
// app.get('u/:shortURL',(req, res) => {
//   let templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL };
//   res.redirect('/urls' + templateVars['shortURL'] )
// })


app.get("/u/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL:  req.params.longURL};
  res.render('urls_show', templateVars);
});


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