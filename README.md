# MeetingScribe

Aplikacja webowa pozwalająca na analizę nagrań audio i wideo poprzez transkrypcję i generowanie inteligentnych notatek ze spotkań.

## Funkcjonalności

- Obsługa plików audio (MP3, WAV, OGG, M4A, WEBM)
- Obsługa plików wideo (MP4, MKV, WEBM, MOV)
- Transkrypcja audio przy użyciu Whisper przez Groq API
- Analiza tekstu (Groq API) generująca:
  - Szczegółowe streszczenie
  - Najważniejsze punkty (bullet points)
  - Podział na rozdziały
  - Słowniczek pojęć
  - Zadania do wykonania
- Eksport wyników do PDF

## Technologie

- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui
- Clerk (autentykacja)
- Convex (backend i baza danych)
- ffmpeg (przetwarzanie wideo)
- Groq API (Whisper i LLM)
- pdfkit (generowanie PDF)

## Wymagania

- Node.js (v18+)
- pnpm
- ffmpeg (do przetwarzania plików wideo)
- Klucz API Groq
- Konto Clerk (autentykacja)
- Konto Convex (backend)

## Instalacja ffmpeg

### Windows

1. Pobierz ffmpeg ze strony https://ffmpeg.org/download.html
2. Rozpakuj do wybranego folderu
3. Dodaj ścieżkę do folderu bin do zmiennej środowiskowej PATH

### MacOS

```bash
brew install ffmpeg
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install ffmpeg
```

## Instalacja

1. Sklonuj repozytorium:

```bash
git clone <repo-url>
cd meetingscribe
```

2. Zainstaluj zależności:

```bash
pnpm install
```

3. Utwórz plik `.env.local` i dodaj swoje klucze API:

```
GROQ_API_KEY=twój_klucz_api_groq
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=twój_klucz_clerk
CLERK_SECRET_KEY=twój_sekretny_klucz_clerk
NEXT_PUBLIC_CONVEX_URL=twój_url_convex
```

## Uruchomienie aplikacji

Uruchom serwer deweloperski:

```bash
pnpm dev:all
```

Aplikacja będzie dostępna pod adresem [http://localhost:3000](http://localhost:3000).

## Uruchomienie w środowisku produkcyjnym

1. Zbuduj aplikację:

```bash
pnpm build
```

2. Uruchom wersję produkcyjną:

```bash
pnpm start
```

## Limity plików

- Audio: do 10MB (MP3, WAV, OGG, M4A, WEBM)
- Wideo: do 25MB (MP4, MKV, WEBM, MOV)

## Licencja

MIT
