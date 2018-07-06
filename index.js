const express = require('express')
const path = require('path')
const url = require('url');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var fs= require('fs');
//const http = require("http");
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const { Pool } = require("pg");
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({connectionString: connectionString});

const PORT = process.env.PORT || 5000

express()
.use(express.static(path.join(__dirname, 'public')))
.use(express.json())
.set('views', path.join(__dirname, 'views'))
.set('view engine', 'ejs')
.get('/', (req, res) => res.render('pages/index'))

.get('/familyList', function(req, res){
    familiesDb(function(error, result){
        if(error || result == null || result.length == 0){
        res.status(500).json({success: false, data: error});
        } else {
            var happy = { 'list': result };
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(happy));
        }
    });
})

.post('/packageMath', urlencodedParser, function(req, res){
    var price = stampMath(req.body.ozSize, req.body.packageT)
    res.render('pages/price', {data: req.body, 'amount': price});
})

.post('/addFam', urlencodedParser, function(req, res){
    addFamily(req, res);
})

.post('/addMember', urlencodedParser, function(req, res){
    addFamMem(req, res);
})

.get('/seeMem', function(request, response){
    getMembers(request, response);
})
    
.get('/getPerson', function(request, response) {
    getPerson(request, response);
    })

.post('/addMemPage', urlencodedParser, function(req, res){
    var famId = req.body.famId;
    res.render('pages/makeMember.ejs', {'fam': famId});
})

.post('/addPics', urlencodedParser, function(req, res){
    var famId = req.body.fam;
    res.render('pages/loadFile.ejs', {'fam': famId});
})

.post('/fileupload', function(request, response){
    addFile(request, response);
})

.listen(PORT, () => console.log(`listening on port ${ PORT }`));

/**************************************
* upload an image... hopefully
***************************************/
function addFile(req, res){
    var form = new formidable.IncomingForm();
    /*var form = new formidable.IncomingForm({
            uploadDir: __dirname + '/images/',
            keepExtensions: true
        });*/
    form.parse(req, function (err, fields, files){
        var oldpath = files.filetoupload.path;
        var newpath = '/images/' + files.filetoupload.name;
        //var newpath = __dirname + '/images/' + files.filetoupload.name;
        //var newpath = 'C:/Users/dcru1c7prpmmo1/images/' + files.filetoupload.name;
        console.log("parsing done");
        //if(err){ return res.end("you found an error fool"); }
        //console.log("You did it!");
        fs.rename(oldpath, newpath, function(err){
            if(err){ 
                throw err; 
            }
            res.status(200).json("pic is uploaded");
            res.end();
        });
    /*form.parse(req);
    form.on('fileBegin', function(name, file){
        file.path = __dirname + '/images/' + file.name;
    });
    form.on('file', function(name, file){
        console.log("uploaded" + file.name);
    });*/
    //res.status(200).json({'love': "it worked!"});
    });
}

/****************************************
* adding a family member
******************************************/
function addFamMem(req, res){
    var name = req.body.fName;
    var email = req.body.mEmail;
    var password = req.body.mPassword;
    var fId = req.body.famId;
    addMember(name, email, password, fId, function(error, result){
        if(error || result == null || result.length < 1){
            res.status(500).json({success: false, data: error});
        } else {
            res.status(200).json(result[0].id);
        }
    });
}

function addMember(name, email, password, id, callback){
    var sql = "INSERT INTO member VALUES (DEFAULT, $1, $2, $3, $4) RETURNING id";
    var params = [name, email, password, id];
    pool.query(sql, params, function(err, result){
        if(err){
            console.log("error in query: ")
            console.log(err);
            callback(err, null);
        } else {
            callback(null, result.rows);
        }
    })
}
/****************************************************
* adding a family to the form
*****************************************************/
function addFamily(req, response){
    var lname = req.body.lName;
    var mom = req.body.momName;
    var dad = req.body.dadName;
    var city = req.body.city;
    var state = req.body.state;
    var street = req.body.street;
    var password = req.body.password;
    getFamilyInfo(lname, mom, dad, city, state, street, password, function(error, result){
        if(error || result == null || result.lenth < 1){
            response.status(500).json({success: false, data: error});
        } else {
            //response.status(200).json(result[0].id);
           var item = result[0].id; response.render('pages/makeMember.ejs', {'fam': item})
        }
    });
}

/******************************************
* add info into db returns new id
*******************************************/
function getFamilyInfo(lname, mom, dad, city, state, street, password, callback){
    var sql = "INSERT INTO family VALUES (DEFAULT, $3, $2, $1, $6, $4, $5, $7) RETURNING id";
    var params = [lname, mom, dad, city, state, street, password];
    pool.query(sql, params, function(err, result){
        if(err){
            console.log("error in query: ")
            console.log(err);
            callback(err, null);
        }
        else {
        callback(null, result.rows);
        }
    })
}

/************************************
* get members of a family
****************************************/
function getMembers(request, response){
    var id = parseInt(request.query.id);
    
    getPplDb(id, function(error, result){
        if(error){
            response.status(500).json({success: false, data: error});
        }
        else if(result == null || result < 1){
            response.render('pages/makeMember.ejs', {'fam': id});
        }
        else{
            var ppl = { 'mem': result };
            //response.render('pages/famMember.ejs', {'ppl': result});
            //return ppl;
            response.setHeader('Content-Type', 'application/json');
            response.send(JSON.stringify(ppl));
        }
    });
}

function getPplDb(id, callback){
    var sql = "SELECT * FROM member WHERE famid = $1::int";
    var params = [id];
    pool.query(sql, params, function(err, result){
        if(err){
            console.log("error in query: ")
            console.log(err);
            callback(err, null);
        }
        callback(null, result.rows);
    });
}
    

/****************************************
* get person info
*****************************************/
function getPerson(request, response){
    var id= request.query.id;
    
    getPersonFromDb(id, function(error, result){
        if(error || result == null || result.length != 1){
            response.status(500).json({success: false, data: error});
        } else {
            var person = result[0].id;
            response.status(200).json(result[0]);
        }
    });
}

function familiesDb(callback){
    var sql = "SELECT * FROM family";
    pool.query(sql, function(err, result){
      if(err){
          console.log("error in query: ")
          console.log(err);
          callback(err, null);
      }
        //console.log(JSON.stringify(result.rows));
        callback(null, result.rows);
    });
}


/************************************
* gets person from db
*************************************/
function getPersonFromDb(id, callback){
    console.log("getting db id with: " + id);
    var sql = "SELECT * FROM family WHERE id = $1::int";
    var params = [id];
    pool.query(sql, params, function(err, result){
        if(err){
            console.log("error in query: ")
            console.log(err);
            callback(err, null);
        }
        console.log("params is" + params);
        console.log(JSON.stringify(result.rows));
        callback(null, result.rows);
    });
}