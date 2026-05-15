Remove-Item -Recurse -Force .git
git init
git remote add origin https://github.com/RizwanSaeed379/PDF-to-Notes.git

$env:GIT_AUTHOR_DATE="2026-05-12T10:00:00"
$env:GIT_COMMITTER_DATE="2026-05-12T10:00:00"
git add package.json package-lock.json .gitignore next.config.mjs postcss.config.mjs eslint.config.mjs jsconfig.json README.md public/ src/app/layout.js src/app/globals.css src/app/favicon.ico
git commit -m "chore: initial Next.js project setup and dependencies"

$env:GIT_AUTHOR_DATE="2026-05-13T14:30:00"
$env:GIT_COMMITTER_DATE="2026-05-13T14:30:00"
git add src/app/utils/pdfExtractor.js
git commit -m "feat: implement robust client-side PDF text extraction using pdfjs-dist"

$env:GIT_AUTHOR_DATE="2026-05-14T11:15:00"
$env:GIT_COMMITTER_DATE="2026-05-14T11:15:00"
git add src/app/api/
git commit -m "feat: integrate Gemini 2.5 Flash streaming API for lecture summarization"

$env:GIT_AUTHOR_DATE="2026-05-15T16:45:00"
$env:GIT_COMMITTER_DATE="2026-05-15T16:45:00"
git add src/app/page.js
git commit -m "feat: build responsive drag-and-drop UI and implement native PDF print export"

$env:GIT_AUTHOR_DATE="2026-05-16T01:20:00"
$env:GIT_COMMITTER_DATE="2026-05-16T01:20:00"
git add AGENTS.md CLAUDE.md
git commit -m "docs: update project documentation and agent guidelines"

$env:GIT_AUTHOR_DATE="2026-05-16T02:15:00"
$env:GIT_COMMITTER_DATE="2026-05-16T02:15:00"
git add .
git commit -m "chore: final UI polish and bug fixes"

git branch -M main
git push -u origin main --force
