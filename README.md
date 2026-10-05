# Trivia v2

Eine moderne, minimalistische Trivia-Quiz-Web-App mit Dark Mode, flüssigen Animationen und dynamischer Anbindung an die [Open Trivia Database](https://opentdb.com/).

## Features

- **Frei konfigurierbares Quiz**: Fragenanzahl (5 bis 25), 21+ Kategorien, 3 Schwierigkeitsgrade, Multiple Choice oder True/False sowie optionaler Timer.
- **Taktiles Gameplay**: Großzügiges UI, sofortige farbliche Rückmeldung, Tastatur-Shortcuts (1–4, A–D, Enter) und dezente Web-Audio-Sounds.
- **Ergebnis & Review**: Punktestand, Trefferquote, Reaktionszeit, Konfetti-Animation und detaillierte Überprüfung aller Antworten.
- **Lokale Bestenliste**: Highscores und Spielverlauf werden sicher im Browser (`localStorage`) gespeichert.
- **Optimiert für Mobile & iPad**: Ergonomische Touch-Bereiche ($\ge 52\,\text{px}$) und responsive Layouts.

---

## Deployment auf Netlify

Die App ist vollständig für **Netlify** vorkonfiguriert:

### 1. Automatisches Deployment via GitHub (Empfohlen)
1. Gehe in deinem Netlify-Dashboard auf **"Add new site"** → **"Import an existing project"**.
2. Wähle **GitHub** und dein Repository aus.
3. Die Build-Einstellungen werden automatisch über die vorhandene `netlify.toml` erkannt:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node Version**: `20` (über `.nvmrc` und `netlify.toml`)
4. Klicke auf **"Deploy Trivia v2"**.

### Enthaltene Netlify-Optimierungen:
- **`netlify.toml` & `public/_redirects`**: Automatisches SPA-Routing (kein 404-Fehler beim Neuladen von Unterpfaden).
- **Hashed Assets Caching**: 1-Jahr Immutable Cache für alle statischen Vite-Assets (`/assets/*`).
- **Sicherheits-Header**: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`.
- **Zero API Secrets**: Die Open Trivia Database ist eine öffentliche REST-API – es müssen keine geheimen API-Schlüssel in Netlify hinterlegt werden.

---

## Lokale Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Produktions-Build erstellen
npm run build
```
