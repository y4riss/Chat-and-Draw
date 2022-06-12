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

let inactivity = 0 // if  inactivity reaches 30 : clear the white board
let mouseUP = false
let boardCleared = false
const MAX_SECONDS_WITHOUT_DRAWING = 20


let userList =[] // keep track of the users


let rooms = []

io.on('connection',socket=>{

    io.emit("allUsers",userList)


    //when user submit his username
    socket.on("joined",username=>{

        userList.push({
            id : socket.id,
            name : username,
        })
        io.emit("renderRooms",rooms)
        io.emit("allUsers",userList)
                
    })


    //when a user creates a room
    socket.on("new room",(roomname,username,privacy) =>{

        rooms.push({
            host : username,
            name : roomname,
            current_users : [username],
            messages : [],
            lines : [],
            lineCoords : [],
            privacy :privacy
        })
        io.emit("renderRooms",rooms)

    })



    // when a user joins a room
    socket.on("user joins room",(username,roomname)=>{

           
            socket.join(roomname)
            rooms.forEach(room => {
                if(room.name === roomname){
                    if(room.host != username){
                        addUserToRoom(username,roomname)
                    }
                    else return;
                }
            })

            const joinMsg = {
                owner : username,
                msg : "has joined"
            }

            const room = addMessagesToRoom(getRoom(socket.id),joinMsg)

            io.emit("renderRooms",rooms)
            io.to(roomname).emit("onlineUsers",room)
            io.to(roomname).emit('joined',username) // send to the others that belong to room r that user x has joined 
            io.to(roomname).emit('renderPreviousDrawings',room.lines) // render to that user the previous drawings
            io.to(roomname).emit('renderPreviousMessages',room.messages) // render to that user the previous messages.

    })


    // when a user sends a message
    socket.on('sendMessage',msg=>{

        const room = addMessagesToRoom(getRoom(socket.id),msg)
        try{
            io.to(room.name).emit('sendMessage',room.messages)
        }
        catch (error){
            socket.emit("reload")
        }
    })




    //when a user is drawing
    socket.on('userIsDrawing',data=>{

        inactivity = 0
        let room = addLineCoordsToRoom(getRoom(socket.id),data)
        try{
            socket.to(room.name).emit('userIsDrawing',data)
        }catch (error){
            socket.emit("reload")
        }
    })



    // when a user stops drawing
    socket.on('mouseup',()=>{
        //when the user finishes drawing , this function fires , it addes the line to the lines array , and reset the line array
        mouseUP = true
        if(boardCleared) {
            mouseUP =false
            boardCleared = false
        }
        // checkInactivity()
        
        let room = getRoom(socket.id)
        room = addLinesToRoom(room,room.lineCoords)
        room = addLineCoordsToRoom(room,[])

    })

    
    
    //when a user disconnect
    socket.on('disconnect',()=>{
        
        let username
        let room = getRoom(socket.id)
         userList.map(u => {
            if(u.id == socket.id ){
                username = u.name
                return
            }
        })
        if(room){
            if(username != "" && username != undefined){

                const leftmsg = {
                    owner : username,
                    msg : "has left"
                }
                room = addMessagesToRoom(getRoom(socket.id),leftmsg)
                room = removeDisconnectedUserFromRoom(room,username)
                if(roomIsEmpty(room.name)) delete_room((room.name))
                io.emit("renderRooms",rooms)
                console.log(rooms)
                io.to(room.name).emit('left',username)   
                io.to(room.name).emit("onlineUsers",room)
  
            // io.emit('onlineUsers',userList,[])
            }
        }

        userList = userList.filter(user => user.id != socket.id)
        io.emit("allUsers",userList)


        if(userList.length == 0)   rooms = []

    })
})


const removeDisconnectedUserFromRoom = (r,username)=>{

    let ROOM
    rooms.forEach(room =>{
        if(room.name === r.name){
            room.current_users =  room.current_users.filter(user => user != username)
            ROOM = room
            return;
        }
    })
    return ROOM
}

const addLineCoordsToRoom = (r,lineCoords)=>{

    let ROOM
    rooms.forEach(room =>{
        if(room.name === r.name){
            room.lineCoords.push(lineCoords)
            ROOM = room
            return
        }
    })
    return ROOM
}

const addLinesToRoom = (r,line)=>{

    let ROOM
    rooms.forEach(room =>{
        if(room.name === r.name){
            room.lines.push(line)
            ROOM = room
            return
        }
    })
    return ROOM
}

const addMessagesToRoom = (r,message)=>{

    let ROOM 
    rooms.forEach(room =>{
        if(room.name === r.name){
            room.messages.push(message)
            ROOM = room
            return
        }
    })
    return ROOM
    

}

const addUserToRoom = (username,roomname)=>{

        rooms.forEach(room =>{
            if(room.name === roomname){
                room.current_users.push(username);
                return;
            }
        })
}

const roomIsEmpty = (roomname)=>{

    let empty = false
    rooms.map(room =>{
        if(room.name === roomname){
            empty = (room.current_users.length == 0)
            return;
        }
    })
    return empty;
}

// const delete_user = (id)=>{

//     let newUserList = []
//     userList.map(user=>{
//         if(user.id != id ) newUserList.push(user)
//     })
//     return newUserList
// }

const delete_room = (roomname)=>{
    let newRooms = []
    rooms.map(room =>{
        if(room.name != roomname) newRooms.push(room)
    })
    rooms = newRooms
}
const getRoom = (id)=>{

    let username = ""
    userList.forEach(user =>{
        if(user.id === id){
            username = user.name
            return;
        }
    })
    let r = null
    rooms.forEach(room =>{
        if(room.current_users.includes(username)){
            r = room
            return;
        }
    })
    return r
}

// const  sleep = ms => {
//     return new Promise(resolve => setTimeout(resolve, ms));
//   }
  
// const checkInactivity = async ()=>{
//     while(true){
//         if(mouseUP){
//             mouseUP = false
//             break
//         }
//         await sleep(1000)

//         if(inactivity === MAX_SECONDS_WITHOUT_DRAWING ) {
//             io.emit('clearBoard')
//             lineCoords = []
//             lines = []
//             io.emit('renderPreviousDrawings',lines)
//             boardCleared = true
//             inactivity = 0
//             break
//         }

//         inactivity++

//     }
// }

// checkInactivity()



const PORT = process.env.PORT || 3000

server.listen(PORT,()=>{
    console.log("http://localhost:"+PORT)
})

