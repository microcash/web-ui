var gulp = require('gulp');
var replace = require('gulp-replace-path');

gulp.task('default', function () {
    gulp.src('node_modules/jquery/dist/jquery.*')
        .pipe(gulp.dest('web/'))
    gulp.src('semantic/dist/semantic*.css')
        .pipe(replace('themes/default/assets/fonts/', '/'))
        .pipe(gulp.dest('web/'));
    gulp.src('semantic/dist/semantic*.js')
        .pipe(gulp.dest('web/'))});
