//express
const express = require("express")
const app = express()

app.use(express.static('public'))

//server
const http = require("http")
const server = http.createServer(app)

//socket
const {Server} = require("socket.io")
const io = new Server(server)


app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/index.html')
})


let userList = [] //list of current users
let metaData = [] // idea : when a new user comes , render what has been drew before 

//this fires when a connection is established ( new client connected)
io.on('connection',socket=>{
    //update user list whenever a client reaches
    io.emit('renderUser',userList)

    // addUser event is sent by a user when submitting its username 
    // the function takes the user , create an object with socket id as the user id , and username as what the user provided
    // the object gets pushed to the userList , and the userList is sent to every client to get rendered to the DOM
    socket.on('addUser',user=>{
        userList.push({
            id : socket.id,
            username : user
        })
        io.emit('renderUser',userList)
        console.log(userList)

    })


    // mousedown and mousemove are sent by the client who is currently drawing , and the server sends the data (coords , color , linewidth)
    // to all the clients except the one drawing because he already sees what he's drawing.
    socket.on('mousedown',data=>{
        socket.broadcast.emit('mousedown',data)
    })
    socket.on('mousemove',data=>{
        socket.broadcast.emit('mousemove',data)
    })
    
    // when a user disconnect , it gets removed from the userList
    // and then we reRender the userList with the new UserList
    socket.on('disconnect',()=>{
        userList = userList.filter(user=> user.id != socket.id)
        io.emit('renderUser',userList)
        console.log(userList)

    })

})


const PORT = 3000
server.listen(PORT,()=>{
    console.log(`listening on port ${PORT}...`)
})

