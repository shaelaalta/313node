const express = require('express')
const path = require('path')
const url = require('url');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var fs= require('fs');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var session = require('express-session')
var bcrypt = require('bcrypt');
const saltRounds = 10;

var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'dipiobrm0',
    api_key: 576757747669498,
    api_secret: process.env.CLOUDINARY_SECRET
});

const pg = require("pg");
const Pool = pg.Pool;
pg.defaults.ssl = true;
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({connectionString: connectionString});

const PORT = process.env.PORT || 5000

express()

.use(session({
  secret: 'my-super-secret-secret!',
  resave: false,
  saveUninitialized: true
}))

.use(bodyParser.json())


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

.get('/memSignPage', function(req, res){
    var famId = parseInt(req.query.famid);
    var id = parseInt(req.query.id);
    res.render('pages/signIn', {'fam': famId, 'id': id});
})

.post('/signIn', urlencodedParser, function(req, res){
    checkLogin(req, res);
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

.get('/albumBunch', function(request, response){
    getFamAlbums(request, response);
})

.get('/journalBunch', function(request, response){
    getJournalStuff(request, response);
})

.get('/getImages', function(request, response){
    getPics(request, response);
})
    
.get('/getPerson', function(request, response) {
    getPerson(request, response);
    })

.get('/viewJournals', function(request, response){
    var userId = parseInt(request.query.userId);
    var imgId = parseInt(request.query.imgId);
    console.log("index user: " + userId + " img id: " + imgId);
    response.render('pages/journalPage', {'imgId': imgId, 'userId': userId});
})

.get('/famLoginPage', function(request, response){
    var famid = parseInt(request.query.famid);
    response.render('pages/famLogin', {'id': famid});
})

.get('/albumPage', function(request, response){
    var famId = parseInt(request.query.fam);
    var name = request.query.name;
    response.render('pages/makeAlbum', {'fam': famId, 'name': name});
})

.post('/makeAlbum', urlencodedParser, function(req, res){
    addAlbum(req, res);
})

.post('/addMemPage', urlencodedParser, function(req, res){
    var famId = req.body.famId;
    res.render('pages/makeMember.ejs', {'fam': famId});
})

.post('/addPics', urlencodedParser, function(req, res){
    //var famId = req.body.fam;
    //res.render('pages/loadFile.ejs', {'fam': famId});
    var albumId = req.body.imgId;
    console.log("addPics albumid: " + albumId);
    res.render('pages/loadFile.ejs', {'album': albumId});
})

.post('/addJournal', urlencodedParser, function(req, res){
    addJournal(req, res);
})

.post('/famLogin', urlencodedParser, handleLogin)

.post('/fileupload', upload.single('image'), urlencodedParser, function(request, response){
    cloudinary.uploader.upload(request.file.path, function(result){
    var imagePlace = result.secure_url;
    var album = request.body.album;
    var name = request.body.imageName;
    console.log("album id " + album);
    addImage(imagePlace, album, name, function(err, result){
        console.log(result.rows);
        if(err || result == null || result.length < 1){
            response.render('pages/index');
        }
        response.render('pages/seeImg.ejs', {'pics': imagePlace, 'album': album, 'name': name})
    })
    });
})

.listen(PORT, () => console.log(`listening on port ${ PORT }`));

function handleLogin(request, response){
    var result = {success: false};
    var name = request.body.username;
    var password = request.body.password;
    var id = request.body.famid;
    
    getUserPassword(name, id, function(err, res){
        if(err || res == null){
            console.log("there was an error getting the password from the db");
            response.end(json(result));
        }
        else{
        bcrypt.compare(password, res[0].password, function(error, ress){
            if(ress){
                result = {success: true};
                response.json(result);
            }
            else{
            console.log("there was an error crypting the passwords...")
            response.json(result);
            }
        });
        }
    });
}

function getUserPassword(name, id, callback){
    var sql = "SELECT password FROM family WHERE id = $1 AND lastname = $2";
    var params = [id, name];
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

/***************************************
* add image to image db
****************************************/
function addImage(imagePlace, album, name, callback){
    console.log("addImage " + imagePlace + " " + album + " " + name);
    var sql = "INSERT INTO image VALUES (DEFAULT, $1, $2, $3) RETURNING id";
    var params = [name, imagePlace, album];
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

/***************************************
* log someone in
****************************************/
function checkLogin(req, res){
    var fName = req.body.fName;
    var password = req.body.mPassword;
    var famId = req.body.famId;
    var id = req.body.id
    verifyMember(fName, famId, function(error, result){
        if(error || result == null || result.length < 1){
            res.render('pages/index');
        }
        bcrypt.compare(password, result[0].password, function(err, ress){
            if(ress){
                res.render('pages/famPics', {'fam': famId, 'id': id, 'name': fName, 'person': id});
            }
            else{
                res.render('pages/index');
            }
        //res.status(200).json(result[0].id);
    });
    });
}

function verifyMember(fName, famId, callback){
    var sql = "SELECT password FROM member WHERE famid = $1 AND firstname = $2";
    var params = [famId, fName];
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

/****************************************
* adding a family member
******************************************/
function addFamMem(req, res){
    var name = req.body.fName;
    var email = req.body.mEmail;
    var password = req.body.mPassword;
    var fId = req.body.famId;
    var hashedPass = bcrypt.hash(password, saltRounds, function(err, hash){
        if(err)
            response.render('/');
        else {
            addMember(name, email, hash, fId, function(error, result){
            if(error || result == null || result.length < 1){
            res.status(500).json({success: false, data: error});
            } else {
                //res.status(200).json(result[0].id);
                res.render('pages/index');
            }
        });
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

/********************************************
* add album to the database
********************************************/
function addAlbum(req, res){
    var name = req.body.name;
    var famid = req.body.famId;
    addAlbumDB(name, famid, function(error, result){
        if(error || result == null){
            res.status(500).json({success: false, data: error});
        }
        var albumid = result;
        res.render('pages/loadFile', {'album': albumid});
    })
}

function addAlbumDB(name, famid, callback){
    var sql = "INSERT INTO album VALUES (DEFAULT, $1, $2) RETURNING id";
    var params = [name, famid];
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

/***********************************************
* add Journal entry to database
************************************************/
function addJournal(req, res){
    var imgId = req.body.imgId;
    var userId = req.body.pId;
    var entry = req.body.entry;
    console.log("img id: " + imgId + " user id: " + userId + " entry: " + entry);
    addEntryDb(imgId, userId, entry, function(error, result){
        if(error || result == null){
            res.status(500).json({success: false, data: error});
        }
        res.render('pages/journalPage', {'imgId': imgId, 'userId': userId});
    })
}

function addEntryDb(imgId, userId, entry, callback){
    var sql = "INSERT INTO journal VALUES (DEFAULT, $1, $2, $3) RETURNING id";
    var params = [entry, userId, imgId];
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
    var hashedPass = bcrypt.hash(password, saltRounds, function(err, hash){
        if(err)
        response.render('/');
        else {
        //console.log(hash);
        getFamilyInfo(lname, mom, dad, city, state, street, hash, function(error, result){
        if(error || result == null || result.lenth < 1){
            response.status(500).json({success: false, data: error});
        } else {
            //response.status(200).json(result[0].id);
           var item = result[0].id; response.render('pages/makeMember.ejs', {'fam': item})
        }
        })
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
            response.setHeader('Content-Type', 'application/json');
            response.send(JSON.stringify(ppl));
        }
    });
};

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

/***********************************************
* get albums
************************************************/
function getFamAlbums(request, response){
    var id = parseInt(request.query.id);
    
    getAlbums(id, function(error, result){
        if(error){
            response.status(500).json({success: false, data: error});
        }
        var pics = { 'pic': result };
        response.setHeader('Content-Type', 'application/json');
        response.send(JSON.stringify(pics));
    })
}

function getAlbums(id, callback){
    var sql = "SELECT * FROM album WHERE famid = $1::int";
    var params= [id];
    pool.query(sql, params, function(err, result){
        if(err){
            console.log("error in query: ")
            console.log(err);
            callback(err, null);
        }
        callback(null, result.rows);
    });
}

/************************************
* get journal entries and img
*************************************/
 function getJournalStuff(request, response){
     var imgId = parseInt(request.query.imgId);
     var id = parseInt(request.query.id);
     
     getJournalandImage(imgId, id, function(error, result){
         if(error){
            response.status(500).json({success: false, data: error});
        }
        var je = { 'je': result };
        response.setHeader('Content-Type', 'application/json');
        response.send(JSON.stringify(je));
     })
 }

function getJournalandImage(imgId, id, callback){
    var sql = "SELECT image.imgplc, journal.entry, member.firstname FROM ((journal INNER JOIN image ON $1 = image.id) INNER JOIN member ON $2 = member.id)";
    var params = [imgId, id];
    pool.query(sql, params, function(err, result){
        if(err){
            console.log("error in query: ")
            console.log(err);
            callback(err, null);
        }
        callback(null, result.rows);
    });
}

/***************************************
* get the pictures
***************************************/
function getPics(request, response){
    var id= parseInt(request.query.id);
    getAllPics(id, function(error, result){
        if(error){
            response.status(500).json({success: false, data: error});
        }
        var imgs = {'img': result};
        response.setHeader('Content-Type', 'application/json');
        response.send(JSON.stringify(imgs));
    })
}

function getAllPics(id, callback){
    var sql = "SELECT * FROM image WHERE albumid = $1::int";
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