const getQuote = require('../helpers/getQuote')
const Message = require('../models/message')
const NoiseMessage = require('../models/noiseMessage')
const removeAscent = require('../helpers/removeAscent')

module.exports.createText = async(req, res) => {
    try {
        const newMessage = await Message.create({
            firstText:  removeAscent(req.body.firstText),
            secondText: removeAscent(req.body.secondText)
        })
        let quote = await getQuote()
        let linkResult = [{linkId : newMessage._id, type: "t"}]
        return res.render("new", { host: req.headers.host, linkResult, quote })   
    } catch (error) {
        return res.render("error", { error: "Something is wrong !" })
    }
}
module.exports.createNoiseText = async(req, res) => {
    try {
        const newMessage = await NoiseMessage.create({
            nameText:  removeAscent(req.body.nameText),
        })
        let quote = await getQuote()
        let linkResult = [{linkId : newMessage._id, type: "nt"}]
        return res.render("new", { host: req.headers.host, linkResult, quote })   
    } catch (error) {
        return res.render("error", { error: "Something is wrong !" })
    }
}

module.exports.getTextApp = async(req, res) => {
    const { _id } = req.query;
    let quote = await getQuote()
    try {
        const message = await Message.findById(_id)
        return res.render("show", {firstText: message.firstText, secondText: message.secondText, quote})
    } catch (error) {
        return res.render("show", { quote })
    }
}

module.exports.getNoiseTextApp = async(req, res) => {
    const { _id } = req.query;
    let quote = await getQuote()
    try {
        const message = await NoiseMessage.findById(_id)
        return res.render("noiseText", { nameText: message.nameText, quote})
    } catch (error) {
        return res.render("show", { quote })
    }
}