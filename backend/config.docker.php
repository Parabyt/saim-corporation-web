<?php
$config=require __DIR__.'/config.example.php';
$config['db_dsn']='mysql:host=db;dbname=saim;charset=utf8mb4';
$config['db_password']='local-dev-only';
return $config;
