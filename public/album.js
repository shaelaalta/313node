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
    
}

window.addEventListener('load', getAlbums);