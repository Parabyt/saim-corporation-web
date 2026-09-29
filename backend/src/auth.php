<?php
declare(strict_types=1);
function startSession(): void {
    ini_set('session.use_strict_mode', '1'); ini_set('session.use_only_cookies', '1'); ini_set('session.use_trans_sid', '0');
    session_name('saim_session');
    session_set_cookie_params(['lifetime' => 0, 'path' => '/api', 'secure' => config()['secure_cookie'], 'httponly' => true, 'samesite' => 'Strict']);
    session_start();
    $now = time();
    if (isset($_SESSION['admin_id']) && ($now - ($_SESSION['last_seen'] ?? 0) > 1800 || $now - ($_SESSION['signed_in'] ?? 0) > 28800)) {
        $_SESSION = []; session_regenerate_id(true);
    }
    $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
    $_SESSION['media_owner'] ??= bin2hex(random_bytes(32));
}
function csrf(): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? null;
    if ($origin !== null && $origin !== config()['origin']) fail(403, 'Request origin is not allowed.');
    if (($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site') fail(403, 'Cross-site request denied.');
    if (!hash_equals($_SESSION['csrf'], $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) fail(403, 'Session verification failed. Refresh and try again.');
}
function currentAdmin(): ?array {
    if (!isset($_SESSION['admin_id'])) return null;
    $admin = query('SELECT id,email,role FROM admins WHERE id=? AND active=1 AND role=?', [$_SESSION['admin_id'], 'admin'])->fetch();
    if (!$admin) { unset($_SESSION['admin_id']); return null; }
    $_SESSION['last_seen'] = time();
    return ['id' => (int)$admin['id'], 'email' => $admin['email'], 'role' => 'admin'];
}
function requireAdmin(): array { return currentAdmin() ?? fail(401, 'Admin sign in is required.'); }
function rateLimit(string $key, int $limit, int $seconds): void {
    $now = time(); $window = intdiv($now, $seconds) * $seconds; $bucket = hash('sha256', $key . ':' . $window);
    query('INSERT INTO rate_limits(bucket,window_start,hits) VALUES(?,?,1) ON DUPLICATE KEY UPDATE hits=hits+1', [$bucket,$window]);
    if ((int)query('SELECT hits FROM rate_limits WHERE bucket=?', [$bucket])->fetchColumn() > $limit) {
        header('Retry-After: ' . ($window + $seconds - $now)); fail(429, 'Too many requests. Please try later.');
    }
    query('DELETE FROM rate_limits WHERE window_start < ? LIMIT 100', [$now - 86400]);
}
function clientIp(): string { return $_SERVER['REMOTE_ADDR'] ?? 'unknown'; } // Never trust forwarded IP headers.
function login(array $data): array {
    $email = strtolower(textField($data, 'email', 254)); $password = $data['password'] ?? '';
    if (!is_string($password) || strlen($password)>1024 || $password==='') fail(422,'Password is required.');
    rateLimit('login-ip:' . clientIp(), 30, 900); rateLimit('login-email:' . $email, 8, 900);
    $admin = query('SELECT * FROM admins WHERE email=?', [$email])->fetch();
    // Always perform a password check, including unknown accounts.
    $hash = $admin['password_hash'] ?? '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.';
    if (!password_verify($password, $hash) || !$admin || !$admin['active'] || $admin['role'] !== 'admin') fail(401, 'Invalid email or password.');
    if (password_needs_rehash($hash, PASSWORD_DEFAULT)) query('UPDATE admins SET password_hash=? WHERE id=?', [password_hash($password, PASSWORD_DEFAULT),$admin['id']]);
    session_regenerate_id(true);
    $_SESSION['admin_id'] = (int)$admin['id']; $_SESSION['signed_in'] = $_SESSION['last_seen'] = time();
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return ['user' => currentAdmin(), 'csrfToken' => $_SESSION['csrf']];
}
