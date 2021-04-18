const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const taskSchema = new mongoose.Schema({
    description :{
        type : String,
        required : true,
        trim : true
    },
    completed :{
        type : Boolean,
        default : false
    },
    owner:{
        type: mongoose.Schema.ObjectId,
        required : true,
        ref : 'User'
    }
},{
    timestamps: true
});



const Tasks = mongoose.model('Tasks', taskSchema);

module.exports = Tasks;