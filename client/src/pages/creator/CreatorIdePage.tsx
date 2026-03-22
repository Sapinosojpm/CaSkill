import { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import Editor from "@monaco-editor/react";

type FileKey = "html" | "css" | "javascript";

export function CreatorIdePage() {
  const [activeFile, setActiveFile] = useState<FileKey>("html");
  
  const [files, setFiles] = useState({
    html: `<!-- HTML Entry -->
<div id="game">
  <h1>CaSkill Sandbox</h1>
  <p>Score: <span id="val">0</span></p>
  <button id="tap">Click Me!</button>
  <button id="done">Finish</button>
</div>`,
    css: `/* Styling */
body { 
  background: #0a0a08; 
  color: #e8ff47; 
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}
#game { 
  text-align: center;
  border: 2px solid #e8ff47;
  padding: 3rem;
  border-radius: 2rem;
  background: rgba(232, 255, 71, 0.05);
}
button {
  background: #e8ff47;
  color: black;
  border: none;
  padding: 1rem 2rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  border-radius: 0.5rem;
  margin: 0.5rem;
  transition: transform 0.1s;
}
button:active { transform: scale(0.95); }
#done { background: #f0efe8; }
`,
    javascript: `// Game Logic
let score = 0;
const val = document.getElementById('val');
const tap = document.getElementById('tap');
const done = document.getElementById('done');

tap.onclick = () => {
  score += 10;
  val.innerText = score;
};

done.onclick = () => {
  // Communication with CaSkill platform
  window.parent.postMessage({
    type: "caskill:finish",
    score: score,
    durationSeconds: 15, // mock duration
    clientMeta: { via: "CaSkill-IDE" }
  }, "*");
};`
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
