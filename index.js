const express = require('express')
const path = require('path')
const url = require('url');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
const PORT = process.env.PORT || 5000

express()
    .use(express.static(path.join(__dirname, 'public')))
    .use(express.json())
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/index'))

    .post('/packageMath', urlencodedParser, function(req, res){
    var price = stampMath(req.body.ozSize, req.body.packageT)
          res.render('pages/price', {data: req.body, 'amount': price});
          })

.listen(PORT, () => console.log(`listening on port ${ PORT }`));

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

function getTotal(x, start, add){
    x = x - 1;
    var math = (((x * add) + start)/100);
    return math.toFixed(2);
    //return math;
}