import del from 'del';
import gulp from 'gulp';
import babel from 'gulp-babel';
import cleanCss from 'gulp-clean-css';
import markdown from 'gulp-markdown';
import cheerio from 'gulp-cheerio';
import rename from 'gulp-rename';
import imagemin from 'gulp-imagemin';
import sassComplie from 'gulp-sass';
import injector from 'gulp-inject';
import uglify from 'gulp-uglify';
import watch from 'gulp-watch';
import autoPrefixer from 'gulp-autoprefixer';
import sourceMaps from 'gulp-sourcemaps';
import _ from 'lodash';
import streamSeries from 'stream-series';
import Fiber from 'fibers';
import BrowserSync from 'browser-sync';
import gulpSort from 'gulp-sort';
//
const browserSync = BrowserSync.create();
const clientPath = 'src';
const autoPreFixerBrowsers = ["last 4 version", "not IE 8"];
const paths = {
    client: {
        root: clientPath,
        assets: `${clientPath}/assets/**/*`,
        images: `${clientPath}/assets/images/**/*`,
        fonts:`${clientPath}/assets/fonts`,
        js: `${clientPath}/assets/js`,
        scss:`${clientPath}/assets/scss/**/*`,
        css: `${clientPath}/assets/css`,
        pages: `${clientPath}/pages`,
        vendors: `${clientPath}/assets/vendors`
    },
    dist: {
        root:'dist',
        css:'dist/assets/css',
        images:'dist/assets/images',
        js:'dist/assets/js',
        pages:'dist/pages',
        vendors:'dist/assets/vendors',
        fonts:'dist/assets/fonts'
    }
};
//readme.md 파일 docs.html 로 변환시킴.
let markdownToHTML=()=>{
    return gulp.src('./README.md')
        .pipe( markdown({
            sanitize: false,
            smartypants: true,
            smartLists:true,
            xhtml: true
        }) )
        .pipe( cheerio( ( $, file )=>{
            let titleTxt = '휴네시온';
            let jqueryCDN = 'docs/jquery-1.10.2.min.js';
            $.root().empty();
            $.root().append(`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${titleTxt}</title>
<link rel="stylesheet" href="docs/base.css">
<style>
    h1{font-size:60px;margin:1em 0;}
    body{font-size:14px;}
    blockquote>p{font-size:16px;}
    .btn-shortcut{display:inline-block;padding:0 12px;margin:10px 5px;line-height:33px;border-radius:4px;font-size:14px;color:#fff;background-color:#337ab7;}
    .btn-shortcut:hover{text-decoration: none;color:#fff;box-shadow:inset 0 3px 5px 0 rgba(27, 15, 76, 0.45);}
    .btn-top{z-index: 20;position:fixed;bottom:46px;right:50%;margin-right:-45%;}
    .btn-top>a{display:block;width:66px; height:66px; border-radius: 50%; border: 1px solid #dedede;} 
    .btn-top>a:hover{text-decoration: none;}
    .btn-top>a:before{content:'↑';padding:0 18px;font-size:50px;color:#337ab7;}
    .aver-table{width: 100%;margin-top:100px;text-align:center;border-top:2px solid #dedede;}
    .aver-table th{text-align:center;}
</style>
<script src=${jqueryCDN}></script>
</head><body><header id="header"></header><div class="container"></div><div class="btn-top"><a href="#header"></a></div>
<script>
  let percentItems=[];
  let completeItems=[];
  let totalValue=0;
    let timer = setTimeout(function () {
        clearTimeout(timer);
        $('table a').attr('target', '_blank');
        let i=0;
          let titleMenus=$('h2');
        let len=titleMenus.length;
        let colors = ['#327AB7', '#5cb85c', '#5bc0de', '#4475a7', '#4fa6d9' ];
        let result='<div style="width:100%"><p style="font-size:30px;">바로가기 메뉴</p>';
        for(i=0;i<len;i++){
           result+= '<a class="btn-shortcut" style="background-color:'+colors[ i%5 ]+';" '+
            'href="#'+titleMenus.eq(i).attr('id')+'">'+titleMenus.eq(i).text()+'</a>';
        }
        result+='</div>';
        titleMenus.eq(0).before(result);
        $('.btn-top').on('click', function(e) {
          $('html,body').stop().animate({scrollTop:0}, 700 );
        });
        let taskTable=$('#task-list').next();
        let percentEle=taskTable.find('td:last-child');
        let perTxt=percentEle.text();
     
        percentEle.each(function(i, item){
            let value=( $(item).text() ).split('%').join('');
            if( value === '100' ){
                completeItems.push( value );
            }
            percentItems.push( value );
        });
        for(i=0;i<percentItems.length;i++){
            totalValue+=parseInt( percentItems[i] );
        }
        let average=( totalValue/percentItems.length ).toFixed(3);
        taskTable.after('<table class="aver-table"><thead><tr><th>총페이지수</th><th>작업된 페이지수</th><th>진행률(%)</th></tr></thead><tbody><tr><td>'+percentItems.length+'</td><td>'+completeItems.length+'</td><td>'+average+'(%) </td></tr></tbody></table>');
        //
        }, 450 );
</script>
</body></html>`);
            $('.container').html( file.contents.toString()  );
        }) )
        .pipe(rename('docs.html'))
        .pipe( gulp.dest('./') )
};

