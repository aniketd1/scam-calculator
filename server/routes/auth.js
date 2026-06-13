// routes/auth.js  — ESM (type:"module")
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import LoginSession from "../models/LoginSession.js";


const router = express.Router();
/*import {
  signup,
  login,
  verify
} from "../controllers/authController.js";*/
/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const POSITIONS = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O"];

// Grid is 4 cols × 3 rows = 12 cards (matches screenshots)
const GRID_SIZE = 12;

// All nouns that have images in client/src/assets/nouns/
// Matches every PNG listed in the screenshots
const ALL_NOUNS = [
  "apple",
  "banana",
  "beach",
  "bed",
  "black",
  "blue",
  "bread",
  "bus",
  "car",
  "carrot",
  "cat",
  "chair",
  "cricket",
  "doctor",
  "dog",
  "dress",
  "drums",
  "ear",
  "elephant",
  "eye",
  "farmer",
  "football",
  "green",
  "guitar",
  "hand",
  "hospital",
  "house",
  "laptop",
  "lotus",
  "mango",
  "milk",
  "mobile",
  "mountain",
  "ocean",
  "park",
  "parrot",
  "piano",
  "pigeon",
  "potato",
  "purple",
  "red",
  "rice",
  "river",
  "rose",
  "school",
  "shirt",
  "sparrow",
  "spinach",
  "sunflower",
  "table",
  "teacher",
  "tennis",
  "train",
  "tshirt",
  "tv",
  "yellow"
];

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function extractNouns(sentence) {
  const normalized = sentence
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return [...new Set(
    ALL_NOUNS.filter(noun =>
      normalized.includes(noun.toLowerCase())
    )
  )];
}

/**
 * Build a 12-card challenge grid.
 * Guarantees every secretNoun appears. Rest are random distractors.
 * Each card gets a fresh random value 10–99.
 */
function generateChallengeGrid(secretNouns) {
  const chosenSecret =
    secretNouns[
      Math.floor(Math.random() * secretNouns.length)
    ];

  const distractors = ALL_NOUNS
    .filter(
      (n) =>
        n !== chosenSecret &&
        !secretNouns.includes(n)
    )
    .sort(() => Math.random() - 0.5)
    .slice(0, GRID_SIZE - 1);

  const challengeGrid = [
    chosenSecret,
    ...distractors,
  ]
    .sort(() => Math.random() - 0.5)
    .map((noun) => ({
      noun,
      value: Math.floor(Math.random() * 90) + 10,
    }));

  return {
    challengeGrid,
    chosenSecret,
  };
}

/* ─────────────────────────────────────────────────────────────
   POST /api/auth/signup
   Body: { email, password, selectedSentence, secretPositions, offset }
───────────────────────────────────────────────────────────── */
router.post("/signup", async (req, res) => {
  try {
    const { email, password, selectedSentence, secretPositions, offset } = req.body;

    // Validate
    if (!email || !password || !selectedSentence || !secretPositions || offset == null) {
      return res.status(400).json({ success: false, error: "All fields are required." });
    }
    if (!Array.isArray(secretPositions) || secretPositions.length !== 2) {
      return res.status(400).json({ success: false, error: "Exactly 2 positions required." });
    }
    const off = parseInt(offset, 10);
    if (isNaN(off) || off < 1 || off > 99) {
      return res.status(400).json({ success: false, error: "Offset must be 1–99." });
    }
    for (const p of secretPositions) {
      if (!POSITIONS.includes(p)) {
        return res.status(400).json({ success: false, error: `Invalid position: ${p}` });
      }
    }

    // Duplicate check
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, error: "An account with that email already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Extract nouns
    const secretNouns = extractNouns(selectedSentence);
    if (secretNouns.length === 0) {
      return res.status(400).json({ success: false, error: "No recognisable nouns found in that sentence." });
    }

    // Save user
    const user = await User.create({
      email: email.toLowerCase().trim(),
      password,
      selectedSentence,
      secretNouns,
      secretPositions,
      offset: off,
    });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: { id: user._id, email: user.email },
    });

  } catch (err) {
    console.error("[signup]", err);
    return res.status(500).json({ success: false, error: "Server error during signup." });
  }
});

