var socket = io.connect("http://127.0.0.1:27015/", { transports : ['websocket'] });

//List of selected rows -- WITH THE JSON DATA OF THE ROW
var selected_rows = [];

//JSON Object of the selected rows. The HTML ID of the row identifies the data
var selected_rows_ids = {};

//List of inputs currently present in #table-update
var update_inputs = [];

//Stuff to run when the document is ready:
$(document).ready(()=>{

    var load_time = new Date();
    
    console.log("Document loaded at " + load_time.getTime()); 

    //Open #create-container when #create is clicked
    document.getElementById("create").onclick = ()=> { $("#create-container").hide().css({ "display": "table" }); }

    //Open #update-container when #update is clicked
    document.getElementById("update").onclick = ()=>{  
        
        //Because we can only update one row at a time
        if (Object.keys(selected_rows_ids).length == 1){
            
            $("#update-container").css({ "display": "table" });

            var data      = selected_rows_ids[Object.keys(selected_rows_ids)[0]];
            var data_keys = Object.keys(data);

            //Reset the table:
            $("#table-update").html(`
            <tr class="action-table-th">
                <th>COLUMN</th>
                <th>ROW</th>
                <th>Type</th>    
            </tr>`);

            //Also reset the list of inputs we have connected to #table-update
            update_inputs = [];
            
            //No we need to populate #table-update with the data the user selected.
            for (var i = 0; i < data_keys.length; i++){

                tr_html = "<tr>"

                //Populate the header row
                for (var i = 0; i < data_keys.length; i++){
                    
                    tr_html += "<td>" + data_keys[i] + "</td>";
                    var isOdd   = (i % 2 == 0) ? "" : " class='odd'";

                    //If we need to convert this to a textarea:
                    var input_type = (data[data_keys[i]] == null|| data[data_keys[i]].toString().length > 10) ? "textarea" : "input type='text'"
                    
                    //We also need to come up with an id for the input:
                    var input_id = randomStr(12);

                    //The value of the input:
                    var input_val = (data[data_keys[i]] == null) ? "NULL" : data[data_keys[i]];
                
                    //While we're at it, also populate #table_create and #table_create
                    $("#table-update").append(`
                        <tr`+isOdd+`>
                            <td>`+ data_keys[i] +`</td>
                            <td><`+input_type+` class="action-table-input" placeholder="Enter `+typeof data[data_keys[i]]+`" value="`+input_val+`" id="`+input_id+`">`+ ((input_type == "textarea") ? input_val + "</textarea>" : "") +`
                            </td>
                            <td>`+ typeof data[data_keys[i]] +`</td>
                        </tr>
                    `);

                    update_inputs.push(input_id);
                
                } tr_html += "</tr>";

            }

        }

    }

    //Open #delete-container when #delete is clicked
    document.getElementById("delete").onclick = ()=>{ $("#delete-container").css({ "display": "table" }) }

    //Exit #create-container when #exit-create is clicked
    document.getElementById("exit-create").onclick = ()=>{ $("#create-container").css({ "display": "none" }); }

    //Exit #update-container when #update is clicked
    document.getElementById("exit-update").onclick = ()=>{ $("#update-container").css({ "display": "none" }); }

    //Exit #delete-container when #delete is clicked
    document.getElementById("exit-delete").onclick = ()=>{ $("#delete-container").css({ "display": "none" }) }

    //Send a DELETE request when #confirm-delete is clicked
    document.getElementById("confirm-delete").onclick = ()=>{ 

        //We will send the contents of selected_row_ids, exluding the html row id:
        var deleting = [];
        var row_keys = Object.keys(selected_rows_ids);

        for (var i = 0; i < row_keys.length; i++){
            if (row_keys[i] !== "rows"){
              
                //Mark it for deletion for the server
                deleting.push(selected_rows_ids[row_keys[i]])

                //Also delete the rows from the HTML:
                document.getElementById(row_keys[i]).remove();

            }
        }

        sendMessage("Sent deletion request for " + deleting.length + " records. Please wait.")
        socket.emit("delete-request", deleting);

    };

    //Send an UPDATE request when #confirm-update is clicked
    document.getElementById("confirm-update").onclick = ()=>{

        //The original row we have:
        var original_row      = selected_rows_ids[Object.keys(selected_rows_ids)[0]]
        var keys_original_row = Object.keys(original_row);

        //The updated row we want:
        var updated_row = {};

        //We will iterate through original_row and insert the required keys
        //and the use update_inputs[] as the values
        for (var i = 0; i < keys_original_row.length; i++){

            //New updated field value:
            var newVal = (document.getElementById(update_inputs[i]).value == "NULL") ? null : document.getElementById(update_inputs[i]).value;
            updated_row[keys_original_row[i]] = newVal;
        
        }

        //Next, remove the container and notify the user of the ongoing process
        $("#update-container").css({ "display": "none" });

        sendMessage("Sent update request for 1 record. Please wait a moment");
        socket.emit("update-request", original_row, updated_row);

        console.log(original_row, updated_row);
        
    }

});

