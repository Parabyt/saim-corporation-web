<?php
declare(strict_types=1);
function cleanupImages(array $candidates): void {
    if (!$candidates) return;
    beginContent();
    try {
        $references = imageReferences(snapshot());
        foreach (query('SELECT reference_image FROM submissions WHERE reference_image IS NOT NULL') as $row) $references[]=$row['reference_image'];
        foreach (array_unique($candidates) as $path) {
            // External/Firebase URLs and any path not created by this backend are never deleted.
            if (!preg_match('#\A/media/[a-f0-9]{32}\.webp\z#',$path) || in_array($path,$references,true)) continue;
            if (!query('SELECT path FROM media WHERE path=?',[$path])->fetchColumn()) continue;
            $file=config()['media_dir'].'/'.basename($path);
            if (is_file($file) && !unlink($file)) { error_log('Unable to clean managed image: '.$path); continue; }
            query('DELETE FROM media WHERE path=?',[$path]);
        }
        db()->commit();
    } catch(Throwable $error) { if(db()->inTransaction()) db()->rollBack(); throw $error; }
}
function uploadImage(): array {
    $folder=textField($_POST,'folder',30);
    if (!in_array($folder,['categories','subcategories','products','home','requirements'],true)) fail(422,'Invalid media folder.');
    if ($folder!=='requirements') requireAdmin();
    rateLimit('upload:'.clientIp(),$folder==='requirements'?10:120,3600);
    $file=$_FILES['file']??null;
    if (!is_array($file) || !isset($file['error']) || $file['error']!==UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) fail(422,'Upload failed. Maximum file size is 5 MB.');
    if ($file['size']<1 || $file['size']>5*1024*1024) fail(413,'Maximum file size is 5 MB.');
    $mime=(new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    if (!in_array($mime,['image/jpeg','image/png','image/webp'],true)) fail(422,'Only JPEG, PNG and WebP images are accepted.');
    $size=@getimagesize($file['tmp_name']);
    // Bound decoded memory before invoking GD, including very narrow/tall images.
    if (!$size || $size[0]>10000 || $size[1]>10000 || $size[0]*$size[1]>16000000) fail(422,'Image dimensions are too large.');
    $source=@imagecreatefromstring(file_get_contents($file['tmp_name']));
    if (!$source) fail(422,'Invalid image contents.');
    $limit=$folder==='home'?1920:1600; $ratio=min(1,$limit/max($size[0],$size[1]));
    $width=max(1,(int)round($size[0]*$ratio)); $height=max(1,(int)round($size[1]*$ratio));
    $target=imagecreatetruecolor($width,$height); imagealphablending($target,false); imagesavealpha($target,true);
    imagecopyresampled($target,$source,0,0,0,0,$width,$height,$size[0],$size[1]); imagedestroy($source);
    // Re-encoding removes executable payloads and metadata; original bytes/names are discarded.
    $bytes='';
    foreach ([82,72,62,50] as $quality) {
        ob_start(); $ok=imagewebp($target,null,$quality); $bytes=ob_get_clean();
        if (!$ok) { imagedestroy($target); fail(500,'Image encoding failed.'); }
        if (strlen($bytes)<=800*1024) break;
    }
    imagedestroy($target);
    if (!$bytes || strlen($bytes)>800*1024) fail(422,'Image is too complex. Please use a smaller image.');
    $dir=config()['media_dir']; if (!is_dir($dir) && !mkdir($dir,0755,true)) throw new RuntimeException('Cannot create media directory.');
    $name=bin2hex(random_bytes(16)).'.webp'; $path='/media/'.$name;
    $temporary=tempnam($dir,'.upload-');
    try {
        if (file_put_contents($temporary,$bytes,LOCK_EX)!==strlen($bytes) || !rename($temporary,$dir.'/'.$name)) throw new RuntimeException('Cannot store image.');
        chmod($dir.'/'.$name,0644);
        query('INSERT INTO media(path,owner_hash,purpose) VALUES(?,?,?)',[$path,hash('sha256',$_SESSION['media_owner']),$folder]);
    } catch(Throwable $error) {
        if (is_file($temporary)) unlink($temporary);
        if (is_file($dir.'/'.$name)) unlink($dir.'/'.$name);
        throw $error;
    }
    return ['url'=>$path];
}
