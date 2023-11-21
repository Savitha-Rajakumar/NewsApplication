import express from 'express'
import bodyParser from 'body-parser'
import axios from 'axios'
import cors from 'cors'
import 'babel-polyfill'
import path from 'path'
import http from 'http'

const iplocate = require("node-iplocate")
const publicIp = require('public-ip')
require('./db')
const Newslist = require('./models/News_model')
const Contactuslist = require('./models/Contactus_model')

const app = express()
app.set('port', process.env.PORT || 7000);
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cors())

app.set('view engine', 'ejs')
app.set('views', './views')

const userloc = async ()=>{
    try{
        const ip = await publicIp.v4()
        console.log("ip : ", ip)
        return await iplocate(ip)    
    }catch(err){
        console.log(err)
    }
}
const getWeather = async (lon, lat) =>{
    const apikey = 'f443d734d889d6c735762b5fedab80b1'
    const apiUrl = `http://api.openweathermap.org/data/2.5/weather?lon=${lon}&lat=${lat}&appid=${apikey}&units=metric`
    //console.log("getWeather : apiUrl : ", apiUrl)
    try{
        return await axios.get(apiUrl)
    }catch(err){
        console.log(err)
    }
}
const newslist=()=>{
    Newslist.find({}, (err,data)=>{
        console.log('inside')
        if(err) "error occured"
        else{
            return data;
        }        
    })      
}

app.get('/getNews', (req, res)=>{
  
 
  
            Newslist.find({}, (err,data)=>{
                if(err) res.status(500).send(err)
                else{
                    res.send({
                        data
                    })
                }        
            })
     
  })

app.get('/', async(req, res) => 
{
    const weather1= await getWeather("12.97","77.59");
    const weather=weather1.data
    console.log(weather.main.temp)
    //const news= newslist();
    Newslist.find({}, (err,news)=>{
        if(err) res.status(500).send(err)
        else{
            //console.log(data)
            res.render('home',({news,weather}))
        }        
    })
    //console.log('weather',weather,data)
    //res.render('home',{weather})
}); // Homepage


app.get('/sports', (req,res)=>{

    const d = new Date().toISOString()
    const today = d.substring(0,10)
    console.log("today : ", today)

    const apiUrl = 'https://newsapi.org/v2/top-headlines' 
    axios.get(apiUrl, {
            params: {
                sources: 'espn, nfl-news, the-sport-bible',
                from: today,
                sortBy: 'popularity',
                language: 'en',
                apiKey: '98129a2a05e845ef84fec4963493b12e'
            }
        })
        .then( (response)=>{
            const data = response.data.articles
            console.log("/sports : data => ", data)
            res.render('sports', {data})
        })
        .catch(function (error) {
            console.log(error);
        })
})

app.get('/about_us', (req,res)=>{
    res.render('about_us')
})

app.get('/contact_us', (req,res)=>{
    res.render('contact_us', {
        msg: req.query.msg?req.query.msg:''
    })
})

app.post('/addContactUs', (req,res)=>{
    console.log("/addContactUs : req.body : ", req.body)
    
    const record = req.body
    Contactuslist.create(
            record  
        , (err, data) => {
            if(err){
                const htmlMsg = encodeURIComponent('Error : ', error);
                res.redirect('/contact_us/?msg=' + htmlMsg)
            }else{
                const htmlMsg = encodeURIComponent('ContactUs Message Saved OK !');
                res.redirect('/contact_us/?msg=' + htmlMsg)
            }
            
        }) 
    
})

const server = http.createServer(app).listen(app.get('port'), () => {
    console.log("Express server listening on port " + app.get('port'));
});
const io = require('socket.io').listen(server);

let users = []

io.on('connection',  (socket) => {

    socket.on('connect', ()=>{
        console.log("New connection socket.id : ", socket.id)
    })

    socket.on('disconnect', ()=>{
        console.log("disconnect => nickname : ", socket.nickname)
        const updatedUsers = users.filter(user => user != socket.nickname)
        console.log("updatedUsers : ", updatedUsers)
        users = updatedUsers
        io.emit('userlist', users)
    })

    socket.on('nick', (nickname) => {
        console.log("nick => nickname : ", nickname)
        socket.nickname = nickname
        users.push(nickname)

        console.log("server : users : ", users)
        io.emit('userlist', users);
    });

    socket.on('chat', (data) => {
        console.log("chat => nickname : ", socket.nickname)
        const d = new Date()
        const ts = d.toLocaleString()
        console.log("ts : ", ts)
        const response = `${ts} : ${socket.nickname} : ${data.message}`
        console.log("rs : ", response)
        io.emit('chat', response)
    });
});


