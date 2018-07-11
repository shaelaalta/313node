function getJournal(){
    xhttp = new XMLHttpRequest();
    var imgId = document.getElementById('imgId').textContent;
    var id = document.getElementById('id').textContent;
    console.log("image id: " + imgId + " " + "person id: " + id);
    var url = '/journalBunch?imgId=' + imgId + '&id=' + id;
    console.log("journal.js url: " + url);
    xhttp.open("GET", url, true);
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            showJournal(this);
        }
    }
    xhttp.send();
}

function showJournal(data){
    var happy = data.response;
    happy = JSON.parse(happy);
    var list = happy.je;
    var show = "";
    var i;
    var len = list.length;
    show += "<img src='"+ list[0].imgplc + "'>";
    for(i = 0; i < len; i++){
        show += "<div id='secFam'>";
        show += "<h2>Journal Entry Made By " + list[i].firstname + "</h2>";
        show += "<p>" + list[i].entry + "</p>";
        show += "</div>";
    }
    document.getElementById("entries").innerHTML = show;
   
}

window.addEventListener('load', getJournal);