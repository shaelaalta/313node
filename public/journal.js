function getJournal(){
    xhttp = new XMLHttpRequest();
    var imgId = document.getElementById('imgId').textContent;
    var id = document.getElementById('id').textContent;
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
    //document.getElementById("picture").innerHTML = list;
    console.log(list);
}
/*function showAlbums(data){
    var happy = data.response;
    happy = JSON.parse(happy);
    var list = happy.pic;
    var show = "";
    var i;
    var len = list.length;
    for(i = 0; i < len; i++){
        show += "<div id='secFam'>";
        show += "<h2>Name: " + list[i].albumname + "</h2>";
        show += "<button onClick = getAlbumPics(" + list[i].id + ")>View Album</button>";
        show += "</div>";
    }
    document.getElementById("albums").innerHTML = show;
}*/

window.addEventListener('load', getJournal);