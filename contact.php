<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');

function respond(bool $success, string $message, int $status = 200): never
{
    http_response_code($status);

    echo json_encode(
        [
            'success' => $success,
            'message' => $message,
        ],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );

    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(false, 'Method not allowed.', 405);
}

function safeLength(string $value): int
{
    if (function_exists('mb_strlen')) {
        return mb_strlen($value, 'UTF-8');
    }

    return strlen($value);
}

function hasHeaderInjection(string $value): bool
{
    return preg_match('/[\r\n]/', $value) === 1;
}

function cleanText(string $value): string
{
    return trim(str_replace("\0", '', $value));
}

function cleanSingleLine(string $value): string
{
    return trim(preg_replace('/[\r\n]+/', ' ', cleanText($value)) ?? '');
}

function getConfiguredEmail(): ?string
{
    $configPath = __DIR__ . '/config/config.js';

    if (!is_file($configPath)) {
        return null;
    }

    $config = file_get_contents($configPath);

    if ($config === false) {
        return null;
    }

    if (preg_match('/\bemail\s*:\s*["\']([^"\']+)["\']/i', $config, $matches) === 1) {
        $email = cleanSingleLine($matches[1]);

        if (!hasHeaderInjection($matches[1]) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $email;
        }
    }

    return null;
}

$rawName = (string) ($_POST['name'] ?? '');
$rawEmail = (string) ($_POST['email'] ?? '');
$rawService = (string) ($_POST['service'] ?? '');
$rawMessage = (string) ($_POST['message'] ?? '');
$rawPrivacy = (string) ($_POST['privacy'] ?? '');
$rawHoneypot = (string) ($_POST['website'] ?? '');

if (cleanSingleLine($rawHoneypot) !== '') {
    respond(false, 'Invalid request.', 400);
}

if (
    hasHeaderInjection($rawName) ||
    hasHeaderInjection($rawEmail) ||
    hasHeaderInjection($rawService)
) {
    respond(false, 'Invalid form data.', 422);
}

$name = cleanSingleLine($rawName);
$email = cleanSingleLine($rawEmail);
$service = cleanSingleLine($rawService);
$message = cleanText($rawMessage);
$privacy = cleanSingleLine($rawPrivacy);

if ($name === '' || safeLength($name) < 2 || safeLength($name) > 100) {
    respond(false, 'Please enter your name.', 422);
}

if (
    $email === '' ||
    safeLength($email) > 180 ||
    !filter_var($email, FILTER_VALIDATE_EMAIL)
) {
    respond(false, 'Please enter a valid email address.', 422);
}

if ($service !== '' && safeLength($service) > 120) {
    respond(false, 'Invalid service value.', 422);
}

if ($message === '' || safeLength($message) < 10 || safeLength($message) > 4000) {
    respond(false, 'Please enter a message between 10 and 4000 characters.', 422);
}

if (!in_array(strtolower($privacy), ['1', 'true', 'yes', 'on', 'accepted'], true)) {
    respond(false, 'Please accept the Privacy Policy.', 422);
}

$recipient = getConfiguredEmail();

if ($recipient === null) {
    respond(false, 'Contact email is not configured.', 500);
}

$subject = 'New Auto Glass Enquiry';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$host = preg_replace('/:\d+$/', '', $host) ?? 'localhost';
$host = preg_replace('/[^a-zA-Z0-9.-]/', '', $host) ?? 'localhost';
$host = trim($host, '.-');

if ($host === '' || strpos($host, '.') === false) {
    $host = 'localhost.local';
}

$fromEmail = 'no-reply@' . $host;

$bodyLines = [
    'New Auto Glass enquiry',
    '',
    'Name: ' . $name,
    'Email: ' . $email,
    'Service: ' . ($service !== '' ? $service : 'Not selected'),
    '',
    'Message:',
    $message,
    '',
    'Privacy Policy accepted: Yes',
    '',
    'Submitted: ' . gmdate('Y-m-d H:i:s') . ' UTC',
];

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: Auto Glass Website <' . $fromEmail . '>',
    'Reply-To: ' . $email,
    'X-Mailer: PHP/' . PHP_VERSION,
];

$sent = @mail(
    $recipient,
    $subject,
    implode(PHP_EOL, $bodyLines),
    implode("\r\n", $headers)
);

if (!$sent) {
    respond(false, 'Unable to send your request right now. Please try again later.', 500);
}

respond(true, 'Successfully sent');
