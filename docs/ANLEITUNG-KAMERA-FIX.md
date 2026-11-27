# Kamera-Fix einspielen

Die Datenbank bleibt gleich, in Supabase musst du nichts tun.

## 1. Dateien auf GitHub ersetzen
1. Öffne `config.js` aus diesem Ordner im Texteditor. Trage `SUPABASE_URL` und `SUPABASE_KEY` ein (wie bisher, du kannst sie aus deiner alten `config.js` kopieren). Speichern.
2. Öffne auf GitHub dein Repository `dart-abend`. Klick auf `config.js`, dann auf das Stift-Symbol, lösche den Inhalt, füge den neuen ein und klick auf **Commit changes**.
3. Das Gleiche machst du mit `index.html`: Stift-Symbol, alles löschen, neuen Inhalt einfügen, **Commit changes**.
4. Nach etwa einer Minute ist die neue Version live. Lade die Seite auf beiden Geräten neu (am PC mit Strg+Shift+R).

## 2. Kamera testen
Starte ein Match und öffne es auf beiden Geräten. Tippe auf einem Gerät auf **Kamera**. Auf dem anderen sollte das Bild oben erscheinen. Danach tippst du auf dem zweiten Gerät auch auf **Kamera**, dann sieht jeder beide Bilder.

## 3. Falls ein Bild immer noch schwarz bleibt: TURN-Server (kostenlos)
Das passiert, wenn die beiden Geräte in unterschiedlichen Netzen sind, zum Beispiel Handy mit mobilen Daten und PC im WLAN. Ein TURN-Server leitet das Bild dann über einen Umweg weiter.
1. Geh auf metered.ca/tools/openrelay und leg einen kostenlosen Account an.
2. Im Dashboard findest du den Bereich **TURN Server** mit einem Namen für deine App (der Teil vor `.metered.live`) und einem **API Key**. Die Menünamen können leicht abweichen. Schick mir einen Screenshot, wenn du etwas nicht findest.
3. Trage beides in `config.js` bei `TURN_APP` und `TURN_KEY` ein, zwischen den Anführungszeichen. Dann `config.js` wie oben auf GitHub ersetzen.

## Gut zu wissen
- Funktioniert nur über den https-Link von Vercel.
- Wenn jemand die Kamera ausschaltet, bleibt das Bild der anderen sichtbar.
