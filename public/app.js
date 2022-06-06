const socket = io();

const input = document.querySelector("input");
const container = document.querySelector(".container")
const login = document.querySelector(".login")
let username = ""
let userList = []


const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth/1.4
canvas.height = window.innerHeight/1.4

let color = "black"
let lineWidth = 2
ctx.lineWidth = lineWidth;


// this function is fired when the user enters his username
// if username is valid ( not empty , doesnt already exist) , it gets added to userList by sending it to the server
// and the drawing page gets shown
const handleSubmit = (e)=>{
        e.preventDefault()
        const emptyUser = /^\s*$/
        username = input.value
        const found = userList.some(user => user.username === username);
        console.log(userList)
        if(found){
            alert("username already exists")
        }
        else if(username.match(emptyUser)) alert("username must not be empty")
        else{
        socket.emit('addUser',username);
        document.body.style.cursor = "url(https://www.svgrepo.com/show/21828/pencil.svg),auto";
        login.classList.add("hide");
        container.classList.remove("hide");
        
        }

        input.value = ""
}

// this function handles the color choice
const drawingColor = (c,element)=>{
    if(c == "white"){
        lineWidth = 30
        ctx.lineWidth = 30
        document.body.style.cursor = "url(https://www.svgrepo.com/show/38906/eraser.svg),auto";
    }
    else{
        lineWidth = 2
        document.body.style.cursor = "url(https://www.svgrepo.com/show/21828/pencil.svg),auto";
    }
    color = c
    const colors = document.getElementsByClassName("color");
    for(let i = 0 ; i < colors.length ; i++){
        colors[i].classList.remove("active")
    }
    element.classList.add("active")
}

//this function starts drawing on the screen with the appropriate color and line width
const startDrawing = (x,y,l,c)=>{
    ctx.beginPath()
    ctx.lineWidth = l
    ctx.strokeStyle = c
    ctx.moveTo(x,y)
};

/* ______________________________________________________SOCKETS______________________________________________*/


// when the client receives the event renderUser , it renders all the users in the dom.
socket.on('renderUser',data=>{
    userList = data
    const ul = document.querySelector("ul");
    ul.innerHTML = ''
    data.forEach(user => {
    
    const li = document.createElement("li")
    li.textContent = user.username
    ul.appendChild(li)
    });
})

// mousedown and mousemove events are sent by the server to all clients , to update the screen in real time
socket.on('mousedown',data=>{
    if(!drawing){
    startDrawing(data.x,data.y,data.l,data.c)
    }


})
socket.on('mousemove',data=>{
    if(!drawing){
    ctx.lineTo(data.x,data.y)
    ctx.stroke()
    }
})
    
/* ______________________________________________________END OF SOCKETS______________________________________________*/


let drawing = false // it is set to true when mouse is down , and false when mouse is up 

//the drawing logic goes down here 

canvas.addEventListener("mousedown",e=>{
socket.emit('mousedown',{x : e.offsetX , y : e.offsetY , c : color , l : lineWidth}); /* here the client send to the server the coords 
of where the drawing started , along with the color chosen and the linewidth */
startDrawing(e.offsetX,e.offsetY,lineWidth,color)
drawing = true
})

canvas.addEventListener("mousemove",e=>{
if(drawing) {
    socket.emit('mousemove',{x : e.offsetX , y : e.offsetY ,c : color , l : lineWidth});
    /* here the client keeps sending the coords of the mouse until the mouse is up */
    ctx.lineTo(e.offsetX,e.offsetY)
    ctx.stroke()
}
})
canvas.addEventListener("mouseup",()=>{
    drawing = false
})
