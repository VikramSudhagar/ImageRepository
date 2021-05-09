const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const {uploadImage, deleteImage, deleteAllImages} = require('./helpers/helper')
const User = require('./models/user.js')
const Image = require('./models/image.js')
const auth = require('./middleware/auth')

require('./db/mongoose')

const app = express()

const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    // no larger than 5mb.
    fileSize: 5 * 1024 * 1024,
  },
})

app.disable('x-powered-by')
app.use(multerMid.single('file'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))


app.post('/login', async(req, res) => {

  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)

    const token = await user.generateAuthToken()
    res.send({user, token})
  } catch(e) {
    //Message is display with error to not give away information
    res.send(400)
  }

})

app.post('/logout', auth, async(req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
        return token.token !== req.token
    }) 
    await req.user.save()

    res.send()
  } catch(e) {
    res.status(500).send()
  }
})

app.post('/users', async(req, res) => {

  const user = new User(req.body)

  try {
    await user.save()
    user.generateAuthToken()
    res.status(200).send({
      user
    })
  } catch(error) {
    console.log(error)
    res.status(400).send(error)
  }

})

app.post('/uploads', auth, async (req, res, next) => {

  try {
    //myFile will store a file object from the request
    const myFile = req.file

    //First upload image to GCP
    const imageUrl = await uploadImage(myFile)

    //Second upload image url to MongoDB along with UserId
    const userId = req.user.id

    const imageDatabase = new Image({
      url: imageUrl,
      owner: req.user._id,
      name: myFile.originalname
    })
    
    const imageObject = await imageDatabase.save()

    res
    .status(200)
    .json({
      message: "Upload was successful",
      data: imageUrl
    })

  } catch (error) {

    if(error == "Please upload an image") {
      res
        .status(300)
        .json({
          message: `${error}`
        })
    } else if(error == 'The file already exists') {
      res.
      status(300)
      .json({
        message: `${error}`
      })
    } else {
      next(error)
    }
  }
})

app.delete('/deleteAll', auth, async (req, res) => {

  try {
    //delete from gcp
    deleteAllImages()

    res.
      status(200)
      .json({
        message: "Deleting all files was successful"
      })
  } catch(error) {

    res.
      status(error.code)
      .json({
        message: error
      })

  }

})

app.delete('/delete/:id', auth, async(req, res) => {

  try {

    const imageObj = await Image.findOneAndDelete({_id: req.params.id, owner: req.user._id})

    
    //Deleted file from GCP
    const deleteFile = await deleteImage(imageObj.name)

      res
      .status(200)
      .json({
        message: "Delete was successful in index"
      })

  } catch(error) {
    res
      .status(404)
      .json({
        message: error.message
      })
  }  
})

app.use((err, req, res, next) => {
  res.status(500).json({
    error: err,
    message: 'Internal server error!',
  })
  next()
})

module.exports = app