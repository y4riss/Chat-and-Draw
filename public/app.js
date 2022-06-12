const socket = io();

const userInput = document.querySelector("#userInput");
const container = document.querySelector(".container");
const login = document.querySelector(".login");
const roomsPage = document.querySelector(".rooms");
const roomInput = document.querySelector("#createRoom");
const emptyString = /^\s*$/

let username = ""
let currentRoom = null
let userList = []
let rooms = []

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth / 1.35
canvas.height = window.innerHeight / 1.35

let color = "white"
let lineWidth = 2
let currentBrush = 2
let brushColor = color
ctx.lineWidth = lineWidth;




// this function is fired when the user enters his username
// if username is valid ( not empty , doesnt already exist) , it gets added to userList by sending it to the server
// and the drawing page gets shown
const handle_username = e=>{
        console.log(userList)
        e.preventDefault()
        username = userInput.value.trim()
        const found = userList.some(user => user.name === username);
        if(found){
            alert("username already exists")
        }
        else if(username.match(emptyString)) alert("username must not be empty")
        else if(username.length > 10){
            alert("username must be under 10 characters")
        }
        else{
            socket.emit('joined',username);
            login.classList.add("hide");
            roomsPage.classList.remove("hide");
            //document.getElementById("chatInput").placeholder = ` ${username}, type your message here...`;
        }
        userInput.value = ""
}

const handle_roomname = e=>{

    e.preventDefault()
    roomname = roomInput.value
    if(rooms.some(room => room.name === roomname)){
        alert("room already exists")
    }
    else if(roomname.match(emptyString)) alert("room name must not be empty")
    else if(roomname.length > 10){
        alert("room name must be under 10 characters")
    }
    else{
        const popup = document.querySelector(".popup")
        popup.classList.add("show")
        roomInput.disabled = true
        document.getElementById("publicBtn").onclick = ()=>{
            const privacy = {
                private : false,
                key : null
            }
            socket.emit("new room",roomname,username,privacy)
            enterRoom(roomname)
            popup.classList.remove("show")
        }
        document.getElementById("privateBtn").onclick = ()=>{
            let key = shuffle(ascii_to_hex(username+roomname).split("")).join("")
            while(key.length < 10){
                key +=  (Math.floor(Math.random() * 9)+"");
            }
            const privacy = {
                private : true,
                key : key
            }
            const popupOfKey = document.querySelector(".popupOfKey")
            const p = document.createElement("p")
            const img = document.createElement("img")
            img.src = "x.svg"
            p.innerHTML= `Your key is : <strong> ${key} </strong>, share it with your friends to join the room`
            p.appendChild(img)
            popupOfKey.appendChild(p)
            popupOfKey.classList.add("show")
            socket.emit("new room",roomname,username,privacy)
            enterRoom(roomname)
            popup.classList.remove("show")
            img.onclick = ()=>{
                popupOfKey.classList.remove("show")
                showKeyInChat(key)
            }
        }
    }
    roomInput.value = ""
}

const showKeyInChat = key =>{
    const div = document.querySelector(".chat-messages")
    const ul = document.querySelector(".message-list")
    const p = document.createElement("p")
    p.innerHTML = `Your key is : <strong> ${key} </strong>, share it with your friends to join the room`
    div.insertBefore(p,ul)
}

const handleCustomColor = input =>{
    
    const c = input.value
    const colorChecker = /^#[a-f0-9]{6}$/ig
    const customColor = document.querySelector(".customColor")
    if(c.match(colorChecker))
    drawingColor(c,customColor)

}

// this function handles the color choice
const drawingColor = (c,element)=>{
    document.body.style.cursor = "url(data:image/x-icon;base64,AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAEAAAAAAAAAAA4f8AAAAAAKjP8ADjkPAABLTMALBwugCQs9EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAERURERERERERVVERERERERM1URERERERMzMUQRERERETMRREEREREREQAURBERERERAAFEQREREREQABREEREREREAAURBERERERAAFEQREREREQABREEREREREAAURBERERERAAFGYREREREQACZhERERERECIhERERERERIhHH/wAAg/8AAAH/AAAA/wAAAH8AAIA/AADAHwAA4A8AAPAHAAD4AwAA/AEAAP4AAAD/AAAA/4AAAP/AAAD/4AAA),auto";
    color = c
    const input = document.querySelector("#inputColor")
    const customColor = document.querySelector(".customColor")
    input.value= c
    customColor.style.background = c


    brushColor = color
    const colors = document.getElementsByClassName("color");
    for(let i = 0 ; i < colors.length ; i++){
        colors[i].classList.remove("active")
    }
    
    //when selecting a color , deselect the eraser and select the pencil :
    if(currentBrush === 30){
        document.getElementsByClassName("b")[4].classList.remove("active")
        document.getElementsByClassName("b")[0].classList.add("active")
        currentBrush = 2
    }

        lineWidth = currentBrush
        element.classList.add("active")


}

