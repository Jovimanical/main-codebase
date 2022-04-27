module.exports = function (grunt) {

    var appConfig = grunt.file.readJSON('package.json');

    // Load grunt tasks automatically
    // see: https://github.com/sindresorhus/load-grunt-tasks
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    // see: https://npmjs.org/package/time-grunt
    require('time-grunt')(grunt);

    var pathsConfig = function (appName) {
        this.app = appName || appConfig.name;

        return {
            app: this.app,
            templates: 'tuteria/templates',
            css: this.app + '/css',
            sass: this.app + '/sass',
            fonts: this.app + '/fonts',
            images: this.app + '/img',
            js: this.app + '/scripts',
            manageScript: this.app + '/manage.py',
            dist: 'tuteria/static/'
        };
    };


    grunt.initConfig({

        paths: pathsConfig('frontend'),
        pkg: appConfig,

        // see: https://github.com/gruntjs/grunt-contrib-watch
        watch: {
            gruntfile: {
                files: ['Gruntfile.js']
            },
            compass: {
                files: ['<%= paths.sass %>/**/*.{scss,sass}'],
                tasks: ['compass:server']
            },

        },
        sprite: {
            all: {
                src: '<%= paths.images %>/png/*.png',
                dest: '<%= paths.img %>/font-icons.png',
                destCss: '<%= paths.sass %>/src/font-icons.scss'
            }
        },

        imagemin: {
            png: {
                options: {
                    optimizationLevel: 7
                },
                files: [
                    {
                        // Set to true to enable the following options…
                        expand: true,
                        // cwd is 'current working directory'
                        cwd: 'tuteria/static/img/',
                        src: ['**/*.png'],
                        // Could also match cwd line above. i.e. project-directory/img/
                        dest: 'compressed/',
                        ext: '.png'
                    }
                ]
            },
            jpg: {
                options: {
                    progressive: true
                },
                files: [
                    {
                        // Set to true to enable the following options…
                        expand: true,
                        // cwd is 'current working directory'
                        cwd: 'tuteria/static/img/',
                        src: ['**/*.jpg'],
                        // Could also match cwd. i.e. project-directory/img/
                        dest: 'compressed/',
                        ext: '.jpg'
                    }
                ]
            }
        },
        sass: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    'main.css': 'main.scss'
                }
            }
        },


        // see: https://github.com/gruntjs/grunt-contrib-compass
        compass: {
            options: {
                sassDir: '<%= paths.sass %>',
                cssDir: '<%= paths.css %>',
                fontsDir: '<%= paths.fonts %>',
                imagesDir: '<%= paths.images %>',
                // sourcemap:true,
                relativeAssets: false,
                assetCacheBuster: false,
                raw: 'Sass::Script::Number.precision = 10\n'
            },
            dist: {
                options: {
                    sassDir: '<%= paths.sass %>',
                    cssDir: '<%= paths.css %>',

                    environment: 'production'
                }
            },
            server: {
                options: {
                    // debugInfo: true
                }
            }
        },
        browserSync: {
            bsFiles: {
                src: ['<%= paths.css %>/*.css',
                    '<%= paths.app %>/**/*.html'

                ]
            },
            options: {
                // watchTask: true,
                proxy: "localhost:8002"
            }
        },

        // see: https://npmjs.org/package/grunt-bg-shell
        bgShell: {
            _defaults: {
                bg: true
            },
            runDjango: {
                cmd: 'python <%= paths.manageScript %> runserver'
            }
        }
    });


    grunt.loadNpmTasks('grunt-spritesmith');
    grunt.loadNpmTasks('grunt-browser-sync');
    grunt.loadNpmTasks('grunt-sass');
    grunt.registerTask('imagemin', ['imagemin']);
    grunt.registerTask('imagepng', ['imagemin:png']); // only .png files
    grunt.registerTask('imagejpg', ['imagemin:jpg']);// only .jpg files
    
    grunt.registerTask('serve', [
        'bgShell:runDjango',
        'watch'
    ]);

    grunt.registerTask('build', [
        'compass:dist'
    ]);

    grunt.registerTask('default', [
        'build'
    ]);
};