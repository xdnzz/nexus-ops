import { Ban, CheckCircle, ShieldAlert } from 'lucide-react';
import { TransactionStatus } from '@/types/telemetry';

const ACTIONS: {
  status: TransactionStatus;
  label: string;
  icon: typeof CheckCircle;
  className: string;
}[] = [
  {
    status: 'settled',
    label: 'Settle',
    icon: CheckCircle,
    className: 'bg-emerald-600 hover:bg-emerald-700',
  },
  {
    status: 'flagged',
    label: 'Flag',
    icon: ShieldAlert,
    className: 'bg-amber-600 hover:bg-amber-700',
  },
  {
    status: 'blocked',
    label: 'Block',
    icon: Ban,
    className: 'bg-rose-600 hover:bg-rose-700',
  },
];

export function OperatorActions({
  onStatusChange,
}: {
  onStatusChange: (status: TransactionStatus) => void;
}) {
  return (
    <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
      <span className="mb-2 block text-[11px] font-medium text-zinc-500">Operator Actions</span>
      <div className="grid grid-cols-3 gap-2">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.status}
              type="button"
              onClick={() => onStatusChange(action.status)}
              className={`inline-flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold text-white ${action.className}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
