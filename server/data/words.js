// server/data/words.js
// ─────────────────────────────────────────────────────────────
// Each entry has:
//   word    — the display word (Hindi, English, or Marathi)
//   lang    — "hi" | "en" | "mr"
//   parts   — 3 or 4 syllable parts, EXACT strings used in grid cards
//             e.g. ["Ra","me","sh"] → cards show "Ra _ _", "_ me _", "_ _ sh"
// ─────────────────────────────────────────────────────────────

export const WORDS = [
    // ── English 3-part ──────────────────────────────────────────
    { word: "Ramesh",   lang: "en", parts: ["Ra",  "me",  "sh"]         },
    { word: "Laxman",   lang: "en", parts: ["Lax", "ma",  "n"]          },
    { word: "Mobile",   lang: "en", parts: ["Mo",  "bi",  "le"]         },
    { word: "Patang",   lang: "en", parts: ["Pa",  "ta",  "ng"]         },
    { word: "Rajesh",   lang: "en", parts: ["Ra",  "je",  "sh"]         },
    { word: "Coconut",  lang: "en", parts: ["Co",  "co",  "nut"]        },
    { word: "Compass",  lang: "en", parts: ["Com", "pa",  "ss"]         },
    { word: "Peacock",  lang: "en", parts: ["Pea", "co",  "ck"]         },
    { word: "Trumpet",  lang: "en", parts: ["Trum","pe",  "t"]          },
    { word: "Basket",   lang: "en", parts: ["Bas", "ke",  "t"]          },
    { word: "Rocket",   lang: "en", parts: ["Ro",  "ck",  "et"]         },
    { word: "Cricket",  lang: "en", parts: ["Cri", "ck",  "et"]         },
    { word: "Blanket",  lang: "en", parts: ["Blan","ke",  "t"]          },
    { word: "Jacket",   lang: "en", parts: ["Ja",  "ck",  "et"]         },
    { word: "Mango",    lang: "en", parts: ["Man", "g",   "o"]          },
    { word: "Pencil",   lang: "en", parts: ["Pen", "ci",  "l"]          },
    { word: "Candle",   lang: "en", parts: ["Can", "d",   "le"]         },
    { word: "Bottle",   lang: "en", parts: ["Bo",  "tt",  "le"]         },
    { word: "Temple",   lang: "en", parts: ["Tem", "p",   "le"]         },
    { word: "Jungle",   lang: "en", parts: ["Jun", "g",   "le"]         },

    // ── English 4-part ──────────────────────────────────────────
    { word: "Telescope",  lang: "en", parts: ["Te", "le", "sc", "ope"] },
    { word: "Butterfly",  lang: "en", parts: ["Bu", "tt", "er", "fly"] },
    { word: "Elephant",   lang: "en", parts: ["E",  "le", "ph", "ant"] },
    { word: "Umbrella",   lang: "en", parts: ["Um", "br", "el", "la"]  },
    { word: "Crocodile",  lang: "en", parts: ["Cr", "oc", "od", "ile"] },
    { word: "Pineapple",  lang: "en", parts: ["Pi", "ne", "ap", "ple"] },
    { word: "Adventure",  lang: "en", parts: ["Ad", "ve", "nt", "ure"] },
    { word: "Waterfall",  lang: "en", parts: ["Wa", "te", "rf", "all"] },
    { word: "Calculator", lang: "en", parts: ["Ca", "lc", "ul", "ator"]},
    { word: "Newspaper",  lang: "en", parts: ["Ne", "ws", "pa", "per"] },

    // ── Hindi 3-part ────────────────────────────────────────────
    { word: "रोशनी",  lang: "hi", parts: ["रो",  "श",   "नी"]         },
    { word: "पतंग",   lang: "hi", parts: ["प",   "तं",  "ग"]          },
    { word: "मोबाइल", lang: "hi", parts: ["मो",  "बा",  "इल"]         },
    { word: "दिल्ली", lang: "hi", parts: ["दि",  "ल्",  "ली"]         },
    { word: "लक्ष्मी",lang: "hi", parts: ["लक्", "ष्",  "मी"]         },
    { word: "कमल",    lang: "hi", parts: ["क",   "म",   "ल"]          },
    { word: "सूरज",   lang: "hi", parts: ["सू",  "र",   "ज"]          },
    { word: "गणेश",   lang: "hi", parts: ["ग",   "णे",  "श"]          },
    { word: "राजेश",  lang: "hi", parts: ["रा",  "जे",  "श"]          },
    { word: "महेश",   lang: "hi", parts: ["म",   "हे",  "श"]          },
    { word: "रमेश",   lang: "hi", parts: ["र",   "मे",  "श"]          },
    { word: "विजय",   lang: "hi", parts: ["वि",  "ज",   "य"]          },
    { word: "आकाश",   lang: "hi", parts: ["आ",   "का",  "श"]          },
    { word: "किताब",  lang: "hi", parts: ["कि",  "ता",  "ब"]          },
    { word: "बादल",   lang: "hi", parts: ["बा",  "द",   "ल"]          },

    // ── Hindi 4-part ────────────────────────────────────────────
    { word: "सुनहरा",  lang: "hi", parts: ["सु",  "न",  "ह",  "रा"]   },
    { word: "तितली",   lang: "hi", parts: ["ति",  "त",  "ल",  "ी"]    },
    { word: "खिलौना",  lang: "hi", parts: ["खि",  "लौ", "न",  "ा"]    },
    { word: "चमकीला",  lang: "hi", parts: ["चम",  "की", "ल",  "ा"]    },
    { word: "परिवार",  lang: "hi", parts: ["प",   "रि", "वा", "र"]    },

    // ── Marathi 3-part ──────────────────────────────────────────
    { word: "आंबा",   lang: "mr", parts: ["आं",  "ब",   "ा"]          },
    { word: "नदी",    lang: "mr", parts: ["न",   "द",   "ी"]          },
    { word: "शाळा",   lang: "mr", parts: ["शा",  "ळ",   "ा"]          },
    { word: "घर",     lang: "mr", parts: ["घ",   "र",   ""]           },
    { word: "माती",   lang: "mr", parts: ["मा",  "त",   "ी"]          },
    { word: "वारा",   lang: "mr", parts: ["वा",  "र",   "ा"]          },
    { word: "झाड",    lang: "mr", parts: ["झा",  "ड",   ""]           },
    { word: "पाणी",   lang: "mr", parts: ["पा",  "ण",   "ी"]          },
    { word: "आग",     lang: "mr", parts: ["आ",   "ग",   ""]           },
    { word: "दगड",    lang: "mr", parts: ["द",   "ग",   "ड"]          },
];

// ── Two-word combos for non-WordPress (regular) flow ──────────
// Each entry pairs two single words from WORDS by their `word` value.
// The frontend picks one and treats both as the secret compound key.
export const WORD_PAIRS = [
    ["Ramesh",  "Compass"],
    ["Patang",  "Coconut"],
    ["Mobile",  "Peacock"],
    ["Laxman",  "Telescope"],
    ["Rajesh",  "Cricket"],
    ["Basket",  "Rocket"],
    ["रोशनी",   "पतंग"],
    ["गणेश",    "मोबाइल"],
    ["राजेश",   "आकाश"],
    ["रमेश",    "किताब"],
    ["Butterfly","Temple"],
    ["Elephant", "Candle"],
    ["Umbrella", "Jungle"],
    ["Peacock",  "Mango"],
    ["Telescope","Blanket"],
];