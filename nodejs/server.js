//=========================================================//
//
// CRUD: Create, Update, and Delete Application
// By Nicholas Smith
// December 2022
//
//=========================================================//

var mysql = require("mysql2");

//Create a new mysql connection to the database
var line = mysql.createConnection({
    "host": "127.0.0.1",
    "user": "root",
    "password": "mygene",
    "database": "dnaiq_dallas"
});

//When we connect:
line.connect((err)=>{

    //Print on error
    if (err) console.log(err);

    console.log("Connected to the MYSQL server");
    console.log("Performing query to database");

    line.query(
        "SELECT * FROM staging_labs;",
        (err, results, fields)=>{

            if (err){
                console.log("Error performing query: " + err);
                return;
            }

            console.log(results);

        }
    )

});