const setLineWidth = (width,element)=>{

        if(width ===30){
        color = "black"
        document.body.style.cursor = "url(data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAD/AAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/8/Pz//Pz8/+Pj4/8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/8/Pz//Pz8/7W1tf+1tbX/4+Pj/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/tbW1//z8/P/8/Pz//Pz8/7W1tf/j4+P/AAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/7W1tf/Z2dn/2dnZ/9nZ2f/Z2dn/tbW1/+Pj4/8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8nuI//J7iP/ye4j/8nuI//J7iP/ye4j/8nuI//AAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/2zrx//J8OX/yfDl/8nw5f/J8OX/J7iP/ye4j/8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/bOvH/2zrx//J8OX/yfDl/8nw5f8nuI//J7iP/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP9s68f/bOvH/8nw5f/J8OX/yfDl/ye4j/8nuI//AAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/2zrx/9s68f/bOvH/2zrx/9s68f/J7iP/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAx/8AAIP/AAAB/wAAAP8AAAB/AACAPwAAwB8AAOAPAADwBwAA+AMAAPwDAAD+BwAA//8AAP//AAD//wAA//8AAA==),auto";
        }

    else{
        color = brushColor
        document.body.style.cursor = "url(data:image/x-icon;base64,AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAEAAAAAAAAAAA4f8AAAAAAKjP8ADjkPAABLTMALBwugCQs9EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAERURERERERERVVERERERERM1URERERERMzMUQRERERETMRREEREREREQAURBERERERAAFEQREREREQABREEREREREAAURBERERERAAFEQREREREQABREEREREREAAURBERERERAAFGYREREREQACZhERERERECIhERERERERIhHH/wAAg/8AAAH/AAAA/wAAAH8AAIA/AADAHwAA4A8AAPAHAAD4AwAA/AEAAP4AAAD/AAAA/4AAAP/AAAD/4AAA),auto";

    }
        const brushes = document.getElementsByClassName("b");
        for(let i = 0 ; i < brushes.length ; i++){
            brushes[i].classList.remove("active")
        }
        currentBrush = width
        lineWidth = currentBrush
        element.classList.add("active")
    
}

const handleKeyDown = e =>{

    if(e.keyCode == 13) sendMessage();
}

const sendMessage = () =>{

    const inputMessage = document.querySelector("#chatInput")
    const message = inputMessage.value

    inputMessage.value = ""
 
    if(!message.match(emptyString))
    socket.emit('sendMessage',{owner : username , msg : message})
    
}
const displayMessages = messages =>{
    const ul = document.querySelector(".message-list");
    const chatMessagesDiv = document.querySelector(".chat-messages");
    let className = "user"
    ul.innerHTML = '';
    messages.map(line =>{
        
        if(line.msg == "has joined")  connectionAlert(line.owner,"joined") 
        else if(line.msg == "has left") connectionAlert(line.owner,"left") 
        else{
            if(username == line.owner) className = "currentUser"
            else className = "user"
            const li = document.createElement("li");
            const span = document.createElement("span")
            const span2 = document.createElement("span")
            span.classList.add(`${className}`)
            span.textContent = `${line.owner}`
            span2.textContent = ` : ${line.msg}`
            li.appendChild(span)
            li.appendChild(span2)
            ul.appendChild(li);
        }
    })
    chatMessagesDiv.scrollTo(0, chatMessagesDiv.scrollHeight);
}
const connectionAlert = (user,action)=>{
    const ul = document.querySelector(".message-list");
    const li = document.createElement("li");
    let verbHave = "has"
    if(user == username) {
        user = "You"
        verbHave = "have"
    }
     li.textContent = user + " " + verbHave + " "  + action;
    li.classList.add("joinLeave")
    ul.appendChild(li);

}

const enterRoom = (roomname)=>{
    socket.emit("user joins room",username,roomname)
    connectionAlert(username,"joined")
    document.body.style.cursor = "url(data:image/x-icon;base64,AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAEAAAAAAAAAAA4f8AAAAAAKjP8ADjkPAABLTMALBwugCQs9EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAERURERERERERVVERERERERM1URERERERMzMUQRERERETMRREEREREREQAURBERERERAAFEQREREREQABREEREREREAAURBERERERAAFEQREREREQABREEREREREAAURBERERERAAFGYREREREQACZhERERERECIhERERERERIhHH/wAAg/8AAAH/AAAA/wAAAH8AAIA/AADAHwAA4A8AAPAHAAD4AwAA/AEAAP4AAAD/AAAA/4AAAP/AAAD/4AAA),auto";
    roomsPage.classList.add("hide");
    container.classList.remove("hide");
    document.getElementById("chatInput").placeholder = ` ${username}, type your message here...`;
}

