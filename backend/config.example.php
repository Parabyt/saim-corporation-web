<?php
// Copy to config.local.php outside public_html. Never commit real credentials.
return [
    'environment' => 'development',
    'origin' => 'http://localhost:4200',
    'db_dsn' => 'mysql:host=127.0.0.1;port=3306;dbname=saim;charset=utf8mb4',
    'db_user' => 'saim',
    'db_password' => '123456',
    'media_dir' => __DIR__ . '/public/media',
    'secure_cookie' => false, // MUST be true with HTTPS in production.
    'recaptcha_secret' => '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe', // Google local test secret only.
    'recaptcha_hostname' => 'localhost',
];
