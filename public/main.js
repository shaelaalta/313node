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
        show += "<div id='secFam'>";
        show += "<h2>Last Name: "+ list[i].lastname + "</h2>";
        if(list[i].dadname != ""){
            show += "<h3>Dad: "+ list[i].dadname + "</h3>";
        }
        if(list[i].momname != ""){
        show += "<h3>Mom: "+ list[i].momname + "</h3>";
        }
        show += "<h3>Address: "+ list[i].city +", "
            +list[i].state + "<br>" + list[i].street + "</h3>";
        show += "</div>";
    }
    
    document.getElementById("family").innerHTML = show;
}

window.addEventListener('load', showAllFams);