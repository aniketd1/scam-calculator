export const VISUAL_PASSWORD_SENTENCES = [
  "The teacher goes to school by bus in India morning time.",
  "The doctor works in hospital with mobile in USA today shift.",
  "The farmer lives in house near river in India village life.",
  "The student studies in university by train in Japan city.",
  "The child plays football in park with dog and cat fun.",
  "The teacher writes on table in school with laptop notes work.",
  "The doctor checks eye in hospital with hand patient care.",
  "The farmer grows carrot in field near mountain green land.",
  "The engineer works in university with laptop in USA office.",
  "The driver drives car on road near ocean sea view.",
  "The boy eats apple in park with banana fruit time.",
  "The girl drinks milk in house with bread food time.",
  "The teacher sits on chair in school with table class.",
  "The doctor uses TV in hospital for patient health care.",
  "The farmer sees dog in field near river green land.",
  "The student reads book in university with mobile study time.",
  "The child watches TV in house with mobile entertainment time.",
  "The teacher plays guitar in school with piano music class.",
  "The doctor hears drum in hospital with guitar sound time.",
  "The farmer eats rice in house with milk food meal.",
  "The boy plays cricket in park with football game time.",
  "The girl plays tennis in university with cricket sport fun.",
  "The teacher draws sunflower in school with rose art work.",
  "The doctor plants rose in hospital garden near river view.",
  "The farmer plants spinach in field near ocean green farm.",
  "The student uses laptop in university with mobile study work.",
  "The child eats banana in park with mango fruit snack.",
  "The teacher uses TV in school with mobile lesson work.",
  "The doctor checks ear in hospital with eye medical care.",
  "The farmer works in field near mountain green farm land.",
  "The boy sits on bed in house with chair rest time.",
  "The girl sleeps on bed in house near ocean sea view.",
  "The teacher travels by train to university in Japan city.",
  "The doctor travels by bus to hospital in USA city.",
  "The farmer travels by car to park in India land.",
  "The student sees parrot in park with pigeon bird view.",
  "The child hears sparrow in house near river sound time.",
  "The teacher sees pigeon in school near ocean bird view.",
  "The doctor sees elephant in hospital near park animal care.",
  "The farmer sees cat in field with dog farm animal.",
  "The boy uses mobile in park with laptop device time.",
  "The girl uses laptop in university with mobile device work.",
  "The teacher uses mobile in school with TV lesson work.",
  "The doctor uses laptop in hospital with TV report work.",
  "The farmer uses mobile in house near river communication tool.",
  "The child draws house in school with mountain art work.",
  "The student draws ocean in university with beach study art.",
  "The teacher draws river in school with mountain teaching art.",
  "The doctor draws beach in hospital with ocean sketch work.",
  "The farmer draws mountain in house with river farm art.",
];

const imageMap = {
  teacher: "teacher.png",
  doctor: "doctor.png",
  farmer: "Farmer.png",
  student: "School building.png",
  child: "School building.png",
  driver: "car.png",
  bus: "bus.png",
  car: "car.png",
  train: "train.png",
  hospital: "Hospital.png",
  school: "School building.png",
  university: "School building.png",
  house: "House.png",
  park: "park.png",
  river: "River.png",
  mountain: "Mountain.png",
  ocean: "Ocean.png",
  beach: "beach.png",
  dog: "dog.png",
  cat: "cat.png",
  apple: "apple.png",
  banana: "banana.png",
  milk: "Milk.png",
  bread: "Bread.png",
  chair: "Chair.png",
  table: "table.png",
  laptop: "laptop.png",
  mobile: "mobile.png",
  tv: "TV.png",
  guitar: "Guitar.png",
  piano: "piano.png",
  drum: "Drums.png",
  eye: "eye.png",
  hand: "hand.png",
  elephant: "elephant.png",
  parrot: "Parrot.png",
  pigeon: "Pigeon.png",
  sparrow: "sparrow.png",
  sunflower: "sunflower.png",
  rose: "Rose.png",
  spinach: "Spinach.png",
  rice: "Rice.png",
  carrot: "carrot.png",
  usa: "USA flag.png",
  india: "India flag.png",
  iphone: "mobile.png",
  laptopdevice: "laptop.png",
};

export function chooseRandomPasswordSentence() {
  return VISUAL_PASSWORD_SENTENCES[Math.floor(Math.random() * VISUAL_PASSWORD_SENTENCES.length)];
}

export function sentenceToChallengeImages(sentence) {
  const normalized = sentence.toLowerCase().replace(/[^a-z0-9 ]+/g, " ");
  const tokens = new Set(normalized.split(" ").filter(Boolean));

  const images = [];
  for (const token of tokens) {
    if (imageMap[token] && !images.includes(imageMap[token])) {
      images.push(imageMap[token]);
    }
  }

  if (images.length === 0) {
    return ["shield.svg"];
  }

  return images.slice(0, 6);
}

const ALL_IMAGES = [
  ...new Set(Object.values(imageMap)),
  "apple.png",
  "banana.png",
  "beach.png",
  "bed.png",
  "bus.png",
  "car.png",
  "carrot.png",
  "cat.png",
  "Chair.png",
  "Cricket.png",
  "doctor.png",
  "dog.png",
  "Drums.png",
  "Ear.png",
  "elephant.png",
  "eye.png",
  "Farmer.png",
  "Football.png",
  "Guitar.png",
  "hand.png",
  "Hospital.png",
  "House.png",
  "India flag.png",
  "Japan Flag.png",
  "laptop.png",
  "Lotus.png",
  "Mango.png",
  "Milk.png",
  "mobile.png",
  "Mountain.png",
  "Ocean.png",
  "park.png",
  "Parrot.png",
  "piano.png",
  "Pigeon.png",
  "Potato.png",
  "purple.png",
  "Rice.png",
  "River.png",
  "Rose.png",
  "School building.png",
  "school.png",
  "shield.svg",
  "Shirt.png",
  "Sparrow.png",
  "Spinach.png",
  "sunflower.png",
  "table.png",
  "teacher.png",
  "Tennis.png",
  "train.png",
  "Tshirt.png",
  "TV.png",
  "USA flag.png",
  "Yellow.png",
];

export function buildChallengeImages(sentence, totalOptions = 8) {
  const required = sentenceToChallengeImages(sentence);
  const availableDecoys = ALL_IMAGES.filter((img) => !required.includes(img));
  const shuffledDecoys = availableDecoys.sort(() => Math.random() - 0.5);
  const selectedDecoys = shuffledDecoys.slice(0, Math.max(0, totalOptions - required.length));
  const options = [...required, ...selectedDecoys].sort(() => Math.random() - 0.5);
  return { expected: required, options };
}
