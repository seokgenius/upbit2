<?php
    //인코딩
    header('Content-Type: text/html; charset=utf-8');
    
    //mysql 접속
    $host = 'localhost';
    $user = 'seokgenius';
    $password = 'upbit!#%1';
    $db = 'seokgenius';
    $conn = mysqli_connect($host, $user, $password, $db) or die("MySQL 접속 실패");
                    
    //쿼리 실행
    if ($_POST['email'] == 'direct') {
        $_POST['email'] = $_POST['email_direct'];
    }
    $user_id = $_POST['user_id']."@".$_POST['email'];
    $user_pw = $_POST['user_pw'];
    $user_name = $_POST['user_name'];
    $user_tel = $_POST['user_tel'];
    $query = "insert into user_info (user_id, user_pw, user_name, user_tel) values ('$user_id', '$user_pw', '$user_name', '$user_tel')";

    mysqli_query($conn, $query);
    mysqli_close($conn);
?>
<script type="text/javascript" language="javascript">
    //1초후 메인 페이지로 이동
    setTimeout(function() {
        alert("메인으로 이동합니다.");
        document.location = "index.html";
    }, 1000);
</script>