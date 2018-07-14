function login(){
    var username = $("#lName").val();
    var password = $("#password").val();
    var famid = $("#famId").val();
    console.log(username);
    //console.log("main.js username " + username + " and " + password);
    
    var params = {
        username: username,
        password: password,
        famid = famid
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