import crypto from "crypto";
import { WORDS, WORDS_BY_LANG } from "../data/words.js";

const GRID_SIZE = 9;
const REGISTER_SIZE = 5;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function shuffle(values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = crypto.randomInt(index + 1);
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

const mask = (parts, revealIndex) => parts.map((part, index) => index === revealIndex ? part : "_").join(" ");

export function buildWordGrid(user) {
  const secretParts = (user.secretParts || []).filter(Boolean);
  if (!user.selectedWord || secretParts.length < 2) throw new Error("User has no configured visual password.");

  const revealIndex = crypto.randomInt(secretParts.length);
  const secretMask = mask(secretParts, revealIndex);
  const sameLanguage = WORDS_BY_LANG[user.selectedWordLang] || WORDS;
  let candidates = sameLanguage.filter(word => {
    const parts = (word.parts || []).filter(Boolean);
    return word.word !== user.selectedWord && parts.length === secretParts.length && parts[revealIndex];
  });
  if (candidates.length < GRID_SIZE - 1) candidates = WORDS.filter(word => {
    const parts = (word.parts || []).filter(Boolean);
    return word.word !== user.selectedWord && parts.length === secretParts.length && parts[revealIndex];
  });

  const distractors = [];
  const seen = new Set([secretMask]);
  for (const word of shuffle(candidates)) {
    const candidateMask = mask(word.parts.filter(Boolean), revealIndex);
    if (seen.has(candidateMask)) continue;
    seen.add(candidateMask);
    distractors.push({ mask: candidateMask, value: crypto.randomInt(1, 10) });
    if (distractors.length === GRID_SIZE - 1) break;
  }
  if (!distractors.length) throw new Error("Unable to generate a visual challenge for this user.");
  while (distractors.length < GRID_SIZE - 1) distractors.push({ ...distractors[distractors.length % distractors.length] });

  const secretValue = crypto.randomInt(1, 10);
  const grid = shuffle([{ mask: secretMask, value: secretValue, isSecret: true }, ...distractors])
    .map(({ isSecret, ...card }) => card);
  return { grid, secretValue };
}

export function recipientMarkers(recipientName) {
  const name = String(recipientName || "").toUpperCase();
  const initials = name.match(/[A-Z0-9]+/g)?.map(part => part[0]) || [];
  const distinct = [];
  for (const character of initials) if (!distinct.includes(character)) distinct.push(character);
  if (distinct.length < 2) {
    for (const character of name.match(/[A-Z0-9]/g) || []) {
      if (!distinct.includes(character)) distinct.push(character);
    }
  }
  return distinct.slice(0, 2).length === 2 ? distinct.slice(0, 2) : null;
}

export function buildRecipientRegister(markers) {
  const filler = shuffle(ALPHABET.filter(letter => !markers.includes(letter))).slice(0, REGISTER_SIZE - markers.length);
  const registerLetters = shuffle([...markers, ...filler]);
  return { registerLetters, markerPositions: markers.map(marker => registerLetters.indexOf(marker)) };
}

export function amountToMinor(amount, currency = "INR") {
  if (typeof amount !== "number" && typeof amount !== "string") return null;
  const text = String(amount).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ""] = text.split(".");
  const minor = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(minor) && minor > 0 ? { amountMinor: minor, currency: String(currency).toUpperCase() } : null;
}

export function amountCode(amount, secretValue) {
  const amountString = String(Math.floor(amount));

  const firstDigit = amountString[0];
  const digitCount = amountString.length;

  const mentalMargin = Number(`${firstDigit}${digitCount}`);

  const finalCode = mentalMargin + secretValue;

  return String(finalCode)
    .padStart(2, "0")
    .slice(-2)
    .split("")
    .map(Number);
}

export function transactionFingerprint({ transactionId, amountMinor, currency, recipientName }) {
  return crypto.createHash("sha256").update(JSON.stringify({ transactionId, amountMinor, currency, recipientName: String(recipientName).trim() })).digest("hex");
}
