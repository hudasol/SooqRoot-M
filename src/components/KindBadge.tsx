import { Droplet, Fish, Leaf, Wheat } from 'lucide-react';
import { GrowingMethod, SupplyKind } from '../types';
import { Badge } from './ui';
import { SUPPLY_KIND_LABEL, SUPPLY_KINDS } from '../data/products';
import { Segmented } from './ui';

export const KIND_ICON = {
  fresh_produce: Leaf,
  dates: Wheat,
  honey: Droplet,
  aquaculture: Fish,
} as const;

const KIND_TONE: Record<SupplyKind, 'brand' | 'sand' | 'amber' | 'sky'> = {
  fresh_produce: 'brand',
  dates: 'sand',
  honey: 'amber',
  aquaculture: 'sky',
};

/** Supply kind badge: Fresh produce, Dates, Honey or Aquaculture. */
export function KindBadge({ kind, className = '' }: { kind: SupplyKind; className?: string }) {
  const Icon = KIND_ICON[kind];
  return (
    <Badge tone={KIND_TONE[kind]} icon={<Icon size={10} />} className={className}>
      {SUPPLY_KIND_LABEL[kind].en}
    </Badge>
  );
}

/** Growing method tag. */
export function MethodTag({ method, className = '' }: { method: GrowingMethod; className?: string }) {
  return (
    <Badge tone="neutral" className={className}>
      {method}
    </Badge>
  );
}

export type KindFilter = 'all' | SupplyKind;

/** Four kinds as a filter. */
export function KindFilterBar({
  value,
  onChange,
  className = '',
}: {
  value: KindFilter;
  onChange: (v: KindFilter) => void;
  className?: string;
}) {
  return (
    <Segmented<KindFilter>
      value={value}
      onChange={onChange}
      className={className}
      options={[
        { value: 'all', label: 'All kinds' },
        ...SUPPLY_KINDS.map((k) => ({ value: k as KindFilter, label: SUPPLY_KIND_LABEL[k].en })),
      ]}
    />
  );
}
