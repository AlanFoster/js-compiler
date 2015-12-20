import gulp from 'gulp';
import pluginloader from 'gulp-load-plugins';
import del from 'del';
import webpackConfiguration from './webpack.js';

const plugins = pluginloader();

const paths = {
	src: 'src',
	dist: 'dist'
};

gulp.task('clean', function () {
	return del([paths.dist]);
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

gulp.task('build', ['build-js', 'build-html']);
gulp.task('default', ['build']);