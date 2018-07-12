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

function login(){
    var username = $("#lName").val();
    var password = $("#password").val();
    
    console.log("main.js username " + username + " and " + password);
    
    var params = {
        username: username,
        password: password
    };
    
    console.log("main.js params "+ params);
    
    $.post("/famLogin", params, function(result){
        if (result && result.success) {
			$("#status").text("Successfully logged in.");
		} else {
			$("#status").text("Error logging in.");
		}
    });
}

function FamLogIn(id){
    var famForm = '<form action="/signIn" method="POST"><label for="lName">Last Name: </label><input type="text" name="lName" id="lName" placeholder="Your Last name..." required><label for="password">Password: </label><input type="password" id="password" name="password" placeholder="Your password. . . " required><input type="hidden" name="famId" value="'+ id + '"><button onclick="login();">Log in</button></form>';
    
    document.getElementById("family").innerHTML = famForm;
}

function loadData(items){
    //console.log(items.response);
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
        show += "<button onClick = FamLogIn("+ list[i].id + ")>Log In</button>";
        show += "<button onClick = showAllMembers(" + list[i].id + ")>See Family Members</button>";
        show += "</div>";
    }
    document.getElementById("family").innerHTML = show;
}

function showAllMembers(id){
    xhttp = new XMLHttpRequest();
    var url = '/seeMem?id='+ id;
    xhttp.open("GET", url, true);
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            showPpl(this);
        }
    }
    xhttp.send();
}

function showPpl(ppl){
    var loves = ppl.response;
    loves = JSON.parse(loves);
    var list = loves.mem;
    var show = "";
    var i;
    var len = list.length;  
    show += "<form action='/addMemPage' method='POST'><input type='hidden' name='famId' value='" + list[0].famid + "'><input type='submit' value='Add Family Member'></form>";
    show += "<form action='/addPics' method='POST'><input type='hidden' name='fam' value='" + list[0].famid + "'><input type='submit' value='Upload Images'></form>";
    
    for(i = 0; i < len; i++){
        show += "<div id='secFam'>";
        show += "<h2>Name: "+ list[i].firstname + "</h2>";
        show += "<h3>Email: "+ list[i].email + "</h3>";
         show += "<a href='/memSignPage?famid=" + list[i].famid + "&id=" + list[i].id + "'>Sign In</a>";
        show += "</div>";
    }
    document.getElementById("family").innerHTML = show;
}

window.addEventListener('load', showAllFams);
