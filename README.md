# Rechen-Gipfel 6

Digitale Lernwelt für die **6. Klasse der Mittelschule in Bayern**.
Zwei Bereiche:

- **Dezimalzahlen:** Addieren, Subtrahieren, Multiplizieren und Dividieren, jeweils **schriftlich** oder als **Kopfrechnen**, in **Stufe 1** und **Stufe 2**.
- **Rationale Zahlen:** Addieren und Subtrahieren im Kopf, in Stufe 1 und Stufe 2. Es kommen nur Aufgaben wie **−8 + 5**, **4 − 9** oder **−13 − 3** vor, also **keine doppelten Vorzeichen** wie −8 − (−8).

Die Lernwelt ist das Gegenstück zu [Grundrechenarten5](https://github.com/MelineHoegl/Grundrechenarten5) und funktioniert genauso.

## So läuft es für die Kinder

1. **Bereich und Rechenart wählen:** Jede Rechenart ist ein Berg.
2. Bei Dezimalzahlen **Verfahren wählen:** schriftlich oder Kopfrechnen. Bei rationalen Zahlen entfällt dieser Schritt.
3. **Stufe wählen:** Stufe 1 oder Stufe 2.
4. **Üben:** Eine Runde hat 5 Aufgaben, die 5. ist eine schwerere **Gipfelaufgabe** mit doppelten Punkten. Beim Kopfrechnen ist jede Aufgabe ein **Päckchen** mit drei Rechnungen.
5. **Aufsteigen:** Wer mindestens 4 von 5 Aufgaben im ersten Versuch löst, erreicht die nächste Hütte. Pro Stufe gibt es 5 Hütten, und mit jeder Hütte wird es schwerer.

**Sachaufgaben** kommen beim schriftlichen Rechnen und bei den rationalen Zahlen ab Hütte 2 vor, in Stufe 2 schon ab Hütte 1. Die Kinder wählen erst die passende Rechnung, rechnen dann und bekommen den Antwortsatz.
Beispiele sind Einkauf in Euro, Brett absägen, Fläche eines Beets, Temperatur am Morgen und in der Nacht oder Kontostand.

Spielerisch wird es durch Punkte, Sterne, Serienbonus, Konfetti und Gamsi, die Gämse, die lobt und Tipps gibt.
Nach zwei Fehlversuchen zeigt Gamsi die Lösung in Rot und erklärt die Schritte. Bei den rationalen Zahlen zeigt der **Tipp einen Zahlenstrahl** mit Pfeilen.

## Was in welcher Stufe geübt wird

| Rechenart | Schriftlich Stufe 1 | Schriftlich Stufe 2 | Kopfrechnen Stufe 1 | Kopfrechnen Stufe 2 |
| --- | --- | --- | --- | --- |
| Addition | gleich viele Stellen nach dem Komma | verschieden viele Stellen, drei und vier Zahlen | Zehntel und Hundertstel, auch über die 1 | Ergänzen bis 1 und zur nächsten ganzen Zahl, drei Summanden |
| Subtraktion | **bayerisches Verfahren** mit Entbündeln und Strich-Zeile | Nullen ergänzen, ganze Zahl minus Dezimalzahl | Zehntel und Hundertstel, 1 − 0,35 | ganze Zahl minus Dezimalzahl, fehlende Zahl finden |
| Multiplikation | Dezimalzahl mal einstellige Zahl | Dezimalzahl mal Dezimalzahl, auch zweistelliger Faktor | mal 10, 100, 1000 und mal einstellige Zahl | Dezimalzahl mal Dezimalzahl, mal 0,1 und 0,01 |
| Division | Dezimalzahl durch einstellige Zahl | durch eine Dezimalzahl: erst Komma verschieben | durch 10, 100, 1000 und einstellige Zahlen | durch Dezimalzahlen wie 0,4 oder 1,2 |

| Rationale Zahlen | Stufe 1 | Stufe 2 |
| --- | --- | --- |
| Addition | −8 + 5, ganze Zahlen bis 100 | Dezimalzahlen wie −2,5 + 4, drei Zahlen, große Zahlen |
| Subtraktion | 3 − 7 und −13 − 3, ganze Zahlen bis 100 | Dezimalzahlen, drei Zahlen, große Zahlen |

Hinweise zu den Verfahren:

- **Schriftlich:** Das Komma steht in den Rechenkästchen schon an der richtigen Stelle, nach dem Prinzip „Komma unter Komma“. Beim Subtrahieren werden fehlende Nullen farbig ergänzt.
- **Multiplikation:** Erst wird ohne Komma gerechnet. Dann zählen die Kinder die Stellen nach dem Komma und streichen sie im Ergebnis von rechts ab.
- **Division:** Geführt mit „Wie oft passt …?“. Wer das Komma überschreitet, setzt im Ergebnis das Komma. In Stufe 2 fragt die Lernwelt zuerst, um wie viele Stellen das Komma verschoben wird, und dann nach der neuen Aufgabe.

## Bedienung

Die Lernwelt funktioniert mit Maus, Tastatur und auf dem Tablet. Auf dem Bildschirm gibt es ein Zahlenfeld mit **Komma-Taste** bei den Dezimalzahlen und **Minus-Taste** bei den rationalen Zahlen.
Auf der Tastatur funktionieren Komma, Punkt und Minus ebenfalls.

Der Fortschritt wird **nur im Browser des jeweiligen Geräts** gespeichert. Es gibt keine Anmeldung, und es werden keine Daten verschickt.

## Veröffentlichen mit GitHub Pages

1. Im Repository auf **Settings → Pages** gehen.
2. Bei *Source* „Deploy from a branch“ wählen, dann Branch **main** und Ordner **/ (root)**, und speichern.
3. Nach ein bis zwei Minuten ist die Lernwelt unter `https://melinehoegl.github.io/Grundrechenarten6/` erreichbar.

Ohne Internet geht es auch: `einzeldatei/Rechen-Gipfel-6.html` enthält die ganze Lernwelt in einer Datei.

## Aufbau des Projekts

```
index.html            Startseite und alle Bildschirme
css/style.css         Gestaltung (hell und dunkel, Handy und Tablet)
js/util.js            Hilfsfunktionen, Dezimalzahlen, Speicher
js/generators.js      Aufgaben und Sachaufgaben je Bereich, Rechenart, Verfahren, Stufe und Hütte
js/specs.js           Rechenkästchen, Päckchen, Prüfung, Tipps und Lösungswege
js/widgets.js         Eingabe in Kästchen und Feldern, Division Schritt für Schritt
js/app.js             Ablauf, Punkte, Hütten, Zahlenstrahl
einzeldatei/          die ganze Lernwelt als eine HTML-Datei
tools/einzeldatei.py  erzeugt die Einzeldatei neu nach Änderungen
```
