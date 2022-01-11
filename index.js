const express = require("express")
const mongoose = require('mongoose')

const helmet = require('helmet');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit')
const setSafeHeader = require('./middlewares/setHeaderMiddleWare')
const removeAscent = require('./helpers/removeAscent')
const Message = require('./models/message')
const app = express()
dotenv.config()
app.use(helmet());

// app.use(rateLimit({
// 	windowMs: 30 * 60 * 1000, // 30 minutes
// 	max: 50, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
// }))

app.use(express.static("public"))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.set("view engine", "ejs")

app.use(setSafeHeader)
app.get("/", (req, res) => {
    res.render("index")
})

app.get("/new", (req, res) => {
    res.render("new")
})

app.post("/new", rateLimit({
	windowMs: 30 * 60 * 1000, // 30 minutes
	max: 50, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
}),async (req, res) => {
    const newMessage = await Message.create({
        firstText:  removeAscent(req.body.firstText),
        secondText: removeAscent(req.body.secondText)
    })
    return res.render("new", { newUrl: `${req.headers.host}/q?_id=${newMessage._id}` })
})

app.get("/q", async(req, res) => {
    const { _id } = req.query;
    try {
        const message = await Message.findById(_id)
        return res.render("show", {firstText: message.firstText, secondText: message.secondText})
    } catch (error) {
        return res.render("show")
    }
})


const PORT = process.env.PORT || 5000
mongoose.connect(process.env.MONGO_CON)
    .then(() => {
        console.log('mongoDB connect');
        return app.listen(PORT, () => console.log(`Server runing at ${PORT}`))
    })
    .catch(err => console.log(err))
