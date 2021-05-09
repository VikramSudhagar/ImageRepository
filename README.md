# ImageRepository

- Created an Image Repository API using Node.js and Express

- Images are uploaded and deleted from GCP Storage Bucket

- Implemented JWT for authentication when performing API functionalities

To run the application, the user needs to make a gcp account and create a service account. When creating a service account, you will download a .json key that needs to be added into index.js in the config folder. Follow this link for more instructions: https://cloud.google.com/iam/docs/creating-managing-service-account-keys

To run MongoDB, the user needs to install MongoDB first, then needs to create a folder for the data. Then, before starting the server, always run the path of the data folder into the terminal.
For example, I would run this path: D:\MongoDB\bin\mongod.exe --dbpath=D:\MongoDB-data

Installing MongoDB:

https://docs.mongodb.com/manual/installation/

https://www.mongodb.org/dl/win32/i386

To run the application/start the server run the command: npm run start

To run the test cases for the application, run the command: npm run test

Please read the ImageRepositoryDocumentation to learn more about the API requests
https://github.com/VikramSudhagar/ImageRepository/blob/main/ImageRepositoryDocumentation.pdf
