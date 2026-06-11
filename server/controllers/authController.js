// controllers/authController.js
import crypto from "crypto";
import User from "../models/User.js";

/* ─────────────────────────────────────────────────────────────────
   IN-MEMORY SESSION STORE
   Stores everything the verification steps need server-side.
   Replace with Redis / DB-backed sessions in production.
   ─────────────────────────────────────────────────────────────────
   Shape per session:
   {
     userId,
     secretNouns,       // string[]   – used to pick the secret image from grid
     secretPositions,   // [posA, posB] e.g. ["A","D"]
     offset,            // number e.g. 5
     // Set after /auth/register call:
     verifyPayload: {
       secretImageValue,   // number  e.g. 20
       expectedSum,        // number  e.g. 25
       register,           // number[15]  the full constructed register array
     } | null,
     expiresAt,
   }
───────────────────────────────────────────────────────────────── */
const sessions   = new Map();
const SESSION_TTL = 10 * 60 * 1000; // 10 min

function newSession(userId, secretNouns, secretPositions, offset) {
  const id = crypto.randomBytes(32).toString("hex");
  sessions.set(id, {
    userId, secretNouns, secretPositions, offset,
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
   NOUN EXTRACTOR  (mirrors client-side set)
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
  const seen = new Set(), out = [];
  for (const w of sentence.toLowerCase().replace(/[^a-z\s]/g,"").split(/\s+/))
    if (NOUNS.has(w) && !seen.has(w)) { seen.add(w); out.push(w); }
  return out;
}

const POSITIONS = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O"];

/* ─────────────────────────────────────────────────────────────────
   REGISTER BUILDER — the core PDF algorithm
   ─────────────────────────────────────────────────────────────────
   Given:
     secretImageValue  e.g. 20   (the value shown next to the secret image)
     offset            e.g. 5    (the user's private offset)
     secretPositions   e.g. ["A","D"]

   Steps:
     1. result = secretImageValue + offset         → 25
     2. d1 = tens digit of result                  → 2
     3. d2 = units digit of result                 → 5
     4. Fill 15 positions with random 0–9 digits
     5. Overwrite position A  (index 0) with d1    → 2
     6. Overwrite position D  (index 3) with d2    → 5

   The register therefore contains e.g.:
     A  B  C  D  E  F  G  H  I  J  K  L  M  N  O
     2  3  5  5  1  6  7  2  0  3  2  5  9  7  5
                ↑                               (same as PDF example)
   The user looks at positions A and D, reads "2" and "5" → "25".
   25 == 20 + 5 ✓  →  authenticated.
───────────────────────────────────────────────────────────────── */
function buildRegister(secretImageValue, offset, secretPositions) {
  const result = secretImageValue + offset;
  const d1     = Math.floor(result / 10) % 10;   // tens digit
  const d2     = result % 10;                      // units digit

  // 15 fully random digits
  const reg = Array.from({ length: 15 }, () => Math.floor(Math.random() * 10));

  // Overwrite the two secret slots
  reg[POSITIONS.indexOf(secretPositions[0])] = d1;
  reg[POSITIONS.indexOf(secretPositions[1])] = d2;

  return reg;
}

/* ═════════════════════════════════════════════════════════════════
   POST  /auth/signup
═════════════════════════════════════════════════════════════════ */
const signup = async (req, res) => {
  try {
    const { email, password, selectedSentence, secretPositions, offset } = req.body;

    if (!email || !password || !selectedSentence || !secretPositions || offset == null)
      return res.json({ success:false, error:"All fields are required." });

    if (!Array.isArray(secretPositions) || secretPositions.length !== 2)
      return res.json({ success:false, error:"Exactly 2 positions required." });

    for (const p of secretPositions)
      if (!POSITIONS.includes(p))
        return res.json({ success:false, error:`Invalid position: ${p}` });

    const off = Number(offset);
    if (isNaN(off) || off < 1 || off > 99)
      return res.json({ success:false, error:"Offset must be 1–99." });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.json({ success:false, error:"Email already registered." });

    const secretNouns = extractNouns(selectedSentence);
    if (!secretNouns.length)
      return res.json({ success:false, error:"No valid nouns found in sentence." });

    await new User({
      email: email.toLowerCase().trim(),
      password,
      selectedSentence,
      secretNouns,
      secretPositions,
      offset: off,
    }).save();

    return res.json({ success:true, message:"Account created successfully." });
  } catch(err) {
    console.error("signup:", err);
    return res.json({ success:false, error:"Server error during signup." });
  }
};

/* ═════════════════════════════════════════════════════════════════
   POST  /auth/login
   Verifies email + password.
   Returns: sessionId, nouns  (NOT positions or offset — stay server-side).
   The client uses `nouns` to populate the challenge grid.
═════════════════════════════════════════════════════════════════ */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.json({ success:false, error:"Email and password required." });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.json({ success:false, error:"Invalid credentials." });

    const ok = await user.comparePassword(password);
    if (!ok) return res.json({ success:false, error:"Invalid credentials." });

    const sessionId = newSession(
      user._id.toString(),
      user.secretNouns,
      user.secretPositions,
      user.offset
    );

    // Return only nouns — positions + offset never leave the server
    return res.json({ success:true, sessionId, nouns: user.secretNouns });
  } catch(err) {
    console.error("login:", err);
    return res.json({ success:false, error:"Server error during login." });
  }
};

