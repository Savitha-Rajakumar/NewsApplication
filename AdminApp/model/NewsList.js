const mongoose = require('mongoose')
const Schema = mongoose.Schema

const newsModel = new Schema({
    title: String,
    description: String,
    url: String,
    urlToImage: String,
    publishedAt: String,
    insertTime: Number
})

module.exports = mongoose.model('newslist', newsModel, 'news_list')