const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, 'server', 'uploads');
const dummyHtml = `<html>
  <body style="background:#111;color:#fff;text-align:center;padding:50px;font-family:sans-serif">
    <h1>Dummy Game</h1>
    <p>This is a seeded game placeholder serving as the build output.</p>
    <button style="padding:10px;cursor:pointer" onclick="window.parent.postMessage({type:'caskill:finish',score:500,durationSeconds:10},'*')">Simulate Finish Score (500)</button>
  </body>
</html>`;

const files = ['memory-match-v1', 'quiz-game-v1', 'reaction-clicker-v1-1', 'reaction-duel-v1'];

files.forEach(f => {
  const distPath = path.join(uploadDir, 'extracted', f, 'dist');
  fs.mkdirSync(distPath, { recursive: true });
  fs.writeFileSync(path.join(distPath, 'index.html'), dummyHtml);
});

console.log('Dummy files created successfully!');
