const validator = require('validator')
const mongoose = require('mongoose')


const imageSchema = new mongoose.Schema({

    url: {
        type: String,
        required: true,
        validate(url){
            if(!validator.isURL(url)){
                throw new Error('Can only store a image URL')
            }
        }
    } ,

    name : {
        type: String,
        required: true
    },
    
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }

})

const Image = mongoose.model('image', imageSchema)

module.exports = Image