var socket = io.connect("http://127.0.0.1:27015/", { transports : ['websocket'] });

//List of selected rows -- WITH THE JSON DATA OF THE ROW
var selected_rows = [];

//JSON Object of the selected rows. The HTML ID of the row identifies the data
var selected_rows_ids = {
    "rows": 0
};

//Stuff to run when the document is ready:
$(document).ready(()=>{

    var load_time = new Date();
    
    console.log("Document loaded at " + load_time.getTime()); 

    //Open #create-container when #create is clicked
    document.getElementById("create").onclick = ()=> { $("#create-container").hide().css({ "display": "table" }); }

    //Open #update-container when #update is clicked
    document.getElementById("update").onclick = ()=>{  $("#update-container").css({ "display": "table" }) }

    //Open #delete-container when #delete is clicked
    document.getElementById("delete").onclick = ()=>{ $("#delete-container").css({ "display": "table" }) }

    //Exit #create-container when #exit-create is clicked
    document.getElementById("exit-create").onclick = ()=>{ $("#create-container").css({ "display": "none" }); }

    //Exit #update-container when #update is clicked
    document.getElementById("exit-update").onclick = ()=>{ $("#update-container").css({ "display": "none" }); }

    //Exit #delete-container when #delete is clicked
    document.getElementById("exit-delete").onclick = ()=>{ $("#delete-container").css({ "display": "none" }) }

    //$("#update").click();

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

        $("#row_selected").html("<a style='font-weight: bold'>"+(Object.keys(selected_rows_ids).length-1) + "</a> RECORD(S) SELECTED");

    });

}

function sendMessage(msg, colour="green"){

    //sendMessage()
    //Send a nice little message to the user. This is usually done when the server has something
    //it wants to say to the user.
    
    let time     = new Date().getTime();
    let time_txt = time.getHours() + ":" + time.getMinutes();

    $("popups").append(`
    <div class="popup">
        <div class="inline-middle">
            <div class="popup-time">`+time_txt+`</div>
            <div class="popup-title inline-middle">Response</div>                        
        </div>
        <!-- <div class="popup-icon cover inline-middle"></div> -->
        <div class="popup-contents">`+msg+`</div>
    </div>
    `);

}