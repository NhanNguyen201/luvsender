const express = require("express")
const mongoose = require('mongoose')

const helmet = require('helmet');
const fileupload = require("express-fileupload");
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit')
const setSafeHeader = require('./middlewares/setHeaderMiddleWare')
const getQuote = require('./helpers/getQuote')

const { createText, getTextApp } = require('./controllers/textController')
const {  createImage, getImageApp } = require('./controllers/imageController')

const app = express()

dotenv.config()
app.use(helmet());

app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.set("view engine", "ejs")


app.use(setSafeHeader)

app.use(fileupload({
    useTempFiles : true,
    tempFileDir : './tmp'
}))

app.get("/", async (req, res) => {
    let quote = await getQuote()
    res.render("index", { quote })
})

app.get('/image', async (req, res) => {
    let quote = await getQuote()
    res.render("image", { quote })
})

app.get("/new", async (req, res) => {
    res.render("new")
})

app.post("/newText", rateLimit({ windowMs: 30 * 60 * 1000, max: 5 }), createText)

app.post("/newImage", rateLimit({ windowMs: 30 * 60 * 1000, max: 5 }), createImage)


app.get("/t", getTextApp)

app.get("/i", getImageApp)

const PORT = process.env.PORT || 5000
mongoose.connect(process.env.MONGO_CON)
    .then(() => {
        console.log('mongoDB connect');
        return app.listen(PORT, () => console.log(`Server runing at ${PORT}`))
    })
    .catch(err => console.log(err))
