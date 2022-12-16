var socket = io.connect("http://127.0.0.1:27015/", { transports : ['websocket'] });

//We will receive 'table-data' as soon as we connect to the server:
socket.on("table-data", (data)=>{

    //Grab a sample so we can know what the table headers will be:
    var data_keys = Object.keys(data[0]);
    var th_html = "<tr class='th-row'><th></th>"

    for (var i = 0; i < data_keys.length; i++){
        th_html += "<th>" + data_keys[i] + "</th>";
    } th_html += "</tr>";

    for (var i = 0; i < data.length; i++){
        
    }

    $("#table").append(th_html);

    //Now do all the rows

});