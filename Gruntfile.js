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
        transform: ['reactify']
      },
      dev: {
        src: './example.js',
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
        files: ['example.js', 'kb/*.js', '*.jsx'],
        tasks: ['browserify:dev']
      }
    }
  });

  grunt.registerTask('default', ['browserify:dev', 'watch']);
  grunt.registerTask('package', ['browserify:production']);
};
