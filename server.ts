import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialization of Gemini API client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured or is placeholder. Please add it via the Settings Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. Health Endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", environment: process.env.NODE_ENV || "development" });
});

// 2. Simulated Router for Anti-Cheat & Game Actions (feels like the real core service API)
app.post("/api/auth/guest", (req, res) => {
  const { device_id } = req.body;
  res.json({
    success: true,
    user_id: `usr_guest_${Math.random().toString(36).substr(2, 9)}`,
    token: `jwt_session_${Math.random().toString(36).substr(2, 20)}`,
    profile: {
      username: `Guest_${Math.floor(1000 + Math.random() * 9000)}`,
      xp: 0,
      coins: 150,
      energy: 5,
      level: 1
    },
    latencyMs: Math.floor(10 + Math.random() * 40)
  });
});

app.get("/api/progress", (req, res) => {
  res.json({
    levelsCompleted: [1, 2, 3],
    currentLevelId: 4,
    stars: 8,
    completionTimes: { "1": 24, "2": 32, "3": 19 },
    backupSyncedAt: new Date().toISOString()
  });
});

app.post("/api/progress/update", (req, res) => {
  const { level_id, stars, score, moves, timeTaken, antiCheatHash } = req.body;
  
  // Anti-cheat mock validator
  const isValid = moves && moves >= 3; 
  if (!isValid) {
    return res.status(400).json({
      success: false,
      error: "ANTI_CHEAT_TRIGGERED",
      message: "Impossible level completion parameters. Score rejected."
    });
  }

  res.json({
    success: true,
    earnedStars: stars || 3,
    xpGranted: 100,
    coinsGranted: 15,
    newLevelUnlocked: (level_id || 1) + 1,
    checksumValidated: true,
    latencyMs: Math.floor(12 + Math.random() * 30)
  });
});

app.post("/api/reward/claim", (req, res) => {
  const { rewardType } = req.body;
  res.json({
    success: true,
    claimed: rewardType || "Daily Bonus",
    rewards: {
      coins: 50,
      energy: 1
    },
    updatedBalance: {
      coins: 200,
      energy: 5
    }
  });
});

app.get("/api/leaderboard/global", (req, res) => {
  res.json({
    leaderboard: [
      { rank: 1, username: "ArrowMaster", score: 45200, level: 98 },
      { rank: 2, username: "FuriousCursor", score: 42100, level: 85 },
      { rank: 3, username: "ZenGrid", score: 39950, level: 80 },
      { rank: 4, username: "PuzzleWizard", score: 38200, level: 75 },
      { rank: 5, username: "FastlaneBuilder", score: 34500, level: 69 },
    ],
    yourRank: 42,
    totalPlayers: 124502
  });
});

// 3. Gemini Advisory Consultation Endpoint
app.post("/api/gemini/consult", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt in request body" });
  }

  try {
    const ai = getGeminiClient();
    const systemPrompt = `You are a Principal Cloud Solution Architect specializing in modern high-performance architectures, game backends, and databases.
You are advisor of the 'Arrow Out' game project, supporting 1M+ active users. You have expertise in:
- React Native + Expo performance & anti-cheat
- NestJS scaling, container configuration, ECS Fargate, Kubernetes autoscale setup
- PostgreSQL connection pooling, Partitioning, and Multi-AZ replication
- Redis Leaderboards (Sorted Sets) optimization (ZADD, ZREVRANGE)
- Kafka real-time decoupling
- ClickHouse/BigQuery analytics ingestion pipelines

Respond concisely and professionally, with code blocks when requested. Deliver actual, reliable production designs.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({
      success: true,
      answer: response.text,
      model: "gemini-3.5-flash"
    });
  } catch (error: any) {
    console.error("Gemini Consult Error:", error);
    // Provide a helpful fallback guide if Gemini key is not set
    const hasNoKey = error.message && (error.message.includes("GEMINI_API_KEY") || error.message.includes("API key"));
    res.json({
      success: false,
      error: error.message,
      isKeyMissing: hasNoKey,
      fallbackMessage: `#### 💡 Architectural Advisory Offline Profile
Your prompt was received: "${prompt.slice(0, 50)}..."

**How to connect Gemini AI Consultation:**
1. Click the **Settings > Secrets** panel in the bottom-left corner of the AI Studio workspace.
2. Add a new secret named \`GEMINI_API_KEY\`, paste your Gemini API Key in, and click Save.
3. The server will hot-reload and connect securely.

---

**Offline Architecture Reference Quick Tip:**
- **Redis Sorted Sets (Leaderboards)**: Use \`ZADD game:leaderboard <score> <userId>\` to insert/update, and \`ZREVRANGE game:leaderboard 0 9 WITHSCORES\` to retrieve top-10 in O(log N).
- **Anti-Cheat Validation**: Match completed levels with server-side definitions. Each level solved must have elapsed time equal to or greater than the absolute minimum humanly required (e.g., minimum 50ms per move in sequence). Verify the HMAC checksum appended by the application bundle.`
    });
  }
});

