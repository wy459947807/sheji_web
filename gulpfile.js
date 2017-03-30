var path = require("path");
var gulp = require("gulp");
var sass = require("gulp-sass");
var spritesmith = require("gulp.spritesmith");
var imagemin = require("gulp-imagemin");
var pngquant = require("imagemin-pngquant");
var mozjpeg = require("imagemin-mozjpeg");
var merge = require("merge-stream");
var runSequence = require("run-sequence");
var gm = require("gulp-gm");
var rename = require("gulp-rename");
var del = require("del");
var replace = require("gulp-replace");
var gulpif = require("gulp-if");
var rev = require("gulp-rev");
var revReplace = require("gulp-rev-replace");
var revdel = require("gulp-rev-delete-original");
var tap = require("gulp-tap");

var imageminOptions = [pngquant(), mozjpeg({ progressive: true, quality: 90 })];

gulp.task("clean", function() {
    return del(["dist/*.html", "dist/assets"]);
});

gulp.task("normalimage", function() {
    return gulp.src("src/img/sprites/*@2x.png")
        .pipe(gm(function(gmfile) {
            return gmfile.resize(50, 50, "%");
        }))
        .pipe(rename(function(path) {
            path.basename = path.basename.replace("@2x", "");
        }))
        .pipe(gulp.dest("src/img/sprites/_normal"));
});

gulp.task("clean-normalimage", function() {
    return del(["src/img/sprite.png", "src/img/sprites/_normal"]);
});

gulp.task("sprite", ["normalimage"], function() {
    var spriteData = gulp.src(["src/img/sprites/**/*.png"]).pipe(spritesmith({
        imgName: "sprite.png",
        imgPath: "../img/sprite.png",
        retinaSrcFilter: ["src/img/sprites/*@2x.png"],
        retinaImgName: "sprite@2x.png",
        retinaImgPath: "../img/sprite@2x.png",
        cssName: "_sprite.scss",
        padding: 2
    }));

    var imgStream = spriteData.img.pipe(gulp.dest("src/img"));
    var cssStream = spriteData.css.pipe(gulp.dest("src/scss"));

    return merge(imgStream, cssStream);
});

gulp.task("build-sprite", function(callback) {
    runSequence("sprite", "clean-normalimage", callback);
});

gulp.task("imagemin", function() {
    return gulp.src("dist/assets/img/**/*")
        .pipe(imagemin(imageminOptions))
        .pipe(gulp.dest("dist/assets/img"));
});

gulp.task("cleanup", function() {
    return del(["dist/assets/js/landing*", "dist/assets/js/share*"]);
});

gulp.task("act-clean", function() {
    return del(["dist/*", "!dist/*.html", "!dist/assets"]);
});

gulp.task("act-copy", function() {
    return gulp.src(["src/activities/**/*", "!src/activities/@(event|oneyuan|redpacket|jaycnparty)/**/*", "!src/activities/@(event|oneyuan|redpacket|jaycnparty)", "!**/*.scss"])
        .pipe(gulpif(/\.(jpg|png)$/, imagemin(imageminOptions)))
        .pipe(gulpif(/\.js$/, replace("http://dev-yedian.chinacloudapp.cn", "")))
        .pipe(gulp.dest("dist/act"));
});

gulp.task("act-copy-old", function() {
    return gulp.src(["src/activities/@(event|oneyuan|redpacket|jaycnparty)/**/*", "!**/*.scss"], { base: "src/activities" })
        .pipe(gulpif(/\.(jpg|png)$/, imagemin(imageminOptions)))
        .pipe(gulpif(/\.js$/, replace("http://dev-yedian.chinacloudapp.cn", "")))
        .pipe(gulp.dest("dist"));
});

gulp.task("act-revision", function() {
    return gulp.src(["dist/**/app.js", "dist/**/yd.js"])
        .pipe(rev())
        .pipe(revdel())
        .pipe(gulp.dest("dist"))
        .pipe(rev.manifest())
        .pipe(gulp.dest("dist"));
});

function adjustManifestPath(folderName) {
    return function(filePath) {
        var fileName = path.basename(filePath);

        if (/^yd-?/.test(fileName)) return fileName;

        return filePath.replace(folderName + "/", "");
    };
}

gulp.task("act-revreplace", function() {
    return gulp.src(["dist/**/index.html", "!dist/index.html"])
        .pipe(tap(function(file) {
            var manifest = gulp.src("dist/rev-manifest.json");
            var folderName = path.dirname(file.path).split(path.sep).pop();
            var modifyFunc = adjustManifestPath(folderName);

            return gulp.src(file.path, { base: "dist" })
                .pipe(revReplace({
                    manifest: manifest,
                    modifyUnreved: modifyFunc,
                    modifyReved: modifyFunc
                }))
                .pipe(gulp.dest("dist"));
        }));
});

gulp.task("act-revclean", function() {
    return del(["dist/rev-manifest.json"]);
});

gulp.task("act", function(callback) {
    runSequence("act-clean", "act-copy", "act-copy-old", "act-revision", "act-revreplace", "act-revclean", callback);
});

gulp.task("prebuild", function(callback) {
    runSequence("clean", "build-sprite", callback);
});

gulp.task("postbuild", ["imagemin", "cleanup"]);
