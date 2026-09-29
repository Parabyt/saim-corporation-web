<?php
// Local development router. Never use the PHP development server publicly.
$path=parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH);
if ($path==='/api' || str_starts_with($path,'/api/')) { require __DIR__.'/public/api/index.php'; return true; }
if (preg_match('#\A/media/[a-f0-9]{32}\.webp\z#',$path) && is_file(__DIR__.'/public'.$path)) {
    header('Content-Type: image/webp'); header('X-Content-Type-Options: nosniff'); readfile(__DIR__.'/public'.$path); return true;
}
http_response_code(404); return true;
