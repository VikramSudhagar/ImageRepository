const request = require('supertest')
const app = require('../app')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { response } = require('express')
const mongoose = require('mongoose')
const Image = require('../models/image')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'Steve',
    email: 'stevethebuilder@example.com',
    password: 'testing123',
    tokens: [{
        token: jwt.sign({_id: userOneId}, 'aabbccproject')
    }]
}

test('Should signup a new user' , async() => {
    const response = await request(app).post('/users').send({
        name: 'Steve',
        email: 'stevethebuilder@example.com',
        password: 'testing123'
    }).expect(200)
    //Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // clean up the database
    await User.findOneAndDelete({_id: response.body.user._id})
    
})

//Test 1 - Does login work correctly
test('Should login without error', async() => {
    await new User(userOne).save()
    const response = await request(app).post('/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should upload a document which does not exist in the database', async () => {
    await request(app)
    .post('/uploads')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('file','tests/fixtures/picture.jpg')
    .expect(200)
})

test('Should delete existing documents in the database', async() => {
    const response = await Image.find({name: 'picture.jpg'})
    response.map(image =>   console.log("imageid:" +image._id))
    await request(app)
    .delete(`/delete/${response[0]._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}}`)
    .send()
    .expect(200)

})

//Test 4 - Does delete work?

//Test 5 - If I delete an image that does not exist, do I get an error?

//Test 6 - If I upload an image with a similar name, will I get a message sayin "That file already exists"