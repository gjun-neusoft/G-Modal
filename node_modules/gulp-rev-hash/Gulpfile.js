var gulp = require('gulp');
var rev = require('./index');

gulp.task('test', function () {
  gulp.src('test/example.html')
    .pipe(rev({assetsDir: 'test'}))
    .pipe(gulp.dest('test'));
});
