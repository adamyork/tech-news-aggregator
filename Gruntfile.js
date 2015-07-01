module.exports = function(grunt) {
    'use strict';
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        handlebars: {
            compile: {
                options: {
                    namespace: 'JST',
                    amd: false,
                    processName: function(filename) {
                        var directoryIndex = filename.lastIndexOf('/') + 1;
                        var extensionIndex = filename.lastIndexOf('handlebars') - 1;
                        filename = filename.slice(directoryIndex, extensionIndex);
                        return filename.toLowerCase();
                    }
                },
                src: 'src/main/handlebars/*.handlebars',
                dest: 'dist/js/templates.js'
            }
        },
        less: {
            options: {
                paths: ['src/main/less'],
                expand: true
            },
            files: {
                src: 'src/main/less/main.less',
                dest: 'dist/css/main.css'
            }
        },
        jshint: {
            options: {
                evil: true,
                regexdash: true,
                browser: true,
                jquery: true,
                node: true,
                wsh: true,
                trailing: true,
                sub: true,
                unused: true,
                undef: true,
                curly: true,
                indent: 4,
                eqeqeq: true,
                globals: {
                    Backbone: false,
                    define: false,
                    require: false,
                    _: false,
                    alert: false,
                    console: false,
                    JST: false,
                    App: false,
                    BaseView: false,
                    Handlebars: false,
                    describe: false,
                    it: false,
                    suite: false,
                    assert: false,
                    test: false,
                    should: false,
                    'throw': false
                }
            },
            files: {
                src: ['src/main/**/*.js', 'build.js', 'bower.json', 'package.json']
            }
        },
        concat: {
            files: {
                src: ['dist/js/templates.js', 'src/main/js/App.js'],
                dest: 'dist/js/main.concat.js'
            }
        },
        copy: {
            ejs: {
            files: [{
                    cwd: 'src/main/ejs',
                    src: 'index.ejs',
                    dest: 'dist/',
                    expand: true
                }]
            },
            resource: {
                files: [{
                    cwd: 'src/main/resource/image',
                    src: '*.png',
                    dest: 'dist/css/image',
                    expand: true,
                    flatten: true
                }]
            },
            libs: {
                files: [{
                    expand: true,
                    dest: 'dist/js/lib',
                    flatten: true,
                    src: ['bower_components/jquery/dist/jquery.js',
                        'bower_components/handlebars/handlebars.runtime.js',
                        'bower_components/underscore/underscore.js'
                    ]
                }]
            }
        },
        uglify: {
            options: {
                mangle: true,
                preserveComments: false,
                compress: {},
                banner: '/**This content is derived. Do not edit.**/\n',
                footer: '\n/**End Content**/'
            },
            main: {
                files: {
                    'dist/js/main.min.js': ['dist/js/main.concat.js']
                }
            },
            node: {
                files: {
                    'dist/server.js': ['src/main/node/server.js']
                }
            }
        },
        clean: ['dist/js/main.concat.js', 'dist/js/templates.js']
    });

    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask('default', ['jshint', 'handlebars', 'less', 'concat', 'copy:ejs', 'copy:resource', 'copy:libs',
        'uglify:main', 'uglify:node', 'clean']);
};