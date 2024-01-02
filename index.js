require('dotenv').config();
const express = require('express');
const app = express();

const session = require('express-session');
const flash = require('express-flash');

const bodyParser = require('body-parser');
var cookie = require('cookie-parser');
const path = require('path');
const web_routes = require('./routes/web');
const auth = require('./routes/auth');
const port = process.env.PORT || 8000;

// Registering public path
const static_path = path.join(__dirname, "/public");
app.use(express.static(static_path));

// Parse URL-encoded bodies (As Sent By HTML Forms)
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Parse JSON bodies (As Sent By API Clients)
app.use(express.json());
app.use(cookie());
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: true,
    saveUninitialized: true
  }));
app.use(flash());

// Set Ejs View Engine
app.set('view engine', 'ejs');

// Routes
app.use("/", web_routes);
app.use("", auth);

// App Running Port
app.listen(port, "127.0.0.1", ()=>{
    console.log(`app running on link http://127.0.0.1:${port}`);
})