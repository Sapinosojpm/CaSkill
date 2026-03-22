import { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { uploadCreatorGame } from "../../api/creator.api";
import { getApiErrorMessage } from "../../utils/errors";
import { useNavigate } from "react-router-dom";
import JSZip from "jszip";
import Editor from "@monaco-editor/react";

async function generateDummyThumbnail(): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#111110";
  ctx.fillRect(0, 0, 400, 400);
  ctx.fillStyle = "#e8ff47";
  ctx.font = "bold 40px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("IDE Build", 200, 200);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob!], "thumbnail.png", { type: "image/png" }));
    });
  });
}

type FileKey = "html" | "css" | "javascript";

export function CreatorIdePage() {
  const [activeFile, setActiveFile] = useState<FileKey>("html");
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [form, setForm] = useState({
    title: "1v1 Reaction Duel",
    description: "Built directly in the CaSkill Sandbox IDE.",
    category: "Arcade",
    version: "1.0.0"
  });
  
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

  async function handlePublish() {
    setIsPublishing(true);
    setPublishError("");
    try {
      const zip = new JSZip();
      
      const manifest = {
        title: form.title,
        version: form.version,
        entryFile: "dist/index.html",
        description: form.description,
        category: form.category,
        controls: "Keyboard / Mouse",
        scoringRules: "Highest score wins"
      };
      
      zip.file("manifest.json", JSON.stringify(manifest, null, 2));
      zip.file("README.md", "# " + form.title + "\n\nGenerated by CaSkill Sandbox.");
      
      const htmlOutput = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${form.title}</title>
    <link rel="stylesheet" href="./style.css">
  </head>
  <body>
${files.html}
    <script src="./script.js"></script>
  </body>
</html>`;

      const dist = zip.folder("dist");
      dist?.file("index.html", htmlOutput);
      dist?.file("style.css", files.css);
      dist?.file("script.js", files.javascript);
      
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipFile = new File([zipBlob], "game-package.zip", { type: "application/zip" });
      const thumbnailFile = await generateDummyThumbnail();
      
      const result = await uploadCreatorGame({
        title: form.title,
        description: form.description,
        category: form.category,
        version: form.version,
        thumbnail: thumbnailFile,
        zipFile: zipFile,
      });
      
      navigate(`/creator/submissions/${result.submission.id}`);
    } catch (err) {
      setPublishError(getApiErrorMessage(err, "Publish failed"));
      setIsPublishing(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col space-y-4 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight [font-family:var(--font-display)]">CaSkill Sandbox</h2>
          <p className="text-sm text-[var(--color-muted)]">Code, Preview, and Publish directly from your browser.</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge label="Auto-saving" tone="success" />
          <Button size="sm" onClick={() => setShowModal(true)}>Publish Game</Button>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(17,17,16,0.98),rgba(10,10,8,0.98))] p-8 shadow-[0_24px_64px_rgba(0,0,0,0.4)]">
            <h3 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">Publish Game</h3>
            <p className="mt-2 text-sm text-[var(--color-muted)]">Set a title and category to upload this Sandbox IDE project directly to the admin moderation queue.</p>
            
            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm text-[var(--color-muted)]">Title</span>
                <input
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]/50"
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-[var(--color-muted)]">Category</span>
                <input
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]/50"
                  value={form.category}
                  onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                />
              </label>
            </div>

            {publishError && <p className="mt-4 text-sm text-[var(--color-error)]">{publishError}</p>}

            <div className="mt-8 flex gap-3">
              <Button className="flex-1 !text-black" disabled={isPublishing} onClick={handlePublish}>
                {isPublishing ? "Zipping & Uploading..." : "Confirm & Upload"}
              </Button>
              <Button className="flex-none bg-transparent hover:brightness-100" tone="ghost" disabled={isPublishing} onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
