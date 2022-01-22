const downloadImage = require('../helpers/downloadImage');
const getQuote = require('../helpers/getQuote')
const cloudinary = require('../helpers/cloudinary')
const ImageMessage = require('../models/imageMessage')

module.exports.createImage = async(req, res) => {
    const mimeTypeInclude = ['image/jpeg','image/png', 'image/gif']
    let quote = await getQuote()
    try {
        let tempImg = req.files.image;
        if(mimeTypeInclude.includes(tempImg.mimetype)) {
            cloudinary.uploader.upload(tempImg.tempFilePath, { upload_preset: 'luv-sender-pre', resource_type: "auto"}, async(error, result) => {
                if(error) {
                    return res.render("error", { error: "Something is wrong !" })
                } else {
                    const newImageMessage = await ImageMessage.create({
                        url: result.url,
                        mimeType: tempImg.mimetype
                    })
                    let linkResult = [
                        {linkId : newImageMessage._id, type: "i"}, 
                        {linkId : newImageMessage._id, type: "b"} 
                    ]
                    return res.render("new", { host: req.headers.host, linkResult, quote })
                }
            })
        } else {
            return res.render("error", { error: "Wrong type" })
        }
    } catch (error) {
        return res.render("error", { error: "Something is wrong !" })
    }
}

module.exports.getImageApp = async(req, res) => {
    const { _id } = req.query;
    let quote = await getQuote()
    try {
        const message = await ImageMessage.findById(_id)
        let mimeType = message.mimeType.substr(6, message.mimeType.length - 6)
        let filename = `i-${Math.round(Math.random() * 10000)}.${mimeType}`
        downloadImage(message.url, `./public/${filename}`, () => {
            return res.render("bloom", {imageUrl: `/${filename}`, metaImg: `./${filename}`, quote})
        })
    } catch (error) {
        return res.render("show", { quote })
    }
}

module.exports.getBoeveApp = async(req, res) => {
    const { _id } = req.query;
    let quote = await getQuote()
    try {
        const message = await ImageMessage.findById(_id)
        let mimeType = message.mimeType.substr(6, message.mimeType.length - 6)
        let filename = `b-${Math.round(Math.random() * 10000)}.${mimeType}`
        downloadImage(message.url, `./public/${filename}`, () => {
            return res.render("boeve", {imageUrl: `/${filename}`, metaImg: `./${filename}`, quote})
        })
    } catch (error) {
        return res.render("show", { quote })
    }
}