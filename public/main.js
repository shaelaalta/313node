function showAllFams(){
    xhttp = new XMLHttpRequest();
    var url = '/familyList';
    xhttp.open("GET", url, true);
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            document.getElementById("family").innerHTML = this;
        }
    }
    xhttp.send();
}

document.getElementById("home").addEventListener("load", showAllFams);