//=============================== start : inject =============================================================
// 소스를 inject 할 범위 지정
let injectURLItems = {
    to:[  `${paths.client.pages}/template.html`, `${paths.client.pages}/*.html`],
    from:paths.client.pages
};
const {to, from}=injectURLItems;
let toURL=to || `${paths.client.root}/*.html`;
let fromURL=from || paths.client.pages;

//css inject
function injectCss() {
    return gulp.src( toURL )
        .pipe(injector(
            streamSeries(
                gulp.src(`${paths.client.vendors}/**/*.css`, {read: false}),
                gulp.src(`${paths.client.css}/*.css`, {read: false})), // 순차 실행
            {relative: true}))
        .pipe(gulp.dest(fromURL))
}

//dependency js inject - 의존성 js 기재 - jquery 처럼 모든 소스에 의존성이 있는 파일
function injectDependencyJs() {
    return gulp.src(toURL)
        .pipe(injector(
            gulp.src([
                `${paths.client.vendors}/jquery/jquery-1.10.2.min.js`,
                `${paths.client.vendors}/bootstrap/js/bootstrap.js`,
                `${paths.client.vendors}/greensock/TweenMax.min.js`,
                // `${paths.client.vendors}/swiper/js/swiper.min.js`,
                // `${paths.client.vendors}/bootstrap-datepicker/js/bootstrap-datepicker.js`,
                // `${paths.client.vendors}/bootstrap-datepicker/js/locales/bootstrap-datepicker.kr.js`,
                `${paths.client.vendors}/mustache/mustache.min.js`,
                `${paths.client.vendors}/toast-ui/tree/tui-tree.js`,
                `${paths.client.vendors}/toast-ui/pagination/tui-pagination.js`,
            ], {read: false}),
            {relative: true, starttag: '<!-- inject:dependency:{{ext}} -->'}))
        .pipe(gulp.dest(fromURL))
}

//공통 js inject - head 에 선언되어야 하는 기본 js
function injectHeadJs() {
    return gulp.src(toURL)
        .pipe(injector(
            gulp.src(
                _.union(
                    [`${paths.client.js}/apps.js`],
                    [`!${paths.client.vendors}/jquery/jquery-1.10.2.min.js`,
                        // `!${paths.client.vendors}/bootstrap-datepicker/**/*`,
                        `!${paths.client.vendors}/toast-ui/tree/**/*`,
                        `!${paths.client.vendors}}/greensock/**/*`]  // ! 붙여서 제외할 파일
                ),
                {read: false}),
            {relative: true, starttag: '<!-- inject:head:{{ext}} -->'}))
        .pipe(gulp.dest(fromURL))
}

// html 태그 내에서 맨 하단에 불러올 js
function injectJs() {
    let first = gulp.src(`${paths.client.js}/Utils.js`, {read: false});
    let second = gulp.src(`${paths.client.js}/common.js`, {read: false});
    let etc = gulp.src(`${paths.client.js}/!(apps|common|Utils|menu).js`, {read: false}); // 정규표현식으로 제외할 파일명 지정
    return gulp.src(toURL)
        .pipe(injector(
            streamSeries(first, second, etc), //gulp.src() 메서드로 호출한 스트림을 순차적으로 적용시킴. 즉 저정한 대로 파일이 순차적으로 로드 된다.
            {relative: true}))
        .pipe(gulp.dest(fromURL))
}

//=================================== end : inject ============================================================

/**
 * scss 컴파일링.
 * @returns {*}
 */
function compileSass(type='local') {
    // expanded - 표준 css / compact -  한줄로 나타내는 스타일의 css 파일 / compressed - 빈공간이 없는 압축된 스타일의 css 파일
    let outputType = (type === 'local') ? 'expanded' : 'compressed';
    return gulp.src(`${paths.client.scss}.scss`)
        .pipe(sourceMaps.init())
        // .pipe(cleanCss({compatibility: 'ie8'}))
        .pipe(sassComplie({
            outputStyle: outputType,
            fiber: Fiber
        }).on("error", sassComplie.logError))
        .pipe(autoPrefixer(autoPreFixerBrowsers))
        .pipe(sourceMaps.write(`.`))
}

