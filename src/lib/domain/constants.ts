// Domain constants — mirrors trading-journal.html. When this list
// changes, update src/lib/domain/types.ts and the seed forms.

export const INSTRUMENTS = ["MNQ", "MES"] as const;
export const DIRECTIONS = ["Long", "Short"] as const;
export const SESSION_WINDOWS = ["NY open", "NY lunch", "Outside session"] as const;
export const OUTCOMES = ["Win", "Loss", "Breakeven", "Stopped early", "Target hit"] as const;

export const PRIMARY_SETUPS = [
  "Order Block (OB)",
  "Fair Value Gap (FVG)",
  "Liquidity sweep",
  "Breaker Block",
  "Market Structure Shift (MSS/BOS)",
  "OTE retracement",
  "Power of 3 (AMD)",
  "ATH Strategy",
] as const;

export const HTF_BIASES = ["Bullish", "Bearish", "Neutral/ranging"] as const;
export const HTF_TIMEFRAMES = ["1H", "4H", "Daily"] as const;
export const ENTRY_MODELS = [
  "OB retest",
  "FVG fill",
  "Sweep + reverse",
  "BOS + pullback",
  "OTE zone",
  "AMD accumulation",
] as const;
export const EMOTIONAL_STATES = ["Calm", "Impatient", "Fearful", "Overconfident", "Neutral"] as const;
export const WAITED_OPTIONS = ["Yes", "No", "Partially"] as const;
export const MOVED_STOP_OPTIONS = ["Yes — widened", "Yes — tightened", "No"] as const;
export const EXITED_EARLY_OPTIONS = ["Yes", "No"] as const;
export const EXITED_EARLY_WHY = ["Felt scared", "Took partials", "News", "Other"] as const;
export const SETUP_PLAN_LEVELS = ["A++", "A", "B", "C", "Gamble"] as const;
export const CHECK_STATES = ["Yes", "No", "Skipped"] as const;

export const CHECKLIST_DEF = [
  { key: "htfBiasConfirmed", label: "HTF bias confirmed (1H or higher)" },
  { key: "sessionActive", label: "Session killzone active (NY open or NY lunch)" },
  { key: "validSetup", label: "Valid ICT setup present (OB, FVG, or sweep)" },
  { key: "entry5mConfirmation", label: "Entry on 1 or 2 Min FVG" },
  { key: "stopBeyondStructure", label: "Stop placed beyond structure (OB low/high or swing)" },
  { key: "riskInRange", label: "Risk is max $200" },
] as const;

export const TICK_SIZE = 0.25;

// Dollars per tick for each instrument.
export const TICK_VALUE: Record<(typeof INSTRUMENTS)[number], number> = {
  MNQ: 0.5,
  MES: 1.25,
};

export type Instrument = (typeof INSTRUMENTS)[number];
export type Direction = (typeof DIRECTIONS)[number];
export type SessionWindow = (typeof SESSION_WINDOWS)[number];
export type Outcome = (typeof OUTCOMES)[number];
export type PrimarySetup = (typeof PRIMARY_SETUPS)[number];
export type HtfBias = (typeof HTF_BIASES)[number];
export type HtfTimeframe = (typeof HTF_TIMEFRAMES)[number];
export type EntryModel = (typeof ENTRY_MODELS)[number];
export type EmotionalState = (typeof EMOTIONAL_STATES)[number];
export type WaitedOption = (typeof WAITED_OPTIONS)[number];
export type MovedStopOption = (typeof MOVED_STOP_OPTIONS)[number];
export type ExitedEarlyOption = (typeof EXITED_EARLY_OPTIONS)[number];
export type SetupPlanLevel = (typeof SETUP_PLAN_LEVELS)[number];
export type CheckState = (typeof CHECK_STATES)[number];
export type ChecklistKey = (typeof CHECKLIST_DEF)[number]["key"];