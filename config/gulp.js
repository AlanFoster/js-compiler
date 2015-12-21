import gulp from 'gulp';
import pluginloader from 'gulp-load-plugins';
import del from 'del';
import webpackConfiguration from './webpack.js';
import _ from 'lodash';
import { Server as KarmaServer } from 'karma';

const plugins = pluginloader();

const paths = {
	src: 'src',
	dist: 'dist'
};

const runKarmaServer = function (configFile, done) {
  new KarmaServer({ configFile: __dirname + configFile }, done).start();
};

gulp.task('clean', function () {
	return del([paths.dist]);
});

gulp.task('test', function (done) {
  runKarmaServer('/karma.js', done);
});

gulp.task('test-dev', function (done) {
  runKarmaServer('/karma.ci.js', done);
});

gulp.task('build-js', function () {
  return gulp.src(`${paths.src}/js/app/index.js`)
             .pipe(plugins.webpack(webpackConfiguration))
             .pipe(gulp.dest(paths.dist));
});

gulp.task('build-html', function () {
    return gulp.src(`${paths.src}/**/*.html`)
                .pipe(gulp.dest(paths.dist));
});

gulp.task('watch', ['build-html'], function () {
	  return gulp.src(`${paths.src}/js/app/index.js`)
             .pipe(plugins.webpack(_.extend({ }, webpackConfiguration, { watch: true })))
             .pipe(gulp.dest(paths.dist));
});

gulp.task('build', ['build-js', 'build-html']);
gulp.task('default', ['build']);
