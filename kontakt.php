<?php
// Kontaktformular Clarity A&A GmbH – läuft auf Hostpoint (PHP)
header('Content-Type: application/json; charset=utf-8');

$empfaenger = 'info@clarity-aa.ch';
$absender   = 'website@clarity-aa.ch'; // Adresse auf der eigenen Domain (verbessert die Zustellung)

function antwort($ok, $fehler = null) {
    echo json_encode(['ok' => $ok, 'error' => $fehler]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    antwort(false, 'Nur POST erlaubt');
}

// Spam-Schutz: verstecktes Feld muss leer sein
if (!empty($_POST['website'])) {
    antwort(true);
}

function feld($name, $max = 5000) {
    $v = isset($_POST[$name]) ? trim((string) $_POST[$name]) : '';
    $v = str_replace(["\r", "\0"], '', $v);
    return mb_substr($v, 0, $max);
}

$name      = feld('name', 200);
$email     = feld('email', 200);
$telefon   = feld('telefon', 50);
$thema     = feld('thema', 100);
$nachricht = feld('nachricht', 5000);

if ($name === '' || $nachricht === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    antwort(false, 'Bitte Name, gültige E-Mail und Nachricht angeben.');
}
if (empty($_POST['datenschutz'])) {
    http_response_code(422);
    antwort(false, 'Bitte Datenschutzerklärung bestätigen.');
}

// Zeilenumbrüche aus Kopfzeilen entfernen (Header-Injection verhindern)
$name_hdr = preg_replace('/[\r\n]+/', ' ', $name);
$thema    = preg_replace('/[\r\n]+/', ' ', $thema);

$betreff = '=?UTF-8?B?' . base64_encode('Website-Anfrage: ' . $thema) . '?=';
$text  = "Neue Anfrage über clarity-aa.ch\n\n";
$text .= "Name:     $name\n";
$text .= "E-Mail:   $email\n";
$text .= "Telefon:  " . ($telefon !== '' ? $telefon : '–') . "\n";
$text .= "Thema:    $thema\n\n";
$text .= "Nachricht:\n$nachricht\n";

$headers  = "From: Clarity Website <$absender>\r\n";
$headers .= "Reply-To: $name_hdr <$email>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";

$gesendet = mail($empfaenger, $betreff, $text, $headers, '-f' . $absender);

if (!$gesendet) {
    http_response_code(500);
    antwort(false, 'Versand fehlgeschlagen');
}
antwort(true);
