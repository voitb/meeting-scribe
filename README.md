# YouTube Analyzer

Aplikacja webowa pozwalająca na analizę zawartości filmów z YouTube poprzez transkrypcję audio i analizę tekstu.

## Funkcjonalności

- Pobieranie audio z filmów YouTube (bez zapisywania plików lokalnie)
- Transkrypcja audio przy użyciu Whisper przez Groq API
- Analiza tekstu (Groq API) generująca:
  - Krótkie streszczenie (1-2 akapity)
  - Najważniejsze punkty (bullet points)
  - Potencjalne pytania do dyskusji
- Eksport wyników do PDF

## Technologie

- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui
- ytdl-core (pobieranie audio z YouTube)
- Groq API (Whisper i LLM)
- pdfkit (generowanie PDF)

## Wymagania

- Node.js (v18+)
- pnpm
- Klucz API Groq

## Instalacja

1. Sklonuj repozytorium:

```bash
git clone <repo-url>
cd youtube-analyzer
```

2. Zainstaluj zależności:

```bash
pnpm install
```

3. Utwórz plik `.env.local` i dodaj swój klucz API Groq:

```
GROQ_API_KEY=twój_klucz_api_groq
```

## Uruchomienie aplikacji

Uruchom serwer deweloperski:

```bash
pnpm dev
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

## Wdrożenie na VPS (Docker + Coolify)

Aplikacja może być łatwo wdrożona na serwerze VPS za pomocą Coolify:

1. Skonfiguruj Coolify na swoim VPS
2. Utwórz nowy projekt w Coolify
3. Połącz repozytorium git
4. Skonfiguruj zmienną środowiskową `GROQ_API_KEY`
5. Wdróż aplikację

## Licencja

MIT
