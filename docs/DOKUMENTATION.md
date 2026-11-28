# Dart-Abend: Projektdokumentation

Stand: 27.11.2026. Diese Dokumentation beschreibt, was die App kann, wie sie aufgebaut ist und wie man sie betreibt und weiterentwickelt. Sie ist für Julius und für jeden geschrieben, der später am Code weiterarbeitet (auch eine KI).

## Inhalt
1. [Überblick](#1-überblick)
2. [Architektur](#2-architektur)
3. [Dateien und Ordner](#3-dateien-und-ordner)
4. [Einrichtung und Betrieb](#4-einrichtung-und-betrieb)
5. [Funktionen](#5-funktionen)
6. [Datenmodell](#6-datenmodell)
7. [Wichtige Abläufe im Code](#7-wichtige-abläufe-im-code)
8. [Admin-Modus](#8-admin-modus)
9. [Kamera](#9-kamera)
10. [Ansagen und Sprachpakete](#10-ansagen-und-sprachpakete)
11. [Sicherheit und Datenschutz](#11-sicherheit-und-datenschutz)
12. [Bekannte Grenzen](#12-bekannte-grenzen)
13. [Weiterentwickeln, Testen, Änderungen einspielen](#13-weiterentwickeln)
14. [Fehlersuche](#14-fehlersuche)

---

## 1. Überblick
Dart-Abend ist ein kostenloser Online-Dartcounter für Freunde, die in verschiedenen Räumen spielen. Man braucht kein Konto: Ein Match hat einen Code, wer ihn kennt, kann zuschauen oder (mit Spielercode) mitspielen. Die App läuft im Browser und lässt sich aufs Handy installieren (PWA).

Gebaut mit: reinem HTML, CSS und JavaScript in einer Datei (`index.html`), Supabase als Datenbank und für Live-Updates, Vercel als Hosting, GitHub als Quelle. Der Code wurde mit Claude geschrieben.

## 2. Architektur

```
 Handy / PC (Browser)                      Supabase                  Vercel
 ┌────────────────────┐   Daten + Live    ┌──────────────┐         ┌─────────┐
 │ index.html (App)   │ <───────────────> │ Tabelle      │         │ liefert │
 │ Rechnen im Browser │   Realtime        │ "matches"    │         │ die     │
 └─────────┬──────────┘                   │ + Funktionen │         │ Dateien │
           │  Kamera-Bild direkt          │ ev_push/pop  │         │ aus     │
           └──── WebRTC zwischen Geräten  └──────────────┘         │ GitHub  │
                 (Signalisierung über                              └─────────┘
                  Supabase-Broadcast)
```

- **Kein eigener Server.** Die ganze Logik läuft im Browser. Supabase speichert nur.
- **Ein Match = eine Zeile** in der Tabelle `matches`. Der Spielstand ist eine Liste aller geworfenen Darts; alles andere (Restpunkte, Leg, Satz, Sieger, Schnitt) wird daraus berechnet (`calc()`).
- **Live-Sync:** Jedes Gerät hört per Supabase Realtime auf Änderungen der Zeile und zeichnet neu.
- **Kamera:** Bild geht direkt von Gerät zu Gerät (WebRTC), nicht über Supabase. Supabase dient nur zum Verabreden (Signalisierung).
- **Es gibt keine Benutzerkonten.** Wer ein Spieler ist, ergibt sich aus Name und Spielercode.

## 3. Dateien und Ordner

| Pfad | Inhalt |
|---|---|
| `index.html` | Die komplette App (ca. 1800 Zeilen: CSS, HTML-Grundgerüst, JavaScript) |
| `config.js` | Supabase-URL und öffentlicher Schlüssel, optional TURN-Zugang für die Kamera |
| `manifest.json` | App-Beschreibung für die Installation auf dem Homescreen |
| `sw.js` | Minimaler Service Worker (macht installierbar, speichert nichts zwischen) |
| `aufnehmen.html` | Seite zum Aufnehmen der eigenen Stimme (`/aufnehmen.html`, Zusatzpaket `/aufnehmen.html?zusatz`) |
| `ton/` | `sprache.wav/json` (Hauptpaket), `sprache2.wav/json` (Zusatzpaket) |
| `icons/` | App-Symbole |
| `docs/` | Diese Dokumentation und die Update-Anleitungen |
| `README.md` | Kurzbeschreibung |

### Aufbau von `index.html` (grob von oben nach unten)
- **CSS** (Farben als Variablen, Kacheln, Tastenfeld, Dartscheibe).
- **Start und Hilfsfunktionen:** Verbindung zu Supabase, `route`, `$`, `esc`.
- **Spielregeln:** `calc(cfg, ev)` berechnet alles aus Einstellungen und Wurfliste.
- **Startbildschirm** (`home`), **Neues Match** (`newView`), **Beitreten** (`joinView`).
- **Matchansicht** (`matchView`, Tastenfeld, Wurfprotokoll, Endscreen `endView`).
- **Statistik:** Ranking, Profile, Heatmap, Duelle, Verlauf (`statsView`, `profile`, `board`, `duelView`, `histView`).
- **Training:** Einstellungen, Ablauf, Auswertung (`tsetup`, `trainRun`, `tcalc`, `tstat`, `tsave`).
- **Admin:** Login, Spieler, Matches, Daten, Changelog, Editor (`adm…`, `ae…`, `autoClean`, `CHANGELOG`).
- **Match-Verwaltung:** erstellen, öffnen, beitreten, speichern (`create`, `openMatch`, `joinCode`, `dart`, `undo`, `sync`, `save`).
- **Ton:** Ansagen und Sprachpaket (`phrases`, `speak`, `loadPack`).
- **Einstellungen** (`setPanel` mit Reitern).
- **Kamera und Clips** (`startCam`, `camJoin`, `mkPc`, `clip…`).
- **Hauptzeichnen:** `render()` wählt je nach Zustand die Ansicht.

## 4. Einrichtung und Betrieb

### Erstmalige Einrichtung
1. **Supabase-Projekt** anlegen (kostenlos). Tabelle `matches` mit den Spalten `id` (text, Primärschlüssel), `state` (jsonb), `finished` (boolean), `created_at`, `updated_at`. Realtime für die Tabelle einschalten. Row Level Security mit offenen Regeln für Lesen, Einfügen, Ändern (siehe 11).
2. **`config.js`** mit der Projekt-URL und dem öffentlichen (publishable) Schlüssel füllen.
3. **GitHub-Repository** und **Vercel**-Projekt verbinden. Jeder Push auf `main` baut automatisch neu (ca. 1 Minute).
4. Seite im Browser öffnen, am Handy „Zum Homescreen hinzufügen".

### Einmalige SQL-Schritte in Supabase (SQL Editor, Run)
- **Löschen erlauben** (für „Endgültig löschen" im Admin):
  `create policy "matches delete" on public.matches for delete using (true);`
- **Sicheres Eintragen** (verhindert verlorene Würfe bei zwei Geräten): das SQL steht im Admin-Bereich unter **Daten → Sicheres Eintragen** (Knopf „SQL kopieren", dann „Funktion testen"). Ohne diesen Schritt speichert die App wie früher den ganzen Spielstand.

### Änderungen einspielen
Datei auf GitHub ändern oder hochladen und „Commit". Vercel veröffentlicht automatisch. Seite mit Strg+Shift+R neu laden.

## 5. Funktionen

### Spielen
- 301, 501 oder eigene Startzahl (2 bis 1501).
- Legs und Sätze frei einstellbar, 1 bis 4 Spieler.
- Check-out je Spieler: Single, Double oder Master Out (Handicap möglich).
- Eintragen Dart für Dart (Single, Double, Triple, 25, Bull, 0). Zurücknehmen des letzten Darts.
- Bust und Leg-/Matchgewinn werden erkannt und angezeigt.
- Rematch mit einem Tipp.
- Beitreten zeigt laufende Matches (zuletzt aktiv innerhalb der Aufräum-Zeit, Standard 10 Minuten), per Tipp ohne Code zuschauen; die Code-Eingabe bleibt.
- Match-Code zum Zuschauen und separater Spielercode zum Mitspielen. Mehrere Geräte können eintragen.
- Zuschauer sehen live mit (nur lesen).
- Bildschirm bleibt an (Wake Lock), Vibration optional.
- Jeder Bereich hat eine eigene Adresse: `#/neu`, `#/beitreten`, `#/training`, `#/training/lauf`, `#/ranking`, `#/profil/<name>`, `#/verlauf[/<name>]`, `#/duell/<a>/<b>`, `#/admin`; ein Match hat `?m=CODE` (mit `&p=` Spielercode). Zurück/Vorwärts des Browsers und der Handy-Geste gehen durch die Bereiche, Neuladen bleibt im Bereich, Links sind teilbar. Im laufenden Match fragt Zurück nach; offene Fenster (Einstellungen, Kamera-Zuordnung) schließen zuerst.

### Live-Kamera
- Kamera starten, Zoom (optisch oder digital), zwei Kameras gleichzeitig.
- Kamera einem Spieler zuordnen; diese Kamera wird dann beim Wurf des Spielers gezeigt. Ohne Zuordnung die eigene.
- Replay-Clips vom Wurf, speicherbar.

### Ansagen
- Deutsche Sprachausgabe (Browserstimme) oder die eigene Stimme (Aufnahmen), Lautstärke einstellbar.
- Ansagen: Punktzahl, Rest, Check-out-Hinweis, Bust, Leg gewonnen „mit dem 1., 2. oder 3. Dart", Match gewonnen.

### Statistik
- **Endscreen:** Schnitt, Höchstwurf, 100+/140+/180, Checkout-Quote, First-9-Schnitt u. a.
- **Ranking** sortierbar, mit Verlaufsdiagramm (Punkt antippen oder mit der Maus darüberfahren zeigt Name, Average und Matchnummer).
- **Profil** je Spieler: Kennzahlen, Dartscheibe mit Trefferverteilung (Heatmap) und **Tabellenansicht**, Duelle gegeneinander, Matchverlauf.
- Spieler lassen sich im Ranking ausblenden (ihre Matches zählen für die Gegner weiter), einzelne Matches im Verlauf separat; alles lässt sich wieder einblenden.

### Training
Modi: Finishing, Scoring, Zielfeld, Legs. Werte nur im Profil-Reiter „Training", nicht im Ranking.

### Einstellungen
Reiter Ton, Anzeige, Kamera, Mehr (dort der Zugang zum Admin-Bereich).

### Installation (PWA)
Auf dem Homescreen wie eine App; ohne Zwischenspeicher, daher immer aktuell.

## 6. Datenmodell

Tabelle `matches` (eine Zeile pro Eintrag):

| Spalte | Bedeutung |
|---|---|
| `id` | Match-Code (Text), Trainings beginnen mit `TR-`, Sonderzeile `_CONFIG` |
| `state` | JSON mit dem gesamten Spielstand (siehe unten) |
| `finished` | `true`, sobald es einen Sieger gibt |
| `created_at`, `updated_at` | Zeitstempel, `updated_at` steuert das Aufräumen |

### `state` eines Matches
```json
{
  "cfg": { "start": 501, "legs": 3, "sets": 1, "players": ["Ann","Ben"], "outs": ["double","double"] },
  "ev":  [[3,20],[1,5],[0,0]],   // jeder Dart: [Multiplikator, Zahl]; 0,0 = Fehlwurf, [2,25] = Bull
  "ph":  "…",                      // Hash des Spielercodes
  "vc":  "…",                      // Zuschauercode
  "v":   12,                       // Versionszähler (sicheres Eintragen)
  "ops": ["a1b2…"],                // zuletzt verarbeitete Schreib-IDs (gegen Doppelbuchung)
  "del": 1, "auto": 1              // im Papierkorb (auto = automatisch aufgeräumt)
}
```
Alles andere (Restpunkte, Besuche, Legs, Sieger, Statistik) berechnet `calc()` jedes Mal neu aus `cfg` und `ev`. Dadurch ist „Zurücknehmen" einfach ein `pop()` auf der Wurfliste.

### Training
`id = TR-xxxxxx`, `state = { tr: {name, kind, rule, ev, o, …} }`, `finished = false`. Wird aus Ranking, Verlauf und Vorschlägen herausgefiltert.

### `_CONFIG`
Eine Sonderzeile mit globalen Einstellungen: `hp` (ausgeblendete Spieler im Ranking), `hm` (ausgeblendete Matches), `hs` (ausgeblendete Vorschläge), `ac` (Minuten bis zum automatischen Aufräumen, 0 = aus).

## 7. Wichtige Abläufe im Code

### Wurf eintragen (`dart` → `sync` → `sqPump`)
1. Der Dart wird sofort lokal an `match.st.ev` angehängt und gezeichnet (fühlt sich sofort an).
2. `sync()` stellt den Schreibauftrag in eine Warteschlange, `sqPump()` sendet die Aufträge nacheinander an die Datenbankfunktion `ev_push` (bzw. `ev_pop` beim Zurücknehmen).
3. Die Datenbank hängt den Dart **atomar** an die Wurfliste an. So gehen Würfe von zwei Geräten nicht gegenseitig verloren.
4. Die Antwort enthält den echten Spielstand; er ersetzt den lokalen, wenn keine weiteren Aufträge offen sind. Außerdem wird `finished` abgeglichen.
5. Jeder Auftrag hat eine ID (`ops`), damit ein Wiederholen nach Verbindungsfehler keinen Dart doppelt anlegt (bis zu 4 Versuche).
6. **Rückfall:** Fehlt die Funktion in Supabase, oder scheitert alles, speichert die App wie früher den ganzen Spielstand (`save()`).
7. Das Live-Update (Realtime) ignoriert veraltete Stände (Versionszähler `v`) und Stände, während eigene Aufträge noch laufen.

### Spielstand berechnen (`calc`)
Geht die Wurfliste durch, bildet Besuche (je 3 Darts), prüft Bust, Check-out-Regel, Leg- und Satzgewinn und liefert Spieler, wer dran ist und den Sieger. Reine Funktion ohne Seiteneffekte; daran hängen fast alle Tests.

### Adressen und Zurück (Router)
`render()` ruft nach dem Zeichnen `syncUrl()` auf: Aus dem aktuellen Zustand (Match, Training, `view`) wird die passende Adresse gebildet (`wantUrl`). Weicht sie von der Browser-Adresse ab, legt die App einen Verlaufseintrag an (`pushState`); führt die neue Adresse zum vorherigen Eintrag zurück (etwa der „‹ Start"-Knopf), geht sie stattdessen einen Schritt zurück. Beim Zurück/Vorwärts des Browsers (`popstate`) liest `applyUrl()` die Adresse und stellt den Zustand her (Match öffnen, Bereich anzeigen, Ranking-Daten nachladen). Fenster werden beim Zurück nur geschlossen (die App geht danach per `history.go(1)` wieder vor), ebenso bei „Match verlassen?" mit Abbrechen.

### Zeichnen (`render`)
Setzt den ganzen Bildschirm aus Textbausteinen neu zusammen, abhängig von `match`, `TS` (Training), `view` und Admin-Zustand. Danach werden Ansagen (`hear`) und Clips (`clipWatch`) angestoßen.

### Automatisches Aufräumen (`autoClean`)
Läuft beim Start und alle 2 Minuten. Offene Matches ohne Aktivität länger als eingestellt kommen in den Papierkorb (`del`+`auto`). Ein gleichzeitiger Wurf wird durch eine Prüfung auf `updated_at` nicht überschrieben. Beendete Matches bleiben immer. Neue Aktivität holt ein Match zurück.

## 8. Admin-Modus
Zugang: Einstellungen → Mehr → Admin-Bereich, Passwort **6789**. Reiter:

- **Spieler:** umbenennen (in allen Matches und Trainings; bei vorhandenem Namen werden beide zusammengeführt), löschen, im Ranking ausblenden/einblenden.
- **Matches:** Liste mit Filter (Alle, Beendet, Offen, Training, Papierkorb). Pro Eintrag: öffnen, **bearbeiten** (einzelne Würfe, Spielernamen, Regeln, Leg-Ergebnisse), in den Papierkorb, wiederherstellen, endgültig löschen.
- **Daten:** Überblick, automatisches Aufräumen (Aus, 10, 30 Min, 1 h, 3 h), Aufräumen alter offener Matches, Papierkorb leeren, **Sicherung** als Datei, SQL für „Endgültig löschen" und „Sicheres Eintragen" mit Funktionstest.
- **Changelog:** zwei Ansichten, „Website" und „Admin-Bereich", nach Datum. Er steht in der Konstante `CHANGELOG` in `index.html` und wird bei jeder Änderung ergänzt.

**Wichtig:** Das Passwort wird nur im Browser geprüft (Hash im Code). Das ist keine echte Sicherheit, sondern eine Schranke gegen Versehen. Wer die Supabase-Daten direkt anspricht, braucht kein Passwort (siehe 11).

## 9. Kamera
- **Technik:** WebRTC. Das Bild geht direkt zwischen den Geräten. Abgemacht wird über den Supabase-Kanal `cam<Match-ID>` (Broadcast).
- **Zuordnung:** Beim Start wählt man einen Spieler (oder keinen). Nachricht `{t:'as', p}` teilt die Zuordnung den anderen mit. Beim Zuschauen zeigt die App die Kamera des werfenden Spielers, sonst die eigene.
- **Clips:** Pro sichtbarer Kachel läuft ein Zwischenspeicher; nach dem Wurf lässt sich der Clip ansehen und speichern.
- **Grenzen:** In manchen Netzen (Mobilfunk, strenge Router) klappt die direkte Verbindung nicht. Dann hilft ein TURN-Server (`TURN_APP` in `config.js`, z. B. kostenlos bei metered.ca). Funktioniert nur über https.

## 10. Ansagen und Sprachpakete
- Ohne Pakete spricht die Browser-Sprachausgabe (TTS).
- **Hauptpaket:** `ton/sprache.wav` + `ton/sprache.json` (eine lange Aufnahme, die JSON enthält die Schnittstellen je Ansage).
- **Zusatzpaket:** `ton/sprache2.wav/json` mit `dart1`, `dart2`, `dart3`, `bust`.
- Aufnehmen: `/aufnehmen.html` (Hauptpaket) oder `/aufnehmen.html?zusatz`. Die Seite erzeugt zwei Dateien zum Herunterladen; diese in `ton/` hochladen und die alten ersetzen.
- Fehlt ein Baustein, fällt die App für diese Ansage auf TTS zurück. Ausnahme: Ist ein Paket aktiv und `bust` fehlt, bleibt „Bust" still, damit nicht mitten im Satz die Stimme wechselt.

## 11. Sicherheit und Datenschutz
- Der Schlüssel in `config.js` ist ein **öffentlicher** Schlüssel und darf im Code stehen. Geheime Schlüssel (service_role) gehören **nie** ins Repository.
- Die Datenbank ist bewusst offen (jeder mit dem Schlüssel kann lesen, schreiben, löschen). Das ist für private Nutzung mit Freunden gedacht. Wer den Link und den Code nicht kennt, findet ein Match praktisch nicht, aber es ist kein Schutz gegen gezielten Missbrauch.
- Spielercodes werden als Hash gespeichert; Zuschauercodes sind kurz und einfach.
- Das Admin-Passwort schützt nur die Oberfläche.
- Kamera-Bilder gehen direkt zwischen den Geräten, nicht über einen Server (außer ein TURN-Server vermittelt).
- Wer mehr Schutz will, müsste Anmeldung und strengere Regeln (RLS) in Supabase einführen.

## 12. Bekannte Grenzen
- Wenn zwei Geräte gleichzeitig den **Gewinnwurf** eintragen, kann ein Dart zu viel im Match stehen.
- „Zurücknehmen" entfernt den zuletzt eingetragenen Dart, auch wenn ihn das andere Gerät geworfen hat.
- Admin-Bearbeitung eines Matches, das gerade live gespielt wird, kann Würfe überschreiben.
- Keine Konten: Namen sind frei wählbar, Schreibweisen müssen übereinstimmen (Admin kann zusammenführen).
- Kamera kann in manchen Netzen ohne TURN nicht verbinden.
- Der Code liegt in einer großen Datei; das ist unübersichtlich, aber einfach zu veröffentlichen.
- Getestet wurde mit simulierter Datenbank und im Browser; echte Geräte, schlechte Netze und Zwei-Handy-Betrieb nur durch Ausprobieren.

## 13. Weiterentwickeln
<a id="13-weiterentwickeln"></a>

### Regeln für Änderungen
- Änderungen immer klein halten und danach auf Testgerät prüfen.
- Neue Funktionen im **Changelog** (`CHANGELOG` in `index.html`) und hier in der Doku nachtragen.
- Spielstand-Format (`state`) abwärtskompatibel halten: alte Matches müssen weiter laden.
- Wer schreibt, muss `del`/`auto` im Blick haben (Papierkorb) und `updated_at` pflegen (Aufräumen).

### Tests
Es gibt keine automatischen Tests im Repository. Bisher wurden Skripte mit Node und einer simulierten Datenbank sowie Browser-Screenshots genutzt: Spielregeln (`calc`), Admin-Funktionen, Aufräumen, Training, sicheres Eintragen mit Konflikten und Verbindungsfehlern. Falls das Projekt wächst, lohnt es sich, diese Skripte ins Repository (`tests/`) zu legen.

### Mögliche Verbesserungen
- `index.html` in mehrere Dateien aufteilen (CSS, Spiel, Kamera, Statistik, Training, Admin).
- Echte Anmeldung und Datenbankregeln, falls die App öffentlicher wird.
- Wettkampf-Modi (Cricket, Around the Clock), Turnier-Modus.
- Automatische Tests und eine Staging-Umgebung.

## 14. Fehlersuche

| Problem | Ursache / Lösung |
|---|---|
| Seite zeigt Altes | Strg+Shift+R, oder App auf dem Handy schließen und neu öffnen |
| „Speichern fehlgeschlagen" | Verbindung prüfen; die App versucht es erneut und speichert zur Not den ganzen Stand |
| Würfe fehlen bei zwei Geräten | „Sicheres Eintragen" einrichten (Admin → Daten, SQL in Supabase), dann „Funktion testen" |
| „Endgültig löschen" tut nichts | Löschregel in Supabase fehlt (SQL aus Abschnitt 4) |
| Kein Kamerabild | https nötig, Berechtigung erlauben, ggf. TURN eintragen; beide im selben Match? |
| Ansagen mit falscher Stimme | `ton/sprache.*` fehlt oder liegt nicht im Ordner `ton/`; Seite neu laden |
| Homescreen-Symbol fehlt | App vom Homescreen entfernen und neu hinzufügen (Icons liegen in `icons/`) |
| Match ist weg | Vermutlich automatisch aufgeräumt: Admin → Matches → Papierkorb → Wiederherstellen; Einstellung unter Daten |
| Neues Match lässt sich nicht öffnen | Alte Matches aus Version 1 sind nicht kompatibel |
