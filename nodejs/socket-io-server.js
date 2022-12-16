//use express as the webserver
var app  = require("express")();
var http = require("http").Server(app);
var io   = require("socket.io")(http);

//Server settings
var port = 27015;

http.listen(port, ()=>{
    console.log("NODE.JS backend running on port " + port);
});

io.on("connection", (socket)=>{

    console.log("Client connected " + socket.id);

    socket.on("disconnect", ()=>{

        console.log("Client disconnected " + socket.id);

    });

});