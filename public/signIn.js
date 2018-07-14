function login(){
    var username = $("#lName").val();
    var password = $("#password").val();
    var famid = $("#famId").val();
    
    var params = {
        username: username,
        password: password,
        famid: famid
    };
    
    $.post("/famLogin", params, function(result){
        if (result && result.success) {
            $("#status").text("Successfully logged in With Your Family");
            showMembers(famid);
		} else {
			$("#status").text("Error logging in.");
		}
    });
}

function showMembers(id){
    xhttp = new XMLHttpRequest();
    var url = '/seeMem?id='+ id;
    xhttp.open("GET", url, true);
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            console.log(this);
            showPpl(this);
        }
    }
    xhttp.send();
}

function showPpl(ppl){
    var loves = ppl.response;
    loves = JSON.parse(loves);
    console.log(loves);
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