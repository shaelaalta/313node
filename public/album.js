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
        show += "<button onClick = getAlbumPics(" + list[i].id + ")>View Album</button>";
        show += "</div>";
    }
    document.getElementById("albums").innerHTML = show;
}

function getAlbumPics(id){
    xhttp = new XMLHttpRequest();
    var url = '/getImages?id=' + id;
    xhttp.open("GET", url, true);
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            showPics(this, id);
        }
    }
    xhttp.send();
}

function insertText(id, section){
    var pid = document.getElementById('person').textContent;
    
    var journal = "<form action='/addJournal' method='POST'><textarea name='entry' rows='70' cols='70'></textarea>";
    journal += "<input type='hidden' name='imgId' value='" + id + "'>";
    journal += "<input type='hidden' name='pId' value='" + pid + "'>";
    journal += "<input type='submit' value='Add Journal Entry'></form>";
    journal += "<a href='/journalPage?personId=" + pid + "&imgId" + id + "'>View This Image's Journal Entries</a>"
    var clean = document.getElementById('journal'+ section);
    clean.innerHTML = journal;
}

function showPics(images, id){
    document.getElementById('albums').style.display = 'none';
    var img = images.response;
    img = JSON.parse(img);
    var list = img.img;
    var i;
    var len = list.length;
    var show = "";
    
    var show = "<form action='/addPics' method='POST'><input type='hidden' name='imgId' value='" + id + "'><input type='submit' value='Add Image to Album'></form>";
    
    for(i = 0; i < len; i++){
        show += "<div id='secFam'>";
        show += "<img src='" + list[i].imgplc + "'>";
        show += "<div id='journal" + i + "'><button onClick = insertText(" + list[i].id + ",";
        show += i + ")>Write About This Memory</button></div>";
        show += "</div>";
    }
    document.getElementById("pictures").innerHTML = show;
}

window.addEventListener('load', getAlbums);