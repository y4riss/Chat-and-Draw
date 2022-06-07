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
let lines = [] // each element is an array that has the line that has been drawing up until now
let lineCoords = [] // holds the info about a line in the board ( x , y , width , color)

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
        socket.emit('renderPreviousDrawings',lines) // when a user get added , the server sends to that user the informations about the
        // current board ( the lines that had been drew up until now , and they get rendered)

    })


    // mousedown and mousemove are sent by the client who is currently drawing , and the server sends the data (coords , color , linewidth)
    // to all the clients except the one drawing because he already sees what he's drawing.
    socket.on('mousedown',data=>{
        lineCoords.push(data) // this represents the first element of lineCoords array , which is the coords of where the line begins
        socket.broadcast.emit('mousedown',data)
    })
    socket.on('mousemove',data=>{
        lineCoords.push(data) // and these are the rest of the coords along with the color and width
        socket.broadcast.emit('mousemove',data)
    })

    socket.on('mouseup',()=>{
        //when the user finishes drawing , this function fires , it addes the line to the lines array , and reset the line array
        lines.push(lineCoords)
        lineCoords = []
    })
    
    // when a user disconnect , it gets removed from the userList
    // and then we reRender the userList with the new UserList
    socket.on('disconnect',()=>{
        userList = userList.filter(user=> user.id != socket.id)
        if(userList.length > 0)    io.emit('renderUser',userList)
        else{
            lineCoords = []
            lines = []
        }


    })

})


const PORT = 3000
server.listen(PORT,()=>{
    console.log(`listening on port ${PORT}...`)
})

