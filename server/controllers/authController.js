// controllers/authController.js
import crypto from "crypto";
import User from "../models/User.js";

/* ─────────────────────────────────────────────────────────────────
   IN-MEMORY SESSION STORE
   Shape per session:
   {
     userId,
     secretNouns,       // string[]
     secretPositions,   // [posA, posB]  e.g. ["A","D"]
     offset,            // number        e.g. 5
     verifyPayload: {
       secretImageValue,   // number  e.g. 20
       expectedSum,        // number  e.g. 25
       register,           // number[15]
     } | null,
     expiresAt,
   }
───────────────────────────────────────────────────────────────── */
const sessions   = new Map();
const SESSION_TTL = 10 * 60 * 1000; // 10 min

function newSession(userId, secretNouns, secretPositions, offset) {
  const id = crypto.randomBytes(32).toString("hex");
  sessions.set(id, {
    userId,
    secretNouns,
    secretPositions,
    offset,
    verifyPayload: null,
    expiresAt: Date.now() + SESSION_TTL,
  });
  return id;
}

function getSession(id) {
  const s = sessions.get(id);
  if (!s) return null;
  if (Date.now() > s.expiresAt) { sessions.delete(id); return null; }
  return s;
}

/* ─────────────────────────────────────────────────────────────────
   NOUN EXTRACTOR
───────────────────────────────────────────────────────────────── */
const NOUNS = new Set([
  "teacher","doctor","farmer","student","child","engineer","driver","boy","girl",
  "school","hospital","house","university","park","field","road","ocean","mountain",
  "river","bus","train","car","laptop","mobile","tv","table","chair","bed","guitar",
  "drum","drums","piano","cricket","football","tennis","apple","banana","mango","carrot",
  "rice","milk","bread","dog","cat","parrot","pigeon","sparrow","elephant",
  "sunflower","rose","spinach","eye","ear","hand","book","beach","lotus",
]);

function extractNouns(sentence) {
  if (!sentence || typeof sentence !== "string") return [];
  const seen = new Set(), out = [];
  for (const w of sentence.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/)) {
    if (NOUNS.has(w) && !seen.has(w)) { seen.add(w); out.push(w); }
  }
  return out;
}

/* ─────────────────────────────────────────────────────────────────
   POSITIONS
───────────────────────────────────────────────────────────────── */
const POSITIONS = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O"];

/* ─────────────────────────────────────────────────────────────────
   ALL NOUNS POOL — used to fill the challenge grid with distractors
───────────────────────────────────────────────────────────────── */
const ALL_NOUNS = [
  "teacher","doctor","farmer","student","child","engineer","driver","boy","girl",
  "school","hospital","house","university","park","field","road","ocean","mountain",
  "river","bus","train","car","laptop","mobile","tv","table","chair","bed","guitar",
  "drums","piano","cricket","football","tennis","apple","banana","mango","carrot",
  "rice","milk","bread","dog","cat","parrot","pigeon","sparrow","elephant",
  "sunflower","rose","spinach","eye","ear","hand","book","beach","lotus",
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ─────────────────────────────────────────────────────────────────
   BUILD CHALLENGE GRID
   Returns 12 items: { noun, value }
   Always includes at least one noun from the user's secretNouns.
   All values are random 10–99.
───────────────────────────────────────────────────────────────── */
function buildChallengeGrid(secretNouns) {
  // Pick one secret noun to include
  const secretNoun = secretNouns[Math.floor(Math.random() * secretNouns.length)];

  // Fill remaining 11 slots with distractors (nouns NOT in secretNouns)
  const distractors = shuffle(ALL_NOUNS.filter(n => !secretNouns.includes(n))).slice(0, 11);

  // Combine and shuffle positions
  const allNouns = shuffle([secretNoun, ...distractors]);

  return allNouns.map(noun => ({
    noun,
    value: Math.floor(Math.random() * 90) + 10, // 10–99
  }));
}

function buildRegister(secretImageValue, offset, secretPositions) {
  const result = secretImageValue + offset;
  const d1     = Math.floor(result / 10) % 10;
  const d2     = result % 10;

  const reg = Array.from({ length: 15 }, () => Math.floor(Math.random() * 10));
  reg[POSITIONS.indexOf(secretPositions[0])] = d1;
  reg[POSITIONS.indexOf(secretPositions[1])] = d2;

  return reg;
}

const signup = async (req, res) => {
  try {
    const { email, password, selectedSentence, secretPositions, offset } = req.body;

    // ── validation ──────────────────────────────────────────────
    if (!email || !password || !selectedSentence) {
      return res.json({ success: false, error: "Email, password, and sentence are required." });
    }
    if (!secretPositions || !Array.isArray(secretPositions) || secretPositions.length !== 2) {
      return res.json({ success: false, error: "Exactly 2 secret positions are required." });
    }
    for (const p of secretPositions) {
      if (!POSITIONS.includes(p)) {
        return res.json({ success: false, error: `Invalid position: ${p}` });
      }
    }
    if (secretPositions[0] === secretPositions[1]) {
      return res.json({ success: false, error: "The two positions must be different." });
    }

    const off = Number(offset);
    if (isNaN(off) || off < 1 || off > 99) {
      return res.json({ success: false, error: "Offset must be a number between 1 and 99." });
    }

    // ── extract nouns ────────────────────────────────────────────
    const secretNouns = extractNouns(selectedSentence);
    if (!secretNouns.length) {
      return res.json({ success: false, error: "No valid nouns found in that sentence." });
    }

    // ── check duplicate ──────────────────────────────────────────
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.json({ success: false, error: "That email is already registered." });
    }

    // ── save ─────────────────────────────────────────────────────
    await new User({
      email:              email.toLowerCase().trim(),
      password,           // User model should hash this in pre-save hook
      selectedSentence,
      secretNouns,
      secretPositions,
      offset: off,
    }).save();

    return res.json({ success: true, message: "Account created successfully." });

  } catch (err) {
    console.error("signup error:", err);
    return res.json({ success: false, error: "Server error during signup." });
  }
};

