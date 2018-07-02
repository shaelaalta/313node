function showAllFams(){
    xhttp = new XMLHttpRequest();
    var url = '/familyList';
    xhttp.open("GET", url, true);
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            //document.getElementById("family").innerHTML = this;
            //console.log(this);
            loadData(this);
        }
    }
    xhttp.send();
}

function loadData(items){
    console.log(items.response);
    var list = items.response;
    list = JSON.parse(list);
    var show = "";
    var i;
    var len = list.length;
            
    for(i = 0; i < len; i++){
        show += "<h2>Dad "+ list[i].dadname + "</h2>";
        show += "<h2>Mom "+ list[i].momname + "</h2>";
        show += "<h2>Last Name "+ list[i].lastname + "</h2><br>";
    }
    
    document.getElementById("family").innerHTML = show;
}

document.getElementById("home").addEventListener("click", showAllFams);