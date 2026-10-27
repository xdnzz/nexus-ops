import { PaymentMethod } from '@/types/telemetry';

const METHOD_LABEL: Record<PaymentMethod, string> = {
  ach: 'ACH',
  wire: 'Wire',
  card: 'Card',
  crypto: 'Crypto',
  instant_pix: 'PIX',
};

export function MethodBadge({ method }: { method: PaymentMethod }) {
  return (
    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
      {METHOD_LABEL[method]}
    </span>
  );
}
