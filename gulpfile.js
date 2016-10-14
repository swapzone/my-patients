// include gulp
var gulp = require('gulp');

// include core modules
var path    = require('path'),
    process = require('child_process');

// include gulp plugin loader
var $ = require('gulp-load-plugins')({ lazy: true });

// include karma test runner
var karma = require('karma');

// get the deployment dependencies
var releaseWindows = require('./build.windows'),
    os             = require('os');

/****************************************************************************************************/
/* SETTING UP DEVELOPMENT ENVIRONMENT                                                               */
/****************************************************************************************************/

var electron = require('electron-connect').server.create({
  useGlobalElectron: true,
  path: 'build/',
  logLevel: 1,
  stopOnClose: true
});

// error notification settings for plumber
var plumberErrorHandler = {
  errorHandler: $.notify.onError({
    title: 'Gulp',
    icon: path.join(__dirname, 'gulp.png'),
    message: "Error: <%= error.message %>"
  })
};

/****************************************************************************************************/
/* BUILD TASKS                                                                                      */
/****************************************************************************************************/

// copy font awesome and compile styles
gulp.task('styles', function() {

  gulp.src([
      'bower_components/font-awesome/fonts/*'
    ])
    .pipe(gulp.dest('build/styles/fonts'));

  gulp.src([
      'bower_components/angular-material/angular-material.css'
    ])
    .pipe($.concat('vendor.css'))
    .pipe(gulp.dest('build/styles'));

  return $.rubySass('app/styles/**/*.scss', { style: 'expanded' })
    .on('error', function (err) {
      console.error('Error during scss compilation: ', err.message);
    })
    .pipe(gulp.dest('build/styles'));
});

// process and compile all script files
gulp.task('vendor-scripts', function() {

  return gulp.src([
      'bower_components/moment/moment.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-ui-router/release/angular-ui-router.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-aria/angular-aria.js',
      'bower_components/angular-material/angular-material.js',
      'bower_components/ngstorage/ngStorage.js'
    ])
    .pipe($.plumber(plumberErrorHandler))
    .pipe($.concat('vendor.js'))
    .pipe(gulp.dest('build/scripts'));
});

gulp.task('custom-scripts', function() {
  return $.merge(
      gulp.src([
          'app/scripts/**/*.html'
        ])
        .pipe($.angularTemplatecache('templates.js', {
          root: 'app/templates/',
          module: 'app.templates',
          standalone: true
        })),
      gulp.src([
        'app/scripts/**/*.module.js',
        'app/scripts/**/*.js',
        '!app/scripts/**/*.spec.js'
      ])
    )
    .pipe($.plumber(plumberErrorHandler))
    .pipe($.concat('script.js'))
    .pipe($.ngAnnotate())
    .pipe(gulp.dest('build/scripts'));
});

gulp.task('scripts', function(done) {
  $.sequence('vendor-scripts', 'custom-scripts')(done);
});

// copy html files
gulp.task('pre-process', function() {
  gulp
    .src([
      'app/index.html',
      'app/main.js',
      'app/package.json'
    ])
    .pipe(gulp.dest('build/'));

  // copy data sources
  gulp
    .src([
      'data/accounting.db',
      'data/patients.db',
      'data/settings.db',
      'data/postals.db',
      'data/postals.txt'
    ])
    .pipe(gulp.dest('build/data/'));

  // copy node modules
  gulp
    .src([
      'app/node_modules/**/*'
    ])
    .pipe(gulp.dest('build/node_modules/'));
});

// copy html files
gulp.task('reload-electron', function() {
  electron.reload();
});

/****************************************************************************************************/
/* GULP TASK SUITES                                                                                 */
/****************************************************************************************************/

gulp.task('start', function () {
  electron.start();
});


gulp.task('live', ['pre-process', 'scripts', 'styles'], function() {
  // Start browser process
  electron.start();

  gulp.watch(['app/*.html'], ['pre-process']);
  gulp.watch(['app/styles/**/*.scss'], ['styles', 'reload-electron']);
  gulp.watch(['app/scripts/**/*.html', 'app/scripts/**/*.js'], ['scripts', 'reload-electron']);
});

gulp.task('debug', function () {
  process.spawn(electron, ['--debug=5858', './build'], { stdio: 'inherit' });
});

gulp.task('release', ['pre-process', 'scripts', 'styles'], function () {

  switch (os.platform()) {
    case 'darwin':
      // execute build.osx.js
      break;
    case 'linux':
      //execute build.linux.js
      break;
    case 'win32':
      return releaseWindows.build();
  }
});

gulp.task('test', function (done) {
  var server = new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    autoWatch: false,
    singleRun: true
  }, done);

  server.start();
});