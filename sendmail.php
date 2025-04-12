<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $to = "Support@HartCoClothes.com";
    $subject = "New Contact Form Submission from HART Co";

    $name = strip_tags($_POST["name"]);
    $email = filter_var($_POST["email"], FILTER_SANITIZE_EMAIL);
    $message = strip_tags($_POST["message"]);

    $body = "From: $name\nEmail: $email\n\nMessage:\n$message";

    $headers = "From: $email\r\n";
    $headers .= "Reply-To: $email\r\n";

    if (mail($to, $subject, $body, $headers)) {
        echo "Thank you for your message!";
    } else {
        echo "There was an error sending your message.";
    }
}
?>
