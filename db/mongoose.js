const mongoose = require('mongoose')

const db = mongoose.connection;

//Connect to mongodb
//Values within mongoose.connect are set to fix deprecation warnings
mongoose.connect(process.env.MONGODB_URL, 
{
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
})
