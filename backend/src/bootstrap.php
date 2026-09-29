<?php
declare(strict_types=1);
final class ApiError extends RuntimeException {
    public function __construct(public int $status, string $message) { parent::__construct($message); }
}
function fail(int $status, string $message): never { throw new ApiError($status, $message); }
function config(): array {
    static $config;
    if ($config !== null) return $config;
    $file = getenv('SAIM_CONFIG') ?: dirname(__DIR__) . '/config.local.php';
    if (!is_file($file)) throw new RuntimeException('Missing private backend configuration.');
    $config = require $file;
    $production = ($config['environment'] ?? 'production') === 'production';
    if ($production && (empty($config['secure_cookie']) || !str_starts_with($config['origin'] ?? '', 'https://'))) {
        throw new RuntimeException('Production requires HTTPS origin and secure cookies.');
    }
    return $config;
}
function db(): PDO {
    static $pdo;
    return $pdo ??= new PDO(config()['db_dsn'], config()['db_user'], config()['db_password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}
function query(string $sql, array $args = []): PDOStatement { $s = db()->prepare($sql); $s->execute($args); return $s; }
function jsonResponse(mixed $value, int $status = 200): never {
    http_response_code($status); header('Content-Type: application/json; charset=utf-8');
    echo json_encode($value, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES); exit;
}
function body(): array {
    if (!str_starts_with($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) fail(415, 'Expected JSON.');
    $raw = file_get_contents('php://input', false, null, 0, 1048577);
    if (strlen($raw) > 1048576) fail(413, 'Request too large.');
    try { $value = json_decode($raw, true, 64, JSON_THROW_ON_ERROR); }
    catch (JsonException) { fail(400, 'Invalid JSON.'); }
    if (!is_array($value) || array_is_list($value) && $value !== []) fail(400, 'Expected a JSON object.');
    return $value;
}
function textField(array $data, string $key, int $max = 255, bool $required = true): string {
    $value = $data[$key] ?? '';
    if (!is_string($value) || strlen($value) > $max || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', $value)) fail(422, "Invalid $key.");
    $value = trim($value);
    if ($required && $value === '') fail(422, "$key is required.");
    return $value;
}
function identifier(string $value): string {
    if (!preg_match('/\A[a-zA-Z0-9_-]{1,80}\z/', $value)) fail(422, 'Invalid identifier.');
    return $value;
}
function listField(array $data, string $key, int $max): array {
    $value = $data[$key] ?? null;
    if (!is_array($value) || !array_is_list($value) || count($value) > $max) fail(422, "Invalid $key.");
    return $value;
}
function urlField(string $url, bool $image = false, bool $empty = false): string {
    if ($empty && $url === '') return '';
    if ($image && preg_match('#\A/(?:media/[a-f0-9]{32}\.webp|assets/[a-zA-Z0-9_./-]+)\z#', $url) && !str_contains($url, '..')) return $url;
    if (strlen($url) > 2048 || !filter_var($url, FILTER_VALIDATE_URL) || parse_url($url, PHP_URL_SCHEME) !== 'https' || parse_url($url, PHP_URL_USER) !== null) fail(422, 'Use an HTTPS URL or a managed image path.');
    return $url;
}
function beginContent(): void { db()->beginTransaction(); query('SELECT id FROM content_lock WHERE id=1 FOR UPDATE'); }
