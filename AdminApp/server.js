const app = require('./app');
const express = require('express');
const port = 3000;
const bodyParser =  require('body-parser');
const session = require('express-session');

app.use(express.static(__dirname+'/public'));

//app.use(session({secret: 'edurekaSecert'}));

app.set('view engine', 'ejs');
app.set('views', './views');

let sess;

app.get('/',(req,res) => {
    //sess=req.session;
   // sess.email=" "
    //console.log(">>>>",sess.email);
    res.render('index')
})

app.get('/signup',(req,res) => {
  res.render('signup')
})

const server = app.listen(port, () => {
  console.log('Express server listening on port ' + port);
});