import { TransactionStatus } from '@/types/telemetry';

const DOT: Record<TransactionStatus, string> = {
  settled: '/figma/dot-settled.svg',
  pending: '/figma/dot-pending.svg',
  flagged: '/figma/dot-flagged.svg',
  blocked: '/figma/dot-blocked.svg',
};

const TONE: Record<TransactionStatus, string> = {
  settled: 'border-settled text-settled',
  pending: 'border-pending text-pending',
  flagged: 'border-flagged text-flagged',
  blocked: 'border-blocked text-blocked',
};

const LABEL: Record<TransactionStatus, string> = {
  settled: 'Settled',
  pending: 'Pending',
  flagged: 'Flagged',
  blocked: 'Blocked',
};

export function statusLabel(status: TransactionStatus) {
  return LABEL[status];
}

export function StatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 self-start rounded-full border bg-subtle px-2 py-1 ${TONE[status]}`}
    >
      <img src={DOT[status]} alt="" />
      <span className="font-sans text-[12px] font-medium leading-4">{LABEL[status]}</span>
    </span>
  );
}
