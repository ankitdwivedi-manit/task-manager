const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const Task = require('../models/task')
const dotenv = require('dotenv')


const userSchema = new mongoose.Schema({
    name:{
        type : String, 
        required : true,
        trim : true
    },
    age:{
        type : Number,
        default : 0,
        validate(value){
            if(value < 0){
                throw new Error('Age must be positive!');
            }
        }
    },
    email:{
        type : String,
        required : true,
        unique: true,
        trim : true,
        lowercase : true,
        validate(val){
            if(!validator.isEmail(val)){
                throw new Error('not an email!');
            }
        }
    },
    password :{
        type : String,
        required : true,
        trim : true,
        minlength : 7,
        validate(val){
            if(val.toLowerCase().includes('password')){
                throw new Error('password must not contain "password" as substring');
            }
        }
    },
    tokens:[{
        token:{
        type: String,
        required: true
    }}],
    avtar:{
        type: Buffer
    }
},{
    timestamps: true
});


userSchema.virtual('tasks', {
    ref : 'Tasks',
    localField : '_id',
    foreignField : 'owner'
})

//note:-
//static methods are accessible on models, also called model methods.
//methods are accessible on instances

userSchema.statics.findByCredentials = async(email, password)=>{
    const user = await User.findOne({email})

    if(!user)
        throw new Error('error occured in login')

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch)
        throw new Error('error occured in login')

   return user
}

userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({'id':user._id.toString()}, `${process.env.JWT_SCERET}`, {expiresIn: '30d'})
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avtar
    return userObject
}

userSchema.pre('save', async function(next){
   const user =  this;
   if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
   }
   next();
});

userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})

const User = mongoose.model('User', userSchema);

module.exports = User;