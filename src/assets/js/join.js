$(document).ready(function() {
    // 삭제 버튼 클릭시 해당 영역 텍스트 삭제
    $('div.util button').on('click', function() {
        $(this).parent().parent().find('.required_input').val('');
    });
    
    //이메일 직접입력 박스 숨김
    $('#email_direct').hide();

    //직접입력 선택시 나타남
    $('#email').change(function() {
        if ($('#email').val() === 'direct') {
            $('#email_direct').show();
        } else {
            $('#email_direct').hide();
        }
    });
    
    //비밀번호 확인
    $('.pw_input:eq(1) #user_pw').on('focusout', function() {
        if ($('.pw_input:eq(0) #user_pw').val() === $('.pw_input:eq(1) #user_pw').val()) {
            $('.pw_check').text('비밀번호가 일치합니다');
        } else {
            $('.pw_check').text('비밀번호가 일치하지 않습니다');
        }
    });
    
    //비밀번호 입력란 초기화할 시 일치여부 확인 문구 삭제
    $('.pw_input div.util button').on('click', function() {
       $('.pw_check').text(''); 
    });
});