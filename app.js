var express = require('express');
var app = express();
var db_config = require(__dirname + '/config/database.js');
var conn = db_config.init();
var bodyParser = require('body-parser');

db_config.connect(conn);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

app.get('/', function (req, res) {
    res.render('main.ejs');
});

app.get('/movies_orderByName', function (req, res) {
    var sql = 'SELECT * FROM MOVIES ORDER BY title';    
    conn.query(sql, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else res.render('movies_orderByName.ejs', {list : rows});
    });
});

app.get('/movies_orderByYear', function (req, res) {
    var sql = 'SELECT * FROM movies where opening_date is not null order by opening_date desc;';    
    conn.query(sql, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else res.render('movies_orderByYear.ejs', {list : rows});
    });
});

app.get('/movies_orderByRate', function (req, res) {
    var sql = 'SELECT * FROM movies where audience_rate is not null order by audience_rate desc;';    
    conn.query(sql, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else res.render('movies_orderByName.ejs', {list : rows});
    });
});

app.use(express.static("./"));
// app.get('/write', function (req, res) {
//     res.render('write.ejs');
// });

// app.post('/writeAf', function (req, res) {
//     var body = req.body;
//     console.log(body);

//     var sql = 'INSERT INTO BOARD VALUES(?, ?, ?, NOW())';
//     var params = [body.id, body.title, body.content];
//     console.log(sql);
//     conn.query(sql, params, function(err) {
//         if(err) console.log('query is not excuted. insert fail...\n' + err);
//         else res.redirect('/list');
//     });
// });

app.listen(3000, () => console.log('Server is running on port 3000...'));