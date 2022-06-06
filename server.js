//express
const express = require("express")
const app = express()
app.set('view engine','ejs')
app.use(express.static('public'))

//server
const http = require("http")
const server = http.createServer(app)

//socket
const {Server} = require("socket.io")
const io = new Server(server)


app.get('/',(req,res)=>{
    res.render('index')
})


let userList = []

io.on('connection',socket=>{


    socket.on('addUser',user=>{
        userList.push({
            id : socket.id,
            username : user
        })
        io.emit('renderUser',userList)

    })



    socket.on('mousedown',data=>{
        socket.broadcast.emit('mousedown',data)
    })
    socket.on('mousemove',data=>{
        socket.broadcast.emit('mousemove',data)
    })
    
    socket.on('disconnect',()=>{
        userList = userList.filter(user=> user.id != socket.id)
        io.emit('renderUser',userList)

    })

})


const PORT = 3000
server.listen(PORT,()=>{
    console.log(`listening on port ${PORT}...`)
})

