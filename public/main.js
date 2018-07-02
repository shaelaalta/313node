function showAllFams(){
    xhttp = new XMLHttpRequest();
    var url = '/familyList';
    xhttp.open("GET", url, true);
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            loadData(this);
        }
    }
    xhttp.send();
}

function loadData(items){
    console.log(items.response);
    var thing = items.response;
    thing = JSON.parse(thing);
    var list = thing.list;
    var show = "";
    var i;
    var len = list.length;     
    for(i = 0; i < len; i++){
        if(list[i].dadname != ""){
            show += "<h2>Dad: "+ list[i].dadname + "</h2>";
        }
        if(list[i].momname != ""){
        show += "<h2>Mom: "+ list[i].momname + "</h2>";
        }
        show += "<h2>Last Name: "+ list[i].lastname + "</h2><br>";
    }
    
    document.getElementById("family").innerHTML = show;
}

//document.getElementById("home").addEventListener("load", showAllFams);
window.addEventListener('load', showAllFams);
//document.getElementById("home").addEventListener("click", showAllFams);
