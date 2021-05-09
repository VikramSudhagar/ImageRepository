const { response } = require('express')
const {format} = require('util')
const storage = require('../config/')
const gc = require('../config/')


const bucket = gc.bucket(process.env.BUCKET_NAME)

/**
 *
 * @param { File } object file object that will be uploaded
 * @description - This function does the following
 * - It uploads a file to the image bucket on Google Cloud
 * - It accepts an object as an argument with the
 *   "originalname" and "buffer" as keys
 */

const message = 'Please upload an image'

const deleteAllMessage = 'The repository is already empty'


const fileExists = async(fileName) => {
  const file = bucket.file(fileName)
  const result =  await file.exists()
  return result[0]
}

const uploadImage = (file) => new Promise((resolve, reject) => {

  const { originalname, buffer } = file

  const blob = bucket.file(originalname.replace(/ /g, "_"))

  const fileExt = blob.name.split('.').pop().toLowerCase().trim()

  if(fileExt !== "jpg" && fileExt !== "jpeg" && fileExt !== "png") {
    reject(message)
  } else {
    
    fileExists(blob.name).then((data) => {

      const result = data
  
      if(result === true) {
        reject("The file already exists")
      } else {
        const blobStream = blob.createWriteStream({
          resumable: false
        })
    
          blobStream.on('finish', () => {
            const publicUrl = format(
              `https://storage.googleapis.com/${bucket.name}/${blob.name}`
            )
            resolve(publicUrl)
          })
          .on('error', () => {
            reject(`Unable to upload image, something went wrong`)
          })
          .end(buffer)
    
      }
  
    })
  }
})

const deleteAllImages = () => new Promise((resolve, reject) => {

  try {
    bucket.getFiles().then( result =>{
        if(result[0].length != 0) {
          bucket.deleteFiles().then(result => {
            
            resolve("Files were successfully deleted")
          }, reason => {
            return reject(reason)
          })
          
        } else {
          reject("The repository is already empty")
        }
     
    }, reason => {
      return reject(reason)
    })

    .catch((error) => {
      reject(error.message)
    })
      
    
  } catch(error) {
    reject({
      message: error,
      code: "404"
    })

  }

})


const deleteImage = (fileName) => new Promise((resolve, reject) => {
  try {

      storage.bucket(process.env.BUCKET_NAME)
      .file(fileName)
      .delete()
      .then ((response) => {
        resolve(response)
      },
       reason => {
        reject({
          message: reason.errors[0].message,
          code: reason.code
        })
       })
      

  } catch(error){
    reject(`There was an error: ${error}`)
  }
})

module.exports = {
  uploadImage,
  deleteImage,
  deleteAllImages
}