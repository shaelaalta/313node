const express = require('express')
const path = require('path')
const url = require('url');
var bodyParser = require('body-parser');
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

.listen(PORT, () => console.log(`listening on port ${ PORT }`));

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
            result.setHeader('Content-Type', 'application/json');
            result.send(JSON.stringify(ppl));
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

/******************************
* does math for mail
*******************************/
function stampMath(x, y){
    if (x === 1){
        x += 1; 
    }
    var start = 0;
    var add = 21;
    var shareTotal;
    
    switch(y){
        case 'Stamped Letter':
            start = 50;
            shareTotal = getTotal(x, start, add);   
            break;
        case 'Metered Letter':
            start = 47;
            shareTotal = getTotal(x, start, add);
            break;
        case 'Large Envelope':
            start = 100;
            shareTotal = getTotal(x, start, add);
            break;
        case 'Retail Package':
            start = 410;
            add = 35;
            if(x < 5){
                return 3.50;
            }
            else if(x < 9){
                return 3.75;
            }
            else{
                var correct = x - 8;
                shareTotal = getTotal(correct, start, add);
            }
            break;
        default:
            return 111.00;
            break;
    }
    return shareTotal;
}

/*******************************
* gets total for mail math
*******************************/
function getTotal(x, start, add){
    x = x - 1;
    var math = (((x * add) + start)/100);
    return math.toFixed(2);
    //return math;
}