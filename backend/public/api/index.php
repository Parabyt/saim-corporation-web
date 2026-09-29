<?php
declare(strict_types=1);
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
header('Referrer-Policy: same-origin');
// Hostinger entrypoint may define this to a private directory outside public_html.
$root=defined('SAIM_BACKEND_ROOT')?SAIM_BACKEND_ROOT:dirname(__DIR__,2);
require $root.'/src/bootstrap.php';
require $root.'/src/auth.php';
require $root.'/src/content.php';
require $root.'/src/media.php';
require $root.'/src/submissions.php';
try {
    config(); startSession();
    $method=$_SERVER['REQUEST_METHOD'];
    $path=trim(substr(parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH),strlen('/api')),'/');
    if (!in_array($method,['GET','POST','PUT','DELETE'],true)) fail(405,'Method not allowed.');
    if ((int)($_SERVER['CONTENT_LENGTH']??0)>6*1024*1024) fail(413,'Request too large.');
    if ($method!=='GET') csrf();
    if ($path==='auth/session' && $method==='GET') jsonResponse(['user'=>currentAdmin(),'csrfToken'=>$_SESSION['csrf']]);
    if ($path==='auth/login' && $method==='POST') jsonResponse(login(body()));
    if ($path==='auth/logout' && $method==='POST') {
        $_SESSION=[]; session_destroy();
        setcookie(session_name(),'', ['expires'=>time()-3600,'path'=>'/api','secure'=>config()['secure_cookie'],'httponly'=>true,'samesite'=>'Strict']);
        jsonResponse(['ok'=>true]);
    }
    if ($method==='GET' && in_array($path,['content','categories','subcategories','products','slides','home','company','social-links'],true)) {
        // One repeatable-read snapshot prevents mixed parent/child lists during a concurrent write.
        db()->beginTransaction(); $content=snapshot(); db()->commit();
        jsonResponse(match($path) { 'content'=>$content, 'slides'=>$content['home']['heroSlides'], 'social-links'=>$content['company']['socials'], default=>$content[$path] });
    }
    if ($method==='GET' && preg_match('#\A(categories|subcategories|products)/([a-zA-Z0-9_-]{1,80})\z#',$path,$match)) {
        db()->beginTransaction(); $content=snapshot(); db()->commit();
        foreach($content[$match[1]] as $item) if($item['id']===$match[2]) jsonResponse($item);
        fail(404,'Not found.');
    }
    if ($path==='media' && $method==='POST') jsonResponse(uploadImage(),201);
    if (in_array($path,['requirements','contact-messages'],true) && $method==='POST') jsonResponse(submitMessage($path,body()),201);
    requireAdmin();
    if ($path==='submissions' && $method==='GET') {
        $rows=query('SELECT * FROM submissions ORDER BY created_at DESC LIMIT 200')->fetchAll();
        foreach($rows as &$row) $row['payload']=json_decode($row['payload'],true);
        jsonResponse($rows);
    }
    if (preg_match('#\A(categories|subcategories|products)(?:/([a-zA-Z0-9_-]{1,80}))?\z#',$path,$match)) {
        $resource=$match[1]; $id=$match[2]??null;
        if ($method==='PUT' && $id!==null || $method==='POST' && $id===null) {
            $data=body(); jsonResponse(mutateContent(fn()=>upsertCatalog($resource,$data,$id)));
        }
        if ($method==='DELETE' && $id!==null) jsonResponse(mutateContent(function() use($resource,$id) { query("DELETE FROM $resource WHERE id=?",[$id]); }));
    }
    if ($path==='home' && $method==='PUT') { $data=body(); jsonResponse(mutateContent(fn()=>saveHome($data))); }
    if ($path==='company' && $method==='PUT') { $data=body(); jsonResponse(mutateContent(fn()=>saveCompany($data))); }
    if ($path==='slides' && $method==='PUT') { $data=body(); jsonResponse(mutateContent(fn()=>saveSlides(listField($data,'slides',30)))); }
    if ($path==='social-links' && $method==='PUT') { $data=body(); jsonResponse(mutateContent(fn()=>saveSocials(listField($data,'socials',4)))); }
    if ($path==='catalog/import' && $method==='POST') { $data=body(); jsonResponse(mutateContent(fn()=>importCatalog($data))); }
    fail(404,'Not found.');
} catch(ApiError $error) {
    jsonResponse(['error'=>$error->getMessage()],$error->status);
} catch(PDOException $error) {
    error_log((string)$error);
    jsonResponse(['error'=>$error->getCode()==='23000'?'This change conflicts with existing catalog relationships.':'Database request failed. Please retry.'],$error->getCode()==='23000'?409:503);
} catch(Throwable $error) {
    error_log((string)$error); jsonResponse(['error'=>'The service is unavailable. Please retry.'],503);
}