function localSassToCss() {
    return compileSass('local')
        .pipe(gulp.dest(paths.client.css))
        .pipe(browserSync.stream());
}

function distSassToCss() {
    return compileSass('dist')
        .pipe(gulp.dest(paths.dist.css))
}
/*Gulp 4.0부터는 Task 함수를 사용하기보다 일반 기명함수로 Task 를 만들고, CommonJS 모듈 형식으로 내보내기를 권장한다.*/
function distHTML() {
    return gulp.src(`${paths.client.pages}/*.html`)
        .pipe(gulp.dest(paths.dist.pages))
}

function distJS() {
    return gulp.src(`${paths.client.js}/*.js`)
        .pipe(sourceMaps.init())
        .pipe( babel() )
        // .pipe( uglify() )
        .pipe(sourceMaps.write(`.`))
        .pipe(gulp.dest(paths.dist.js))
}

function distVendors() {
    return gulp.src(`${paths.client.vendors}/**/*`)
        .pipe(gulp.dest(paths.dist.vendors))
}

function distFonts() {
    return gulp.src(`${paths.client.fonts}/**/*`, { dot: true })
        .pipe(gulp.dest(paths.dist.fonts));
}
//optimizationLevel
//- default 는 3 // 값은 0 ~ 7 까지
// 값 1 - 1 trial
// 값 2 - 8 trials
// 값 3 - 16 trials
// 값 4 - 24 trials
// 값 5 - 48 trials
// 값 6 - 120 trials
// 값 7 - 240 trials
//- 즉 수치가 높을수록 압축시도가 높아진다.
function minifyImg() {
    return gulp.src(`${paths.client.images}`)
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}), //점진적인 렌더링
            imagemin.jpegtran({progressive: true}), //무손실로 점진적으로 렌더링
            imagemin.optipng({optimizationLevel: 1})
        ]))
        .pipe(gulp.dest(paths.dist.images));
}
//start: dist 경로 내에 파일 지우기.
const cleanDos = () => del([ 'docs.html' ], {force:true});
const cleanDist = () => del([ `${paths.dist.root}/**/*` ], {force:true});
const cleanClientCss = () => del([`${paths.client.css}/*`], {force: true});
const cleanDistCss = () => del([ `${paths.dist.css}/*` ], {force:true});
const cleanDistHtml = () => del([ `${paths.dist.pages}/*` ], {force:true});
//end: dist 경로 내에 파일 지우기.

//리로드
const reload = browserSync.reload;

const localWatch = () => {
    /*browserSync.init({
        server: `${clientPath}/`
    });*/
    watch(`${paths.client.scss}`, localSassToCss);
    // watch(`${paths.client.js}/*.js`, reload);
    // watch(`${clientPath}/*.html`, reload);
     watch(`${clientPath}/**/*`, (e) => {
         console.log(`${e.event}: ${e.path.split("/").pop()}`);
     });
};

//readme.md 파일 변환 하여 docs.html 로 배포시킴.
const docs = gulp.series(cleanDos, markdownToHTML);

//html 에 라이브러리 inject- injectURLItems 배열에 경로 지정이 있으니 반드시 확인 및 수정 후 inject 해야 한다.
const inject = gulp.series(injectCss, injectDependencyJs, injectHeadJs, injectJs);

//local
const local = gulp.series(cleanClientCss, localSassToCss, inject );
const dev = gulp.series(cleanClientCss, localSassToCss, localWatch);
//html 복사 이동, scss 변환
const dist = gulp.series(cleanDist, gulp.parallel(distSassToCss, minifyImg, distJS, distVendors, distFonts), distHTML);

//최종 출판
const prod = gulp.series(dist, docs);
export {docs, inject, dist, dev, local, prod }

/*
//gulp.task 형식으로 쓰려면 아래와 같이 사용.
gulp.task('scss', done =>{
    //실행 코드
    //series 함수는 Task 를 순차적으로 실행한다. 각 Task 는 종료 시점을 알기 위해 Promise, Stream 또는 아래와 같이 명시적으로 완료 콜백 함수를 호출해야 한다.
    gulp.series(cleanDist, compileSass)();

    //series 에 인수로 넣은 함수 중 완료 콜백이 존재하지 않는다면 위의 task 에 전달인자를 한개 선언하여 이 지점에서 콜백 호출하듯 하면 된다.
    done();
});
*/