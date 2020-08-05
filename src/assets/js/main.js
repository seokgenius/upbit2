$(document).ready(function() {
    //main-visual 숫자 카운트
    setCount('.app-viewinfo ul li:eq(0) .app-num', 2000, 129);
    setCount('.app-viewinfo ul li:eq(1) .app-num', 2000, 129);

    function setCount(selector, duration, step) {
        var timerId = '';
        var numTarget = parseInt($(selector).text());
        var numNow = 0;
        var numStep = Math.ceil(numTarget / step);
        var speed = Math.ceil(duration / step);

        timerId = setInterval(function() {
            if (numNow > numTarget) {
                $(selector).text(numTarget);
                clearInterval(timerId);
            } else {
                $(selector).text(numNow);
                numNow += numStep;     
            }
        }, speed);
    }

	//이미지 슬라이드
    setImageSlide('div.app-slider-circle-wrap div', 1, true, 3000);
    
    function setImageSlide(selector, first, status, speed) {
        var numSlide = $(selector).length;
        var slideNow = 0;
        var slideNext = 0;
        var slideFirst = first;
        var timerId = null;
        var isTimerOn = status;
        var timerSpeed = speed;

        showSlide(slideFirst);

        $(selector).find('a.slide-btn').on('click focusin', function() {
            var index = $(this).parent().index();
            showSlide(index + 1);
        });

        function showSlide(n) {
            clearTimeout(timerId);
            $(selector).removeClass('on');
            $(selector).find('img.on').css({'opacity': 0});
            $(selector).find('img.off').css({'opacity': 1});
            $(selector).eq(n - 1).addClass('on');
            $(selector).eq(n - 1).find('img.on').css({'transition':'opacity 0.5s ease', 'opacity': 1});
            $('.app-info1 .app-slider-bg .app-mobile-slider img').css({'opacity': 0.5}).stop().attr('src', '../assets/images/slider' + n + '.png').animate({'opacity': 1});
            slideNow = n;
            slideNext = (n >= numSlide) ? 1 : (n + 1);
            if (isTimerOn === true) {
                timerId = setTimeout(function() {showSlide(slideNext);}, timerSpeed);
            }
        }
    }
});