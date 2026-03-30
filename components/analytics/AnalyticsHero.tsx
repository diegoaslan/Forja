import { weekScoreLabel } from "@/lib/utils/analytics";

interface AnalyticsHeroProps {
  score: number;
}

export function AnalyticsHero({ score }: AnalyticsHeroProps) {
  const { label } = weekScoreLabel(score);
  const circumference = 2 * Math.PI * 38;
  const dash = circumference * (score / 100);

  return (
    <div className="gradient-primary mx-4 mt-4 rounded-3xl p-5 text-white">
      <div className="flex items-center gap-5">
        {/* Score ring */}
        <div className="relative shrink-0" style={{ width: 88, height: 88 }}>
          <svg width={88} height={88} className="-rotate-90">
            <circle cx={44} cy={44} r={38} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={6} />
            <circle
              cx={44} cy={44} r={38}
              fill="none"
              stroke="white"
              strokeWidth={6}
              strokeDasharray={`${dash} ${circumference}`}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold leading-none">{score}</span>
            <span className="text-[10px] font-medium opacity-75">/ 100</span>
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium opacity-75 mb-1">Score da semana</p>
          <p className="text-xl font-bold leading-tight">{label}</p>
          <p className="text-xs opacity-70 mt-1.5">
            Combinando treinos, dieta, hábitos e progresso
          </p>
        </div>
      </div>
    </div>
  );
}
