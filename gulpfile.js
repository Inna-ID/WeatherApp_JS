const {src, dest, series, watch} = require('gulp')
const sass = require('gulp-sass')
const csso = require('gulp-csso')
const include = require('gulp-file-include')
const htmlmin = require('gulp-htmlmin')
const uglify = require('gulp-uglify')
const del = require('del')
const concat = require('gulp-concat')
const autoprefixer = require('gulp-autoprefixer')
const sync = require('browser-sync').create()

function html() {
	return src('src/**.html')
    .pipe(include({
      prefix: '@@'
    }))
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(dest('dist'))
}

function scss() {
	return src('src/scss/**.scss')
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(csso())
    .pipe(concat('index.css'))
    .pipe(dest('dist/css'))
}

function styleLibs() {
	return src('src/js/libs/*.css')
	.pipe(csso())
	.pipe(concat('libs.min.css'))
	.pipe(dest('dist/css'))
}

function scripts() {
	return src('src/js/*.js')
	.pipe(uglify())
	.pipe(dest('dist/js'))
}

function scriptsLibs() {
	return src('src/js/libs/*.js')
	.pipe(uglify())
	.pipe(concat('libs.min.js'))
	.pipe(dest('dist/js'))
}

function images() {
	return src('src/img/**/*.*')
	.pipe(dest('dist/img'))
}

function fonts() {
	return src('src/fonts/**/*.*')
	.pipe(dest('dist/fonts'))
}

function clear() {
	return del('dist')
}

function serve() {
	sync.init({
		server: './dist',
		notify: false
	})

  watch('src/**.html', series(html)).on('change', sync.reload)
  watch('src/scss/**.scss', series(scss)).on('change', sync.reload)
  watch('src/js/*.js', series(scripts)).on('change', sync.reload)
}

exports.build = series(clear, scss, html, scripts, styleLibs, scriptsLibs, images, fonts)
exports.default = series(clear, html, styleLibs, scriptsLibs, scss, scripts, images, fonts, serve)

exports.clear = clear