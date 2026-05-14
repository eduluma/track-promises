import type { PromiseStatus } from "@/config/schemas";

const statusStyles: Record<PromiseStatus, string> = {
  planned: "bg-white text-ink border-ink/10",
  in_progress: "bg-[#fff5ec] text-clay border-clay/20",
  fulfilled: "bg-[#eef7ed] text-moss border-moss/20",
  delayed: "bg-[#fff1db] text-[#9a6700] border-[#9a6700]/20",
  disputed: "bg-[#fdeeee] text-[#b42318] border-[#b42318]/20"
};

type StatusBadgeProps = {
  status: PromiseStatus;
  labels?: Record<PromiseStatus, string>;
};

export function StatusBadge({ status, labels }: StatusBadgeProps) {
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusStyles[status]}`}>
      {labels?.[status] ?? status.replaceAll("_", " ")}
    </span>
  );
}
