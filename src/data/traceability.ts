import { BatchPassport, ColdChainReading, CustodyStep, Farm, Order } from '../types';
import { FARM_MAP } from './farms';
import { BUYERS } from './buyers';
import { ORDERS, NETWORK_FARMS } from './orders';
import { BASE_PASSPORTS } from './operations';
import { assignPartners, emirateFromLocation } from '../lib/engine';
import { foodMilesFor, localRouteKm } from '../lib/emissions';
import { getProduct } from './products';

/* ============================================================
   Traceability
   Federal Law No. 10 of 2015 on Food Safety and Cabinet
   Resolution No. 26 of 2017 require traceability across the
   food chain. Every batch passport carries the farm
   registration, provenance tags, custody chain and, for
   aquaculture, a cold chain log. Sample network records.
   ============================================================ */

function hash(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return '0x' + (h >>> 0).toString(16).padStart(8, '0') + 'a1';
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function addMinutes(stamp: string, minutes: number): string {
  const d = new Date(stamp.replace(' ', 'T') + ':00Z');
  d.setUTCMinutes(d.getUTCMinutes() + minutes);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

/**
 * A passport records a batch as harvested or delivered, so it cannot carry a date after 22 November 2026.
 * The cut off is 21 November so that the arrival at the buyer the morning after harvest is on or before the 22nd.
 * A later date moves back in whole weeks, which keeps the weekday. Earlier dates are left as they are.
 */
const PASSPORT_LATEST = '2026-11-21';

function settleDate(value: string): string {
  const day = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || day <= PASSPORT_LATEST) return value;
  const dayMs = Date.parse(`${day}T00:00:00Z`);
  const over = Math.round((dayMs - Date.parse(`${PASSPORT_LATEST}T00:00:00Z`)) / 86400000);
  const back = Math.ceil(over / 7) * 7;
  return new Date(dayMs - back * 86400000).toISOString().slice(0, 10) + value.slice(10);
}

function buyerName(id: string): string {
  return BUYERS.find((b) => b.id === id)?.name ?? 'Buyer';
}

function buyerLocation(orderId: string): string {
  return ORDERS.find((o) => o.id === orderId)?.deliveryLocation ?? 'Delivery point';
}

/** Cold chain readings between harvest and delivery. Aquaculture only. Sample readings. */
function coldChainFor(batchId: string, harvestedAt: string, deliveredAt: string, chain: string): ColdChainReading[] {
  const seed = hash(batchId)
    .slice(2, 10)
    .split('')
    .map((c) => parseInt(c, 16));
  const points = [
    'Harvest, ice slurry',
    'Packhouse, iced boxes',
    `Loaded, ${chain}`,
    'Consolidation point',
    'Linehaul, mid route',
    'Arrival, buyer dock',
  ];
  const start = new Date(harvestedAt.replace(' ', 'T') + ':00Z').getTime();
  const end = new Date(deliveredAt.replace(' ', 'T') + ':00Z').getTime();
  const step = Math.max(30, Math.round((end - start) / 60000 / (points.length - 1)));
  return points.map((point, i) => ({
    at: addMinutes(harvestedAt, step * i),
    tempC: Math.round((0.6 + (seed[i % seed.length] % 6) * 0.35) * 10) / 10,
    point,
  }));
}

function lotIdFor(farm: Farm | undefined, productId: string, harvestDate: string): string {
  const live = NETWORK_FARMS.find((f) => f.id === farm?.id);
  const line = live?.capacity.find((c) => c.productId === productId && c.harvestWindowEnd >= harvestDate);
  return `LOT-${farm?.code ?? 'XX'}-${productId.replace('p-', '').toUpperCase()}-${settleDate(line?.harvestWindowStart ?? harvestDate).replace(/-/g, '')}`;
}

function enrich(
  recorded: Omit<
    BatchPassport,
    'farmRegistrationNo' | 'region' | 'lotId' | 'harvestedAt' | 'lotKg' | 'provenanceTags' | 'buyerPoRef' | 'custodyChain' | 'coldChainLog'
  >,
  order: Order | undefined
): BatchPassport {
  // The lot is chosen from the recorded harvest date, then every date shown on the passport is settled.
  const base = {
    ...recorded,
    harvestedOn: settleDate(recorded.harvestedOn),
    packedOn: settleDate(recorded.packedOn),
    deliveredOn: recorded.deliveredOn ? settleDate(recorded.deliveredOn) : undefined,
    checkpoints: recorded.checkpoints.map((c) => ({ ...c, at: settleDate(c.at) })),
  };
  const farm = FARM_MAP[base.farmId];
  const product = getProduct(base.productId);
  const harvestedAt = `${base.harvestedOn} 05:40`;
  const deliveredAt = base.deliveredOn ? `${base.deliveredOn} 06:20` : addMinutes(harvestedAt, 26 * 60);
  const alloc = order?.allocations.find((a) => a.batchId === base.batchId);
  const emirate = emirateFromLocation(order?.deliveryLocation ?? buyerLocation(base.orderId));
  const chain = alloc?.partnerChain ?? (farm ? assignPartners(farm, emirate, base.productId) : undefined);

  const custody: CustodyStep[] = [
    { role: 'Farm', party: farm?.name ?? 'Farm', at: harvestedAt, location: farm?.area ?? 'Farm gate' },
    {
      role: 'Collection partner',
      party: chain?.collection ?? 'Collection partner',
      at: addMinutes(harvestedAt, 220),
      location: `${farm?.region ?? 'Farm'} pickup`,
    },
    {
      role: 'Distributor',
      party: chain?.delivery ?? 'Delivery partner',
      at: addMinutes(harvestedAt, 330),
      location: chain?.consolidation ?? 'Consolidation point',
    },
    {
      role: 'Buyer',
      party: buyerName(base.buyerId),
      at: deliveredAt,
      location: buyerLocation(base.orderId),
    },
  ];

  const miles = foodMilesFor(base.productId, base.qty, localRouteKm(farm ?? ({ distanceKm: base.distanceKm } as Farm), emirate));

  return {
    ...base,
    co2SavedKg: miles.co2SavedKg,
    farmRegistrationNo: farm?.farmRegistrationNo ?? 'SR-FR-XX-0000',
    region: farm?.region ?? 'Al Saad',
    lotId: lotIdFor(farm, base.productId, recorded.harvestedOn),
    harvestedAt,
    lotKg: product.unit === 'kg' ? base.qty : 0,
    provenanceTags: farm?.provenanceTags ?? [],
    buyerPoRef: `PO-${order?.ref ?? base.orderId.replace('order-', '').toUpperCase()}`,
    custodyChain: custody,
    coldChainLog: product.category === 'fish' ? coldChainFor(base.batchId, harvestedAt, deliveredAt, chain?.coldChain ?? 'cold chain') : undefined,
  };
}

/** Passports for every committed allocation in the order book. */
function generated(): BatchPassport[] {
  const known = new Set(BASE_PASSPORTS.map((p) => p.batchId));
  const out: BatchPassport[] = [];
  for (const order of ORDERS) {
    for (const a of order.allocations) {
      if (a.role !== 'primary' || known.has(a.batchId)) continue;
      const farm = FARM_MAP[a.farmId];
      const delivered = order.status === 'Delivered';
      const harvestedOn = a.harvestDate;
      const packedOn = harvestedOn;
      const deliveredOn = delivered ? order.requiredBy : undefined;
      const emirate = emirateFromLocation(order.deliveryLocation);
      const product = getProduct(order.productId);
      out.push(
        enrich(
          {
            id: `bp-${a.batchId.toLowerCase()}`,
            batchId: a.batchId,
            orderId: order.id,
            farmId: a.farmId,
            buyerId: order.buyerId,
            productId: order.productId,
            qty: a.qty,
            unit: a.unit,
            grade: order.grade,
            harvestedOn,
            packedOn,
            deliveredOn,
            distanceKm: localRouteKm(farm, emirate),
            co2SavedKg: null,
            waterMethod: farm.facility.includes('ro_water') ? 'RO desalinated drip irrigation' : product.category === 'fish' ? 'Recirculating tanks' : 'Drip irrigation',
            certifications: farm.certifications,
            checkpoints: [
              { label: 'Commitment confirmed', at: `${order.createdAt} 09:30`, by: 'SooqRoot commitment engine' },
              { label: 'Harvest completed', at: `${harvestedOn} 05:40`, by: `Field team, ${farm.area}` },
              { label: 'Graded and packed', at: `${harvestedOn} 08:15`, by: `${farm.name} packhouse`, note: `Grade ${order.grade}` },
              { label: 'Collected', at: `${harvestedOn} 09:35`, by: a.partnerChain?.collection ?? 'Collection partner' },
              ...(delivered
                ? [{ label: 'Delivered', at: `${deliveredOn} 06:20`, by: buyerName(order.buyerId) }]
                : []),
            ],
            verificationHash: hash(a.batchId),
          },
          order
        )
      );
    }
  }
  return out;
}

export const BATCH_PASSPORTS: BatchPassport[] = [
  ...BASE_PASSPORTS.map((p) => enrich(p, ORDERS.find((o) => o.id === p.orderId))),
  ...generated(),
];

export function getPassport(batchId: string): BatchPassport | undefined {
  return BATCH_PASSPORTS.find((p) => p.batchId === batchId);
}

/** Every delivery drawn from the same harvest lot, for recall tracing. */
export function traceLot(batchId: string): BatchPassport[] {
  const p = getPassport(batchId);
  if (!p) return [];
  return BATCH_PASSPORTS.filter((x) => x.lotId === p.lotId).sort((a, b) =>
    (a.deliveredOn ?? '9999').localeCompare(b.deliveredOn ?? '9999')
  );
}

export const PROVENANCE_AR: Record<string, string> = {
  'RO desalinated drip': 'ري بالتنقيط بمياه محلّاة بالتناضح العكسي',
  'Zero pesticide biological': 'خالٍ من المبيدات بمكافحة حيوية',
  'Harvested under 12 hours ago': 'حُصد قبل أقل من 12 ساعة',
  'Cold chain verified': 'سلسلة باردة موثّقة',
};

export const CUSTODY_ROLE_AR: Record<string, string> = {
  Farm: 'المزرعة',
  'Collection partner': 'شريك الجمع',
  Distributor: 'الموزّع',
  Buyer: 'المشتري',
};
