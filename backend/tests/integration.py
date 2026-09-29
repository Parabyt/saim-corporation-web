"""HTTP integration suite against an isolated MySQL test database; no external packages.
SAIM_TEST_ALLOW_WRITES=1 PHP_BIN=php python3 backend/tests/integration.py
Start the PHP server with the same SAIM_CONFIG first. Requires a seeded test database.
"""
import base64, copy, http.cookiejar, json, os, pathlib, secrets, subprocess, urllib.request, urllib.error, urllib.parse
ROOT = pathlib.Path(__file__).resolve().parents[2]
BASE = os.environ.get('SAIM_TEST_URL', 'http://127.0.0.1:8080')
assert os.environ.get('SAIM_TEST_ALLOW_WRITES') == '1', 'Set SAIM_TEST_ALLOW_WRITES=1 for the isolated test database.'
assert urllib.parse.urlparse(BASE).hostname in ('localhost', '127.0.0.1'), 'Tests only run against localhost.'
PHP = os.environ.get('PHP_BIN', 'php')
PASSWORD = secrets.token_urlsafe(24)
checks = 0

def fixture(action, data=''):
    subprocess.run([PHP, str(ROOT/'backend/tests/fixture.php'), action], input=data, text=True, check=True)

def check(ok, label):
    global checks
    assert ok, label
    checks += 1
    print('PASS', label)

