<?php
declare(strict_types=1);
function verifyCaptcha(string $token): void {
    $secret=config()['recaptcha_secret']??'';
    if (!$secret || (config()['environment']==='production' && $secret==='6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe')) fail(503,'Contact verification is not configured.');
    $ch=curl_init('https://www.google.com/recaptcha/api/siteverify');
    curl_setopt_array($ch,[CURLOPT_POST=>true,CURLOPT_POSTFIELDS=>http_build_query(['secret'=>$secret,'response'=>$token]),CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>10,CURLOPT_PROTOCOLS=>CURLPROTO_HTTPS]);
    $response=curl_exec($ch); $status=curl_getinfo($ch,CURLINFO_RESPONSE_CODE); curl_close($ch);
    $value=is_string($response)?json_decode($response,true):null;
    if ($status!==200 || !is_array($value)) fail(503,'Contact verification is unavailable. Please retry.');
    if (empty($value['success']) || (config()['environment']==='production' && ($value['hostname']??'')!==(config()['recaptcha_hostname']??''))) fail(422,'Captcha verification failed. Please try again.');
}
function submitMessage(string $kind,array $data): array {
    rateLimit('submission:'.clientIp(),10,3600);
    $fields=$kind==='contact-messages'
        ? ['fullName','companyName','email','phone','country','subject','message']
        : ['contactPerson','companyName','email','phone','country','productFocus','targetQuantity','message'];
    $payload=[]; foreach ($fields as $field) $payload[$field]=textField($data,$field,$field==='message'?10000:255);
    if (!filter_var($payload['email'],FILTER_VALIDATE_EMAIL)) fail(422,'Invalid email.');
    if (strlen($payload['message'])<20) fail(422,'Message must contain at least 20 characters.');
    $reference=null;
    if ($kind==='contact-messages') {
        if (($data['acceptedTerms']??false)!==true) fail(422,'Accept the terms before sending.');
        verifyCaptcha(textField($data,'captchaToken',4096)); $payload['acceptedTerms']=true;
    } else {
        $reference=textField($data,'referenceImageUrl',2048,false) ?: null;
        if ($reference!==null) {
            if (!preg_match('#\A/media/[a-f0-9]{32}\.webp\z#',$reference)) fail(422,'Upload a reference image first.');
            if (!query('SELECT path FROM media WHERE path=? AND owner_hash=? AND purpose=?',[$reference,hash('sha256',$_SESSION['media_owner']),'requirements'])->fetchColumn()) fail(422,'Reference image does not belong to this session.');
        }
    }
    $payload['source']=textField($data,'source',80,false);
    $id=bin2hex(random_bytes(16));
    beginContent();
    try {
        if ($reference!==null) validateManagedImages([$reference]);
        query('INSERT INTO submissions(id,kind,payload,reference_image) VALUES(?,?,?,?)',[$id,$kind,json_encode($payload,JSON_THROW_ON_ERROR),$reference]);
        db()->commit();
    } catch(Throwable $error) { db()->rollBack(); throw $error; }
    return ['id'=>$id];
}
