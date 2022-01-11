const { model, Schema } = require('mongoose')


module.exports = model('Message', new Schema({
    firstText: {
        required: true,
        type: String
    },
    secondText: {
        required: true,
        type: String
    },
    createdAt: {
        type: String,
        default: new Date().toISOString()
    }   
}));