class Client:
    def __init__(self):
        self.jar = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.jar))
        self.csrf = ''
    def request(self, path, method='GET', data=None, status=200, headers=None, raw=None):
        h = {'Accept':'application/json'}
        if method != 'GET': h['X-CSRF-Token'] = self.csrf
        if data is not None: h['Content-Type'] = 'application/json'; raw = json.dumps(data).encode()
        h.update(headers or {})
        req = urllib.request.Request(BASE+'/api/'+path, data=raw, method=method, headers=h)
        try: response = self.opener.open(req)
        except urllib.error.HTTPError as e: response = e
        content = response.read()
        assert response.status == status, (method, path, response.status, status, content[:500])
        return json.loads(content)
    def session(self):
        v = self.request('auth/session'); self.csrf = v['csrfToken']; return v
    def login(self):
        v = self.request('auth/login','POST',{'email':'integration@saim.invalid','password':PASSWORD}); self.csrf = v['csrfToken']; return v
    def upload(self, image, folder='products', mime='image/png', status=201):
        boundary = 'saim'+secrets.token_hex(12)
        raw = (f'--{boundary}\r\nContent-Disposition: form-data; name="folder"\r\n\r\n{folder}\r\n'
            f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="untrusted.png"\r\nContent-Type: {mime}\r\n\r\n').encode()+image+f'\r\n--{boundary}--\r\n'.encode()
        return self.request('media','POST',raw=raw,headers={'Content-Type':'multipart/form-data; boundary='+boundary},status=status)

def category(id='test-cat', image='https://example.com/image.webp'):
    return {'id':id,'slug':id,'title':'Integration category','description':'Description','imageUrl':image}

fixture('admin', PASSWORD)
admin, guest = Client(), Client()
original = None
try:
    check(guest.session()['user'] is None, 'anonymous session')
    check('HttpOnly' in next(iter(guest.jar))._rest and next(iter(guest.jar)).path == '/api', 'HTTP-only session scoped to API')
    guest.request('categories/test-cat','PUT',category(),status=401)
    check(True, 'anonymous catalog write denied')
    guest.request('categories/test-cat','PUT',category(),status=403,headers={'X-CSRF-Token':'invalid'})
    check(True, 'invalid CSRF denied')
    guest.request('auth/login','POST',{'email':'integration@saim.invalid','password':PASSWORD},status=403,headers={'Origin':'https://evil.example'})
    check(True, 'foreign origin denied even with valid CSRF')
    guest.request('auth/login','POST',{'email':'integration@saim.invalid','password':'wrong'},status=401)
    check(True, 'incorrect password denied')
    admin.session(); old_cookie = list(admin.jar)[0].value; old_csrf = admin.csrf
    check(admin.login()['user']['role']=='admin', 'admin login succeeds')
    check(old_cookie != list(admin.jar)[0].value and old_csrf != admin.csrf, 'login rotates session and CSRF')
    admin.request('categories/test-cat','PUT',category(),status=403,headers={'X-CSRF-Token':old_csrf})
    check(True, 'old CSRF rejected')
    original = admin.request('content')
    image = subprocess.check_output([PHP, '-r', '$im=imagecreatetruecolor(40,30);imagepng($im);'])
    guest.upload(image,status=401)
    check(True,'anonymous catalog upload denied')
    admin.upload(b'<?php echo "bad"; ?>',status=422)
    admin.upload(b'<svg xmlns="http://www.w3.org/2000/svg"></svg>',mime='image/svg+xml',status=422)
    check(True,'executable and SVG uploads rejected')
    url1 = admin.upload(image)['url']; url2 = admin.upload(image)['url']
    check(url1.startswith('/media/') and url1.endswith('.webp'), 'upload optimized to generated WebP path')
    media1 = ROOT/'backend/public'/url1.lstrip('/'); media2 = ROOT/'backend/public'/url2.lstrip('/')
    check(media1.read_bytes()[:4]==b'RIFF' and media1.stat().st_size < 800*1024,'stored WebP size bounded')
    cat = category(image=url1); snapshot = admin.request('categories/test-cat','PUT',cat)
    check(any(v['id']=='test-cat' for v in snapshot['categories']),'category saved')
    sub = dict(category('test-sub',url1),categoryId='test-cat')
    admin.request('subcategories/test-sub','PUT',sub)
    cat2 = category('test-cat2',url1); admin.request('categories/test-cat2','PUT',cat2)
    product = dict(category('test-product',url1),categoryId='test-cat',subcategoryId='test-sub',gallery=[url1],originCountry='Pakistan',price=12.5,currency='USD')
    admin.request('products/test-product','PUT',dict(product,categoryId='test-cat2'),status=422)
    check(True,'cross-category product relationship rejected')
    admin.request('products/test-product','PUT',product)
    check(admin.request('products/test-product')['price']==12.5,'product and numeric price roundtrip')
    admin.request('subcategories/test-sub','PUT',dict(sub,categoryId='test-cat2'),status=409)
    check(True,'reparenting subcategory cannot orphan its products')
    admin.request('categories/test-cat','PUT',dict(cat,imageUrl='javascript:alert(1)'),status=422)
    check(media1.exists() and admin.request('categories/test-cat')['imageUrl']==url1,'failed replacement preserves old image and row')
    admin.request('categories/test-cat','PUT',dict(cat,imageUrl='/media/'+'0'*32+'.webp'),status=422)
    check(admin.request('categories/test-cat')['imageUrl']==url1,'missing managed file rolls back update')
    admin.request('categories/test-other','PUT',dict(category('test-other'),slug='test-cat'),status=409)
    check(not any(v['id']=='test-other' for v in admin.request('categories')),'duplicate slug does not overwrite existing row')
    admin.request('categories/test-cat','PUT',dict(cat,imageUrl=url2))
    check(media1.exists(),'shared image retained after successful replacement')
    admin.request('products/test-product','PUT',dict(product,imageUrl=url2,gallery=[url1,url2]))
    admin.request('subcategories/test-sub','PUT',dict(sub,imageUrl=url2))
    admin.request('categories/test-cat2','PUT',dict(cat2,imageUrl=url2))
    check(media1.exists(),'gallery references protect old media')
    admin.request('products/test-product','PUT',dict(product,imageUrl=url2,gallery=[url2]))
    check(not media1.exists() and media2.exists(),'unreferenced old managed file deleted after committed replacement')
    home = copy.deepcopy(original['home']); home['heroSlides'][0]['imageUrl']=url2
    admin.request('home','PUT',home)
    check(admin.request('slides')[0]['imageUrl']==url2,'slides persisted through home save')
    company = copy.deepcopy(original['company']); company['phone']='+92 300 1234567'; company['socials'][0]['enabled']=False
    admin.request('company','PUT',company)
    check(admin.request('company')['phone']==company['phone'] and not admin.request('social-links')[0]['enabled'],'company settings and social switch persist')
    bad_company=copy.deepcopy(company); bad_company['socials'][0].update(enabled=True,url='javascript:alert(1)')
    admin.request('company','PUT',bad_company,status=422)
    check(admin.request('company')==company,'social validation rollback')
    admin.request('catalog/import','POST',{'categories':[category('test-import')],'subcategories':[],'products':[dict(product,id='test-bad',slug='test-bad',categoryId='missing')]},status=422)
    check(not any(v['id']=='test-import' for v in admin.request('categories')),'catalog import rolls back all rows on failure')
    saved = admin.request('categories/test-cat'); admin.request('categories/test-cat','DELETE')
    current=admin.request('content')
    check(not any(v['id']=='test-sub' for v in current['subcategories']) and not any(v['id']=='test-product' for v in current['products']),'category delete cascades subcategories/products')
    admin.request('categories/test-cat2','DELETE')
    check(media2.exists(),'slider reference protects media after catalog deletion')
    admin.request('home','PUT',original['home'])
    check(not media2.exists(),'last slider reference replacement cleans media')
    admin.request('slides','PUT',{'slides':[]})
    check(admin.request('slides')==[],'empty slide list stays empty')
    admin.request('home','PUT',original['home'])
    ref=guest.upload(image,folder='requirements')['url']
    inquiry={'companyName':'Integration Fixture','contactPerson':'Tester','email':'test@example.com','phone':'123456789','country':'Pakistan','productFocus':'Test products','targetQuantity':'100','message':'A sufficiently detailed integration test request.','referenceImageUrl':ref,'source':'other'}
    other=Client(); other.session(); other.request('requirements','POST',inquiry,status=422)
    check(True,'public reference upload ownership enforced')
    check(bool(guest.request('requirements','POST',inquiry,status=201)['id']),'public inquiry stored with uploaded reference')
    guest.request('submissions',status=401)
    check(any(v['payload']['companyName']=='Integration Fixture' for v in admin.request('submissions')),'submissions restricted to admin')
    guest.request('contact-messages','POST',dict(inquiry,fullName='Test Person',subject='Testing contact',acceptedTerms=False),status=422)
    check(True,'server enforces contact terms')
    fixture('disable')
    admin.request('categories/test-cat','PUT',cat,status=401)
    check(True,'disabled administrator loses access despite existing session')
    fixture('enable'); admin.session(); admin.login()
    subprocess.run([PHP, str(ROOT/'backend/tests/fixture.php'), 'expire-idle', next(iter(admin.jar)).value], check=True)
    check(admin.session()['user'] is None, 'idle session timeout enforced')
    admin.login()
    subprocess.run([PHP, str(ROOT/'backend/tests/fixture.php'), 'expire-absolute', next(iter(admin.jar)).value], check=True)
    check(admin.session()['user'] is None, 'absolute session timeout enforced')
    admin.login()
    admin.request('auth/logout','POST',{})
    check(admin.session()['user'] is None,'logout invalidates session')
    for i in range(8):
        admin.request('auth/login','POST',{'email':'missing@saim.invalid','password':'wrong'},status=401)
    admin.request('auth/login','POST',{'email':'missing@saim.invalid','password':'wrong'},status=429)
    check(True,'persistent login rate limit enforced')
finally:
    fixture('enable')
    if original is not None:
        admin.session(); admin.login()
        admin.request('home','PUT',original['home']); admin.request('company','PUT',original['company'])
    fixture('cleanup')
print(f'{checks} integration checks passed.')
