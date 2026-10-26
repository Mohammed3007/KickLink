export const SPORT_OPTIONS = [
  "Soccer",
  "Basketball",
  "Volleyball",
  "Tennis",
  "Padel",
  "Cricket",
  "Running",
  "Hockey",
  "Rugby",
  "Baseball",
  "Softball",
  "Ultimate",
  "Badminton",
  "Pickleball",
  "Other",
] as const;

export function normalizeSport(value: unknown) {
  const sport = String(value ?? "").trim();
  return sport.length > 0 ? sport : "Soccer";
}

export function sportSlug(value: string) {
  return value.trim().toLowerCase();
}
