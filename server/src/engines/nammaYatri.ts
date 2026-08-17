export interface NammaYatriRateCard {
  vehicleType:
    | "AUTO"
    | "AUTO_PRIORITY"
    | "NON_AC_CAB"
    | "AC_CAB"
    | "SEDAN_PREMIUM"
    | "XL_CAB"
    | "XL_PREMIUM";
  label: string;
  category: "auto" | "hatchback" | "sedan" | "suv";
  capacity: number;
  minFare: number;
  minDistanceKm: number;
  slab1Rate: number; // 2km+ rate for Auto (₹18/km), 4km-10km rate for Cabs
  slab1EndKm: number | null; // 10km if 2-slab
  slab2Rate: number | null; // >10km rate for Cabs
  pickupCharge: number;
  driverAdditions: number; // ₹10 for Auto driver additions
  priorityTip: number; // ₹30 for Auto Priority
}

export const EXACT_NAMMA_YATRI_RATES: NammaYatriRateCard[] = [
  {
    vehicleType: "AUTO",
    label: "Auto (Easy Commute)",
    category: "auto",
    capacity: 3,
    minFare: 40, // Revised base fare for 2km
    minDistanceKm: 2,
    slab1Rate: 19, // Revised rate per km
    slab1EndKm: null,
    slab2Rate: null,
    pickupCharge: 25, // Revised pickup charge
    driverAdditions: 0,
    priorityTip: 0,
  },
  {
    vehicleType: "AUTO_PRIORITY",
    label: "Auto Priority",
    category: "auto",
    capacity: 3,
    minFare: 44, // Revised base fare for 2km
    minDistanceKm: 2,
    slab1Rate: 20, // Revised rate per km
    slab1EndKm: null,
    slab2Rate: null,
    pickupCharge: 25,
    driverAdditions: 0,
    priorityTip: 0,
  },
  {
    vehicleType: "NON_AC_CAB",
    label: "Non-AC Cab",
    category: "hatchback",
    capacity: 4,
    minFare: 100, // Government limit Category 1: ₹100 base for 4km
    minDistanceKm: 4,
    slab1Rate: 24, // ₹24 per km
    slab1EndKm: null,
    slab2Rate: null,
    pickupCharge: 24, // Flat fee/pickup charge
    driverAdditions: 0,
    priorityTip: 0,
  },
  {
    vehicleType: "AC_CAB",
    label: "AC Cab",
    category: "hatchback",
    capacity: 4,
    minFare: 115, // Government limit Category 2: ₹115 base for 4km
    minDistanceKm: 4,
    slab1Rate: 28, // ₹28 per km
    slab1EndKm: null,
    slab2Rate: null,
    pickupCharge: 24,
    driverAdditions: 0,
    priorityTip: 0,
  },
  {
    vehicleType: "SEDAN_PREMIUM",
    label: "Sedan Premium",
    category: "sedan",
    capacity: 4,
    minFare: 115,
    minDistanceKm: 4,
    slab1Rate: 28,
    slab1EndKm: null,
    slab2Rate: null,
    pickupCharge: 24,
    driverAdditions: 0,
    priorityTip: 0,
  },
  {
    vehicleType: "XL_CAB",
    label: "XL Cab",
    category: "suv",
    capacity: 6,
    minFare: 130, // Government limit Category 3: ₹130 base for 4km
    minDistanceKm: 4,
    slab1Rate: 32, // ₹32 per km
    slab1EndKm: null,
    slab2Rate: null,
    pickupCharge: 24,
    driverAdditions: 0,
    priorityTip: 0,
  },
  {
    vehicleType: "XL_PREMIUM",
    label: "XL Premium",
    category: "suv",
    capacity: 6,
    minFare: 130,
    minDistanceKm: 4,
    slab1Rate: 32,
    slab1EndKm: null,
    slab2Rate: null,
    pickupCharge: 40,
    driverAdditions: 0,
    priorityTip: 0,
  },
];