const handleRoomKey = (e)=>{
    e.preventDefault()

    const inputKey = document.getElementById("inputKey")

    if(inputKey.value.trim() === currentRoom.privacy.key) {
        const enterKeyPage = document.querySelector(".enterKey")
        enterKeyPage.classList.remove("show")
        enterRoom(currentRoom.name)}

    else{
        alert("invalid key")
    }
    inputKey.value = ""

}
/* ______________________________________________________SOCKETS______________________________________________*/

socket.on("allUsers",users=>{
    userList = users
    const allUsers = document.querySelector(".allUsers")
    allUsers.textContent = `Current users : ${userList.length}`
})

socket.on("onlineUsers",room=>{
    currentRoom = room
    const onlineUsers = document.querySelector(".online-users")
    const welcomeMessage = document.querySelector(".chat-title")
    onlineUsers.textContent = `Online users : ${room.current_users.length}`
    welcomeMessage.textContent = `Welcome to ${room.name}`
})


socket.on('sendMessage',messages=>{

    displayMessages(messages)

})

socket.on('joined',user=>{
    connectionAlert(user,"joined")
})

socket.on('left',user=>{
    connectionAlert(user,"left")
})


const startDrawing = (x,y,c,l)=>{
    ctx.beginPath()
    ctx.fillStyle = c
    ctx.arc(x,y,l, 0, Math.PI*2);
    ctx.fill();
}


// mousedown and mousemove events are sent by the server to all clients , to update the screen in real time

socket.on("renderRooms",allRooms=>{
    console.log(allRooms)
    rooms = allRooms
    const ul = document.querySelector(".available-rooms")
    ul.innerHTML = ""
    if(allRooms.length){
        allRooms.map(room =>{

            const li = document.createElement("li")
            const joinButton = document.createElement("button")
            li.textContent = ` ${room.name}  ( ${room.host} ) - ${room.current_users.length} / 5 spots`
            joinButton.innerText = `Join room ( ${room.privacy.private ? 'private' : 'public' })` 
            li.appendChild(joinButton)
            ul.appendChild(li)
            joinButton.addEventListener("click",()=>{
                if(room.current_users.length >= 5 ){
                   alert("You cannot join this room - room is full (5/5)")
                }
                else if(room.privacy.private === true){
                    const enterKeyPage = document.querySelector(".enterKey")
                    console.log(enterKeyPage)
                    enterKeyPage.classList.add("show")
                    currentRoom = room
                }
                else{
                    enterRoom(room.name)

                }
            })
        })
    }
    else{
        const p = document.createElement("p")
        p.innerText = "No rooms yet, be the first to create one !"
        ul.appendChild(p)
    }

})

socket.on('userIsDrawing',data=>{
   
        ctx.beginPath()
        ctx.fillStyle = data.c
        ctx.arc(data.x, data.y ,data.l, 0, Math.PI*2);
        ctx.fill();

})

socket.on('renderPreviousDrawings',lines =>{
    lines.map(lineCoords =>{
            for(let i = 0 ; i < lineCoords.length ; i++){
             startDrawing(lineCoords[i].x,lineCoords[i].y,lineCoords[i].c,lineCoords[i].l)
            }
    })
})

socket.on('renderPreviousMessages',messages=>{
        displayMessages(messages)
})

socket.on('clearBoard',()=>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
})

/* ______________________________________________________END OF SOCKETS______________________________________________*/


let drawing = false // it is set to true when mouse is down , and false when mouse is up 

//the drawing logic goes down here 

canvas.addEventListener("pointerdown",e=>{

    const  rect = e.target.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;

socket.emit('mousedown',{x : mouseX , y : mouseY , c : color , l : lineWidth}); /* here the client send to the server the coords 
of where the drawing started , along with the color chosen and the linewidth */

drawing = true
})

canvas.addEventListener("pointermove",e=>{
if(drawing) {
    const  rect =  e.target.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;
    socket.emit('userIsDrawing',{x : mouseX , y : mouseY ,c : color , l : lineWidth})
    /* here the client keeps sending the coords of the mouse until the mouse is up */
    startDrawing(mouseX,mouseY,color,lineWidth)

}
})
canvas.addEventListener("pointerup",()=>{
    drawing = false
    socket.emit('mouseup')
})


const shuffle = (arr) =>{
    const newArr = arr
    newArr.sort(()=> 0.5 - Math.random());
    return newArr
}
const ascii_to_hex = str =>{
    let arr1 = [];
	for (let n = 0, l = str.length; n < l; n ++) 
     {
		arr1.push(Number(str.charCodeAt(n)).toString(16));
	 }
	return arr1.join('');
}
