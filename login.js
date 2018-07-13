var path = require('path');
var express = require('express');
var app = express();
var session = require('express-session')

// set up sessions
app.use(session({
  secret: 'my-super-secret-secret!',
  resave: false,
  saveUninitialized: true
}))

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.set('port', (process.env.PORT || 5000));

// We have html and js in the public directory that need to be accessed
app.use(express.static(path.join(__dirname, 'public')))

app.post('/famLogin', handleLogin);

function handleLogin(){
    var result = {success: false};
    
    console.log("index.js " + req.body.username + " and password "+ req.body.password);
    
    if(req.body.username == "happy" && req.body.password == "day"){
        //req.session.user == req.body.username;
        result = {success: true};
    }
    
    res.json(result);
}