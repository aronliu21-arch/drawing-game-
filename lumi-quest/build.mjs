// Joins src/ into one self-contained page: node lumi-quest/build.mjs
// Writes index.html (full page for GitHub Pages) and, with an output path argument,
// a second copy without the <html> wrapper (the format the Claude artifact host expects).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const src = f => readFileSync(join(dir, 'src', f), 'utf8');
const js = ['questions.js', 'data.js', 'story.js', 'art.js', 'audio.js', 'core.js', 'world.js', 'battle.js', 'main.js'].map(src).join('\n');
const head = `<title>光靈大冒險</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito:wght@600;700;800;900&display=swap">
<style>
${src('style.css')}</style>`;
const body = `${src('shell.html')}<script>
${js}</script>`;

writeFileSync(join(dir, 'index.html'), `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
${head}
</head>
<body>
${body}
</body>
</html>
`);
if (process.argv[2]) writeFileSync(process.argv[2], `${head}\n${body}\n`);
console.log('built', join(dir, 'index.html'));
