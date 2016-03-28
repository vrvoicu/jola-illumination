var mysql = require('mysql');

(function(){
    "use strict";
    module.exports = function setup (options, imports, register)
    {

        var connection = mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : 'root',
            database : 'illumination'
        });

        var mysql_settings = {

            setSetting: function (name, value, callback) {

                connection.query('SELECT * FROM settings WHERE name="'+name+'"', function(err, rows, fields) {

                    if(err)
                        return callback(err);

                    if(rows.length == 0)

                        connection.query('INSERT INTO settings VALUES(NULL,"'+name+'","'+value+'")', function (err, rows, fields) {

                            if(err)
                                return callback(err);

                        });

                    else

                        connection.query('UPDATE settings SET value="'+value+'" WHERE name="'+name+'"', function (err, rows, fields) {

                            if(err)
                                return callback(err);

                        })
                });

            },

            getSetting: function (name, callback) {

                connection.query('SELECT * FROM settings WHERE name="'+name+'"', function(err, rows, fields) {

                    callback(err, rows);

                });

            }

        };

        connection.connect(function(err){
            register (null,
                {
                    mysql_settings: mysql_settings
                });
        });

        //connection.end();

    };

})();
