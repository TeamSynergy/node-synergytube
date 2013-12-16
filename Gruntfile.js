module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      main: {
        files: [
          { expand: true, src: ['views/**'], dest: 'build/' },
          { expand: true, cwd: 'public/assets/', src: ['**'], dest: 'build/views/assets/' }
        ]
      },
      root: {
        files: [
          { expand: true, cwd: 'build/views/assets/', src: ['**'], dest: 'public/assets' },
          { expand: true, cwd: 'build/views/', src: ['**/*.swig'], dest: 'views/' }
        ]
      }
    },

    clean: {
      main: ['build/']
    },

    groundskeeper: {
      main: {
        expand: true,
        cwd: 'build/views/assets/js',
        src: ['**/*.js'],
        dest: 'build/views/assets/js'
      }
    },

    useminPrepare: {
      html: 'build/views/**/*.swig',
      options: {
        root: 'build/views/',
        dest: 'build/views',
        staging: 'build/.tmp/'
      }
    },

    usemin: {
      html: ['build/views/**/*.swig'],
      options: {
        dirs: ['build/']
      }
    }

  });

  // load our tasks
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-groundskeeper');

  grunt.registerTask('default', [
    'copy:main',
    'groundskeeper',
    'useminPrepare',
    'concat',
    'uglify',
    'cssmin',
    'usemin',
    'copy:root',
    'clean'
  ]);
};
