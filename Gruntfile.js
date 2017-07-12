module.exports = (grunt) => {
  require('load-grunt-tasks')(grunt);

  grunt.loadNpmTasks('grunt-execute');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.initConfig({

    clean: ['dist'],

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        ignores: ['src/bower_components/**'],
      },
      src: ['Gruntfile.js', 'src/*.js'],
    },

    copy: {
      src_to_dist: {
        cwd: 'src',
        expand: true,
        src: ['**/*', '!**/*.js', '!**/*.ts', '!**/*.scss', '!img/**/*'],
        dest: 'dist'
      },

      bower_libs: {
        cwd: 'bower_components',
        expand: true,
        src: [],
        dest: 'dist/libs/'
      },

      libs: {
        cwd: 'libs',
        expand: true,
        src: ['**/*'],
        dest: 'dist/libs/',
        options: {
          process: function (content, srcpath) {
            return content.replace(/(\'|")echarts(\'|")/g, '$1./echarts.min$2');
          },
        },
      },

      echarts_libs: {
        cwd: 'node_modules/echarts/dist',
        expand: true,
        src: ['echarts.min.js'],
        dest: 'dist/libs/',
      },

      img_to_dist: {
        cwd: 'src',
        expand: true,
        src: ['img/**/*'],
        dest: 'dist/img/'
      },

      pluginDef: {
        expand: true,
        src: ['plugin.json', 'README.md'],
        dest: 'dist',
      }
    },

    watch: {
      rebuild_all: {
        files: ['src/**/*', 'plugin.json', 'README.md', '!src/node_modules/**', '!src/bower_components/**'],
        tasks: ['default'],
        options: {spawn: false}
      },
    },

    babel: {
      options: {
        sourceMap: true,
        presets: ['es2015'],
        plugins: ['transform-es2015-modules-systemjs', 'transform-es2015-for-of'],
      },
      dist: {
        files: [{
          cwd: 'src',
          expand: true,
          src: ['*.js'],
          dest: 'dist',
          ext: '.js'
        }]
      },
    },

  });

  grunt.registerTask('default', [
    'jshint',
    'clean',
    'copy:src_to_dist',
    'copy:bower_libs',
    'copy:libs',
    'copy:echarts_libs',
    'copy:img_to_dist',
    'copy:pluginDef',
    'babel'
  ]);
};