/* ─────────────────────────────────────────────────────────────
   POST /api/auth/login   — Step 1: verify credentials
   Body: { email, password }
   Returns: { success, sessionId, challengeGrid }
   NOTE: secretPositions and offset are NEVER sent to the client.
───────────────────────────────────────────────────────────── */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, error: "Invalid email or password." });
    }

    // Generate 12-card challenge grid
const {
  challengeGrid,
  chosenSecret,
} = generateChallengeGrid(
  user.secretNouns
);

const revealedItem =
  challengeGrid.find(
    (item) => item.noun === chosenSecret
  );

    // Create session — stores grid + revealedItem server-side
    const sessionId = uuidv4();
    await LoginSession.create({
      sessionId,
      userId: user._id,
      challengeGrid,
      revealedItem: { noun: revealedItem.noun, value: revealedItem.value },
    });

    // Return sessionId + grid to client.
    // Never return secretPositions or offset.
    return res.json({
      success: true,
      sessionId,
      challengeGrid,
    });

  } catch (err) {
    console.error("[login]", err);
    return res.status(500).json({ success: false, error: "Server error during login." });
  }
});

/* ─────────────────────────────────────────────────────────────
   POST /api/auth/verify   — Step 2: user submits filled register
   Body: { sessionId, registerInputs }
   registerInputs: array of 15 digits the user typed (index 0=A, 1=B, …)

   Server logic:
     1. Load session → get revealedItem.value
     2. Load user    → get offset, secretPositions
     3. Compute expected = revealedItem.value + offset
     4. Split into d1 (tens) and d2 (units)
     5. Check registerInputs[posIdx1] === d1  AND  registerInputs[posIdx2] === d2
     6. If match → issue JWT and delete session
───────────────────────────────────────────────────────────── */
router.post("/verify", async (req, res) => {
  try {
    const { sessionId, registerInputs } = req.body;

    if (!sessionId || !Array.isArray(registerInputs)) {
      return res.status(400).json({ success: false, error: "sessionId and registerInputs are required." });
    }
    if (registerInputs.length !== 15) {
      return res.status(400).json({ success: false, error: "registerInputs must have exactly 15 values." });
    }

    const session = await LoginSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ success: false, error: "Session not found or expired. Please start over." });
    }

    const user = await User.findById(session.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    // Derive expected digits
    const { value: secretValue } = session.revealedItem;
    const expected  = secretValue + user.offset;      // e.g. 62 + 5 = 67
    const expD1     = Math.floor(expected / 10) % 10; // tens  digit → 6
    const expD2     = expected % 10;                   // units digit → 7

    const posIdx1   = POSITIONS.indexOf(user.secretPositions[0]);
    const posIdx2   = POSITIONS.indexOf(user.secretPositions[1]);

    const actualD1  = parseInt(registerInputs[posIdx1], 10);
    const actualD2  = parseInt(registerInputs[posIdx2], 10);
console.log("secretValue:", secretValue);
console.log("offset:", user.offset);

console.log("expected:", expected);

console.log("positions:", user.secretPositions);

console.log("expected digits:", expD1, expD2);

console.log("received:", registerInputs);
    if (isNaN(actualD1) || isNaN(actualD2) || actualD1 !== expD1 || actualD2 !== expD2) {
      // Delete session on failure — force full restart
      await LoginSession.deleteOne({ sessionId });
      return res.status(401).json({
        success: false,
        error: "Register verification failed. Check your positions and offset, then try again.",
      });
    }

    // Verified — clean up session and issue JWT
    await LoginSession.deleteOne({ sessionId });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Identity verified. Welcome back!",
      token,
      user: { id: user._id, email: user.email },
    });

  } catch (err) {
    console.error("[verify]", err);
    return res.status(500).json({ success: false, error: "Server error during verification." });
  }
});

export default router;
