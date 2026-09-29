<?php
declare(strict_types=1);
if(PHP_SAPI!=='cli') { http_response_code(404); exit; }
require dirname(__DIR__).'/src/bootstrap.php';
require dirname(__DIR__).'/src/content.php';
require dirname(__DIR__).'/src/media.php';
try {
    $command=$argv[1]??'';
    if($command==='migrate') {
        db()->exec(file_get_contents(dirname(__DIR__).'/schema.sql')); echo "Schema ready.\n";
    } elseif($command==='create-admin') {
        $email=strtolower($argv[2]??'');
        if(!filter_var($email,FILTER_VALIDATE_EMAIL)) throw new RuntimeException('Provide a valid email.');
        fwrite(STDERR,"Password from stdin (12–72 bytes; use a hidden shell prompt): ");
        $password=rtrim(stream_get_contents(STDIN),"\r\n");
        if(strlen($password)<12 || strlen($password)>72) throw new RuntimeException('Password must be 12–72 bytes.');
        query('INSERT INTO admins(email,password_hash) VALUES(?,?)',[$email,password_hash($password,PASSWORD_DEFAULT)]);
        echo "Admin created.\n";
    } elseif($command==='import') {
        $file=$argv[2]??''; $data=json_decode(file_get_contents($file),true,64,JSON_THROW_ON_ERROR);
        mutateContent(function() use($data) {
            foreach(['categories','subcategories','products','settings','slides','social_links'] as $table)
                if((int)query("SELECT COUNT(*) FROM $table")->fetchColumn()>0) throw new RuntimeException('Import requires an empty content database. Back up and use a fresh database.');
            importCatalog($data); saveHome($data['home']); saveCompany($data['company']);
        }); echo "Content imported atomically.\n";
    } elseif($command==='export') {
        db()->beginTransaction(); $data=snapshot(); db()->commit();
        echo json_encode($data,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR)."\n";
    } elseif($command==='cleanup-media') {
        $paths=query('SELECT path FROM media WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)')->fetchAll(PDO::FETCH_COLUMN);
        cleanupImages($paths); echo "Unreferenced managed images older than 7 days checked.\n";
    } else { throw new RuntimeException('Commands: migrate | create-admin EMAIL | import FILE | export | cleanup-media'); }
} catch(Throwable $error) { fwrite(STDERR,$error->getMessage()."\n"); exit(1); }
