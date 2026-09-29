<?php
// Destructive test helper: only databases whose name contains _test or integration.
require dirname(__DIR__).'/src/bootstrap.php';
if (PHP_SAPI!=='cli' || !preg_match('/dbname=[^;]*(?:_test|integration)/',config()['db_dsn'])) { fwrite(STDERR,'Use a dedicated _test/integration database.'); exit(1); }
$action=$argv[1]??'';
if($action==='admin') {
    $password=trim(stream_get_contents(STDIN));
    query("INSERT INTO admins(email,password_hash) VALUES('integration@saim.invalid',?) ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash),active=1,role='admin'",[password_hash($password,PASSWORD_DEFAULT)]);
    query('DELETE FROM rate_limits');
} elseif($action==='disable') query("UPDATE admins SET active=0 WHERE email='integration@saim.invalid'");
elseif($action==='enable') query("UPDATE admins SET active=1 WHERE email='integration@saim.invalid'");
elseif($action==='expire-idle' || $action==='expire-absolute') {
    $id=$argv[2]??'';
    if(!preg_match('/\A[a-zA-Z0-9,-]+\z/',$id)) exit(1);
    session_name('saim_session'); session_id($id); session_start();
    $_SESSION[$action==='expire-idle'?'last_seen':'signed_in']=time()-($action==='expire-idle'?1801:28801);
    session_write_close();
}
elseif($action==='cleanup') {
    query("DELETE FROM categories WHERE id LIKE 'test-%'");
    query("DELETE FROM submissions WHERE JSON_UNQUOTE(JSON_EXTRACT(payload,'$.companyName'))='Integration Fixture'");
    query("DELETE FROM admins WHERE email='integration@saim.invalid'");
    query('DELETE FROM rate_limits');
}
