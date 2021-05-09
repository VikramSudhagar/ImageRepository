const validator = require('validator')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Image = require('./image')

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true  
    },

    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }

        }
    },

    password: {
        type: String,
        required: true
    },

    tokens: [{
        token: {
            type: String, 
            required: true
        }
    }]
})


userSchema.virtual('images', {
    ref: 'Image',
    localField: '_id',
    foreignField: 'owner'
})



//Hashing the password
userSchema.pre('save', async function (next) {
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token})
    await user.save()
   
    return token
}


userSchema.statics.findByCredentials = async function(email, password) {

    const user = await User.findOne({email})

    if(!user) {
        throw new Error('Unable to login')
    }

    const match = await bcrypt.compare(password, user.password)

    if(!match) {
        throw new Error('Unable to login')
    }

    return user

}


const User = mongoose.model('User', userSchema)

module.exports = User
