import type { BodyMeasurements } from "@/lib/mock-progress";
import { MEASUREMENT_LABELS } from "@/lib/mock-progress";

interface BodyMetricsCardProps {
  latest: BodyMeasurements;
}

export function BodyMetricsCard({ latest }: BodyMetricsCardProps) {
  const keys = Object.keys(MEASUREMENT_LABELS) as Array<keyof typeof MEASUREMENT_LABELS>;
  const filled = keys.filter((k) => latest[k] !== undefined);

  return (
    <div className="mx-4 rounded-2xl bg-card card-shadow overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Medidas atuais
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Última atualização:{" "}
          {new Date(latest.date + "T00:00:00").toLocaleDateString("pt-BR")}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-0 divide-x divide-y divide-border">
        {filled.map((key) => (
          <div key={key} className="px-4 py-3 text-center">
            <p className="text-base font-bold">{latest[key]}</p>
            <p className="text-[10px] text-muted-foreground">cm</p>
            <p className="text-[10px] text-muted-foreground">{MEASUREMENT_LABELS[key]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
