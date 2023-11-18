
const express = require('express');
const router = express.Router();
const LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');
const app = express();
// For parsing form
const bodyParser = require('body-parser');
// For generating Token
const jwt = require('jsonwebtoken');
// For encrypting Password
const bcrypt = require('bcryptjs');
// For Secert Token
const config = require('../config');
// For User Schema
const User = require('../user/User');
const session = require('express-session');
const Newslist=require('../model/NewsList')
router.use(session({secret: 'edurekaSecert1', resave: false, saveUninitialized: true}));
app.use(express.static(__dirname+'/public'));
app.set('view engine', 'ejs');
app.set('views', './views');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// Register User
router.post('/register', function(req, res) {
  
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    console.log('testing')
    User.create({
      name : req.body.name,
      email : req.body.email,
      password : hashedPassword
    },
    function (err, user) {
      if (err) return res.status(500).send("There was a problem registering the user.")
      // create a token
      var token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
      });
      const string = encodeURIComponent('Success Fully Register Please Login');
      res.redirect('/?msg=' + string);
    }); 
    });

// Login User
router.post('/login', function(req, res) {
    User.findOne({ name: req.body.name },   async(err, user)=> {
      if (err) return res.status(500).send('Error on the server.');
      const string = encodeURIComponent('! Please enter valid value');
      console.log(user)
      if (!user) { res.redirect('/?valid=' + string);}
      else{
        const passwordIsValid = await bcrypt.compare(req.body.password, user.password);
        console.log(passwordIsValid);
        if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
        var token = jwt.sign({ id: user._id }, config.secret, {
            expiresIn: 86400 // expires in 24 hours
        });
        localStorage.setItem('authtoken', token)
        res.redirect(`/api/auth/loginedUser`);
      }
    });
});

// Info of logined User
router.get('/loginedUser', function(req, res) {
    var token = localStorage.getItem('authtoken');
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      
      // res.status(200).send(decoded);
      User.findById(decoded.id, { password: 0 }, function (err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");
        console.log("user",user)
        res.render("Newsform",{user});
      });
    });
  });

  router.post('/addNews', (req, res)=>{
    console.log("/addNews : req.body : ", req.body)
    const token = localStorage.getItem('authtoken')
    console.log("token>>>",token)
    if (!token) {
        res.redirect('/')
    }
    jwt.verify(token, config.secret, (err, decoded)=>{
        if (err) { res.redirect('/') }
        User.findById(decoded.id, { password: 0}, (err,user)=>{
            if (err) {res.redirect('/')}
            if (!user) {res.redirect('/')} 
            console.log("/newsForm : user ==> ", user)   
            
            const d = Date.now()
            const news = {...req.body, insertTime: d }
            console.log("/addNews : news => ", news)

            Newslist.create(
                news
            , (err, data) => {
                if(err) return res.status(500).send('There was a problem registering user')
                console.log(`Inserted ... ${data} `)
                const htmlMsg = encodeURIComponent('Added News DONE !');
                res.redirect('/newsForm/?msg=' + htmlMsg)
            })            

        })
    })
})


router.get("logout", (err,data)=>{
  localStorage.removeItem('authtoken')
  res.redirect('/')
})

  module.exports = router;