const mongoose = require('mongoose');
const dotenv = require('dotenv')


const connDB = async ()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URL, {
            useUnifiedTopology:true,
            useNewUrlParser:true,
            useCreateIndex:true
        })
        console.log(`mongodb connected: ${conn.connection.host}`)
    }
    catch(error){
        return console.log(`Error : ${error.message}`)
    }
}
module.exports = connDB


// mongoose.connect( process.env.MONGO_URL.toString(),{
//     useNewUrlParser:true,
//     useCreateIndex: true,
//     useUnifiedTopology: true,
//     useFindAndModify: false
// });