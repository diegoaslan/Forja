export function weekScoreLabel(score: number): { label: string; color: string } {
  if (score >= 85) return { label: "Excelente",      color: "text-green-500" };
  if (score >= 70) return { label: "Muito bom",      color: "text-primary"   };
  if (score >= 55) return { label: "Regular",        color: "text-amber-500" };
  return               { label: "Pode melhorar", color: "text-rose-500"  };
}
