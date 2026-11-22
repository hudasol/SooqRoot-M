import { Farm, Grade, Order } from '../types';
import { FARMS } from './farms';
import { ORDERS } from './orders';
import { getProduct } from './products';

/* ============================================================
   Data layer
   The app reads farms, harvest windows and allocations through
   this interface. LocalRepository serves the typed sample data
   under src/data/. A hosted implementation can replace it
   without changing any page. See supabase/schema.sql for the
   matching tables and the README section "Data layer".
   ============================================================ */

export interface HarvestWindowRecord {
  farmId: string;
  crop: string;
  grade: Grade;
  availableKg: number;
  windowStart: string;
  windowEnd: string;
  /** Locked windows belong to an advance only cycle. */
  isLocked: boolean;
}

export interface AllocationRecord {
  orderId: string;
  farmId: string;
  allocatedKg: number;
  status: 'primary' | 'backup';
  backupFarmId?: string;
}

export interface Repository {
  listFarms(): Promise<Farm[]>;
  listHarvestWindows(): Promise<HarvestWindowRecord[]>;
  listAllocations(): Promise<AllocationRecord[]>;
}

export class LocalRepository implements Repository {
  constructor(
    private readonly farms: Farm[] = FARMS,
    private readonly orders: Order[] = ORDERS
  ) {}

  async listFarms(): Promise<Farm[]> {
    return this.farms;
  }

  async listHarvestWindows(): Promise<HarvestWindowRecord[]> {
    return this.farms.flatMap((f) =>
      f.capacity.map((c) => ({
        farmId: f.id,
        crop: getProduct(c.productId).name,
        grade: 'A' as Grade,
        availableKg: Math.max(0, c.expectedHarvest - c.committed - c.reserve),
        windowStart: c.harvestWindowStart,
        windowEnd: c.harvestWindowEnd,
        isLocked: f.advanceOnly,
      }))
    );
  }

  async listAllocations(): Promise<AllocationRecord[]> {
    return this.orders.flatMap((o) => {
      const backup = o.allocations.find((a) => a.role === 'backup');
      return o.allocations.map((a) => ({
        orderId: o.id,
        farmId: a.farmId,
        allocatedKg: a.qty,
        status: a.role,
        backupFarmId: a.role === 'primary' ? backup?.farmId : undefined,
      }));
    });
  }
}

/** The repository the app uses today. */
export const repository: Repository = new LocalRepository();
