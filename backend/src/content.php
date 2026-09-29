<?php
declare(strict_types=1);
function setting(string $name, array $fallback = []): array {
    $value = query('SELECT value FROM settings WHERE name=?', [$name])->fetchColumn();
    return $value === false ? $fallback : json_decode($value, true, 64, JSON_THROW_ON_ERROR);
}
function setSetting(string $name, array $value): void {
    query('INSERT INTO settings(name,value) VALUES(?,?) ON DUPLICATE KEY UPDATE value=VALUES(value)', [$name,json_encode($value, JSON_THROW_ON_ERROR)]);
}
function snapshot(): array {
    $categories = query('SELECT id,slug,title,description,image_url AS imageUrl FROM categories ORDER BY sort_order')->fetchAll();
    $subcategories = query('SELECT id,slug,category_id AS categoryId,title,description,image_url AS imageUrl FROM subcategories ORDER BY sort_order')->fetchAll();
    $products = query('SELECT id,slug,category_id AS categoryId,subcategory_id AS subcategoryId,title,description,image_url AS imageUrl,origin_country AS originCountry,price,currency FROM products ORDER BY sort_order')->fetchAll();
    $galleries = [];
    foreach (query('SELECT * FROM product_images ORDER BY product_id,position') as $image) $galleries[$image['product_id']][] = $image['url'];
    foreach ($products as &$product) { $product['price'] = (float)$product['price']; $product['gallery'] = $galleries[$product['id']] ?? []; }
    unset($product);
    $home = setting('home', ['marqueeText'=>'','newsletterTitle'=>'','newsletterText'=>'','blocks'=>[]]);
    $home['heroSlides'] = query('SELECT id,title,subtitle,image_url AS imageUrl,tags FROM slides ORDER BY position')->fetchAll();
    foreach ($home['heroSlides'] as &$slide) $slide['tags'] = json_decode($slide['tags'], true, 64, JSON_THROW_ON_ERROR);
    unset($slide);
    $company = setting('company', ['phone'=>'','email'=>'','address'=>'']);
    $company['socials'] = query('SELECT platform,label,enabled,url FROM social_links ORDER BY position')->fetchAll();
    foreach ($company['socials'] as &$social) $social['enabled'] = (bool)$social['enabled'];
    return compact('categories','subcategories','products','home','company');
}
function imageReferences(array $snapshot): array {
    $urls = [];
    foreach (['categories','subcategories','products'] as $table) foreach ($snapshot[$table] as $row) {
        $urls[] = $row['imageUrl']; foreach ($row['gallery'] ?? [] as $url) $urls[] = $url;
    }
    foreach (['heroSlides','blocks'] as $key) foreach ($snapshot['home'][$key] ?? [] as $row) $urls[] = $row['imageUrl'];
    return array_values(array_unique($urls));
}
function validateManagedImages(array $urls): void {
    foreach ($urls as $url) if (str_starts_with($url, '/media/')) {
        if (!query('SELECT path FROM media WHERE path=?', [$url])->fetchColumn() || !is_file(config()['media_dir'] . '/' . basename($url))) fail(422, 'An uploaded image is missing. Upload it again before saving.');
    }
}
function mutateContent(callable $write): array {
    beginContent();
    try {
        $before = imageReferences(snapshot()); $write(); $next = snapshot();
        validateManagedImages(imageReferences($next));
        db()->commit();
    } catch (Throwable $error) { if (db()->inTransaction()) db()->rollBack(); throw $error; }
    // A second locked reference check prevents another writer from attaching an image during cleanup.
    try { cleanupImages(array_diff($before, imageReferences($next))); }
    catch (Throwable $error) { error_log('Media cleanup deferred: ' . $error->getMessage()); }
    return $next;
}
function upsertCatalog(string $resource, array $data, ?string $routeId = null): void {
    if (!in_array($resource, ['categories','subcategories','products'], true)) fail(404, 'Not found.');
    $id = identifier(textField($data, 'id', 80));
    if ($routeId !== null && $id !== $routeId) fail(422, 'ID does not match URL.');
    $slug = textField($data,'slug',190);
    if (!preg_match('/\A[a-z0-9]+(?:-[a-z0-9]+)*\z/', $slug)) fail(422, 'Invalid slug.');
    $values = ['id'=>$id,'slug'=>$slug,'title'=>textField($data,'title'), 'description'=>textField($data,'description',10000), 'image_url'=>urlField(textField($data,'imageUrl',2048),true)];
    if ($resource !== 'categories') {
        $values['category_id'] = identifier(textField($data,'categoryId',80));
        if (!query('SELECT id FROM categories WHERE id=?', [$values['category_id']])->fetchColumn()) fail(422, 'Category does not exist.');
    }
    if ($resource === 'subcategories') {
        $oldCategory = query('SELECT category_id FROM subcategories WHERE id=?', [$id])->fetchColumn();
        if ($oldCategory && $oldCategory !== $values['category_id'] && query('SELECT id FROM products WHERE subcategory_id=? LIMIT 1', [$id])->fetchColumn()) fail(409, 'Move or remove linked products before changing this subcategory’s category.');
    }
    if ($resource === 'products') {
        $sub = textField($data,'subcategoryId',80,false);
        $values['subcategory_id'] = $sub === '' ? null : identifier($sub);
        if ($sub !== '' && !query('SELECT id FROM subcategories WHERE id=? AND category_id=?', [$sub,$values['category_id']])->fetchColumn()) fail(422, 'Subcategory must belong to the selected category.');
        $values['origin_country'] = textField($data,'originCountry',150);
        $price = $data['price'] ?? null;
        if ((!is_int($price) && !is_float($price)) || !is_finite((float)$price) || $price < 0 || $price > 9999999999.99) fail(422, 'Invalid price.');
        $values['price'] = $price; $values['currency'] = textField($data,'currency',3);
        if (!preg_match('/\A[A-Z]{3}\z/', $values['currency'])) fail(422, 'Invalid currency.');
        $gallery = listField($data,'gallery',20);
        foreach ($gallery as $url) { if (!is_string($url)) fail(422,'Invalid gallery.'); urlField($url,true); }
    }
    $conflict = query("SELECT id FROM $resource WHERE slug=? AND id<>?", [$slug,$id])->fetchColumn();
    if ($conflict) fail(409,'This slug is already in use. Choose a different title.');
    $columns = array_keys($values);
    if (query("SELECT id FROM $resource WHERE id=?",[$id])->fetchColumn()) {
        $updates = array_diff($columns,['id']);
        query("UPDATE $resource SET " . implode(',',array_map(fn($c)=>"$c=?",$updates)) . ' WHERE id=?', [...array_map(fn($c)=>$values[$c],$updates),$id]);
    } else query("INSERT INTO $resource (".implode(',',$columns).') VALUES ('.implode(',',array_fill(0,count($columns),'?')).')',array_values($values));
    if ($resource === 'products') {
        query('DELETE FROM product_images WHERE product_id=?',[$id]);
        foreach ($gallery as $position=>$url) query('INSERT INTO product_images VALUES(?,?,?)',[$id,$position,$url]);
    }
}
function saveSlides(array $slides): void {
    if (!array_is_list($slides) || count($slides)>30) fail(422,'Invalid slides.');
    $ids=[];
    foreach ($slides as $slide) {
        if (!is_array($slide)) fail(422,'Invalid slide.');
        $id=identifier(textField($slide,'id',80)); if (isset($ids[$id])) fail(422,'Duplicate slide ID.'); $ids[$id]=true;
        textField($slide,'title'); textField($slide,'subtitle',3000,false); urlField(textField($slide,'imageUrl',2048),true);
        foreach (listField($slide,'tags',20) as $tag) textField(['tag'=>$tag],'tag',80);
    }
    query('DELETE FROM slides');
    foreach ($slides as $position=>$slide) query('INSERT INTO slides VALUES(?,?,?,?,?,?)',[$slide['id'],$position,trim($slide['title']),trim($slide['subtitle']),$slide['imageUrl'],json_encode($slide['tags'],JSON_THROW_ON_ERROR)]);
}
function saveHome(array $data): void {
    $home=[];
    foreach (['marqueeText','newsletterTitle','newsletterText'] as $field) $home[$field]=textField($data,$field,3000,false);
    $home['blocks']=[];
    foreach (listField($data,'blocks',30) as $block) {
        if (!is_array($block)) fail(422,'Invalid block.');
        $link=textField($block,'link',2048);
        if (!preg_match('#\A/[a-zA-Z0-9_/?=&%-]*\z#',$link) || str_starts_with($link,'//')) fail(422,'Invalid block link.');
        $home['blocks'][]=['id'=>identifier(textField($block,'id',80)), 'title'=>textField($block,'title'), 'subtitle'=>textField($block,'subtitle',3000,false),'imageUrl'=>urlField(textField($block,'imageUrl',2048),true),'link'=>$link];
    }
    saveSlides(listField($data,'heroSlides',30)); setSetting('home',$home);
}
function saveSocials(array $socials): void {
    if (!array_is_list($socials) || count($socials)>4) fail(422,'Invalid social links.');
    $platforms=[];
    foreach ($socials as $link) {
        if (!is_array($link)) fail(422,'Invalid social link.');
        $platform=textField($link,'platform',30);
        if (!in_array($platform,['instagram','facebook','linkedin','youtube'],true) || isset($platforms[$platform])) fail(422,'Invalid social platform.');
        $platforms[$platform]=true; textField($link,'label',80);
        if (!is_bool($link['enabled'] ?? null)) fail(422,'Invalid social enabled flag.');
        urlField(textField($link,'url',2048,false),false,!$link['enabled']);
    }
    query('DELETE FROM social_links');
    foreach ($socials as $position=>$link) query('INSERT INTO social_links VALUES(?,?,?,?,?)',[$link['platform'],$link['label'],(int)$link['enabled'],$link['url'],$position]);
}
function saveCompany(array $data): void {
    $company=[]; foreach (['phone','email','address'] as $key) $company[$key]=textField($data,$key,$key==='address'?3000:254);
    if (!filter_var($company['email'],FILTER_VALIDATE_EMAIL)) fail(422,'Invalid company email.');
    saveSocials(listField($data,'socials',4)); setSetting('company',$company);
}
function importCatalog(array $data): void {
    foreach (['categories','subcategories','products'] as $resource) foreach (listField($data,$resource,5000) as $row) {
        if (!is_array($row)) fail(422,'Invalid import row.'); upsertCatalog($resource,$row);
    }
}
