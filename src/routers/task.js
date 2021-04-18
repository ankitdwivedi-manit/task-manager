const express = require('express');
const router = new express.Router();
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth')

const Task = require('../models/task');

router.post('/tasks', auth ,async (req, res)=>{
    try{
        const task = new Task({...req.body, owner : req.user._id});
        await task.save();
        res.status(201).send(task);
    }catch(error){
        res.status(400).send(error);
    }
})


// /tasks?completed=true&limit=5&skip=0
router.get('/tasks', auth, async (req, res)=>{
    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed == 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] =( parts[1] === 'desc') ? -1 : 1
    }

    try{
        // const tasks = await Task.find({owner : req.user._id})
        // res.send(tasks);
        await req.user.populate({
            path : 'tasks',
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort : sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    }catch(error){
        res.status(500).send(error);
    }
})

router.get('/tasks/:id', auth ,async (req, res)=>{
    try{
        const _id = req.params.id;
        const task = await Task.findOne({_id, owner:req.user._id} )
        if(!task){
            return res.status(404).send();
        }
        res.send(task);
    }
    catch(error){
        res.status(500).send();
    }
})

router.patch('/tasks/:id', auth ,async (req, res) => { 
    const validUpdates = ["description", "completed"];
    const updates = Object.keys(req.body);

    const isValidOperation = updates.every((update)=> validUpdates.includes(update));

    if(!isValidOperation){
        return res.status(404).send("not a valid operation");
    }

    try{
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {'new' :true ,'runValidators' : true});
        // const task = await Task.findById(req.params.id); 
        const task = await Task.findOne({_id : req.params.id, owner : req.user._id}); 
        if(!task){
            return res.status(404).send(task);
        }
        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
        res.send(task);
    }
    catch(e){
        res.status(500).send();
    }
})

router.delete('/tasks/:id',auth ,async (req, res) => {

    try{
        // const task = await Task.findByIdAndDelete(req.params.id);
        const task = await Task.findOneAndDelete({_id:req.params.id, owner : req.user._id});
        if(!task){
            return res.status(404).send();
        }
        res.status(201).send(task);
    }catch(e){
        res.status(500).send(e);
    }

})

module.exports = router;
