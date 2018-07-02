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

/*.post('/addMember', urlencodedParser, function(req, res){
    var familyId = req.body.famId;
    response.status(200).json(familyId);
})*/

.get('/seeMem', function(request, response){
    getMembers(request, response);
})
    
.get('/getPerson', function(request, response) {
    getPerson(request, response);
    })

.listen(PORT, () => console.log(`listening on port ${ PORT }`));

/****************************************************
* first getting family info from form
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
        console.log("params ... " + params);
        console.log(JSON.stringify(result.rows[0].id));
        callback(null, result.rows);
    })
}

/************************************
* get members of a family
****************************************/
function getMembers(request, response){
    var id = request.query.id;
    getPplDb(id, function(error, result){
        if(error){
            response.status(500).json({success: false, data: error});
        }
        else if(result == null){
            response.render('pages/makeMember', {fam: id});
        }
        else{
            response.status(200).json(result[0].id)
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