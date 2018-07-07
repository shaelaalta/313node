function getAlbums(){
    xhttp = new XMLHttpRequest();
    var famId = document.getElementById('famId').textContent;
    var id = document.getElementById('id').textContent;
    var url = '/albumBunch?fid=' + famId + '&id=' + id;
    xhttp.open("GET", url, true);
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            showAlbums(this);
        }
    }
    xhttp.send();
}

function showAlbums(data){
    var happy = data.response;
    happy = JSON.parse(happy);
    var list = happy.pic;
    var show = "";
    var i;
    var len = list.length;
    for(i = 0; i < len; i++){
        show += "<div id='secFam'>";
        show += "<h2>Name: " + list[i].albumname + "</h2>";
        show += "<button onClick = getAlbums(" + list[i].id + ")>View Album</button>";
        show += "</div>";
    }
    document.getElementById("albums").innerHTML = show;
}

function getAlbums(id){
    xhttp = new XMLHttpRequest();
    var url = '/getImages?id=' + id;
    xhttp.open("GET", url, true);
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            showPics(this);
        }
    }
    xhttp.send();
}

function showPics(images){
    var img = data.response;
    img = JSON.parse(img);
    var list = img.img;
    var show = "";
    var i;
    var len = list.length;
    for(i = 0; i < len; i++){
        show += "<div id='secFam'>";
        show += "<img src='" + list[i].imgplc + "'>";
        show += "</div>";
    }
    document.getElementById("albums").innerHTML = show;
}

window.addEventListener('load', getAlbums);