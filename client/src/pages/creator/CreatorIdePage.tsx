import { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import Editor from "@monaco-editor/react";

type FileKey = "html" | "css" | "javascript";

export function CreatorIdePage() {
  const [activeFile, setActiveFile] = useState<FileKey>("html");
  
  const [files, setFiles] = useState({
    html: `<!-- HTML Entry -->
<div id="game-container">
  <h2>1v1 Reaction Duel</h2>
  <div id="status">Press Start to begin...</div>
  
  <div id="arena">
    <div id="p1">Player 1 (Key: A)</div>
    <div id="center-light"></div>
    <div id="p2">Player 2 (Key: L)</div>
  </div>
  
  <button id="start-btn">Start Round</button>
  <button id="done-btn" style="display:none">Submit Results</button>
</div>`,
    css: `/* Styling */
body {
  background: #0a0a08;
  color: #f0efe8;
  font-family: 'Courier New', Courier, monospace;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

#game-container {
  text-align: center;
  background: #111;
  padding: 2rem;
  border-radius: 16px;
  border: 2px solid #222;
  width: 420px;
}

#status {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #e8ff47;
  height: 1.5rem;
}

#arena {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

#p1, #p2 {
  font-size: 0.9rem;
  font-weight: bold;
  padding: 10px;
  border: 2px solid #333;
  border-radius: 8px;
  width: 100px;
}

#center-light {
  width: 70px;
  height: 70px;
  background: #333;
  border-radius: 50%;
  transition: background 0.1s;
}

button {
  background: #e8ff47;
  color: black;
  border: none;
  padding: 12px 24px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 8px;
  text-transform: uppercase;
  margin: 0 5px;
}

button:active {
  transform: scale(0.95);
}`,
    javascript: `// 1v1 Reaction Duel Logic
let isLive = false;
let p1Score = 0;
let p2Score = 0;
let timeoutId = null;
let startTime = Date.now();

const statusEl = document.getElementById('status');
const light = document.getElementById('center-light');
const startBtn = document.getElementById('start-btn');
const doneBtn = document.getElementById('done-btn');
const p1El = document.getElementById('p1');
const p2El = document.getElementById('p2');

function startRound() {
  isLive = false;
  
  // Players must wait for Red to turn Green
  light.style.background = '#ff4d4d'; 
  light.style.boxShadow = '0 0 20px rgba(255, 77, 77, 0.5)';
  statusEl.textContent = 'Wait for Green...';
  startBtn.style.display = 'none';

  // Random delay between 1 and 4 seconds
  const delay = Math.random() * 3000 + 1000;
  
  timeoutId = setTimeout(() => {
    isLive = true;
    light.style.background = '#a8e063';
    light.style.boxShadow = '0 0 20px rgba(168, 224, 99, 0.5)';
    statusEl.textContent = 'GO!';
  }, delay);
}

function handleWin(player) {
  isLive = false;
  clearTimeout(timeoutId);
  
  if (player === 1) {
    p1Score += 1;
    statusEl.textContent = 'Player 1 Wins text round!';
    p1El.style.borderColor = '#a8e063';
  } else {
    p2Score += 1;
    statusEl.textContent = 'Player 2 Wins the round!';
    p2El.style.borderColor = '#a8e063';
  }
  
  startBtn.textContent = 'Next Round';
  startBtn.style.display = 'inline-block';
  doneBtn.style.display = 'inline-block';
}

function handleEarlyJump(player) {
  clearTimeout(timeoutId);
  isLive = false;
  statusEl.textContent = \`Player \${player} went too early! \${player === 1 ? 2 : 1} gets the point!\`;
  
  if (player === 1) {
    p2Score += 1;
  } else {
    p1Score += 1;
  }
  
  startBtn.textContent = 'Next Round';
  startBtn.style.display = 'inline-block';
  doneBtn.style.display = 'inline-block';
}

window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  
  // Player 1 controls
  if (key === 'a') {
    if (isLive) handleWin(1);
    else if (startBtn.style.display === 'none') handleEarlyJump(1);
  }
  
  // Player 2 controls
  if (key === 'l') {
    if (isLive) handleWin(2);
    else if (startBtn.style.display === 'none') handleEarlyJump(2);
  }
});

startBtn.addEventListener('click', () => {
  p1El.style.borderColor = '#333';
  p2El.style.borderColor = '#333';
  startRound();
});

doneBtn.addEventListener('click', () => {
  // Determine final points based on who won more rounds
  const finalScore = Math.max(p1Score, p2Score) * 100;
  const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
  
  // Submit final results to CaSkill Anti-cheat & Matchmaking
  window.parent.postMessage({
    type: "caskill:finish",
    score: finalScore,
    durationSeconds: durationSeconds,
    clientMeta: { 
      mode: "local-1v1",
      p1Score: p1Score, 
      p2Score: p2Score 
    }
  }, "*");
  
  statusEl.textContent = 'Results submitted!';
  doneBtn.style.display = 'none';
  startBtn.style.display = 'none';
});`
  });

  const [srcDoc, setSrcDoc] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
        <html>
          <style>${files.css}</style>
          <body>
            ${files.html}
            <script>${files.javascript}</script>
          </body>
        </html>
      `);
    }, 500);

    return () => clearTimeout(timeout);
  }, [files]);

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight [font-family:var(--font-display)]">CaSkill Sandbox</h2>
          <p className="text-sm text-[var(--color-muted)]">Code, Preview, and Publish directly from your browser.</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge label="Auto-saving" tone="success" />
          <Button size="sm">Publish Game</Button>
        </div>
      </div>

      <div className="grid flex-1 overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[#1e1e1e] lg:grid-cols-[1.3fr_0.7fr]">
        <div className="flex flex-col border-r border-[var(--color-border)]">
          <div className="flex items-center border-b border-[#333] bg-[#111]">
            <button
              className={`px-6 py-3 text-[11px] font-bold uppercase tracking-widest transition ${activeFile === "html" ? "border-[var(--color-border)] border-t-2 border-t-orange-400 bg-[#1e1e1e] text-orange-400" : "text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]"}`}
              onClick={() => setActiveFile("html")}
            >
              index.html
            </button>
            <button
              className={`px-6 py-3 text-[11px] font-bold uppercase tracking-widest transition ${activeFile === "css" ? "border-[var(--color-border)] border-t-2 border-t-blue-400 bg-[#1e1e1e] text-blue-400" : "text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]"}`}
              onClick={() => setActiveFile("css")}
            >
              style.css
            </button>
            <button
              className={`px-6 py-3 text-[11px] font-bold uppercase tracking-widest transition ${activeFile === "javascript" ? "border-[var(--color-border)] border-t-2 border-t-yellow-400 bg-[#1e1e1e] text-yellow-400" : "text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]"}`}
              onClick={() => setActiveFile("javascript")}
            >
              script.js
            </button>
          </div>
          <div className="flex-1 relative">
            <Editor
              height="100%"
              theme="vs-dark"
              language={activeFile}
              value={files[activeFile]}
              onChange={(value) => setFiles((prev) => ({ ...prev, [activeFile]: value || "" }))}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "var(--font-mono)",
                wordWrap: "on",
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                padding: { top: 16 },
                renderLineHighlight: "all",
                cursorBlinking: "smooth",
                autoIndent: "full",
                formatOnPaste: true,
              }}
            />
          </div>
        </div>

        <div className="relative flex flex-col bg-white overflow-hidden">
          <div className="absolute left-0 right-0 top-0 flex items-center justify-between border-b bg-gray-50 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <span>Live Preview</span>
            <div className="flex gap-1.5">
              <div className="h-2 w-2 rounded-full bg-red-400" />
              <div className="h-2 w-2 rounded-full bg-yellow-400" />
              <div className="h-2 w-2 rounded-full bg-green-400" />
            </div>
          </div>
          <iframe
            className="mt-8 h-full w-full border-none"
            srcDoc={srcDoc}
            title="CaSkill Sandbox Preview"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
}
