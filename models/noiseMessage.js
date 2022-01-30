const { model, Schema } = require('mongoose')


module.exports = model('NoiseMessage', new Schema({
    nameText: {
        required: true,
        type: String
    },
    createdAt: {
        type: String,
        default: new Date().toISOString()
    }   
}));