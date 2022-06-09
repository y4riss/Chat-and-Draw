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


let lines = [] // each element is an array that has the line that has been drawing up until now
let lineCoords = [] // holds the info about a line in the board ( x , y , width , color)
let inactivity = 0 // if  inactivity reaches 30 : clear the white board
let mouseUP = false
let boardCleared = false
const MAX_SECONDS_WITHOUT_DRAWING = 20


let userList =[] // keep track of the users
let messages = []

io.on('connection',socket=>{
    
    // addUser event is sent by a user when submitting its username 
    // the function takes the user , create an object with socket id as the user id , and username as what the user provided
    // the object gets pushed to the userList , and the userList is sent to every client to get rendered to the DOM

       
         // when a user get added , the server sends to that user the informations about the
        // current board ( the lines that had been drawn up until now , and they get rendered)

    socket.on("joined",username=>{

        userList.push({
            id : socket.id,
            user : username,
        })

        messages.push({
            user : username,
            msg : "has joined the room"
        })
        
        io.emit('userNumber',userList.length) // send the number of users
        socket.broadcast.emit('joined',username) // send to the others that user x has joined 
        socket.emit('renderPreviousDrawings',lines) // render to that user the previous drawings
        socket.emit('renderPreviousMessages',messages) // render to that user the previous messages.
    })


    socket.on('sendMessage',data=>{
        messages.push(data)
        io.emit('sendMessage',messages)
    })


    socket.on('userIsDrawing',data=>{
        inactivity = 0
        lineCoords.push(data) // and these are the rest of the coords along with the color and width
        socket.broadcast.emit('userIsDrawing',data)
    })

    socket.on('mouseup',()=>{
        //when the user finishes drawing , this function fires , it addes the line to the lines array , and reset the line array
        mouseUP = true
        if(boardCleared) {
            mouseUP =false
            boardCleared = false
        }
        checkInactivity()
        lines.push(lineCoords)
        lineCoords = []

    })
    
    // when a user disconnect , it gets removed from the userList
    // and then we reRender the userList with the new UserList
    socket.on('disconnect',()=>{
        let username
         userList.map(u => {
            if(u.id == socket.id ){
                username = u.user
                return
            }
        })
        userList = userList.filter(user => user.id != socket.id)
        if(username != "" && username != undefined){
            messages.push({
                user : username,
                msg : "has left the room"
            })
            socket.broadcast.emit('left',username) // send to the others that user x has joined \
            io.emit('userNumber',userList.length)

        }
      
        

        if(userList.length == 0)   
        {
            lineCoords = []
            lines = []
            messages = []
        }

    })



})



const  sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
const checkInactivity = async ()=>{
    while(true){
        if(mouseUP){
            mouseUP = false
            break
        }
        await sleep(1000)

        if(inactivity === MAX_SECONDS_WITHOUT_DRAWING ) {
            io.emit('clearBoard')
            lineCoords = []
            lines = []
            io.emit('renderPreviousDrawings',lines)
            boardCleared = true
            inactivity = 0
            break
        }

        inactivity++

    }
}

checkInactivity()

const PORT = process.env.PORT || 3000

server.listen(PORT,()=>{
    console.log("http://localhost:"+PORT)
})

