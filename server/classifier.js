export function classifyScam(text) {
  const t = text.toLowerCase();

  if (t.match(/loan|credit|mudra|finance|cashloop/)) return "loan";
  if (t.match(/job|interview|salary|data entry|hiring/)) return "job";
  if (t.match(/otp|upi|cvv|bank|atm|card/)) return "banking";
  if (t.match(/crypto|bitcoin|trading|investment/)) return "investment";
  if (t.match(/qr|upi collect|payment link/)) return "upi";
  if (t.match(/police|arrest|traffic|legal/)) return "authority";
  if (t.match(/snapchat|instagram|blackmail|video/)) return "blackmail";

  return "general";
}