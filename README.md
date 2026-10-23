# Clarity A&A GmbH – Website

Website der Clarity A&A GmbH, Treuhand in Zürich: Treuhand, Steuern, Buchhaltung, Beratung, Firmengründung und Liquidation.

Reine statische Seite (HTML, CSS, etwas JavaScript), kein Build-Schritt nötig. Schriften sind lokal eingebunden, es werden keine externen Dienste oder Cookies verwendet.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Startseite mit allen Bereichen |
| `impressum.html`, `datenschutz.html` | Rechtliches |
| `styles.css` | Gestaltung (Farben aus dem Logo: Anthrazit `#3a3a3a`, Gold `#b89f6f`) |
| `script.js` | Menü, Animationen, Kontaktformular |
| `kontakt.php` | Versand des Kontaktformulars an info@clarity-aa.ch (läuft nur auf Hostpoint, nicht auf Vercel) |
| `.htaccess` | HTTPS-Weiterleitung, Caching und Sicherheit auf Hostpoint |
| `assets/` | Logo, Favicon und Schriften |

## Auf Hostpoint hochladen

1. Im Hostpoint Control Panel die SFTP-Zugangsdaten nachschauen.
2. Mit FileZilla (oder einem anderen SFTP-Programm) verbinden.
3. Alle Dateien und den Ordner `assets` in den Web-Ordner der Domain laden (meist `www/clarity-aa.ch`). Die Datei `.htaccess` ist versteckt, also im Programm versteckte Dateien anzeigen lassen.
4. `README.md` muss nicht hochgeladen werden.

## Vor dem Livegang ergänzen

- Adresse, Geschäftsführung, UID- und MWST-Nummer in `impressum.html` und `datenschutz.html` (gelb markierte Platzhalter).
- Die Absenderadresse `website@clarity-aa.ch` in `kontakt.php` bei Bedarf anpassen.

## Vorschau auf Vercel

Jeder Push auf GitHub erzeugt auf Vercel automatisch eine Vorschau. Das Kontaktformular funktioniert dort nicht, weil Vercel kein PHP ausführt.
