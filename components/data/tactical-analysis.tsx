type TacticalAnalysisProps = {
  summary?: string;
};

// 第三方免费数据不一定有战术内容；这里先把“暂未提供”状态做清楚。
export function TacticalAnalysis({ summary }: TacticalAnalysisProps) {
  return (
    <section className="rounded-md border border-line bg-white p-4 shadow-panel">
      <h3 className="text-base font-black text-ink">阵型与战术解读</h3>
      <p className="mt-4 text-sm leading-6 text-muted">{summary?.trim() ? summary : "暂未提供。本区域后续可接入编辑撰写的阵型、站位和战术变化解读。"}</p>
    </section>
  );
}
