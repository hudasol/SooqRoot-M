import { useMemo } from 'react';
import { Sun } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge, Card, CardHeader } from './ui';
import { ChartTooltip } from './viz/ChartTooltip';
import { useChartColors } from '../lib/theme';
import { FARMS } from '../data/farms';
import { METHOD_MONTHLY_INDEX, SeasonalMethod } from '../data/methods';
import { supplyKindOf } from '../data/products';

/* ============================================================
   Summer gap view
   Monthly supply by growing method for the sample network.
   Controlled environment farms (Indoor vertical, Hydroponic,
   Climate greenhouse) keep supplying from June to September,
   when open field supply drops. Index values follow the UAE
   crop calendar in the data pack. Sample network (estimate).
   ============================================================ */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SERIES: { method: SeasonalMethod; color: string; controlled: boolean }[] = [
  { method: 'Open field', color: '#c99c57', controlled: false },
  { method: 'Net house', color: '#dcba7e', controlled: false },
  { method: 'Greenhouse', color: '#8dc6a4', controlled: false },
  { method: 'Hydroponic', color: '#3c8c61', controlled: true },
  { method: 'Indoor vertical', color: '#2a714c', controlled: true },
  { method: 'Climate greenhouse', color: '#183b2b', controlled: true },
];

export function SummerGapView() {
  const chart = useChartColors();

  const { rows, summerShare } = useMemo(() => {
    // Baseline weekly capacity per method: expected harvest across fresh produce lines, kg, in tonnes.
    const base: Record<string, number> = {};
    for (const f of FARMS) {
      const kg = f.capacity
        .filter((c) => c.unit === 'kg' && supplyKindOf(c.productId) === 'fresh_produce')
        .reduce((s, c) => s + c.expectedHarvest, 0);
      base[f.growingMethod] = (base[f.growingMethod] ?? 0) + kg;
    }
    const rows = MONTHS.map((m, i) => {
      const row: Record<string, number | string> = { month: m };
      for (const s of SERIES) row[s.method] = Math.round(((base[s.method] ?? 0) * METHOD_MONTHLY_INDEX[s.method][i]) / 100) / 10;
      return row;
    });
    const total = (i: number) => SERIES.reduce((s, x) => s + (rows[i][x.method] as number), 0);
    const controlled = (i: number) => SERIES.filter((x) => x.controlled).reduce((s, x) => s + (rows[i][x.method] as number), 0);
    const summer = [5, 6, 7, 8];
    const share = summer.reduce((s, i) => s + controlled(i), 0) / Math.max(1, summer.reduce((s, i) => s + total(i), 0));
    return { rows, summerShare: Math.round(share * 100) };
  }, []);

  return (
    <Card>
      <CardHeader
        title="Summer gap view"
        subtitle="Monthly supply by growing method (estimate). Controlled environment farms cover June to September."
        icon={<Sun size={16} />}
        action={<Badge tone="brand">{summerShare}% of June to September supply (estimate)</Badge>}
      />
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid stroke={chart.grid} vertical={false} />
            <XAxis dataKey="month" tick={{ fill: chart.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: chart.axis, fontSize: 11 }} axisLine={false} tickLine={false} unit=" t" />
            <Tooltip content={<ChartTooltip suffix=" t" />} cursor={{ fill: chart.cursor }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceArea x1="Jun" x2="Sep" fill="#c99c57" fillOpacity={0.1} />
            {SERIES.map((s) => (
              <Bar key={s.method} dataKey={s.method} stackId="a" fill={s.color} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-2xs text-charcoal-400">
        Open field, net house and greenhouse follow the crop calendar: peak November to April, low July to September. Hydroponic,
        indoor vertical and climate greenhouse farms hold supply through the summer gap.
      </p>
    </Card>
  );
}
