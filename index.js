const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
var bodyParser = require('body-parser')
const io = socket(server);

app.set('view engine', 'ejs')
app.set('views', './views')

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

const rooms = {};

io.on("connection", socket => {
    socket.on("join room", roomID => {
        console.log("Someone joined")
        if (rooms[roomID]) {
            rooms[roomID].push(socket.id);
        } else {
            rooms[roomID] = [socket.id];
        }
        const otherUser = rooms[roomID].find(id => id !== socket.id);
        if (otherUser) {
            socket.emit("other user", otherUser);
            socket.to(otherUser).emit("user joined", socket.id);
        }
    });

    socket.on("offer", payload => {
        console.log("offered");
        io.to(payload.target).emit("offer", payload);
    });

    socket.on("answer", payload => {
        console.log(payload.target);
        io.to(payload.target).emit("answer", payload);
    });

    socket.on("ice-candidate", incoming => {
        io.to(incoming.target).emit("ice-candidate", incoming.candidate);
    });
});

app.get("/",function(req,res){
    res.render("createRoom")
})

app.get("/room/:id",function(req,res){
    res.render("room",{roomID : req.params.id})
})
server.listen(8000, () => console.log('server is running on port 8000'));