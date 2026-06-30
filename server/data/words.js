// data/words.js

const WORDS_EN = [
  { word: "Ramesh",   lang: "en", parts: ["Ra","me","sh"] },
  { word: "Rajesh",   lang: "en", parts: ["Ra","je","sh"] },
  { word: "Laxman",   lang: "en", parts: ["Lax","man"] },
  { word: "Mobile",   lang: "en", parts: ["Mo","bile"] },
  { word: "Patang",   lang: "en", parts: ["Pa","tang"] },
  { word: "Coconut",  lang: "en", parts: ["Co","co","nut"] },
  { word: "Compass",  lang: "en", parts: ["Com","pass"] },
  { word: "Peacock",  lang: "en", parts: ["Pea","cock"] },
  { word: "Trumpet",  lang: "en", parts: ["Trum","pet"] },
  { word: "Basket",   lang: "en", parts: ["Bas","ket"] },
  { word: "Rocket",   lang: "en", parts: ["Roc","ket"] },
  { word: "Cricket",  lang: "en", parts: ["Cric","ket"] },
  { word: "Blanket",  lang: "en", parts: ["Blan","ket"] },
  { word: "Jacket",   lang: "en", parts: ["Jac","ket"] },
  { word: "Mango",    lang: "en", parts: ["Man","go"] },
  { word: "Pencil",   lang: "en", parts: ["Pen","cil"] },
  { word: "Candle",   lang: "en", parts: ["Can","dle"] },
  { word: "Bottle",   lang: "en", parts: ["Bot","tle"] },
  { word: "Temple",   lang: "en", parts: ["Tem","ple"] },
  { word: "Jungle",   lang: "en", parts: ["Jun","gle"] },
  { word: "Telescope",lang: "en", parts: ["Te","le","scope"] },
  { word: "Butterfly",lang: "en", parts: ["But","ter","fly"] },
  { word: "Elephant", lang: "en", parts: ["Ele","phant"] },
  { word: "Umbrella", lang: "en", parts: ["Um","brel","la"] },
  { word: "Crocodile",lang: "en", parts: ["Cro","co","dile"] },
];

const WORDS_HI = [
  { word: "रमेश",    lang: "hi", parts: ["र","मे","श"] },
  { word: "राजेश",   lang: "hi", parts: ["रा","जे","श"] },
  { word: "रोशनी",   lang: "hi", parts: ["रो","श","नी"] },
  { word: "पतंग",    lang: "hi", parts: ["प","तं","ग"] },
  { word: "मोबाइल",  lang: "hi", parts: ["मो","बा","इल"] },
  { word: "दिल्ली",   lang: "hi", parts: ["दि","ल्","ली"] },
  { word: "लक्ष्मी",  lang: "hi", parts: ["लक्","ष्","मी"] },
  { word: "कमल",     lang: "hi", parts: ["क","म","ल"] },
  { word: "सूरज",     lang: "hi", parts: ["सू","र","ज"] },
  { word: "गणेश",     lang: "hi", parts: ["ग","णे","श"] },
  { word: "महेश",     lang: "hi", parts: ["म","हे","श"] },
  { word: "विजय",     lang: "hi", parts: ["वि","ज","य"] },
  { word: "आकाश",     lang: "hi", parts: ["आ","का","श"] },
  { word: "किताब",    lang: "hi", parts: ["कि","ता","ब"] },
  { word: "बादल",     lang: "hi", parts: ["बा","द","ल"] },
  { word: "सुनहरा",   lang: "hi", parts: ["सु","न","हरा"] },
  { word: "तितली",    lang: "hi", parts: ["ति","त","ली"] },
  { word: "खिलौना",   lang: "hi", parts: ["खि","लौ","ना"] },
  { word: "चमकीला",   lang: "hi", parts: ["चम","की","ला"] },
  { word: "परिवार",   lang: "hi", parts: ["प","रि","वार"] },
  { word: "समुद्र",    lang: "hi", parts: ["स","मु","द्र"] },
  { word: "पहाड़",     lang: "hi", parts: ["प","हा","ड़"] },
  { word: "जंगल",     lang: "hi", parts: ["जं","ग","ल"] },
  { word: "मंदिर",     lang: "hi", parts: ["मं","दि","र"] },
  { word: "तालाब",     lang: "hi", parts: ["ता","ला","ब"] },
];

const WORDS_MR = [
  { word: "रमेश",   lang: "mr", parts: ["र","मे","श"] },
  { word: "राजेश",  lang: "mr", parts: ["रा","जे","श"] },
  { word: "आंबा",   lang: "mr", parts: ["आं","बा"] },
  { word: "नदी",    lang: "mr", parts: ["न","दी"] },
  { word: "शाळा",   lang: "mr", parts: ["शा","ळा"] },
  { word: "घर",     lang: "mr", parts: ["घ","र"] },
  { word: "माती",   lang: "mr", parts: ["मा","ती"] },
  { word: "वारा",   lang: "mr", parts: ["वा","रा"] },
  { word: "झाड",    lang: "mr", parts: ["झा","ड"] },
  { word: "पाणी",   lang: "mr", parts: ["पा","णी"] },
  { word: "आग",     lang: "mr", parts: ["आ","ग"] },
  { word: "दगड",    lang: "mr", parts: ["द","गड"] },
  { word: "फुलपाखरू", lang: "mr", parts: ["फुल","पा","खरू"] },
  { word: "डोंगर",   lang: "mr", parts: ["डों","गर"] },
  { word: "समुद्र",   lang: "mr", parts: ["स","मु","द्र"] },
  { word: "आकाश",    lang: "mr", parts: ["आ","का","श"] },
  { word: "विजय",    lang: "mr", parts: ["वि","ज","य"] },
  { word: "गणेश",    lang: "mr", parts: ["ग","णे","श"] },
  { word: "महेश",    lang: "mr", parts: ["म","हे","श"] },
  { word: "मंदिर",    lang: "mr", parts: ["मं","दि","र"] },
  { word: "तळे",     lang: "mr", parts: ["त","ळे"] },
  { word: "खिडकी",   lang: "mr", parts: ["खि","ड","की"] },
  { word: "पुस्तक",   lang: "mr", parts: ["पु","स्","तक"] },
  { word: "मुंगी",    lang: "mr", parts: ["मुं","गी"] },
  { word: "सूर्य",    lang: "mr", parts: ["सू","र्य"] },
];

export const WORDS_BY_LANG = { en: WORDS_EN, hi: WORDS_HI, mr: WORDS_MR };

// Flat list (all languages combined) — kept for backward compatibility
export const WORDS = [...WORDS_EN, ...WORDS_HI, ...WORDS_MR];

// Word pairs are built per-language at runtime now (see auth.js helper),
// but keep a simple static fallback if something imports WORD_PAIRS directly.
export const WORD_PAIRS = [];