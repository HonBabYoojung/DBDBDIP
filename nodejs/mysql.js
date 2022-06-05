var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'Shin5633^^',
    database : 'dbproject_navermovie'
});

connection.connect();

connection.query('SELECT * FROM TEST', function (error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results);
});

connection.end();