// 4. Gemini Level Generator Endpoint (generates a valid structural puzzle level JSON)
app.post("/api/gemini/generate-level", async (req, res) => {
  const { difficulty } = req.body;
  const targetDiff = difficulty || "Medium";

  try {
    const ai = getGeminiClient();
    const prompt = `Generate a creative puzzle level for the 'Arrow Out' game on a 9x9 board.
The difficulty of the level should be: ${targetDiff}.
Each arrow is a 2-cell pill block.
- gridSize MUST be exactly 9. (9x9 grid)
- Number of arrows generated must be: Easy = 5 to 6 arrows, Medium = 7 to 8 arrows, Hard = 9 to 11 arrows.
- For UP and DOWN directions, the arrow is vertical and sits at (row, col) and (row+1, col). Thus, row MUST be less than gridSize - 1.
- For LEFT and RIGHT directions, the arrow is horizontal and sits at (row, col) and (row, col+1). Thus, col MUST be less than gridSize - 1.
- Make sure none of the generated arrows' occupied cells overlap or exceed constraints.
Output ONLY a JSON object that adheres exactly to this TypeScript schema:
{
  "name": string (e.g. "Dynamic Drift", "Crossed Paths"),
  "gridSize": 9, 
  "arrows": Array of {
    "id": string (unique, e.g. "a1", "a2"),
    "row": number (0 to 8),
    "col": number (0 to 8),
    "dir": "UP" | "DOWN" | "LEFT" | "RIGHT",
    "status": "active"
  }
}
Constraint:
1. Ensure the arrows placed are solvable (meaning at least one or more arrows can escape without colliding, allowing others to eventually gain clear paths!).
2. Ensure no overlapping starting cells (meaning if an arrow occupies (r,c) and its neighbor cell, no other arrow occupies them).
3. Do not include any markdowns or markdown blocks like \`\`\`json. Return plain raw JSON output only. Ensure exact, strict parsing.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.8,
        responseMimeType: "application/json"
      }
    });

    const bodyText = response.text || "";
    const parsedLevel = JSON.parse(bodyText.trim());

    res.json({
      success: true,
      level: parsedLevel,
      model: "gemini-3.5-flash"
    });
  } catch (error: any) {
    console.error("Gemini Level Generator Error:", error);
    
    // Fallback level generation offline using non-overlapping 2-cell capsule layout
    const nameGenerator = ["Laser Grid", "Escape Route", "Wiggle Room", "Squeeze Box", "Arrow Trap"];
    const levelName = nameGenerator[Math.floor(Math.random() * nameGenerator.length)] + " (Local Engine)";
    
    const size = 9; // enforce 9x9 board as requested
    const count = targetDiff === "Easy" ? 5 : targetDiff === "Medium" ? 7 : 9; // at least 5 arrows
    const arrows: any[] = [];
    const usedPositions = new Set<string>();

    const directions: Array<"UP" | "DOWN" | "LEFT" | "RIGHT"> = ["UP", "DOWN", "LEFT", "RIGHT"];

    for (let i = 0; i < count; i++) {
      let placed = false;
      let tries = 0;
      while (!placed && tries < 150) {
        const dir = directions[Math.floor(Math.random() * 4)];
        const isVertical = dir === "UP" || dir === "DOWN";
        const maxRow = isVertical ? size - 2 : size - 1;
        const maxCol = isVertical ? size - 1 : size - 2;
        
        const r = Math.floor(Math.random() * (maxRow + 1));
        const c = Math.floor(Math.random() * (maxCol + 1));
        
        const cell1 = `${r},${c}`;
        const cell2 = isVertical ? `${r+1},${c}` : `${r},${c+1}`;
        
        if (!usedPositions.has(cell1) && !usedPositions.has(cell2)) {
          usedPositions.add(cell1);
          usedPositions.add(cell2);
          arrows.push({
            id: `ea${i}-${Date.now()}`,
            row: r,
            col: c,
            dir,
            status: "active"
          });
          placed = true;
        }
        tries++;
      }
    }

    res.json({
      success: false,
      level: {
        name: levelName,
        gridSize: size,
        arrows: arrows
      },
      warning: "Offline dynamic generator activated. Connect GEMINI_API_KEY in Secrets for genuine neural-based level puzzles."
    });
  }
});

// Serving the React Applet (Vite setup)
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development configuration
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production configuration
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Arrow Out Backend] Server listening on http://localhost:${PORT} [ENV: ${process.env.NODE_ENV || "development"}]`);
  });
}

startServer();
