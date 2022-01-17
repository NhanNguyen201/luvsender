const { model, Schema } = require('mongoose')


module.exports = model('ImageMessage', new Schema({
    url :{
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    createdAt: {
        type: String,
        default: new Date().toISOString()
    }   
}));