'use strict';

import gulp from 'gulp';
import paths from './conf';

gulp.task('copy:server', () => {
  return gulp.src([
      'package.json',
      'bower.json',
      '.bowerrc'
    ], {cwdbase: true})
    .pipe(gulp.dest(paths.dist));
});

