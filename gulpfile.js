var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps')
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var nodemon = require('gulp-nodemon')

gulp.task('dev:server', function () {
    nodemon({
        script:'server/server.js',
        ext: 'js',
        ignore:['client','beaglebone']
    });
});

gulp.task('js', function () {
    gulp.src(['client/app/main-module.js',
            'client/app/**/*.js'
    ])
        .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        .pipe(ngAnnotate())
        //.pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('client/app'))
});

gulp.task('watch:js',['js'], function () {
    gulp.watch(['client/app/main-module.js',
                'client/app/**/*.js',
                'client/components/**/*.js'],
               ['js']);
});

gulp.task('dev',['watch:js', 'dev:server']);