//We will receive 'table-data' as soon as we connect to the server:
socket.on("table-data", (data)=>{

    //Grab a sample so we can know what the table headers will be:
    var data_keys = Object.keys(data[0]);
    var th_html = "<tr class='th-row'><th></th>";

    //Populate the header row
    for (var i = 0; i < data_keys.length; i++){
        
        th_html += "<th>" + data_keys[i] + "</th>";
        var isOdd   = (i % 2 == 0) ? "" : " class='odd'";

        //While we're at it, also populate #table_create and #table_create
        $("#table_create").append(`
            <tr`+isOdd+`>
                <td>`+ data_keys[i] +`</td>
                <td><input type="text" class="action-table-input" placeholder="Enter `+typeof data[0][data_keys[i]]+`" /></td>
                <td>`+ typeof data[0][data_keys[i]] +`</td>
            </tr>
        `);
    
    } th_html += "</tr>";

    $("#table").append(th_html);

    //Populate the actual table itself
    for (var i = 0; i < data.length; i++){
        
        //Generate an id for the current row:
        var row_id = randomStr(9);

        var isOdd   = (i % 2 == 0) ? "" : " class='odd'";
        var td_html = "<tr id='"+row_id+"'"+ isOdd +"><td><input type='checkbox' id='checkbox-"+row_id+"' /></td>"

        for (var j = 0; j < data_keys.length; j++){
            td_html += "<td"+isOdd+">" + data[i][data_keys[j]] + "</td>";
        } td_html += "</tr>";

        //Insert the HTML string into the actual HTML itself. So we can add event listeners
        //to it.
        $("#table").append(td_html);
        
        //Ensure we can make selections on the row
        addCheckboxEvent(row_id, data[i]);

    }

});



function randomStr(x){
    
    //Generate a random string.
    //x => integer

    var alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q","r","s","t","u","v","w","x","y","z"];
    var str = "";

    for (var i = 0; i < x; i++){
        
        var isUppercase = Math.floor((Math.random() * 2)+1);
        var y = alphabet[Math.floor(Math.random() * alphabet.length)];

        (isUppercase == 2) ? str += y.toUpperCase() : str += y;

    }

    return str;

}

function addCheckboxEvent(row_id, data){

    //Select and unselect a row in the table when clicked.
    //Add event listenrs to the tables, so we can select them.
    document.getElementById(row_id).addEventListener("click", ()=>{
        
        //The checkbox associated with this row
        var checkbox = document.getElementById("checkbox-" + row_id);

        //checkbox.checked = !checkbox.checked;
        
        //Check if this row has already been selected:
        if (Object.keys(selected_rows_ids).includes(row_id)){

            //If it has, then we want to remove it. Because we've already selected
            //this row, so the user wants to undo it.
            
            //Undo the checkbox:
            checkbox.checked = false;
            
            //Remove .row-selected from the row:
            $("#" + row_id).removeClass("row-selected");

            //Remove the row and its data from selected_rows_ids
            delete selected_rows_ids[row_id]

        } else {

            //Otherwise, the user wants to select it. So we should add it to selected_rows_ids first.
            selected_rows_ids[row_id] = data;

            //Then, check the checkbox:
            checkbox.checked = true;

            //Add .row-selected to the row:
            $("#" + row_id).addClass("row-selected");

        }

        $("#row_selected").html("<a style='font-weight: bold'>"+(Object.keys(selected_rows_ids).length) + "</a> RECORD(S) SELECTED");
        $("#no_selected").html(Object.keys(selected_rows_ids).length);

        
        //Also apply the different colour rules:

        //For DELETE
        if (Object.keys(selected_rows_ids).length > 0){
            $("#delete").css({ "color": "#fff" })
        } else {
            $("#delete").css({ "color": "#bcbcbc" });
        }

        //For UPDATE
        if (Object.keys(selected_rows_ids).length == 1){
            $("#update").css({ "color": "#fff" });
        } else {
            $("#update").css({ "color": "#bcbcbc" });
        }

    });

}

socket.on("reload", ()=>{ window.location.reload() });
socket.on("message", (msg, colour="green")=>{ sendMessage(msg, colour); });

function sendMessage(msg, colour="green"){

    //sendMessage()
    //Send a nice little message to the user. This is usually done when the server has something
    //it wants to say to the user.

    console.log(colour);
    
    let time     = new Date();
    let time_txt = time.getHours() + ":" + leadingZero(time.getMinutes()) + ":" + leadingZero(time.getSeconds());
    let popup_id = randomStr(12);

    //Check if we should paint the message red:
    var redClass = (colour == "red") ? " popup-red" : "";

    let popup_html = `
    <div class="popup`+redClass+`" id="`+popup_id+`">
        <div class="inline-middle">
            <div class="popup-time">`+time_txt+`</div>
            <div class="popup-title inline-middle">Response</div>                        
        </div>
        <!-- <div class="popup-icon cover inline-middle"></div> -->
        <div class="popup-contents">`+msg+`</div>
    </div>`;

    $("#popups").append(popup_html).hide().fadeIn();

    //Delay times (ms) to fade out and remove the pop up
    let fadeTime   = 8000;
    let removeTime = 12000;

    if (colour == "red"){
        fadeTime == 15000;
        removeTime = 17000;
    }

    setTimeout(()=>{
        $("#" + popup_id).fadeOut()
    }, fadeTime);

    setTimeout(()=>{
        document.getElementById(popup_id).remove();
    }, removeTime);


}

function leadingZero(x){

    //Add a leading zero to a number, if its < 10.
    //x => string

    if (x < 10){
        return "0" + x;
    } else {
        return x;
    }

}