/* ═════════════════════════════════════════════════════════════════
   POST  /auth/login
   Body: { email, password }
   Returns: { success, sessionId, challengeGrid: [{noun, value}] }
   NOTE: secretPositions and offset NEVER leave the server.
═════════════════════════════════════════════════════════════════ */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ success: false, error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.json({ success: false, error: "Invalid credentials." });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.json({ success: false, error: "Invalid credentials." });
    }

    // Build the 12-card challenge grid (includes one of the user's secret nouns)
    const challengeGrid = buildChallengeGrid(user.secretNouns);

    // Store session — positions + offset stay server-side
    const sessionId = newSession(
      user._id.toString(),
      user.secretNouns,
      user.secretPositions,
      user.offset
    );

    return res.json({
      success: true,
      sessionId,
      challengeGrid,   // [{noun, value}, …] — 12 cards
    });

  } catch (err) {
    console.error("login error:", err);
    return res.json({ success: false, error: "Server error during login." });
  }
};

/* ═════════════════════════════════════════════════════════════════
   POST  /auth/register  (build-register step)
   Body: { sessionId, challengeGrid: [{noun, value}] }
   
   The client sends back the grid it was shown. Server:
     1. Finds the secret noun in that grid
     2. Reads its value
     3. Builds the 15-position register with correct digits at secret positions
     4. Returns the register (positions NOT revealed)
   
   Client shows all 15 boxes (A–O) and user fills them in,
   placing the correct two digits at their memorised positions.
═════════════════════════════════════════════════════════════════ */
const buildRegisterRoute = async (req, res) => {
  try {
    const { sessionId, challengeGrid } = req.body;

    if (!sessionId) {
      return res.json({ success: false, error: "Session ID is required." });
    }
    const session = getSession(sessionId);
    if (!session) {
      return res.json({ success: false, error: "Session expired. Please sign in again." });
    }
    if (!Array.isArray(challengeGrid) || !challengeGrid.length) {
      return res.json({ success: false, error: "Invalid challenge grid." });
    }

    const { secretNouns, secretPositions, offset } = session;

    // Find the secret noun that appeared in the grid
    const secretItem = challengeGrid.find(item => secretNouns.includes(item.noun));
    if (!secretItem) {
      return res.json({ success: false, error: "Your secret image was not in the challenge grid." });
    }

    const secretImageValue = Number(secretItem.value);
    const expectedSum      = secretImageValue + offset;
    const register         = buildRegister(secretImageValue, offset, secretPositions);

    // Store for /verify step
    session.verifyPayload = { secretImageValue, expectedSum, register };

    return res.json({
      success:      true,
      register,                                        // 15-digit array
      revealedItem: { noun: secretItem.noun, value: secretImageValue },
      // secretPositions intentionally NOT included
    });

  } catch (err) {
    console.error("buildRegister error:", err);
    return res.json({ success: false, error: "Server error building register." });
  }
};

/* ═════════════════════════════════════════════════════════════════
   POST  /auth/verify
   Body: { sessionId, registerInputs: number[15] }
   
   Client sends ALL 15 digits the user typed.
   Server checks only the two secret positions match the expected digits.
   Everything else is ignored — the user can type anything elsewhere.
═════════════════════════════════════════════════════════════════ */
const verify = async (req, res) => {
  try {
    const { sessionId, registerInputs } = req.body;

    if (!sessionId) {
      return res.json({ success: false, error: "Session expired." });
    }
    const session = getSession(sessionId);
    if (!session) {
      return res.json({ success: false, error: "Session expired. Please sign in again." });
    }
    if (!session.verifyPayload) {
      return res.json({ success: false, error: "Register not yet built. Complete the challenge step first." });
    }
    if (!Array.isArray(registerInputs) || registerInputs.length !== 15) {
      return res.json({ success: false, error: "All 15 register positions are required." });
    }

    const { secretPositions } = session;
    const { register }        = session.verifyPayload;

    // Check only the two secret positions
    const pos0 = POSITIONS.indexOf(secretPositions[0]);
    const pos1 = POSITIONS.indexOf(secretPositions[1]);

    const d0Correct = Number(registerInputs[pos0]) === register[pos0];
    const d1Correct = Number(registerInputs[pos1]) === register[pos1];

    if (!d0Correct || !d1Correct) {
      // Invalidate session on failure — must start over
      sessions.delete(sessionId);
      return res.json({ success: false, error: "Register digits do not match. Please sign in again." });
    }

    // Success — invalidate session (one-time use)
    sessions.delete(sessionId);

    return res.json({
      success: true,
      message: "Identity verified. Welcome back!",
      userId:  session.userId,
    });

  } catch (err) {
    console.error("verify error:", err);
    return res.json({ success: false, error: "Server error during verification." });
  }
};

export { signup, login, verify, buildRegisterRoute };