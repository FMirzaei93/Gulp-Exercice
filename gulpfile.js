// Variables
const gulp = require('gulp');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');
const del = require('del');
const runSequence = require('gulp4-run-sequence');

// "Transforming sass files to css files" process
gulp.task('sass', function() {
    // function() is equal to ()=>
    return gulp.src('dev/scss/**/*.scss') //gets all files ending with .scss in dev/scss and its children directories.
        .pipe(sass())
        .pipe(gulp.dest('dev/css'))
        .pipe(browserSync.stream());
});


gulp.task('prod', async function() {

    // "Minification of javascript files" process
    gulp.src('dev/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('prod/js'));

    // Running "sass" task that already defined
    gulp.series('sass')();

    // Moving css folder to prod folder using gulp
    gulp.src('dev/css/*.css')
        .pipe(gulp.dest('prod/css'));

    gulp.series('imagemin')();

    // Moving fonts to prod folder using gulp
    gulp.src('dev/fonts/*')
        .pipe(gulp.dest('prod/fonts'));

    // Moving index.html file to prod folder using gulp
    gulp.src('dev/*.html')
        .pipe(gulp.dest('prod'));

});

// Syncing browser as soon as changing files
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'dev'
        }
    })
});

function reload() {
    browserSync.reload();
    // The reload method will inform all browsers about changed files and will either cause the browser to refresh,
    //  or inject the files where possible. 
}

// Watching process
gulp.task('watch', async function() {

    gulp.series('browserSync')();

    // Watching changes in .scss files in order to transform them to .css files immidiately
    gulp.watch('dev/scss/**/*.scss', gulp.series('sass'), reload);
    gulp.watch('*.html', reload);
    gulp.watch('*.js', reload);
    //These all mean: if (this file changed watch it, then do this)
});


// Minimizin images and moving them to prod folder using gulp
gulp.task('imagemin', function() {
    return gulp.src('dev/images/*.+(png|jpg|svg|gif)')
        .pipe(cache(imagemin({
            // To create interlaced GIFs (a technique for gradually displaying a raster image)
            // Image optimization is a fairly long process and it is desirable not to repeat it when it is not necessary. For this, we will use the gulp-cache plugin.
            interlacred: true
        })))
        .pipe(gulp.dest('prod/images'));
});


gulp.task('clean:prod', async function() {
    cache.clearAll();
    //deleting all caches in prod folder

    return del('prod/*');
    //deleteing everything 
});

gulp.task('build:prod', function(cb) {
    runSequence('clean:prod', 'prod', cb)
        // the first argument ('clean:prod') will run firstly, but the others will run as parellel.
        // (the tasks in the runSequence's parantheses, will run by the ordered they are placed, but the one in array(series) will run as parellel.)
});

gulp.task('default', function(cb) {
    // By writing $gulp ,everything inside the 'default' task will be called.
    runSequence(['build:prod', 'watch'], cb);
});