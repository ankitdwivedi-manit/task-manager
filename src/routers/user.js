const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail, sendCancelationEmail} = require('../emails/account')

router.post('/users', async (req, res)=>{
    const user = new User(req.body);
    try{
        await user.save()
        sendWelcomeEmail(user.name, user.email)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    }
    catch(error){
        console.log(error)
        res.status(400).send(error);
    }
 })

router.post('/users/login', async(req, res)=>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (error) {
        res.status(404).send()
    }
})

router.post('/users/logout', auth ,async (req, res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth ,async (req, res)=>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})


router.get('/users/me', auth, async (req, res)=>{
    res.send(req.user)
})



router.patch('/users/me', auth, async(req, res)=>{

    const updates = Object.keys(req.body);
    const allowedUpadtes = ["name", "age", "password", "email"];
    const isValidOperation = updates.every((update) => allowedUpadtes.includes(update));

    if(!isValidOperation){
        res.status(400).send("error : invalid updates!");
    }

    try{
        
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {'new' :true, 'runValidators' : true});
        // imp: findByIdAndUpdate() method bypasses mongoose(it performs direct operation on database), updating user 
        // as below so that middleware runs correctly
        
        //note if the things are are done dynamically then we have to use bracket notaion like user[update]
        const user = req.user;
        updates.forEach((update) => user[update] = req.body[update]);
        await user.save();

        if(!user){
            return res.status(404).send();
        }
        res.send(user);
    }
    catch(error){
        res.status(400).send(error);
    }
})

router.delete('/users/me', auth , async (req, res) => {
    try{
        await req.user.remove()
        sendCancelationEmail(req.user.name, req.user.email)
        res.send(req.user);
    }catch(e){
        res.status(500).send(e);
    }

})

const upload = multer({
    // dest : 'avtar',
    limits:{
        fileSize:1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('please upload img'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avtar', auth, upload.single('avtar'), async (req, res)=>{
    const buffer = await sharp(req.file.buffer).resize({width: 250, height:250}).png().toBuffer()
    req.user.avtar = buffer
    // req.user.avtar = req.file.buffer
    await req.user.save()
    res.send()
}, (error, req, res, next)=>{
    res.status(404).send({error : error.message})
})

router.delete('/users/me/avtar', auth, async (req, res)=>{
    req.user.avtar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avtar',async (req, res)=>{
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avtar){
            throw new Error()
        }
        res.set('content-type', 'image/png')
        res.send(user.avtar)
    } catch (error) {
        res.status(404).send()
    }
})

module.exports = router;