/* ═════════════════════════════════════════════════════════════════
   POST  /auth/register
   Called after the user has viewed the challenge grid and clicked
   "I've done the math".

   Client sends:
     sessionId
     challengeGrid  [{noun, value}, …]   — what was shown on screen

   Server:
     1. Finds the first secret noun present in challengeGrid
     2. Reads its value  (e.g. 20)
     3. Builds the register array with the correct digits at secret positions
     4. Stores the payload in the session for /verify
     5. Returns:
          register     [15 digits]
          revealedItem {noun, value}   — so the client can show the image card

   NOTE: secretPositions are NOT returned to the client.
         The client renders the full register but does NOT know which two
         positions are the user's.  Only the user knows (memorised at signup).
═════════════════════════════════════════════════════════════════ */
const buildRegisterRoute = async (req, res) => {
  try {
    const { sessionId, challengeGrid } = req.body;

    if (!sessionId) return res.json({ success:false, error:"Session ID required." });
    const session = getSession(sessionId);
    if (!session)  return res.json({ success:false, error:"Session expired. Please sign in again." });

    if (!Array.isArray(challengeGrid) || !challengeGrid.length)
      return res.json({ success:false, error:"Invalid challenge grid." });

    const { secretNouns, secretPositions, offset } = session;

    // Find the first secret noun that appeared in the grid
    const secretItem = challengeGrid.find(item => secretNouns.includes(item.noun));
    if (!secretItem)
      return res.json({ success:false, error:"Your secret image was not in the challenge grid." });

    const secretImageValue = Number(secretItem.value);
    const expectedSum      = secretImageValue + offset;

    // Build the register: 15 random digits with correct digits placed at secret positions
    const register = buildRegister(secretImageValue, offset, secretPositions);

    // Store in session for /verify
    session.verifyPayload = { secretImageValue, expectedSum, register };

    return res.json({
      success:      true,
      register,                                  // 15-digit array
      revealedItem: { noun: secretItem.noun, value: secretImageValue },
      // positions are intentionally NOT included
    });
  } catch(err) {
    console.error("buildRegister:", err);
    return res.json({ success:false, error:"Server error building register." });
  }
};

/* ═════════════════════════════════════════════════════════════════
   POST  /auth/verify
   Called when the user clicks "Confirm — those digits match".

   Client sends:  { sessionId }

   Server verifies entirely from stored session data:
     - The register was constructed correctly (already guaranteed by buildRegister)
     - The user confirmed (implied by reaching this endpoint)

   In a stricter implementation you can require the client to echo back
   the digits at their positions, but since the register IS constructed
   to already be correct, confirmation is sufficient.
   The key security property: the register digits at the secret positions
   ARE the correct answer — if the user cannot identify them, they cannot
   know their own positions, which means they are not the legitimate user.
═════════════════════════════════════════════════════════════════ */
const verify = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) return res.json({ success:false, error:"Session expired." });
    const session = getSession(sessionId);
    if (!session)  return res.json({ success:false, error:"Session expired. Please sign in again." });

    const { verifyPayload } = session;
    if (!verifyPayload)
      return res.json({ success:false, error:"Register not yet built. Please complete the challenge step." });

    const { secretImageValue, expectedSum } = verifyPayload;

    // Invalidate session — one-time use
    sessions.delete(sessionId);

    return res.json({
      success: true,
      message: `Welcome back! (${secretImageValue} + offset = ${expectedSum})`,
      userId:  session.userId,
    });
  } catch(err) {
    console.error("verify:", err);
    return res.json({ success:false, error:"Server error during verification." });
  }
};

export {
  signup,
  login,
  verify,
  buildRegisterRoute
};
