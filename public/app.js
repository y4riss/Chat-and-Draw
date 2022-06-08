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
let currentBrush = 2
let brushColor = color
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
        document.body.style.cursor = "url(data:image/x-icon;base64,AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAEAAAAAAAAAAA4f8AAAAAAKjP8ADjkPAABLTMALBwugCQs9EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAERURERERERERVVERERERERM1URERERERMzMUQRERERETMRREEREREREQAURBERERERAAFEQREREREQABREEREREREAAURBERERERAAFEQREREREQABREEREREREAAURBERERERAAFGYREREREQACZhERERERECIhERERERERIhHH/wAAg/8AAAH/AAAA/wAAAH8AAIA/AADAHwAA4A8AAPAHAAD4AwAA/AEAAP4AAAD/AAAA/4AAAP/AAAD/4AAA),auto";
        login.classList.add("hide");
        container.classList.remove("hide");
        
        }

        input.value = ""
}

// this function handles the color choice
const drawingColor = (c,element)=>{
    document.body.style.cursor = "url(data:image/x-icon;base64,AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAEAAAAAAAAAAA4f8AAAAAAKjP8ADjkPAABLTMALBwugCQs9EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAERURERERERERVVERERERERM1URERERERMzMUQRERERETMRREEREREREQAURBERERERAAFEQREREREQABREEREREREAAURBERERERAAFEQREREREQABREEREREREAAURBERERERAAFGYREREREQACZhERERERECIhERERERERIhHH/wAAg/8AAAH/AAAA/wAAAH8AAIA/AADAHwAA4A8AAPAHAAD4AwAA/AEAAP4AAAD/AAAA/4AAAP/AAAD/4AAA),auto";
    color = c
    brushColor = color
    const colors = document.getElementsByClassName("c");
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
        color = "white"
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



/* ______________________________________________________SOCKETS______________________________________________*/


// when the client receives the event renderUser , it renders all the users in the dom.
socket.on('renderUser',data=>{
    userList = data
    const ul = document.querySelector("ul");
    ul.innerHTML = ''
    data.forEach(user => {
    const li = document.createElement("li")
    
     if(user.username == username) {
         const span = document.createElement("span")
         span.classList.add("blink_me")
         span.textContent = ">> "
        li.appendChild(span)
     }

     const span2 = document.createElement("span")
     span2.textContent = user.username
     li.appendChild(span2)

    ul.appendChild(li)
    });
})

const startDrawing = (x,y,c,l)=>{
    ctx.beginPath()
    ctx.fillStyle = c
    ctx.arc(x,y,l, 0, Math.PI*2, true);
    ctx.fill();
}

// mousedown and mousemove events are sent by the server to all clients , to update the screen in real time


socket.on('userIsDrawing',data=>{
   
        ctx.beginPath()
        ctx.fillStyle = data.c
        ctx.arc(data.x, data.y ,data.l, 0, Math.PI*2, true);
        ctx.fill();
        console.log('another user is drawing')

})

socket.on('renderPreviousDrawings',lines =>{
    lines.map(lineCoords =>{
            for(let i = 0 ; i < lineCoords.length ; i++){

             startDrawing(lineCoords[i].x,lineCoords[i].y,lineCoords[i].c,lineCoords[i].l)
                console.log('drawing previous things')
            }
    })
})

socket.on('clearBoard',()=>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
})

/* ______________________________________________________END OF SOCKETS______________________________________________*/


let drawing = false // it is set to true when mouse is down , and false when mouse is up 

//the drawing logic goes down here 

canvas.addEventListener("pointerdown",e=>{
socket.emit('mousedown',{x : e.offsetX , y : e.offsetY , c : color , l : lineWidth}); /* here the client send to the server the coords 
of where the drawing started , along with the color chosen and the linewidth */
drawing = true
})

canvas.addEventListener("pointermove",e=>{
if(drawing) {
    socket.emit('userIsDrawing',{x : e.offsetX , y : e.offsetY ,c : color , l : lineWidth})
    /* here the client keeps sending the coords of the mouse until the mouse is up */
    startDrawing(e.offsetX, e.offsetY,color,lineWidth)

}
})
canvas.addEventListener("pointerup",()=>{
    drawing = false
    socket.emit('mouseup')
})