export interface NammaYatriEstimateResult {
  provider: "Namma Yatri";
  vehicleType: string;
  label: string;
  category: "auto" | "hatchback" | "sedan" | "suv";
  capacity: number;
  estimatedFare: number;
  fareMin?: number;
  fareMax?: number;
  isNightFare: boolean;
  etaMinutes: number;
  breakdown: {
    baseFare: number;
    pickupCharge: number;
    driverAdditions: number;
    distanceFare: number;
    priorityTip: number;
    congestionCharge?: number;
    nightSurcharge: number;
    total: number;
  };
}

function getBengaluruHour(at: Date): number {
  const hourStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    hour12: false,
  }).format(at);
  return Number(hourStr) % 24;
}

export function isNightFareIST(at: Date = new Date()): boolean {
  const hour = getBengaluruHour(at);
  return hour >= 22 || hour < 5;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function calculateNammaYatriFares(
  distanceKm: number,
  durationMin: number,
  forceNight: boolean = false
): NammaYatriEstimateResult[] {
  const night = forceNight || isNightFareIST();

  return EXACT_NAMMA_YATRI_RATES.map((cfg) => {
    let distanceFare = 0;
    const extraKm = Math.max(0, distanceKm - cfg.minDistanceKm);

    if (extraKm > 0) {
      if (cfg.slab1EndKm != null && cfg.slab2Rate != null) {
        const slab1Km = Math.min(extraKm, cfg.slab1EndKm - cfg.minDistanceKm);
        const slab2Km = Math.max(0, distanceKm - cfg.slab1EndKm);
        distanceFare = slab1Km * cfg.slab1Rate + slab2Km * cfg.slab2Rate;
      } else {
        distanceFare = extraKm * cfg.slab1Rate;
      }
    }

    // Congestion Charge (10% on base + distance fare for Auto Priority)
    const congestionCharge = cfg.vehicleType === "AUTO_PRIORITY"
      ? Math.round((cfg.minFare + distanceFare) * 0.10)
      : 0;

    const subtotal =
      cfg.minFare +
      distanceFare +
      cfg.pickupCharge +
      cfg.driverAdditions +
      cfg.priorityTip +
      congestionCharge;

    // Night surcharge (10 PM - 5 AM IST for Auto: 1.5x on base+distance; 12 AM - 6 AM for Cab: 1.1x on total)
    const nightMultiplier = cfg.category === "auto" ? 1.5 : 1.1;
    const nightBase = cfg.category === "auto"
      ? (cfg.minFare + distanceFare)
      : (cfg.minFare + distanceFare + cfg.pickupCharge);

    const nightSurcharge = night
      ? nightBase * (nightMultiplier - 1)
      : 0;

    const total = round2(subtotal + nightSurcharge);
    const etaMinutes = cfg.category === "auto" ? 2 : 4;

    if (cfg.category === "auto") {
      const fareMin = Math.round(total - 10);
      const fareMax = Math.round(total);
      return {
        provider: "Namma Yatri",
        vehicleType: cfg.vehicleType,
        label: cfg.label,
        category: cfg.category,
        capacity: cfg.capacity,
        estimatedFare: Math.round(total),
        fareMin,
        fareMax,
        isNightFare: night,
        etaMinutes,
        breakdown: {
          baseFare: round2(cfg.minFare),
          pickupCharge: round2(cfg.pickupCharge),
          driverAdditions: round2(cfg.driverAdditions),
          distanceFare: round2(distanceFare),
          priorityTip: round2(cfg.priorityTip),
          congestionCharge: congestionCharge > 0 ? congestionCharge : undefined,
          nightSurcharge: round2(nightSurcharge),
          total: Math.round(total),
        },
      };
    }

    return {
      provider: "Namma Yatri",
      vehicleType: cfg.vehicleType,
      label: cfg.label,
      category: cfg.category,
      capacity: cfg.capacity,
      estimatedFare: Math.round(total),
      isNightFare: night,
      etaMinutes,
      breakdown: {
        baseFare: round2(cfg.minFare),
        pickupCharge: round2(cfg.pickupCharge),
        driverAdditions: round2(cfg.driverAdditions),
        distanceFare: round2(distanceFare),
        priorityTip: round2(cfg.priorityTip),
        nightSurcharge: round2(nightSurcharge),
        total: Math.round(total),
      },
    };
  });
}
