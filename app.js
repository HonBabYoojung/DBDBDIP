var express = require('express');
var app = express();
var db_config = require(__dirname + '/config/database.js');
var conn = db_config.init();
var bodyParser = require('body-parser');
var router = express.Router();
var moment = require('moment')

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

// app.get('/movieInfo', function (req, res) {
//     res.render('movieInfo.ejs');
// });

// app.post('/movieCodeTest', function (req, res) {
    
//     let body = req.body;
//     console.log(body);
//     res.end("code 전송받음!")
//     //var code = parseInt(req.body.movie_code);

//     // var sql = `SELECT * FROM movies where movie_code = ${req.body.movie_code}`
//     // conn.query(sql, function (err, rows, fields) {
//     //     if(err) console.log('query is not excuted. select fail...\n' + err);
//     //     else res.redirect("/movieInfo", {list: rows});
//     // });
// });
router.route('/movies_orderByName').get((req, res)=>{
    res.render('movies_orderByName.ejs');
});

router.route('/movieInfo').post((req, res)=>{
    console.log('output 처리함')
    var mcode = parseInt(req.body.movie_code)    

    var sql = `SELECT distinct title, manufacture_year, audience_rate, audience_count, journalist_rate, journalist_count, scopeName, countryName, playing_time, opening_date, directorName, castName, image FROM movies m, country co, director d, moviecast mc, scope s where m.movie_code = co.movie_code and m.movie_code = d.movie_code and mc.movie_code = m.movie_code and s.movie_code = m.movie_code and m.movie_code = ${mcode}`;    
    conn.query(sql, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else {
            //console.log(rows);
            basicInfo = []; // title, manufacture_year, audience_rate, journalist_rate, playing_time, opening_date, image
            scope = []; // scopeName 여러개
            country = []; // countryName 여러개
            director = []; // directorName 여러개
            cast = []; // castName 여러개
            
            rows.map((rowData, index) => {
                console.log(rowData);
                if(index == 0) {
                    
                    basicInfo.push(rowData.title);
                    basicInfo.push(rowData.manufacture_year);
                    basicInfo.push(rowData.audience_rate);
                    basicInfo.push(rowData.audience_count);
                    basicInfo.push(rowData.journalist_rate);
                    basicInfo.push(rowData.journalist_count);
                    
                    
                    basicInfo.push(rowData.playing_time);
                    var newdate = moment(rowData.opening_date).utc().format('YYYY-MM-DD');
                    basicInfo.push(newdate);
                    basicInfo.push(rowData.image);
                    scope.push(rowData.scopeName);
                    country.push(rowData.countryName);
                    director.push(rowData.directorName);
                    cast.push(rowData.castName);
                }
                else {
                    scope.push(rowData.scopeName);
                    country.push(rowData.countryName);
                    director.push(rowData.directorName);
                    cast.push(rowData.castName);
                }
                

            });
            let scopeList = [ ...new Set(scope) ];
            let countryList = [ ...new Set(country) ];
            let directorList = [ ...new Set(director) ];
            let castList = [ ...new Set(cast) ]; 
            console.log(basicInfo);
            console.log(scopeList);
            console.log(countryList);
            console.log(directorList);
            console.log(castList);
            res.render('movieInfo.ejs', { basicInfo, scopeList, countryList, directorList, castList });
        }
    });

    //res.render('movieInfo.ejs', user);
});
app.use('/', router);


// app.use(express.static("./"));
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