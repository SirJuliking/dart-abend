# Dart-Abend

Dies ist meine Darts-Abend-Website. Damit kann man gegeneinander Darts spielen, wenn man in unterschiedlichen Räumen ist. Also quasi ein Dart-Counter, nur kostenlos.
Für die Datenbank nutze ich Supabase und gehostet wird aktuell über Vercel.
Der Code ist von Claude geschrieben und wahrscheinlich nicht zu 100 % der beste. Ist aber egal, weil ich es nur privat mit Freunden verwende.

## Was liegt wo?

| Pfad | Inhalt |
|---|---|
| `index.html` | Die ganze App (Spiel, Kamera, Ranking, Training, Admin, Changelog) |
| `config.js` | Zugangsdaten für Supabase |
| `manifest.json`, `sw.js` | Installierbare App (PWA), müssen im Hauptordner bleiben |
| `aufnehmen.html` | Seite zum Aufnehmen der eigenen Stimme (`/aufnehmen.html`, Zusatz-Paket: `/aufnehmen.html?zusatz`) |
| `ton/` | Sprachaufnahmen: `sprache.wav/json` und Zusatz-Paket `sprache2.wav/json` |
| `icons/` | App-Symbole |
| `docs/` | `DOKUMENTATION.md` (komplette Projektdokumentation) und Anleitungen (Update, Kamera, Training) |

## Neue Sprachaufnahmen einspielen
Die Aufnahme-Seite erzeugt `sprache.wav` und `sprache.json` (bzw. `sprache2.*`). Diese Dateien in den Ordner `ton/` hochladen und die alten ersetzen.
