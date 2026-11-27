# Update auf Version 2

Die Datenbank bleibt unverändert, du musst in Supabase nichts tun.

## 1. Deine Zugangsdaten sichern
Öffne auf GitHub in deinem Repository `dart-abend` die Datei `index.html` und kopiere dir die beiden Zeilen mit `SUPABASE_URL` und `SUPABASE_KEY` (Werte in den Anführungszeichen).

## 2. Neue Datei `config.js` anlegen
1. Öffne `config.js` aus diesem Ordner mit einem Texteditor und ersetze `DEINE_PROJEKT_URL` und `DEIN_ANON_KEY` durch deine Werte. Speichern.
2. Auf GitHub im Repository: **Add file → Upload files**, `config.js` hineinziehen, **Commit changes**.

## 3. `index.html` ersetzen
1. Öffne auf GitHub `index.html`, klick auf das Stift-Symbol.
2. Markiere den gesamten Inhalt (Strg+A) und lösche ihn.
3. Öffne die neue `index.html` aus diesem Ordner im Texteditor, kopiere alles und füge es ein.
4. **Commit changes**. Nach etwa einer Minute ist Version 2 live (Seite mit Strg+Shift+R neu laden).

## Kamera benutzen
- Einer öffnet im Match oben rechts **Kamera**, erlaubt den Zugriff und richtet das Handy auf die Scheibe.
- Alle anderen im selben Match sehen das Bild automatisch oben.
- Funktioniert nur über den https-Link von Vercel.

## Gut zu wissen
- Alte Matches aus Version 1 lassen sich nicht mehr öffnen und zählen nicht fürs Ranking.
- Würfe von zwei Geräten gleichzeitig gehen nicht mehr verloren, sobald das SQL „Sicheres Eintragen" (Admin → Daten) einmal in Supabase ausgeführt wurde. Siehe DOKUMENTATION.md.
