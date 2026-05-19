# PFP Assistant

Chat assistant for Preferred Freelancer Program rules, powered by **OpenAI**. Answers are grounded in your validated Q&A in `lib/knowledge.ts` (sync with `questions.md`).

## Setup

1. Copy env file and add your key:

```bash
cp .env.example .env.local
```

2. Set `OPENAI_API_KEY` in `.env.local`.

3. Install and run:

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Vercel

1. Import the GitHub repo.
2. Add environment variable: `OPENAI_API_KEY`
3. Optional: `OPENAI_MODEL` (default `gpt-4o-mini`)
4. Deploy.

## Update rules

Edit `lib/knowledge.ts` to match `questions.md`, then redeploy.
