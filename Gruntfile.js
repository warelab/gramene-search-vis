'use strict';

module.exports = function (grunt) {
  require('jit-grunt')(grunt);

  grunt.initConfig({

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

    less: {
      dev: {
        options: {
          compress: false,
          yuicompress: true,
          optimization: 2
        },
        files: {
          "build/styles.css": "styles/main.less"
        }
      }
    },

    watch: {
      browserify: {
        files: ['rewriteExample.js', 'taxogenomic/**/*.js', 'taxogenomic/**/*.jsx', '*.js', '*.jsx'],
        tasks: ['browserify:dev']
      },
      styles: {
        files: ['styles/**/*.less'],
        tasks: ['less']
      }
    }
  });

  grunt.registerTask('default', ['less', 'browserify:dev', 'watch']);
  grunt.registerTask('package', ['less', 'browserify:production']);
};
