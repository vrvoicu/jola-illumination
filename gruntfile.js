//wrapper function
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        /*uglify: {
            options: {
                banner: '/!*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> *!/\n'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        }*/

        /*env: {
            dev: {
                NODE_ENV: 'dev',
                DEST: '<%= config.dev %>'
            },
            dist: {
                NODE_ENV: 'dist',
                DEST: '<%= config.dist %>'
            }
        },*/

        clean: {
            buid: ['build']
        },

        copy: {
            server: {
                files: [
                    {
                        expand: true,
                        cwd: "server/",
                        src: '**',
                        dest: "build/server"
                    }
                ]
            },
            client: {
                files: [
                    {
                        expand: true,
                        cwd: 'client/',
                        src: '**',
                        dest: 'build/client'
                    }
                ]
            }
        },

        jshint: {
            server:{
                src: "server/**/*.js"
            },
            client:{
                src: "client/**/*.js"
            }
        },

        /*typescript: {
            base: {
                src: ['client/plugins/!**!/!*.ts'],
                dest: 'client/js/a.js',
                options: {
                    module: 'system', //or commonjs
                    target: 'es5', //or es3
                    sourceMap: true,
                    declaration: true
                }
            }
        },*/

        wiredep: {
            client: {
                cwd: 'build/client',
                src: 'build/client/index.html',
                ignorePath: '',
                exclude: []
            }
        },

        injector: {
            options: {},
            js:{
                options: {
                    transform: function (filePath) {
                        filePath = filePath.replace('/build/client/', '');
                        //filePath = filePath.replace('/tmp/', '');

                        return '<script src="' + filePath + '"></script>';
                    },
                    starttag: '<!-- injector:js -->',
                    endtag: '<!-- endinjector -->'
                },
                files: {
                    'build/client/index.html': [
                        'build/client/plugins/**/*.js'
                    ]
                }
            }/*,
            css: {
                options: {
                    transform: function (filePath) {
                        filePath = filePath.replace('/build/client/', '');

                        return '<link rel="stylesheet" type="text/css" href=' + filePath + '>';
                    },
                    starttag: '<!-- injector:css -->',
                    endtag: '<!-- endinjector -->',
                },
                files: {
                    'tmp/public/index.html': [
                        [

                            'tmp/public/css/!*.css',
                        ]
                    ]
                }
            }*/
        },

        watch: {
            files: [
                'client/bower_components/*'
            ],
            tasks: ['wiredep']
        },
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    // Load the plugin that provides the "uglify" task.
    //grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    /*grunt.loadNpmTasks('grunt-typescript');*/
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-injector');
    //this is used to wire bower dependencies
    grunt.loadNpmTasks('grunt-wiredep');


    // Default task(s).
    //grunt.registerTask('default', ['uglify']);
    grunt.registerTask('server', ['jshint:server', /*'typescript'*/]);
    grunt.registerTask('client', ['jshint:client']);
    grunt.registerTask('global', ['clean', 'copy', 'wiredep', 'injector'/*, 'watch'*/]);

};