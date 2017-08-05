
// wrapper函数，包含了整个Grunt配置信息。
// module.exports = function(grunt) {}
module.exports = function (grunt) {

  // matchdep 免去重复 加载task
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // 初始化 configuration 对象
  grunt.initConfig({
    // 从package.json 文件读入项目配置信息，并存入pkg 属性内。
    pkg: grunt.file.readJSON('package.json'),

    // 清除生产目录dist下所有文件夹及其代码
    clean: {
      all: ['dist/**', 'dist/*.*'],
      image: ['dist/img', 'dist/views/images'],
      css: ['dist/css', 'dist/views/css'],
      html: 'dist/**/*'
    },

    // 从源src目录下拷贝需要做自动化处理的文件
    copy: {
      src: {
        files: [
          {expand: true, cwd: '', src: ['*.html', 'views/*.html'], dest: 'dist'}
        ]
      },
      image: {
        files: [
          {expand: true, cwd: '', src: ['img/*.{png,jpg,jpeg,gif}','views/images/*.{png,jpg,jpeg,gif}'], dest: 'dist'}
        ]
      },
      css: {
        files: [
          {expand: true, cwd: '', src: ['css/*.css', 'views/css/*.css'], dest: 'dist'}
        ]
      },
      js: {
        files: [
          {expand: true, cwd: '', src: ['js/*.js', 'js/libs/*.js'], dest: 'dist'}
        ]
      }
    },

    // usemin 准备工作
    useminPrepare: {
      html: ['index.html'],
      options: {
        dest: 'dist'
      }
    },

    // 压缩JS
    uglify: {
      prod: {
        options: {
            mangle: false,
            banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
        },
        files: [{
            expand: true,
            cwd: 'dist',
            src: ['js/*.js', 'views/js/*.js', '!js/*.min.js', '!views/js/*.min.js'],
            dest: 'dist',
            ext: '.min.js',  // 更改拓展名为 *.min.js
            extDot: 'first'  // 从文件名第一个 `.` 开始匹配
        }]
      }
    },

    // 压缩CSS
    cssmin: {
      prod: {
        options: {
          report: 'gzip',
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
          beautify: {
            // 中文ascii化，防止中文乱码
            ascii_only: true
          }
        },
        files: [
          {
            expand: true, // expand 设置为true用于启用下面的选项：
            cwd: 'dist',
            src: ['css/*.css', 'views/css/*.css'],
            dest: 'dist',
            ext: '.min.css',
            extDot: 'first'
          }
        ]
      }
    },

    // 压缩图片
    imagemin: {
      prod: {
        options: {
          optimizationLevel: 7,
        //   pngquant: true
        //   use: [mozjpeg()]
        },
        files: [
          {expand: true, cwd: 'dist', src: ['img/*.{png,jpg,jpeg,gif,webp,svg}'], dest: 'dist'}
        ]
      }
    },

    // 处理html中css、js 引入合并问题
    usemin: {
      html: ['dist/index.html']
    },

    // 压缩HTML
    htmlmin: {
      options: {
        removeComments: true,
        removeCommentsFromCDATA: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: false,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeOptionalTags: false
      },
      html: {
        files: [
          {expand: true, cwd: 'dist', src: ['*.html', 'views/*.html'], dest: 'dist'}
        ]
      }
    }

  });

  // 自定义任务
  grunt.registerTask('default', [
    'copy',                 //复制文件
    'useminPrepare',        // usemin准备工作
    'imagemin',             //图片压缩
    'cssmin',               //CSS压缩
    'uglify',               //JS压缩
    'usemin',               //HTML处理
    'htmlmin'               //HTML压缩
  ]);

  grunt.registerTask('publish', ['clean', 'default']);
};