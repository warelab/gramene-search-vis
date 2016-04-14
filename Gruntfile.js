'use strict';

module.exports = function (grunt) {
  require('jit-grunt')(grunt);

  grunt.initConfig({
    less: {
      development: {
        options: {
          compress: false,
          yuicompress: true,
          optimization: 2
        },
        files: {
          "build/style.css": "styles/*.less"
        }
      }
    },

    browserify: {
      options: {

        browserifyOptions: {
          debug: true
        },
        transform: [
          ['babelify', {presets: ["es2015", "react"]}]
        ]
      },
      dev: {
        src: './rewriteExample.js',
        dest: 'build/bundle.js'

      },
      production: {
        browserifyOptions: {
          debug: false
        },
        src: '<%= browserify.dev.src %>',
        dest: 'build/bundle.js'
      }
    },

    watch: {
      browserify: {
        files: ['rewriteExample.js', 'taxogenomic/**/*.js', 'taxogenomic/**/*.jsx', '*.js', '*.jsx'],
        tasks: ['browserify:dev']
      }
    }
  });

  grunt.registerTask('default', ['browserify:dev', 'watch']);
  grunt.registerTask('package', ['browserify:production']);
};
