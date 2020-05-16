const express = require('express');
const morgan = require('morgan');
var bodyParser = require('body-parser');
const port = 3000;
const app = express();
const path = require('path');
var cors = require('cors');
var AnswerRoute = require('./routers/AnswerRoute.route.js');
var IndexRoute = require('./routers/IndexRoute.route.js');

app.use(express.static('public'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(morgan('dev'));
app.use(cors());

app.use(function(req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
app.use(express.static(path.join(__dirname, '/public/images/uploads')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.json({
        user: 'ad'
    });

});

app.use('/index', IndexRoute);

app.use('/answer', AnswerRoute);

app.listen(port, err => {
    console.log('Server listening on port ' + port);
});