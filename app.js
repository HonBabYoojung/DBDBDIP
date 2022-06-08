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
        //console.log(rows);
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else res.render('movies_orderByName.ejs', {list : rows});
    });
});

app.get('/movies_orderByName/:num', function (req, res) {

    let mcode = req.params.num;

    var sql = `SELECT distinct title, manufacture_year, audience_rate, audience_count, journalist_rate, journalist_count, countryName, playing_time, opening_date, directorName, castName, image, summary FROM movies m, country co, director d, moviecast mc, scope s where m.movie_code = co.movie_code and m.movie_code = d.movie_code and mc.movie_code = m.movie_code and s.movie_code = m.movie_code and m.movie_code = ${mcode};` 
    +  `SELECT distinct castName, mainorsub, roleName, castImg FROM movies m, moviecast mc WHERE m.movie_code = mc.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct imageType, photoLink FROM photo p, movies m WHERE p.movie_code = m.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct videoName, videoImgsrc, videoLink FROM movies m, video v where m.movie_code = v.movie_code and m.movie_code = ${mcode};`
    + `SELECT starScore, rateInfo, writerId, rateDate, likeNum, dislikeNum FROM movies m, rate r WHERE m.movie_code = r.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct directorName, movieTitle, movieImg FROM movies m, filmography f WHERE m.movie_code = f.movie_code and m.movie_code = ${mcode};` 
    conn.query(sql, function (err, rows, fields) {
        //console.log(rows);
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else {

            basicInfo = []; // title, manufacture_year, audience_rate, journalist_rate, playing_time, opening_date, image
            scope = []; // scopeName 여러개
            country = []; // countryName 여러개
            director = []; // directorName 여러개
            cast = []; // castName 여러개
            
            castInfoList = []; // 배우/제작진 상세정보 리스트
            photoInfoList = []; // 포토 상세정보 리스트
            videoInfoList = []; // 동영상 상세정보 리스트
            rateList = []; // 한줄평 리스트
            filmoList = []; // 필모그래피 리스트

            let scopeList;
            let countryList; 
            let directorList; 
            let castList; 
            
            
            //console.log(rows);
        
            
            rows[0].map((rowData, index) => {
                //console.log(rowData);
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
                    basicInfo.push(rowData.summary);
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
            scopeList = [ ...new Set(scope) ];
            countryList = [ ...new Set(country) ];
            directorList = [ ...new Set(director) ];
            castList = [ ...new Set(cast) ]; 
            

            

            rows[1].map((row) => {
                castInfoList.push(row)
            })

            rows[2].map((row) => {
                photoInfoList.push(row)
            })

            rows[3].map((row) => {
                videoInfoList.push(row)
            })

            rows[4].map((row) => {
                rateList.push(row)
            })
            
            rows[5].map((row) => {
                console.log(row);
                filmoList.push(row)
            })
            
            res.render('movieInfo.ejs', { basicInfo, scopeList, countryList, directorList, castList, castInfoList, photoInfoList, videoInfoList, rateList, filmoList })
            
        }
    });
});

app.get('/movies_orderByCode', function (req, res) {
    var sql = 'SELECT * FROM MOVIES ORDER BY movie_code';    
    conn.query(sql, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else res.render('movies_orderByCode.ejs', {list : rows});
    });
});

app.get('/movies_orderByCode/:num', function (req, res) {

    let mcode = req.params.num;

    var sql = `SELECT distinct title, manufacture_year, audience_rate, audience_count, journalist_rate, journalist_count, countryName, playing_time, opening_date, directorName, castName, image, summary FROM movies m, country co, director d, moviecast mc, scope s where m.movie_code = co.movie_code and m.movie_code = d.movie_code and mc.movie_code = m.movie_code and s.movie_code = m.movie_code and m.movie_code = ${mcode};` 
    +  `SELECT distinct castName, mainorsub, roleName, castImg FROM movies m, moviecast mc WHERE m.movie_code = mc.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct imageType, photoLink FROM photo p, movies m WHERE p.movie_code = m.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct videoName, videoImgsrc, videoLink FROM movies m, video v where m.movie_code = v.movie_code and m.movie_code = ${mcode};`
    + `SELECT starScore, rateInfo, writerId, rateDate, likeNum, dislikeNum FROM movies m, rate r WHERE m.movie_code = r.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct directorName, movieTitle, movieImg FROM movies m, filmography f WHERE m.movie_code = f.movie_code and m.movie_code = ${mcode};` 
    conn.query(sql, function (err, rows, fields) {
        //console.log(rows);
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else {

            basicInfo = []; // title, manufacture_year, audience_rate, journalist_rate, playing_time, opening_date, image
            scope = []; // scopeName 여러개
            country = []; // countryName 여러개
            director = []; // directorName 여러개
            cast = []; // castName 여러개
            
            castInfoList = []; // 배우/제작진 상세정보 리스트
            photoInfoList = []; // 포토 상세정보 리스트
            videoInfoList = []; // 동영상 상세정보 리스트
            rateList = []; // 한줄평 리스트
            filmoList = []; // 필모그래피 리스트

            let scopeList;
            let countryList; 
            let directorList; 
            let castList; 
            
            
            //console.log(rows);
        
            
            rows[0].map((rowData, index) => {
                //console.log(rowData);
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
                    basicInfo.push(rowData.summary);
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
            scopeList = [ ...new Set(scope) ];
            countryList = [ ...new Set(country) ];
            directorList = [ ...new Set(director) ];
            castList = [ ...new Set(cast) ]; 
            

            

            rows[1].map((row) => {
                castInfoList.push(row)
            })

            rows[2].map((row) => {
                photoInfoList.push(row)
            })

            rows[3].map((row) => {
                videoInfoList.push(row)
            })

            rows[4].map((row) => {
                rateList.push(row)
            })
            
            rows[5].map((row) => {
                console.log(row);
                filmoList.push(row)
            })
            
            res.render('movieInfo.ejs', { basicInfo, scopeList, countryList, directorList, castList, castInfoList, photoInfoList, videoInfoList, rateList, filmoList })
            
        }
    });
});


app.get('/movies_orderByYear', function (req, res) {
    var sql = 'SELECT * FROM movies where opening_date is not null order by opening_date desc;';    
    conn.query(sql, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else res.render('movies_orderByYear.ejs', {list : rows});
    });
});

app.get('/movies_orderByYear/:num', function (req, res) {

    let mcode = req.params.num;

    var sql = `SELECT distinct title, manufacture_year, audience_rate, audience_count, journalist_rate, journalist_count, countryName, playing_time, opening_date, directorName, castName, image, summary FROM movies m, country co, director d, moviecast mc, scope s where m.movie_code = co.movie_code and m.movie_code = d.movie_code and mc.movie_code = m.movie_code and s.movie_code = m.movie_code and m.movie_code = ${mcode};` 
    +  `SELECT distinct castName, mainorsub, roleName, castImg FROM movies m, moviecast mc WHERE m.movie_code = mc.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct imageType, photoLink FROM photo p, movies m WHERE p.movie_code = m.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct videoName, videoImgsrc, videoLink FROM movies m, video v where m.movie_code = v.movie_code and m.movie_code = ${mcode};`
    + `SELECT starScore, rateInfo, writerId, rateDate, likeNum, dislikeNum FROM movies m, rate r WHERE m.movie_code = r.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct directorName, movieTitle, movieImg FROM movies m, filmography f WHERE m.movie_code = f.movie_code and m.movie_code = ${mcode};` 
    conn.query(sql, function (err, rows, fields) {
        //console.log(rows);
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else {

            basicInfo = []; // title, manufacture_year, audience_rate, journalist_rate, playing_time, opening_date, image
            scope = []; // scopeName 여러개
            country = []; // countryName 여러개
            director = []; // directorName 여러개
            cast = []; // castName 여러개
            
            castInfoList = []; // 배우/제작진 상세정보 리스트
            photoInfoList = []; // 포토 상세정보 리스트
            videoInfoList = []; // 동영상 상세정보 리스트
            rateList = []; // 한줄평 리스트
            filmoList = []; // 필모그래피 리스트

            let scopeList;
            let countryList; 
            let directorList; 
            let castList; 
            
            
            //console.log(rows);
        
            
            rows[0].map((rowData, index) => {
                //console.log(rowData);
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
                    basicInfo.push(rowData.summary);
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
            scopeList = [ ...new Set(scope) ];
            countryList = [ ...new Set(country) ];
            directorList = [ ...new Set(director) ];
            castList = [ ...new Set(cast) ]; 
            

            

            rows[1].map((row) => {
                castInfoList.push(row)
            })

            rows[2].map((row) => {
                photoInfoList.push(row)
            })

            rows[3].map((row) => {
                videoInfoList.push(row)
            })

            rows[4].map((row) => {
                rateList.push(row)
            })
            
            rows[5].map((row) => {
                console.log(row);
                filmoList.push(row)
            })
            
            res.render('movieInfo.ejs', { basicInfo, scopeList, countryList, directorList, castList, castInfoList, photoInfoList, videoInfoList, rateList, filmoList })
            
        }
    });
});

app.get('/movies_orderByRate', function (req, res) {
    var sql = 'SELECT * FROM movies where audience_rate is not null order by audience_rate desc;';    
    conn.query(sql, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else res.render('movies_orderByName.ejs', {list : rows});
    });
});

app.get('/movies_orderByRate/:num', function (req, res) {

    let mcode = req.params.num;

    var sql = `SELECT distinct title, manufacture_year, audience_rate, audience_count, journalist_rate, journalist_count, countryName, playing_time, opening_date, directorName, castName, image, summary FROM movies m, country co, director d, moviecast mc, scope s where m.movie_code = co.movie_code and m.movie_code = d.movie_code and mc.movie_code = m.movie_code and s.movie_code = m.movie_code and m.movie_code = ${mcode};` 
    +  `SELECT distinct castName, mainorsub, roleName, castImg FROM movies m, moviecast mc WHERE m.movie_code = mc.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct imageType, photoLink FROM photo p, movies m WHERE p.movie_code = m.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct videoName, videoImgsrc, videoLink FROM movies m, video v where m.movie_code = v.movie_code and m.movie_code = ${mcode};`
    + `SELECT starScore, rateInfo, writerId, rateDate, likeNum, dislikeNum FROM movies m, rate r WHERE m.movie_code = r.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct directorName, movieTitle, movieImg FROM movies m, filmography f WHERE m.movie_code = f.movie_code and m.movie_code = ${mcode};` 
    conn.query(sql, function (err, rows, fields) {
        //console.log(rows);
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else {

            basicInfo = []; // title, manufacture_year, audience_rate, journalist_rate, playing_time, opening_date, image
            scope = []; // scopeName 여러개
            country = []; // countryName 여러개
            director = []; // directorName 여러개
            cast = []; // castName 여러개
            
            castInfoList = []; // 배우/제작진 상세정보 리스트
            photoInfoList = []; // 포토 상세정보 리스트
            videoInfoList = []; // 동영상 상세정보 리스트
            rateList = []; // 한줄평 리스트
            filmoList = []; // 필모그래피 리스트

            let scopeList;
            let countryList; 
            let directorList; 
            let castList; 
            
            
            //console.log(rows);
        
            
            rows[0].map((rowData, index) => {
                //console.log(rowData);
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
                    basicInfo.push(rowData.summary);
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
            scopeList = [ ...new Set(scope) ];
            countryList = [ ...new Set(country) ];
            directorList = [ ...new Set(director) ];
            castList = [ ...new Set(cast) ]; 
            

            

            rows[1].map((row) => {
                castInfoList.push(row)
            })

            rows[2].map((row) => {
                photoInfoList.push(row)
            })

            rows[3].map((row) => {
                videoInfoList.push(row)
            })

            rows[4].map((row) => {
                rateList.push(row)
            })
            
            rows[5].map((row) => {
                console.log(row);
                filmoList.push(row)
            })
            
            res.render('movieInfo.ejs', { basicInfo, scopeList, countryList, directorList, castList, castInfoList, photoInfoList, videoInfoList, rateList, filmoList })
            
        }
    });
});

app.get('/movies_orderByJournalist', function (req, res) {
    var sql = 'SELECT * FROM movies where journalist_rate is not null order by journalist_rate desc;';    
    conn.query(sql, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else res.render('movies_orderByJournalist.ejs', {list : rows});
    });
});

app.get('/movies_orderByJournalist/:num', function (req, res) {

    let mcode = req.params.num;

    var sql = `SELECT distinct title, manufacture_year, audience_rate, audience_count, journalist_rate, journalist_count, countryName, playing_time, opening_date, directorName, castName, image, summary FROM movies m, country co, director d, moviecast mc, scope s where m.movie_code = co.movie_code and m.movie_code = d.movie_code and mc.movie_code = m.movie_code and s.movie_code = m.movie_code and m.movie_code = ${mcode};` 
    +  `SELECT distinct castName, mainorsub, roleName, castImg FROM movies m, moviecast mc WHERE m.movie_code = mc.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct imageType, photoLink FROM photo p, movies m WHERE p.movie_code = m.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct videoName, videoImgsrc, videoLink FROM movies m, video v where m.movie_code = v.movie_code and m.movie_code = ${mcode};`
    + `SELECT starScore, rateInfo, writerId, rateDate, likeNum, dislikeNum FROM movies m, rate r WHERE m.movie_code = r.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct directorName, movieTitle, movieImg FROM movies m, filmography f WHERE m.movie_code = f.movie_code and m.movie_code = ${mcode};` 
    conn.query(sql, function (err, rows, fields) {
        //console.log(rows);
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else {

            basicInfo = []; // title, manufacture_year, audience_rate, journalist_rate, playing_time, opening_date, image
            scope = []; // scopeName 여러개
            country = []; // countryName 여러개
            director = []; // directorName 여러개
            cast = []; // castName 여러개
            
            castInfoList = []; // 배우/제작진 상세정보 리스트
            photoInfoList = []; // 포토 상세정보 리스트
            videoInfoList = []; // 동영상 상세정보 리스트
            rateList = []; // 한줄평 리스트
            filmoList = []; // 필모그래피 리스트

            let scopeList;
            let countryList; 
            let directorList; 
            let castList; 
            
            
            //console.log(rows);
        
            
            rows[0].map((rowData, index) => {
                //console.log(rowData);
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
                    basicInfo.push(rowData.summary);
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
            scopeList = [ ...new Set(scope) ];
            countryList = [ ...new Set(country) ];
            directorList = [ ...new Set(director) ];
            castList = [ ...new Set(cast) ]; 
            

            

            rows[1].map((row) => {
                castInfoList.push(row)
            })

            rows[2].map((row) => {
                photoInfoList.push(row)
            })

            rows[3].map((row) => {
                videoInfoList.push(row)
            })

            rows[4].map((row) => {
                rateList.push(row)
            })
            
            rows[5].map((row) => {
                console.log(row);
                filmoList.push(row)
            })
            
            res.render('movieInfo.ejs', { basicInfo, scopeList, countryList, directorList, castList, castInfoList, photoInfoList, videoInfoList, rateList, filmoList })
            
        }
    });
});

router.route('/movies_orderByName').get((req, res)=>{
    res.render('movies_orderByName.ejs');
});




router.route('/movieInfo').post(
    async (req, res)=>{
    console.log('output 처리함')
    var mcode = req.body.movie_code

    var sql = `SELECT distinct title, manufacture_year, audience_rate, audience_count, journalist_rate, journalist_count, countryName, playing_time, opening_date, directorName, castName, image, summary FROM movies m, country co, director d, moviecast mc, scope s where m.movie_code = co.movie_code and m.movie_code = d.movie_code and mc.movie_code = m.movie_code and s.movie_code = m.movie_code and m.movie_code = ${mcode};` 
    +  `SELECT distinct castName, mainorsub, roleName, castImg FROM movies m, moviecast mc WHERE m.movie_code = mc.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct imageType, photoLink FROM photo p, movies m WHERE p.movie_code = m.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct videoName, videoImgsrc, videoLink FROM movies m, video v where m.movie_code = v.movie_code and m.movie_code = ${mcode};`
    + `SELECT starScore, rateInfo, writerId, rateDate, likeNum, dislikeNum FROM movies m, rate r WHERE m.movie_code = r.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct directorName, movieTitle, movieImg FROM movies m, filmography f WHERE m.movie_code = f.movie_code and m.movie_code = ${mcode};`

    conn.query(sql, function (err, rows, fields) {
        
        
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else {

            basicInfo = []; // title, manufacture_year, audience_rate, journalist_rate, playing_time, opening_date, image
            scope = []; // scopeName 여러개
            country = []; // countryName 여러개
            director = []; // directorName 여러개
            cast = []; // castName 여러개
            
            castInfoList = []; // 배우/제작진 상세정보 리스트
            photoInfoList = []; // 포토 상세정보 리스트
            videoInfoList = []; // 동영상 상세정보 리스트
            rateList = []; // 한줄평 리스트
            filmoList = []; // 필모그래피 리스트

            let scopeList;
            let countryList; 
            let directorList; 
            let castList; 
            
            
            //console.log(rows);
        
            
            rows[0].map((rowData, index) => {
                //console.log(rowData);
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
                    basicInfo.push(rowData.summary);
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
            scopeList = [ ...new Set(scope) ];
            countryList = [ ...new Set(country) ];
            directorList = [ ...new Set(director) ];
            castList = [ ...new Set(cast) ]; 
            

            

            rows[1].map((row) => {
                castInfoList.push(row)
            })

            rows[2].map((row) => {
                photoInfoList.push(row)
            })

            rows[3].map((row) => {
                videoInfoList.push(row)
            })

            rows[4].map((row) => {
                rateList.push(row)
            })
            
            rows[5].map((row) => {
                console.log(row);
                filmoList.push(row)
            })
            
            res.render('movieInfo.ejs', { basicInfo, scopeList, countryList, directorList, castList, castInfoList, photoInfoList, videoInfoList, rateList, filmoList })
            
        }
    });

});



router.route('/movieInfo_title').post(
    async (req, res)=>{
    console.log('output 처리함')

    var title = String(req.body.movie_title);
    console.log(title);

    let mcode = "";


    var findCode = `SELECT movie_code FROM movies m WHERE m.title = "${title}"`;
    conn.query(findCode, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else {
            console.log("코드값 : " + rows[0].movie_code);
            mcode = String(rows[0].movie_code);

            var sql = `SELECT distinct title, manufacture_year, audience_rate, audience_count, journalist_rate, journalist_count, countryName, playing_time, opening_date, directorName, castName, image, summary FROM movies m, country co, director d, moviecast mc, scope s where m.movie_code = co.movie_code and m.movie_code = d.movie_code and mc.movie_code = m.movie_code and s.movie_code = m.movie_code and m.movie_code = ${mcode};` 
    +  `SELECT distinct castName, mainorsub, roleName, castImg FROM movies m, moviecast mc WHERE m.movie_code = mc.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct imageType, photoLink FROM photo p, movies m WHERE p.movie_code = m.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct videoName, videoImgsrc, videoLink FROM movies m, video v where m.movie_code = v.movie_code and m.movie_code = ${mcode};`
    + `SELECT starScore, rateInfo, writerId, rateDate, likeNum, dislikeNum FROM movies m, rate r WHERE m.movie_code = r.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct directorName, movieTitle, movieImg FROM movies m, filmography f WHERE m.movie_code = f.movie_code and m.movie_code = ${mcode};`

    conn.query(sql, function (err, rows, fields) {
        
        
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else {

            basicInfo = []; // title, manufacture_year, audience_rate, journalist_rate, playing_time, opening_date, image
            scope = []; // scopeName 여러개
            country = []; // countryName 여러개
            director = []; // directorName 여러개
            cast = []; // castName 여러개
            
            castInfoList = []; // 배우/제작진 상세정보 리스트
            photoInfoList = []; // 포토 상세정보 리스트
            videoInfoList = []; // 동영상 상세정보 리스트
            rateList = []; // 한줄평 리스트
            filmoList = []; // 필모그래피 리스트

            let scopeList;
            let countryList; 
            let directorList; 
            let castList; 
            
            
            //console.log(rows);
        
            
            rows[0].map((rowData, index) => {
                //console.log(rowData);
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
                    basicInfo.push(rowData.summary);
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
            scopeList = [ ...new Set(scope) ];
            countryList = [ ...new Set(country) ];
            directorList = [ ...new Set(director) ];
            castList = [ ...new Set(cast) ]; 
            

            

            rows[1].map((row) => {
                castInfoList.push(row)
            })

            rows[2].map((row) => {
                photoInfoList.push(row)
            })

            rows[3].map((row) => {
                videoInfoList.push(row)
            })

            rows[4].map((row) => {
                rateList.push(row)
            })
            
            rows[5].map((row) => {
                console.log(row);
                filmoList.push(row)
            })
            
            res.render('movieInfo_title.ejs', { basicInfo, scopeList, countryList, directorList, castList, castInfoList, photoInfoList, videoInfoList, rateList, filmoList })
            
        }
    });

        }

        


    });


    

});

router.route('/movieInfo_actor').post(
    async (req, res)=>{

    let actor = req.body.movie_actor.trim();
    console.log(actor);

    var sql = "SELECT distinct m.movie_code, title, audience_rate, audience_count, journalist_rate, journalist_count, playing_time, opening_date, manufacture_year FROM Movies m, Moviecast c WHERE m.movie_code = c.movie_code AND c.castName = " + `"${actor}"` + "ORDER BY m.title;" 
    conn.query(sql, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else res.render('movieInfo_actor.ejs', {list : rows});
    });

});

app.get('/movieInfo_actor/:num', function (req, res) {

    let mcode = req.params.num;

    var sql = `SELECT distinct title, manufacture_year, audience_rate, audience_count, journalist_rate, journalist_count, countryName, playing_time, opening_date, directorName, castName, image, summary FROM movies m, country co, director d, moviecast mc, scope s where m.movie_code = co.movie_code and m.movie_code = d.movie_code and mc.movie_code = m.movie_code and s.movie_code = m.movie_code and m.movie_code = ${mcode};` 
    +  `SELECT distinct castName, mainorsub, roleName, castImg FROM movies m, moviecast mc WHERE m.movie_code = mc.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct imageType, photoLink FROM photo p, movies m WHERE p.movie_code = m.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct videoName, videoImgsrc, videoLink FROM movies m, video v where m.movie_code = v.movie_code and m.movie_code = ${mcode};`
    + `SELECT starScore, rateInfo, writerId, rateDate, likeNum, dislikeNum FROM movies m, rate r WHERE m.movie_code = r.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct directorName, movieTitle, movieImg FROM movies m, filmography f WHERE m.movie_code = f.movie_code and m.movie_code = ${mcode};` 
    conn.query(sql, function (err, rows, fields) {
        //console.log(rows);
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else {

            basicInfo = []; // title, manufacture_year, audience_rate, journalist_rate, playing_time, opening_date, image
            scope = []; // scopeName 여러개
            country = []; // countryName 여러개
            director = []; // directorName 여러개
            cast = []; // castName 여러개
            
            castInfoList = []; // 배우/제작진 상세정보 리스트
            photoInfoList = []; // 포토 상세정보 리스트
            videoInfoList = []; // 동영상 상세정보 리스트
            rateList = []; // 한줄평 리스트
            filmoList = []; // 필모그래피 리스트

            let scopeList;
            let countryList; 
            let directorList; 
            let castList; 
            
            
            //console.log(rows);
        
            
            rows[0].map((rowData, index) => {
                //console.log(rowData);
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
                    basicInfo.push(rowData.summary);
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
            scopeList = [ ...new Set(scope) ];
            countryList = [ ...new Set(country) ];
            directorList = [ ...new Set(director) ];
            castList = [ ...new Set(cast) ]; 
            

            

            rows[1].map((row) => {
                castInfoList.push(row)
            })

            rows[2].map((row) => {
                photoInfoList.push(row)
            })

            rows[3].map((row) => {
                videoInfoList.push(row)
            })

            rows[4].map((row) => {
                rateList.push(row)
            })
            
            rows[5].map((row) => {
                console.log(row);
                filmoList.push(row)
            })
            
            res.render('movieInfo.ejs', { basicInfo, scopeList, countryList, directorList, castList, castInfoList, photoInfoList, videoInfoList, rateList, filmoList })
            
        }
    });
});

router.route('/movieInfo_director').post(
    async (req, res)=>{

    let director = req.body.movie_director.trim();
    console.log(director);

    var sql = "SELECT distinct m.movie_code, title, audience_rate, audience_count, journalist_rate, journalist_count, playing_time, opening_date, manufacture_year FROM Movies m, Filmography f WHERE m.movie_code = f.movie_code AND f.directorName = " + `"${director}"` + "ORDER BY m.title;" 
    conn.query(sql, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else res.render('movieInfo_director.ejs', {list : rows});
    });

});

app.get('/movieInfo_director/:num', function (req, res) {

    let mcode = req.params.num;

    var sql = `SELECT distinct title, manufacture_year, audience_rate, audience_count, journalist_rate, journalist_count, countryName, playing_time, opening_date, directorName, castName, image, summary FROM movies m, country co, director d, moviecast mc, scope s where m.movie_code = co.movie_code and m.movie_code = d.movie_code and mc.movie_code = m.movie_code and s.movie_code = m.movie_code and m.movie_code = ${mcode};` 
    +  `SELECT distinct castName, mainorsub, roleName, castImg FROM movies m, moviecast mc WHERE m.movie_code = mc.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct imageType, photoLink FROM photo p, movies m WHERE p.movie_code = m.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct videoName, videoImgsrc, videoLink FROM movies m, video v where m.movie_code = v.movie_code and m.movie_code = ${mcode};`
    + `SELECT starScore, rateInfo, writerId, rateDate, likeNum, dislikeNum FROM movies m, rate r WHERE m.movie_code = r.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct directorName, movieTitle, movieImg FROM movies m, filmography f WHERE m.movie_code = f.movie_code and m.movie_code = ${mcode};` 
    conn.query(sql, function (err, rows, fields) {
        //console.log(rows);
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else {

            basicInfo = []; // title, manufacture_year, audience_rate, journalist_rate, playing_time, opening_date, image
            scope = []; // scopeName 여러개
            country = []; // countryName 여러개
            director = []; // directorName 여러개
            cast = []; // castName 여러개
            
            castInfoList = []; // 배우/제작진 상세정보 리스트
            photoInfoList = []; // 포토 상세정보 리스트
            videoInfoList = []; // 동영상 상세정보 리스트
            rateList = []; // 한줄평 리스트
            filmoList = []; // 필모그래피 리스트

            let scopeList;
            let countryList; 
            let directorList; 
            let castList; 
            
            
            //console.log(rows);
        
            
            rows[0].map((rowData, index) => {
                //console.log(rowData);
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
                    basicInfo.push(rowData.summary);
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
            scopeList = [ ...new Set(scope) ];
            countryList = [ ...new Set(country) ];
            directorList = [ ...new Set(director) ];
            castList = [ ...new Set(cast) ]; 
            

            

            rows[1].map((row) => {
                castInfoList.push(row)
            })

            rows[2].map((row) => {
                photoInfoList.push(row)
            })

            rows[3].map((row) => {
                videoInfoList.push(row)
            })

            rows[4].map((row) => {
                rateList.push(row)
            })
            
            rows[5].map((row) => {
                console.log(row);
                filmoList.push(row)
            })
            
            res.render('movieInfo.ejs', { basicInfo, scopeList, countryList, directorList, castList, castInfoList, photoInfoList, videoInfoList, rateList, filmoList })
            
        }
    });
});

router.route('/movieInfo_scope').post(
    async (req, res)=>{

    let scope = req.body.movie_scope.trim();
    console.log(scope);

    var sql = "SELECT distinct m.movie_code, title, audience_rate, audience_count, journalist_rate, journalist_count, playing_time, opening_date, manufacture_year FROM Movies m, Scope s WHERE m.movie_code = s.movie_code AND s.scopeName = " + `"${scope}"` + "ORDER BY m.title;" 
    conn.query(sql, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else res.render('movieInfo_scope.ejs', {list : rows});
    });

});

app.get('/movieInfo_scope/:num', function (req, res) {

    let mcode = req.params.num;

    var sql = `SELECT distinct title, manufacture_year, audience_rate, audience_count, journalist_rate, journalist_count, countryName, playing_time, opening_date, directorName, castName, image, summary FROM movies m, country co, director d, moviecast mc, scope s where m.movie_code = co.movie_code and m.movie_code = d.movie_code and mc.movie_code = m.movie_code and s.movie_code = m.movie_code and m.movie_code = ${mcode};` 
    +  `SELECT distinct castName, mainorsub, roleName, castImg FROM movies m, moviecast mc WHERE m.movie_code = mc.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct imageType, photoLink FROM photo p, movies m WHERE p.movie_code = m.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct videoName, videoImgsrc, videoLink FROM movies m, video v where m.movie_code = v.movie_code and m.movie_code = ${mcode};`
    + `SELECT starScore, rateInfo, writerId, rateDate, likeNum, dislikeNum FROM movies m, rate r WHERE m.movie_code = r.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct directorName, movieTitle, movieImg FROM movies m, filmography f WHERE m.movie_code = f.movie_code and m.movie_code = ${mcode};` 
    conn.query(sql, function (err, rows, fields) {
        //console.log(rows);
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else {

            basicInfo = []; // title, manufacture_year, audience_rate, journalist_rate, playing_time, opening_date, image
            scope = []; // scopeName 여러개
            country = []; // countryName 여러개
            director = []; // directorName 여러개
            cast = []; // castName 여러개
            
            castInfoList = []; // 배우/제작진 상세정보 리스트
            photoInfoList = []; // 포토 상세정보 리스트
            videoInfoList = []; // 동영상 상세정보 리스트
            rateList = []; // 한줄평 리스트
            filmoList = []; // 필모그래피 리스트

            let scopeList;
            let countryList; 
            let directorList; 
            let castList; 
            
            
            //console.log(rows);
        
            
            rows[0].map((rowData, index) => {
                //console.log(rowData);
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
                    basicInfo.push(rowData.summary);
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
            scopeList = [ ...new Set(scope) ];
            countryList = [ ...new Set(country) ];
            directorList = [ ...new Set(director) ];
            castList = [ ...new Set(cast) ]; 
            

            

            rows[1].map((row) => {
                castInfoList.push(row)
            })

            rows[2].map((row) => {
                photoInfoList.push(row)
            })

            rows[3].map((row) => {
                videoInfoList.push(row)
            })

            rows[4].map((row) => {
                rateList.push(row)
            })
            
            rows[5].map((row) => {
                console.log(row);
                filmoList.push(row)
            })
            
            res.render('movieInfo.ejs', { basicInfo, scopeList, countryList, directorList, castList, castInfoList, photoInfoList, videoInfoList, rateList, filmoList })
            
        }
    });
});

router.route('/movieInfo_year').post(
    async (req, res)=>{

    let year = req.body.movie_year.trim();
    console.log(year);

    var sql = "SELECT distinct m.movie_code, title, audience_rate, audience_count, journalist_rate, journalist_count, playing_time, opening_date, manufacture_year FROM Movies m WHERE YEAR(m.opening_date) = " + `"${year}"` + "ORDER BY m.title;" 
    conn.query(sql, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else res.render('movieInfo_actor.ejs', {list : rows});
    });

});

app.get('/movieInfo_year/:num', function (req, res) {

    let mcode = req.params.num;

    var sql = `SELECT distinct title, manufacture_year, audience_rate, audience_count, journalist_rate, journalist_count, countryName, playing_time, opening_date, directorName, castName, image, summary FROM movies m, country co, director d, moviecast mc, scope s where m.movie_code = co.movie_code and m.movie_code = d.movie_code and mc.movie_code = m.movie_code and s.movie_code = m.movie_code and m.movie_code = ${mcode};` 
    +  `SELECT distinct castName, mainorsub, roleName, castImg FROM movies m, moviecast mc WHERE m.movie_code = mc.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct imageType, photoLink FROM photo p, movies m WHERE p.movie_code = m.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct videoName, videoImgsrc, videoLink FROM movies m, video v where m.movie_code = v.movie_code and m.movie_code = ${mcode};`
    + `SELECT starScore, rateInfo, writerId, rateDate, likeNum, dislikeNum FROM movies m, rate r WHERE m.movie_code = r.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct directorName, movieTitle, movieImg FROM movies m, filmography f WHERE m.movie_code = f.movie_code and m.movie_code = ${mcode};` 
    conn.query(sql, function (err, rows, fields) {
        //console.log(rows);
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else {

            basicInfo = []; // title, manufacture_year, audience_rate, journalist_rate, playing_time, opening_date, image
            scope = []; // scopeName 여러개
            country = []; // countryName 여러개
            director = []; // directorName 여러개
            cast = []; // castName 여러개
            
            castInfoList = []; // 배우/제작진 상세정보 리스트
            photoInfoList = []; // 포토 상세정보 리스트
            videoInfoList = []; // 동영상 상세정보 리스트
            rateList = []; // 한줄평 리스트
            filmoList = []; // 필모그래피 리스트

            let scopeList;
            let countryList; 
            let directorList; 
            let castList; 
            
            
            //console.log(rows);
        
            
            rows[0].map((rowData, index) => {
                //console.log(rowData);
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
                    basicInfo.push(rowData.summary);
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
            scopeList = [ ...new Set(scope) ];
            countryList = [ ...new Set(country) ];
            directorList = [ ...new Set(director) ];
            castList = [ ...new Set(cast) ]; 
            

            

            rows[1].map((row) => {
                castInfoList.push(row)
            })

            rows[2].map((row) => {
                photoInfoList.push(row)
            })

            rows[3].map((row) => {
                videoInfoList.push(row)
            })

            rows[4].map((row) => {
                rateList.push(row)
            })
            
            rows[5].map((row) => {
                console.log(row);
                filmoList.push(row)
            })
            
            res.render('movieInfo.ejs', { basicInfo, scopeList, countryList, directorList, castList, castInfoList, photoInfoList, videoInfoList, rateList, filmoList })
            
        }
    });
});

router.route('/movieInfo_country').post(
    async (req, res)=>{

    let con = req.body.movie_country.trim();
    console.log(con);

    var sql = "SELECT distinct m.movie_code, title, audience_rate, audience_count, journalist_rate, journalist_count, playing_time, opening_date, manufacture_year FROM Movies m, Country co WHERE m.movie_code = co.movie_code AND co.countryName = " + `"${con}"` + "ORDER BY m.title;" 
    conn.query(sql, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else res.render('movieInfo_actor.ejs', {list : rows});
    });

});

app.get('/movieInfo_country/:num', function (req, res) {

    let mcode = req.params.num;

    var sql = `SELECT distinct title, manufacture_year, audience_rate, audience_count, journalist_rate, journalist_count, countryName, playing_time, opening_date, directorName, castName, image, summary FROM movies m, country co, director d, moviecast mc, scope s where m.movie_code = co.movie_code and m.movie_code = d.movie_code and mc.movie_code = m.movie_code and s.movie_code = m.movie_code and m.movie_code = ${mcode};` 
    +  `SELECT distinct castName, mainorsub, roleName, castImg FROM movies m, moviecast mc WHERE m.movie_code = mc.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct imageType, photoLink FROM photo p, movies m WHERE p.movie_code = m.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct videoName, videoImgsrc, videoLink FROM movies m, video v where m.movie_code = v.movie_code and m.movie_code = ${mcode};`
    + `SELECT starScore, rateInfo, writerId, rateDate, likeNum, dislikeNum FROM movies m, rate r WHERE m.movie_code = r.movie_code and m.movie_code = ${mcode};`
    + `SELECT distinct directorName, movieTitle, movieImg FROM movies m, filmography f WHERE m.movie_code = f.movie_code and m.movie_code = ${mcode};` 
    conn.query(sql, function (err, rows, fields) {
        //console.log(rows);
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else {

            basicInfo = []; // title, manufacture_year, audience_rate, journalist_rate, playing_time, opening_date, image
            scope = []; // scopeName 여러개
            country = []; // countryName 여러개
            director = []; // directorName 여러개
            cast = []; // castName 여러개
            
            castInfoList = []; // 배우/제작진 상세정보 리스트
            photoInfoList = []; // 포토 상세정보 리스트
            videoInfoList = []; // 동영상 상세정보 리스트
            rateList = []; // 한줄평 리스트
            filmoList = []; // 필모그래피 리스트

            let scopeList;
            let countryList; 
            let directorList; 
            let castList; 
            
            
            //console.log(rows);
        
            
            rows[0].map((rowData, index) => {
                //console.log(rowData);
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
                    basicInfo.push(rowData.summary);
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
            scopeList = [ ...new Set(scope) ];
            countryList = [ ...new Set(country) ];
            directorList = [ ...new Set(director) ];
            castList = [ ...new Set(cast) ]; 
            

            

            rows[1].map((row) => {
                castInfoList.push(row)
            })

            rows[2].map((row) => {
                photoInfoList.push(row)
            })

            rows[3].map((row) => {
                videoInfoList.push(row)
            })

            rows[4].map((row) => {
                rateList.push(row)
            })
            
            rows[5].map((row) => {
                console.log(row);
                filmoList.push(row)
            })
            
            res.render('movieInfo.ejs', { basicInfo, scopeList, countryList, directorList, castList, castInfoList, photoInfoList, videoInfoList, rateList, filmoList })
            
        }
    });
});

app.use('/', router);
app.use(express.static("./"));


app.listen(3000, () => console.log('Server is running on port 3000...'));