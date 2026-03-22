import { useState } from "react";
import { PageHero } from "../../components/ui/PageHero";
import { SectionCard } from "../../components/ui/SectionCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Button } from "../../components/ui/Button";

const TEMPLATE_FILES = {
  "manifest.json": `{
  "title": "My Skill Game",
  "version": "1.0.0",
  "entryFile": "dist/index.html",
  "description": "A simple skill-based game for CaSkill.",
  "category": "Arcade",
  "controls": "Use arrows to move, SPACE to jump.",
  "scoringRules": "10 points per collectible, -5 per hit."
}`,
  "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CaSkill Game Template</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="game-container">
    <h1>Score: <span id="score">0</span></h1>
    <button id="finish-btn">Finish Match</button>
  </div>
  <script src="game.js"></script>
</body>
</html>`,
  "style.css": `body {
  margin: 0;
  background: #0a0a08;
  color: #f0efe8;
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

#game-container {
  text-align: center;
  border: 2px solid #e8ff47;
  padding: 40px;
  border-radius: 24px;
}

button {
  background: #e8ff47;
  color: black;
  border: none;
  padding: 12px 24px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 8px;
}`,
  "game.js": `let score = 0;
const scoreEl = document.getElementById('score');
const finishBtn = document.getElementById('finish-btn');

// Game logic simulation
setInterval(() => {
  score += 10;
  scoreEl.textContent = score;
}, 1000);

finishBtn.addEventListener('click', () => {
  // IMPORTANT: Communicate results to CaSkill
  window.parent.postMessage({
    type: "caskill:finish",
    score: score,
    durationSeconds: Math.floor(performance.now() / 1000),
    clientMeta: {
      completedLevels: 1
    }
  }, "*");
});`
};

export function CreatorGuidePage() {
  const [activeFile, setActiveFile] = useState<keyof typeof TEMPLATE_FILES>("manifest.json");

  return (
    <div className="space-y-12">
      <PageHero
        eyebrow="Documentation"
        title="Creator Integration Guide"
        description="Learn how to build, package, and integrate your skill-based games with the CaSkill platform."
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_0.4fr]">
        <div className="space-y-8">
          <SectionCard title="1. Build Requirements" description="The core languages and structure.">
            <div className="space-y-6">
              <p className="text-sm leading-8 text-[var(--color-muted)]">
                CaSkill is a browser-first platform. Your games should be built using standard web technologies.
                You can use any framework (React, Unity WebGL, Godot) as long as it generates a standalone static build.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">Core Languages</p>
                  <ul className="mt-4 space-y-2 text-sm text-[var(--color-text)]">
                    <li className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-[var(--color-success)]" />
                      HTML5 & CSS3
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-[var(--color-success)]" />
                      Modern JavaScript / ESNext
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-[var(--color-success)]" />
                      WASM (compiled from Rust/C++)
                    </li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">Anti-Cheat Compliance</p>
                  <p className="mt-4 text-xs leading-6 text-[var(--color-muted)]">
                    All games run in a sandboxed iframe. The platform monitors user attention via camera.
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="2. The 'CaSkill IDE' Template" description="Use this boilerplate to get started quickly.">
            <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[#1e1e1e] shadow-2xl">
              {/* Tab Bar */}
              <div className="flex items-center border-b border-[#333] bg-[#1a1a1a] px-2 py-1">
                {(Object.keys(TEMPLATE_FILES) as Array<keyof typeof TEMPLATE_FILES>).map((file) => (
                  <button
                    key={file}
                    onClick={() => setActiveFile(file)}
                    className={`px-4 py-2 text-xs font-medium transition \${
                      activeFile === file 
                      ? "bg-[#1e1e1e] text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]" 
                      : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {file}
                  </button>
                ))}
              </div>
              
              {/* Code Area */}
              <div className="relative p-6 font-mono text-sm leading-6">
                <div className="absolute right-4 top-4">
                  <Button size="sm" tone="ghost" onClick={() => navigator.clipboard.writeText(TEMPLATE_FILES[activeFile])}>
                    Copy Code
                  </Button>
                </div>
                <pre className="no-scrollbar overflow-x-auto text-gray-300">
                  {TEMPLATE_FILES[activeFile]}
                </pre>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-8">
          <SectionCard title="Workflow" description="From setup to live.">
            <div className="space-y-6">
              {[
                { step: "01", label: "Develop locally", sub: "Build in your favorite IDE." },
                { step: "02", label: "Bundle ZIP", sub: "Include manifest.json and dist/." },
                { step: "03", label: "Upload", sub: "Submit via Creator Dashboard." },
                { step: "04", label: "Admin Review", sub: "Verification takes 24-48h." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <span className="text-lg font-black text-[var(--color-primary)]/40 font-mono">{item.step}</span>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--color-text)]">{item.label}</h4>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Scoring Integration" description="How to report scores.">
            <p className="text-sm leading-7 text-[var(--color-muted)]">
              Your game must call <code className="text-[var(--color-primary)]">window.parent.postMessage</code> with a <code className="text-[var(--color-primary)]">caskill:finish</code> payload. 
              The server will only accept sessions that report scores via this secure channel.
            </p>
            <div className="mt-4">
              <StatusBadge label="Required for approval" tone="warning" />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
