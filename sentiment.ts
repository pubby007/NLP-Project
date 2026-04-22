const POSITIVE_WORDS = new Set([
  "good", "great", "excellent", "amazing", "awesome", "fantastic", "wonderful",
  "love", "loved", "loving", "best", "perfect", "happy", "satisfied", "satisfying",
  "nice", "beautiful", "brilliant", "superb", "outstanding", "delight", "delighted",
  "delightful", "enjoy", "enjoyed", "enjoyable", "recommend", "recommended", "fast",
  "quality", "comfortable", "easy", "smooth", "reliable", "durable", "solid",
  "impressive", "impressed", "fabulous", "exceptional", "favorite", "favourite",
  "pleased", "pleasant", "incredible", "remarkable", "stunning", "elegant",
  "worth", "worthy", "winner", "win", "works", "working", "value", "valuable",
  "sturdy", "premium", "fresh", "clean", "bright", "useful", "helpful", "thanks",
  "thank", "thankful", "wow", "yay", "blessing", "joy", "joyful", "fun", "cool",
  "polished", "responsive", "efficient", "magnificent", "stellar", "top", "ace",
  "marvelous", "splendid", "neat", "perfectly", "lovely", "adore", "adored",
]);

const NEGATIVE_WORDS = new Set([
  "bad", "terrible", "awful", "worst", "horrible", "hate", "hated", "hating",
  "poor", "disappointing", "disappointed", "disappointment", "useless", "broken",
  "break", "breaks", "broke", "defective", "faulty", "fail", "failed", "failure",
  "slow", "cheap", "ugly", "boring", "annoying", "annoyed", "frustrating",
  "frustrated", "frustration", "waste", "wasted", "wasting", "trash", "junk",
  "garbage", "refund", "return", "returned", "returning", "scam", "scammed",
  "fraud", "fake", "lie", "lied", "lying", "stuck", "stopped", "dead", "died",
  "dies", "dying", "leak", "leaking", "leaked", "rip", "ripped", "tear", "torn",
  "uncomfortable", "painful", "pain", "hurt", "hurts", "hurting", "worse",
  "worsen", "worsened", "regret", "regretted", "regrettable", "missing", "lost",
  "loss", "damaged", "damage", "damages", "crap", "crappy", "lame", "weak",
  "flimsy", "rough", "rude", "mess", "messy", "stinky", "smelly", "sad",
  "unhappy", "miserable", "horrid", "atrocious", "dreadful", "appalling",
  "ridiculous", "stupid", "dumb", "nonsense", "issue", "issues", "problem",
  "problems", "problematic", "complaint", "complain", "complaining", "buggy",
  "glitch", "glitchy", "noisy", "loud", "overpriced", "expensive", "wrong",
  "incorrect", "error", "errors", "warning", "warnings", "delay", "delayed",
  "late", "miss", "missed",
]);

const NEGATIONS = new Set(["not", "no", "never", "n't", "cannot", "cant", "won't", "wont", "isn't", "isnt", "wasn't", "wasnt", "don't", "dont", "didn't", "didnt", "doesn't", "doesnt", "aren't", "arent"]);
const INTENSIFIERS = new Set(["very", "really", "extremely", "absolutely", "totally", "highly", "super", "so", "incredibly"]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export type SentimentResult = {
  label: "Positive" | "Negative" | "Neutral";
  score: number;
  confidence: number;
  positiveHits: string[];
  negativeHits: string[];
  tokenCount: number;
};

export function analyzeSentiment(text: string): SentimentResult {
  const tokens = tokenize(text);
  let score = 0;
  const positiveHits: string[] = [];
  const negativeHits: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];
    const prev = tokens[i - 1] ?? "";
    const prev2 = tokens[i - 2] ?? "";
    const negated = NEGATIONS.has(prev) || NEGATIONS.has(prev2);
    const intensified = INTENSIFIERS.has(prev);
    const weight = intensified ? 1.5 : 1;

    if (POSITIVE_WORDS.has(word)) {
      const delta = (negated ? -1 : 1) * weight;
      score += delta;
      if (negated) negativeHits.push(`${prev} ${word}`);
      else positiveHits.push(word);
    } else if (NEGATIVE_WORDS.has(word)) {
      const delta = (negated ? 1 : -1) * weight;
      score += delta;
      if (negated) positiveHits.push(`${prev} ${word}`);
      else negativeHits.push(word);
    }
  }

  const totalHits = positiveHits.length + negativeHits.length;
  const confidence = totalHits === 0 ? 0 : Math.min(1, totalHits / 6);

  let label: "Positive" | "Negative" | "Neutral" = "Neutral";
  if (score > 0.5) label = "Positive";
  else if (score < -0.5) label = "Negative";

  return {
    label,
    score,
    confidence,
    positiveHits,
    negativeHits,
    tokenCount: tokens.length,
  };
}
