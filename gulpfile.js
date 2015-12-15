// include gulp
var gulp = require('gulp');

// include core modules
var path  = require('path');

// get the dependencies
var concat 		    = require('gulp-concat'),
    merge         = require('gulp-merge'),
    notify		    = require('gulp-notify'),
    plumber 	    = require('gulp-plumber'),
    childProcess  = require('child_process'),
    electron      = require('electron-prebuilt'),
    sass 		      = require('gulp-ruby-sass'),
    ngAnnotate    = require('gulp-ng-annotate'),
    angularTemplateCache
                  = require('gulp-angular-templatecache'),
    gulpSequence  = require('gulp-sequence'),
    liveReload    = require('electron-livereload');

/****************************************************************************************************/
/* SETTING UP DEVELOPMENT ENVIRONMENT                                                               */
/****************************************************************************************************/

// the title and icon that will be used for notifications
var notifyInfo = {
  title: 'Gulp',
  icon: path.join(__dirname, 'gulp.png')
};

// error notification settings for plumber
var plumberErrorHandler = {
  errorHandler: notify.onError({
    title: notifyInfo.title,
    icon: notifyInfo.icon,
    message: "Error: <%= error.message %>"
  })
};

var liveServer = liveReload.server({
  applicationPath: 'build/app'
});

/****************************************************************************************************/
/* BUILD TASKS                                                                                      */
/****************************************************************************************************/

// copy font awesome and compile styles
gulp.task('styles', function() {

  gulp.src([
      'bower_components/font-awesome/fonts/*'
    ])
    .pipe(gulp.dest("build/app/styles/fonts"));

  gulp.src([
      'bower_components/angular-material/angular-material.css'
    ])
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('build/app/styles'));

  return sass('app/styles/**/*.scss', { style: 'expanded' })
    .on('error', function (err) {
      console.error('Error during scss compilation: ', err.message);
    })
    .pipe(gulp.dest('build/app/styles'));
});

// process and compile all script files
gulp.task('vendor-scripts', function() {
  return gulp.src([
      'bower_components/moment/moment.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-aria/angular-aria.js',
      'bower_components/angular-material/angular-material.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-ui-router/release/angular-ui-router.js',
      'bower_components/angular-translate/angular-translate.js',
      'bower_components/ngstorage/ngStorage.js'
    ])
    .pipe(plumber(plumberErrorHandler))
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('build/app/scripts'));
});

gulp.task('custom-scripts', function(done) {
  return merge(
    gulp.src([
        'app/templates/**/*.html'
      ])
      .pipe(angularTemplateCache('templates.js', {
        root: 'app/templates/',
        module: 'app.templates',
        standalone: true
      })),
    gulp.src([
        'app/scripts/**/_*.js',
        'app/scripts/**/*.js'
      ])
    )
    .pipe(plumber(plumberErrorHandler))
    .pipe(concat('script.js'))
    .pipe(ngAnnotate())
    .pipe(gulp.dest('build/app/scripts'));
});

gulp.task('scripts', function(done) {
  gulpSequence('vendor-scripts', 'custom-scripts')(done);
});

// copy html files
gulp.task('preprocess', function() {
  gulp
    .src([
      'app/index.html',
      'app/main.js',
      'app/package.json'
    ])
    .pipe(gulp.dest('build/app/'));

  // copy data sources
  gulp
    .src([
      'data/accounting.db',
      'data/patients.db',
      'data/settings.db'
    ])
    .pipe(gulp.dest('build/app/data/'));

  // copy node modules
  gulp
    .src([
      'app/node_modules/**/*'
    ])
    .pipe(gulp.dest('build/app/node_modules/'));
});

gulp.task('electron-reload', function() {
  liveServer.reload();
});

/****************************************************************************************************/
/* GULP TASK SUITES                                                                                 */
/****************************************************************************************************/

gulp.task('live', ['preprocess', 'scripts', 'styles'], function() {
  liveServer.start();

  gulp.watch(['app/*.html'], ['preprocess']);
  gulp.watch(['app/styles/**/*.scss'], ['styles']);
  gulp.watch(['app/templates/**/*.html', 'app/scripts/**/*.js'], ['scripts']);
  gulp.watch(['build/app/scripts/*.js', 'build/app/styles/*.css', 'build/app/index.html', 'build/app/main.js'], ['electron-reload'])
});

gulp.task('debug', function () {
  childProcess.spawn(electron, ['--debug=5858', './app'], { stdio: 'inherit' });
});