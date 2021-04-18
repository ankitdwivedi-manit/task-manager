const express = require('express');
const dotenv = require('dotenv')
const conndb = require('./db/mongoose');
dotenv.config()
conndb()

const bcrypt = require('bcrypt');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const PORT = process.env.PORT;


app.use(express.json())
app.use(userRouter);
app.use(taskRouter);

// without middleware :   new request -> run route handler
// with middleware : new request -> do something -> route handler


app.listen(PORT, ()=>{
    console.log(`server is up on port ${PORT}`)
})

const multer = require('multer')
const upload = multer({
    dest : 'images'
})
app.post('/upload', upload.single('upload') ,(req, res)=>{

    res.send()
})
































// ----------------------------------------------------------------------------

// const Task = require('./models/task')
// const User = require('./models/user')
// const main = async ()=>{
    // const task = await Task.findById('604a4b566d0594218445d6ee')
    // await task.populate('owner').execPopulate()
    // console.log(task.owner)
//     const user = await User.findById('604a4a95edbfa129dc64b988')
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)
// }
// main()