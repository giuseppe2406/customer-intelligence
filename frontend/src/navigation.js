// Navigation und Seitentitel an einer Stelle, damit Menue und Ueberschrift
// nicht auseinanderlaufen, wenn spaeter eine Seite dazukommt.
export const NAVIGATION = [
  { pfad: "/arbeitsliste", titel: "Arbeitsliste" },
  { pfad: "/kunden", titel: "Kunden" },
  { pfad: "/dashboard", titel: "Dashboard" },
];

export function seitentitel(pfad) {
  if (pfad.startsWith("/kunden/")) {
    return "Kundendetail";
  }
  const eintrag = NAVIGATION.find((e) => e.pfad === pfad);
  return eintrag ? eintrag.titel : "";
}
