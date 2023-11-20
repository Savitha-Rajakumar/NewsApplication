// require('dotenv').config()
// const mongoose = require('mongoose');

// export const DB_URL = "mongodb://127.0.0.1:27017/AdminUsers"

// export function createClient(){
//     const client = new MongoClient(DB_URL);
//     return client;
// }


const mongoose = require("mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/AdminUsers", {
    useNewUrlParser: true,
    useUnifiedTopology: true 

})