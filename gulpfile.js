'use strict';
/* global exec */

require('shelljs/global');

var gulp = require('gulp');
var plgs = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'run-sequence', 'merge-stream', 'main-bower-files', 'del'],
  replaceString: /^gulp-?/
});

var func = {

  /**
   * Create a task to exec jshint.
   */
  jshint: function(globs) {
    return function() {
      return gulp.src(globs)
        .pipe(plgs.plumber({ errorHandler: plgs.notify.onError('<%= error.message %>') }))
        .pipe(plgs.jshint())
        .pipe(plgs.jshint.reporter('jshint-stylish'))
        .pipe(plgs.jshint.reporter('fail'));
    };
  },

  /**
   * Create a task to exec scsslint.
   */
  scsslint: function(globs) {
    return function() {
      return gulp.src(globs)
        .pipe(plgs.plumber({ errorHandler: plgs.notify.onError('<%= error.message %>') }))
        .pipe(plgs.scssLint());
    };
  },

  /**
   * Create a task to test files with mocha.
   */
  mocha: function(globs) {
    return function() {
      return gulp.src(globs, { read: false })
        .pipe(plgs.plumber({ errorHandler: plgs.notify.onError('<%= error.message %>') }))
        .pipe(plgs.spawnMocha({
          reporter: 'list',
          timeout: 10000,
          bail: true,
          env: {
            NODE_ENV: 'testing',
            PORT: 30000
          }
        }));
    };
  },

  /**
   * Create a task to do nothing.
   */
  noop: function() {
    return function(done) {
      return done();
    };
  },

  /**
   * Create a function to call specific function with no args.
   */
  wrap: function(func) {
    return function() {
      return func();
    };
  }
};


//
// test
//
gulp.task('jshint:server', func.jshint(['server/**/*.js']));
gulp.task('jshint:client', func.jshint(['client/app/scripts/**/*.js']));
gulp.task('jshint', function(done) {
  plgs.runSequence(['jshint:server', 'jshint:client'], func.wrap(done));
});

gulp.task('scsslint:client', func.scsslint(['client/app/styles/**/*.scss']));
gulp.task('scsslint', function(done) {
  plgs.runSequence(['scsslint:client'], func.wrap(done));
});

gulp.task('test:server', func.mocha(['server/test/spec/*.js']));
gulp.task('test:client', func.noop());
gulp.task('test', function(done) {
  plgs.runSequence(['test:server', 'test:client'], func.wrap(done));
});

//
// serve
//
gulp.task('watch', function() {
  gulp.watch([
    'client/app/{scripts,directives}/**/*.js',
    'client/app/{views,directives}/**/*.html'
  ], ['compile:scripts']);

  gulp.watch([
    'client/app/styles/*.scss'
  ], ['compile:styles']);
});

gulp.task('serve', ['compile', 'watch'], function() {
  exec('./bin/hiptory setup', function() {
    plgs.nodemon({ 
      script: './bin/hiptory',
      args: ['start'],
      watch: ['server/**/*.js', 'server/**/*.jade'],
      ignore: ['client/dist/**'] 
    });
  });
});

//
// compile
//
gulp.task('compile:scripts:components', function() {
  var bowerFiles = plgs.mainBowerFiles({ filter: function(path) {
    return /\.js$/.test(path) && !/bootstrap-sass/.test(path);
  }});

  return gulp.src(bowerFiles)
    .pipe(plgs.concat('_components.js'))
    .pipe(plgs.jsbeautifier({ config: '.jsbeautifyrc' }))
    .pipe(gulp.dest('client/dev/scripts'));
});

gulp.task('compile:scripts:directives', function() {
  return gulp.src(['client/app/directives/**/*.html'])
    .pipe(plgs.ngHtml2js({
      moduleName: 'hiptory',
      prefix: '/directives/'
    }))
    .pipe(plgs.concat('directives.js'))
    .pipe(plgs.jsbeautifier({ config: '.jsbeautifyrc' }))
    .pipe(gulp.dest('client/.tmp/scripts'));
});

gulp.task('compile:scripts:views', function() {
  return gulp.src(['client/app/views/**/*.html'])
    .pipe(plgs.ngHtml2js({
      moduleName: 'hiptory',
      prefix: '/views/'
    }))
    .pipe(plgs.concat('views.js'))
    .pipe(plgs.jsbeautifier({ config: '.jsbeautifyrc' }))
    .pipe(gulp.dest('client/.tmp/scripts'));
});

gulp.task('compile:scripts:app', ['jshint:client', 'compile:scripts:directives', 'compile:scripts:views'], function() {
  var globs = [
    'client/app/scripts/hiptory.js',
    'client/app/scripts/**/*.js',
    'client/app/directives/**/*.js',
    'client/.tmp/scripts/**/*.js'
  ];

  return gulp.src(globs)
    .pipe(plgs.concat('hiptory.js')) 
    .pipe(plgs.ngAnnotate())
    .pipe(gulp.dest('client/dev/scripts'));
});

gulp.task('compile:scripts', function(done) {
  plgs.runSequence(['compile:scripts:components', 'compile:scripts:app'], done);
});

gulp.task('compile:styles', ['scsslint:client'], function() {
  var bowerFiles = plgs.mainBowerFiles({ filter: function(path) {
    return /\.css$/.test(path);
  }});
  return plgs.mergeStream(
    gulp.src(bowerFiles)
      .pipe(plgs.concat('_components.css'))
      .pipe(gulp.dest('client/dev/styles')),
    gulp.src(['client/app/styles/*.scss'])
      .pipe(plgs.plumber({ errorHandler: plgs.notify.onError('<%= error.message %>') }))
      .pipe(plgs.sass({ outputStyle: 'expanded' }))
      .pipe(gulp.dest('client/dev/styles'))
  );
});

gulp.task('compile:fonts', function() {
  return gulp.src(['bower_components/bootstrap-sass/assets/fonts/bootstrap/**/*.{woff,ttf}'])
    .pipe(gulp.dest('client/dev/fonts'));
});

gulp.task('compile', ['sweep'], function(done) {
  plgs.runSequence(['compile:scripts', 'compile:styles', 'compile:fonts'], func.wrap(done));
});

gulp.task('sweep', function(done) {
  plgs.del(['client/dev'], done);
});

//
// build
//
gulp.task('build:scripts', function() {
  return gulp.src(['client/dev/scripts/*.js'])
    .pipe(plgs.plumber({ errorHandler: plgs.notify.onError('<%= error.message %>') }))
    .pipe(plgs.concat('hiptory.min.js'))
    .pipe(plgs.uglify())
    .pipe(gulp.dest('client/prd/scripts'));
});

gulp.task('build:styles', function() {
  return gulp.src(['client/dev/styles/*.css'])
    .pipe(plgs.concat('hiptory.min.css'))
    .pipe(plgs.csso())
    .pipe(gulp.dest('client/prd/styles'));
});

gulp.task('build:fonts', function() {
  return gulp.src(['client/dev/fonts/**/*'])
    .pipe(gulp.dest('client/prd/fonts'));
});

gulp.task('build', ['clean'], function(done) {
  plgs.runSequence('compile', ['build:scripts', 'build:styles', 'build:fonts'], func.wrap(done));
});

gulp.task('clean', function(done) {
  plgs.del(['client/prd'], done);
});
