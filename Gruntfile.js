module.exports = function ( grunt ) {
    'use strict';

    // Force use of Unix newlines
    grunt.util.linefeed = '\n';

    RegExp.quote = function (string) {
        return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
    };

    /**
     * Config.
     */
    grunt.initConfig({

        // ------------------------------------------------------------------------
        // Meta
        // ------------------------------------------------------------------------

        pkg : grunt.file.readJSON('package.json'),
        site: grunt.file.readYAML('docs/data/site.yml'),

        meta: {
            name: 'BasMaterial UI',
            name_root_file: '<%= pkg.name %>',
            name_root_docs_file: '<%= pkg.name %>-docs'
        },

        banner: '/*!\n' +
        ' * BasMaterial UI v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
        ' * Copyright 2012-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
        ' * Licensed under MIT (https://github.com/Basgrani-Org/bas-material-ui/blob/master/LICENSE)\n' +
        ' */\n',

        jqueryCheck: 'if (typeof jQuery === \'undefined\') {\n' +
        '  throw new Error(\'<%= meta.name %> requires jQuery\')\n' +
        '}\n',

        jqueryVersionCheck: '+function ($) {\n' +
        '  var version = $.fn.jquery.split(\' \')[0].split(\'.\')\n' +
        '  if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1) || (version[0] >= 4)) {\n' +
        '    throw new Error(\'<%= meta.name %> requires at least jQuery v1.9.1 but less than v4.0.0\')\n' +
        '  }\n' +
        '}(jQuery);\n\n',

        // ------------------------------------------------------------------------
        // CSS
        // ------------------------------------------------------------------------

        // CSS Sass
        sass: {
            dist: {
                options: {
                    outputStyle: 'expanded',
                    sourceMap: true
                },
                files: {
                    'dist/css/<%= meta.name_root_file %>.css': 'scss/<%= meta.name_root_file %>.scss'
                }
            },
            docs: {
                options: {
                    outputStyle: 'expanded',
                    sourceMap: true
                },
                files: {
                    'site/assets/css/<%= meta.name_root_docs_file %>.css': 'docs/scss/<%= meta.name_root_docs_file %>.scss'
                }
            }
        },

        // CSS autoprefixer
        postcss: {
            options: {
                map: true,
                processors: [
                    require('autoprefixer')({
                        browsers: [
                            'Chrome >= 35',
                            'Firefox >= 38',
                            'Edge >= 12',
                            'Explorer >= 9',
                            'iOS >= 8',
                            'Safari >= 8',
                            'Android 2.3',
                            'Android >= 4',
                            'Opera >= 12'
                        ]
                    })
                ]
            },
            dist: {
                src: 'dist/css/<%= meta.name_root_file %>.css'
            },
            docs: {
                src: 'site/assets/css/<%= meta.name_root_docs_file %>.css'
            }
        },

        // CSS min
        cssmin: {
            options: {
                report: 'gzip',
                processImport: false
            },
            dist: {
                src: 'dist/css/<%= meta.name_root_file %>.css',
                dest: 'dist/css/<%= meta.name_root_file %>.min.css'
            },
            docs: {
                src: 'site/assets/css/<%= meta.name_root_docs_file %>.css',
                dest: 'site/assets/css/<%= meta.name_root_docs_file %>.min.css'
            }
        },

        // ------------------------------------------------------------------------
        // JS
        // ------------------------------------------------------------------------

        // Babel
        babel: {
            options: {
                "presets": [
                    ["es2015", { "modules": "commonjs" }]
                ]
            },
            dist: {
                options: {
                    sourceMap: false
                },
                expand: true,
                cwd: 'js/es6/',
                src: '**/*.js',
                dest: 'js/dist/'

            },
            docs: {
                options: {
                    sourceMap: false
                },
                expand: true,
                cwd: 'docs/js/es6/',
                src: '**/*.js',
                dest: 'docs/js/dist/'

            }
        },

        // Browserify
        browserify: {
            dist_dev: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                files: {
                    'dist/js/<%= meta.name_root_file %>.js': ['js/dist/app.js']
                }
            },
            dist: {
                options: {
                    browserifyOptions: {
                        debug: false
                    }
                },
                files: {
                    'dist/js/<%= meta.name_root_file %>.js': ['js/dist/app.js']
                }
            },
            docs_dev: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                files: {
                    'site/assets/js/<%= meta.name_root_docs_file %>.js': ['docs/js/dist/app.js']
                }
            },
            docs: {
                options: {
                    browserifyOptions: {
                        debug: false
                    }
                },
                files: {
                    'site/assets/js/<%= meta.name_root_docs_file %>.js': ['docs/js/dist/app.js']
                }
            }
        },

        // Banner
        stamp: {
            options: {
                banner: '<%= banner %>\n<%= jqueryCheck %>\n<%= jqueryVersionCheck %>\n+function ($) {\n',
                footer: '\n}(jQuery);'
            },
            dist: {
                files: {
                    src: 'dist/js/<%= meta.name_root_file %>.js'
                }
            },
            docs: {
                files: {
                    src: 'site/assets/js/<%= meta.name_root_docs_file %>.js'
                }
            }
        },

        // Compress
        uglify: {
            options: {
                compress: {
                    warnings: false
                }
            },
            dist: {
                options: {
                    mangle: true,
                    preserveComments: /^!|@preserve|@license|@cc_on/i
                },
                src: 'dist/js/<%= meta.name_root_file %>.js',
                dest: 'dist/js/<%= meta.name_root_file %>.min.js'
            },
            docs: {
                options: {
                    mangle: true,
                    preserveComments: /^!|@preserve|@license|@cc_on/i
                },
                src: 'site/assets/js/<%= meta.name_root_docs_file %>.js',
                dest: 'site/assets/js/<%= meta.name_root_docs_file %>.min.js'
            }
        },

        // ------------------------------------------------------------------------
        // Template
        // ------------------------------------------------------------------------

        // Build Html Doc
        assemble: {
            options: {
                marked: {sanitize: false},
                production: true,
                assets: '<%= site.destination %>/assets',
                plugins: ['grunt-assemble-sitemap', 'grunt-assemble-permalinks'],
                sitemap: {
                    homepage: '<%= pkg.homepage %>',
                    relativedest: true,
                    changefreq: 'weekly',
                    priority: '0.5',
                    exclude: [],
                    robot: '<%= assemble.options.production %>'
                },
                permalinks: {
                    structure: ':slug_section/:basename:ext'
                },
                helpers: '<%= site.source %>/helpers/helper-*.js',
                partials: ['<%= site.source %>/templates/snippets/**/*.hbs'],
                layoutdir: '<%= site.source %>/templates/layouts',
                data: ['<%= site.source %>/**/*.{json,yml}','package.json']
            },
            site: {
                options: {layout: 'default.hbs'},
                files: [
                    { expand: true, cwd: '<%= site.source %>/templates/pages', src: ['*.hbs'], dest: '<%= site.destination %>/' }
                ]
            }
        },

        // ------------------------------------------------------------------------
        // Others
        // ------------------------------------------------------------------------

        // Clean
        clean: {
            dist: {
                src: ["dist/*"]
            },
            site: {
                src: ["site/*"]
            },
            js: {
                src: ["js/dist/*"]
            },
            docs_js: {
                src: ["docs/js/dist/*"]
            }
        },

        // String remplace
        replace: {
            version: {
                src: ['site/*.html'],
                overwrite: true, // overwrite matched source files
                replacements: [
                    {
                        from: "?v=0.0.0",
                        to: "?v=<%= pkg.version %>"
                    }
                ]
            },
            min: {
                src: ['site/*.html'],
                overwrite: true, // overwrite matched source files
                replacements: [
                    {
                        from: "<%= meta.name_root_file %>.css",
                        to: "<%= meta.name_root_file %>.min.css"
                    },
                    {
                        from: "<%= meta.name_root_file %>.js",
                        to: "<%= meta.name_root_file %>.min.js"
                    }
                ]
            },
            analytics: {
                src: ['site/*.html'],
                overwrite: true, // overwrite matched source files
                replacements: [
                    {
                        from: "UA-XXXXX-X",
                        to: "UA-9809953-1"
                    }
                ]
            }
        },

        // Copy
        copy: {
            fonts: {
                files: [
                    {
                        expand: true,
                        cwd: '',
                        src: ['fonts/**'],
                        dest: 'site/assets'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['bower_components/mdi/fonts/*'],
                        dest: 'site/assets/fonts',
                        filter: 'isFile'
                    }
                ]
            },
            img: {
                files: [
                    {
                        expand: true,
                        cwd: '',
                        src: ['img/**'],
                        dest: 'site/assets'
                    },
                    {
                        expand: true,
                        cwd: 'docs/',
                        src: ['img/**'],
                        dest: 'site/assets'
                    }
                ]
            },
            css_dev: {
                files: [
                    {
                        expand: true,
                        cwd: 'dist/',
                        src: ['css/<%= meta.name_root_file %>.css', 'css/<%= meta.name_root_file %>.css.map'],
                        dest: 'site/assets/'
                    }
                ]
            },
            css: {
                files: [
                    {
                        expand: true,
                        cwd: 'dist/',
                        src: ['css/<%= meta.name_root_file %>.css', 'css/<%= meta.name_root_file %>.css.map', 'css/<%= meta.name_root_file %>.min.css'],
                        dest: 'site/assets/'
                    }
                ]
            },
            js_dev: {
                files: [
                    {
                        expand: true,
                        cwd: 'dist/',
                        src: ['js/<%= meta.name_root_file %>.js'],
                        dest: 'site/assets/'
                    }
                ]
            },
            js: {
                files: [
                    {
                        expand: true,
                        cwd: 'dist/',
                        src: ['js/<%= meta.name_root_file %>.js', 'js/<%= meta.name_root_file %>.min.js'],
                        dest: 'site/assets/'
                    }
                ]
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '',
                        src: ['img/**'],
                        dest: 'dist'
                    },
                    {
                        expand: true,
                        cwd: '',
                        src: ['fonts/**'],
                        dest: 'dist'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['bower_components/mdi/fonts/*'],
                        dest: 'dist/fonts',
                        filter: 'isFile'
                    }
                ]
            }
        },

        // Browser Sync integration
        browserSync: {
            bsFiles: {
                src : [
                    '<%= site.destination %>/assets/**/*',
                    '<%= site.destination %>/*.html'
                ]
            },
            options: {
                server: {
                    baseDir: "<%= site.destination %>"
                },
                open: false,
                browser: ["google chrome"],
                port: 9595
            }
        },

        // System Notifications
        notify: {
            watching: {
                options: {
                    enabled: true,
                    message: 'Watching Files!',
                    title: "<%= meta.name %>",
                    success: true,
                    duration: 1
                }
            },

            sass_compile: {
                options: {
                    enabled: true,
                    message: 'Sass Compiled!',
                    title: "<%= meta.name %>",
                    success: true,
                    duration: 1
                }
            },

            js_compile: {
                options: {
                    enabled: true,
                    message: 'JS Compiled!',
                    title: "<%= meta.name %>",
                    success: true,
                    duration: 1
                }
            },

            site_compile: {
                options: {
                    enabled: true,
                    message: 'Site Compiled!',
                    title: "<%= meta.name %>",
                    success: true,
                    duration: 1
                }
            },

            release_compile: {
                options: {
                    enabled: true,
                    message: 'Release Build Completed!',
                    title: "<%= meta.name %>",
                    success: true,
                    duration: 1
                }
            },

            server: {
                options: {
                    enabled: true,
                    message: 'Server Running!',
                    title: "<%= meta.name %>",
                    success: true,
                    duration: 1
                }
            }
        }

    });

    /**
     * Load Grunt tasks.
     */
    require('load-grunt-tasks')(grunt, { scope: 'devDependencies',
        // Exclude Plugins.
        pattern: ['grunt-*', '!grunt-assemble-permalinks', '!grunt-assemble-sitemap'] });

    /**
     * Register Grunt tasks (Main)
     */

    // Sass compile
    grunt.registerTask('_sass_compile', ['sass:dist', 'postcss:dist', 'cssmin:dist', 'copy:css']);
    grunt.registerTask('_sass_compile_dev', ['sass:dist', 'postcss:dist', 'copy:css_dev']);
    grunt.registerTask('sass_compile', ['_sass_compile_dev', 'notify:sass_compile']);

    // Babel
    grunt.registerTask('_babel_compile', ['clean:js', 'babel:dist', 'browserify:dist', 'stamp:dist', 'uglify:dist', 'copy:js']);
    grunt.registerTask('_babel_compile_dev', ['clean:js', 'babel:dist', 'browserify:dist_dev', 'copy:js_dev']);
    grunt.registerTask('babel_compile', ['_babel_compile_dev', 'notify:js_compile']);

    /**
     * Register Grunt tasks (Docs)
     */

    // Sass Docs compile
    grunt.registerTask('_sass_docs_compile', ['sass:docs', 'postcss:docs', 'cssmin:docs']);
    grunt.registerTask('_sass_docs_compile_dev', ['sass:docs', 'postcss:docs']);
    grunt.registerTask('sass_docs_compile', ['_sass_docs_compile_dev', 'notify:sass_compile']);

    // Babel Docs
    grunt.registerTask('_babel_docs_compile', ['clean:docs_js', 'babel:docs', 'browserify:docs', 'stamp:docs', 'uglify:docs']);
    grunt.registerTask('_babel_docs_compile_dev', ['clean:docs_js', 'babel:docs', 'browserify:docs_dev']);
    grunt.registerTask('babel_docs_compile', ['_babel_docs_compile_dev', 'notify:js_compile']);

    /**
     * Register Grunt tasks (Common)
     */

    // Site compile
    grunt.registerTask('_site_compile', ['newer:assemble']);
    grunt.registerTask('site_compile', ['_site_compile', 'notify:site_compile']);

    // Server
    grunt.registerTask('Server', ['browserSync', 'notify:server']);

    // Release
    grunt.registerTask('Build', [
        'clean:dist',
        'clean:site',
        '_sass_compile',
        '_babel_compile',
        '_sass_docs_compile',
        '_babel_docs_compile',
        'copy:dist',
        'copy:fonts',
        'copy:img',
        'copy:css',
        'copy:js',
        'assemble',
        'replace:version',
        'replace:min',
        'replace:analytics',
        'notify:release_compile'
    ]);
};
