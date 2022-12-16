//=========================================================//
//
// CRUD: Create, Update, and Delete Application
// By Nicholas Smith
// December 2022
//
//=========================================================//

var mysql     = require("mysql2");
//use express as the webserver
var app  = require("express")();
var http = require("http").Server(app);
var io   = require("socket.io")(http);

//Server settings
var port = 27015;

//GLOBAL container for the results of the query to staging_labs
var staging_labs = [];

//Settings for the websocket 
var ws_settings = {
    port: 27015
}

//Create a new mysql connection to the database
var line = mysql.createConnection({
    "host": "127.0.0.1",
    "user": "root",
    "password": "mygene",
    "database": "dnaiq_dallas"
});

//When we connect to the mysql database:
line.connect((err)=>{

    //Print on error
    if (err) console.log(err);

    console.log("Connected to the MYSQL server");
    console.log("Performing query to database");

});

//Start the http webserver for socket.io connections
http.listen(port, ()=>{
    console.log("NODE.JS backend running on port " + port);
});

io.on("connection", (socket)=>{

    console.log("Client connected " + socket.id);

    //When a client connects, perform a query to the database to get them
    //the latest data:
    line.query(
        "SELECT * FROM staging_labs;",
        (err, results, fields)=>{

            if (err){
                console.log("Error performing query: " + err);
                return;
            }

            staging_labs = results;

            socket.emit("table-data", results);

        }
    )

    socket.on("disconnect", ()=>{

        console.log("Client disconnected " + socket.id);

    });

    
    //When we receive a delete request:
    socket.on("delete-request", (rows)=>{

        //rows => array[] which contains an array of JSON objects

        //We will want to construct a string to execute
        var mysql_string = "DELETE FROM staging_labs WHERE idstaging_labs IN (" ;

        //Construct the rest of mysql_string
        for (var i = 0; i < rows.length; i++){
            (i !== rows.length-1) ? mysql_string += rows[i].idstaging_labs + "," : mysql_string += rows[i].idstaging_labs + ");";
        }

        //Now that we have the deletion string, we can query it.
        line.query(mysql_string, (err, results, fields)=>{

            if (err){
                errString = "Error performing DELETE operation: " + err;
                socket.emit("message", errString, "red");
                console.log(errString);
            }

            socket.emit("message", "DELETE Operation successfully performed. Removed " + rows.length + " record(s)", "green");

        });

        console.log(mysql_string);

    });


});