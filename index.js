const express = require("express")
const mongoose = require('mongoose')

const helmet = require('helmet');
const fileupload = require("express-fileupload");
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit')
const setSafeHeader = require('./middlewares/setHeaderMiddleWare')
const getQuote = require('./helpers/getQuote')
const removeAscent = require('./helpers/removeAscent')
const { cloudinary } = require('./helpers/cloudinary')
const Message = require('./models/message');
const ImageMessage = require('./models/imageMessage');

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
    tempFileDir : '/'
}))

app.get("/", async (req, res) => {
    let quote = await getQuote()
    res.render("index", { quote })
})

app.get("/new", async (req, res) => {
    res.render("new")
})

app.post("/new", rateLimit({
        windowMs: 30 * 60 * 1000, 
        max: 50 
    }),async (req, res) => {
    const newMessage = await Message.create({
        firstText:  removeAscent(req.body.firstText),
        secondText: removeAscent(req.body.secondText)
    })
    let quote = await getQuote()

    return res.render("new", { host: req.headers.host, linkId : newMessage._id, type: "t", quote })
})


app.post("/newImage", async(req, res) => {
    const mimeTypeInclude = ['image/jpeg','image/png', 'image/gif']
    let quote = await getQuote()
    if(mimeTypeInclude.includes(req.files.image.mimetype)) {
        cloudinary.uploader.upload(req.files.image.tempFilePath, { upload_preset: 'luv-sender-pre', resource_type: "auto"}, async(error, result) => {
            if(error) {
                return res.render("new")
            } else {
                const newImageMessage = await ImageMessage.create({
                    url: result.url,
                    mimeType: req.files.image.mimetype
                })
                return res.render("new", { host: req.headers.host, linkId : newImageMessage._id, type: "i", quote })
            }
        })
    } else {
        return res.render("new")
    }
})

app.get("/image", async (req, res) => {
    res.render("image")
})

app.get("/t", async(req, res) => {
    const { _id } = req.query;
    let quote = await getQuote()

    try {
        const message = await Message.findById(_id)
        return res.render("show", {firstText: message.firstText, secondText: message.secondText, quote})
    } catch (error) {
        return res.render("show", { quote })
    }
})

app.get("/i", async(req, res) => {
    const { _id } = req.query;
    let quote = await getQuote()
    const downloadImage = require('./helpers/downloadImage');
    try {
        const message = await ImageMessage.findById(_id)
        let mimeType = message.mimeType.substr(6, message.mimeType.length - 6)
        let filename = `a.${mimeType}`
        downloadImage(message.url, `./public/${filename}`, () => {
            return res.render("bloom", {imageUrl: `/${filename}`})
        })
    } catch (error) {
        return res.render("show", { quote })
    }
})

const PORT = process.env.PORT || 5000
mongoose.connect(process.env.MONGO_CON)
    .then(() => {
        console.log('mongoDB connect');
        return app.listen(PORT, () => console.log(`Server runing at ${PORT}`))
    })
    .catch(err => console.log(err))
