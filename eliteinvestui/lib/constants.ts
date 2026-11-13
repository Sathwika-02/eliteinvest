export function getScoreColor(score: number): string {
  if (score <= 30) return "text-score-bearish"
  if (score <= 50) return "text-score-cautious"
  if (score <= 70) return "text-score-neutral"
  if (score <= 85) return "text-score-bullish"
  return "text-score-extreme"
}
export function getScoreBgColor(score: number): string {
  if (score <= 30) return "bg-score-bearish"
  if (score <= 50) return "bg-score-cautious"
  if (score <= 70) return "bg-score-neutral"
  if (score <= 85) return "bg-score-bullish"
  return "bg-score-extreme"
}
export function getAciTileTheme(score: number) {
  // Matches your legend style:
  // Low (<35) red, Caution (35-45) amber, Neutral (45-55) slate,
  // Positive (55-65) green, Strong (>65) dark green

  if (score < 35) return { bg: "#dc2626", fg: "#ffffff", label: "Low" };         // red-600
  if (score < 45) return { bg: "#f59e0b", fg: "#111827", label: "Caution" };     // amber-500 (dark text looks better)
  if (score < 55) return { bg: "#64748b", fg: "#ffffff", label: "Neutral" };     // slate-500
  if (score < 65) return { bg: "#22c55e", fg: "#052e16", label: "Positive" };    // green-500 (very dark green text)
  return { bg: "#16a34a", fg: "#ffffff", label: "Strong" };                      // green-600
}
export function getScoreHex(score: number): string {
  return getAciTileTheme(score).bg;
}
export function getScoreLabel(score: number): string {
  const t = getAciTileTheme(score);
  if (t.label === "Low") return "Low";
  if (t.label === "Caution") return "Caution";
  if (t.label === "Neutral") return "Neutral";
  if (t.label === "Positive") return "Positive";
  return "Strong";
}


export const scoreDefinitions = {
  KFI: {
    full: "Kinetic Flow Index",
    description:
      "Quantifies the flow-divergence lattice and cross-constituent participation velocity to reveal hidden directional energy.",
    friendly:
      '"Is the rally real or fake?" \u2014 Tells you whether most stocks are participating in the market move, or if just a few heavyweights are dragging the index. High KFI = broad strength, Low KFI = narrow/weak move.',
    label: "Momentum",
  },
  CNS: {
    full: "Consilium Score",
    description:
      "Distills the multi-horizon conviction mesh from institutional forward-guidance layers and professional outlook convergence patterns.",
    friendly:
      '"What is smart money expecting?" \u2014 Shows whether analysts and institutions are upgrading or downgrading their outlook. High CNS = professionals are optimistic, Low CNS = professionals are pessimistic.',
    label: "Sentiment",
  },
  IES: {
    full: "Intrinsic Edge Score",
    description:
      "Calibrates the fundamental dislocation envelope by mapping intrinsic worth corridors against prevailing market pricing surfaces.",
    friendly:
      '"Am I buying cheap or expensive?" \u2014 Compares what stocks are actually worth versus what the market is charging right now. Low IES = stocks are undervalued (bargain zone), High IES = stocks are overpriced (expensive zone).',
    label: "Valuation",
  },
  ACI: {
    full: "Alpha Confluence Index",
    description:
      "Proprietary tri-dimensional fusion engine orchestrating kinetic, conviction, and intrinsic signals through adaptive weighting into a single opportunity-risk continuum.",
    friendly:
      '"Bottom line \u2014 should I invest now or wait?" \u2014 Combines all three signals into one number. Low ACI = Fear/Opportunity (good time to buy), High ACI = Greed/Overpriced (good time to be cautious or exit). This is your primary decision indicator.',
    label: "Composite",
  },
}

