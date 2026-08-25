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
  slab1Rate: number; // 2km+ rate for Auto, 4km-12km for Non-AC Cab, 4km-10km for AC Cab
  slab1EndKm: number | null; // 12km for Non-AC Cab, 10km for AC Cab
  slab2Rate: number | null; // Rate after slab1EndKm
  pickupCharge: number;
  driverAdditions: number;
  priorityTip: number;
  congestionPercentage?: number; // e.g. 10 for Auto Priority, 15 for AC Cab, 25 for Sedan Priority
}

export const EXACT_NAMMA_YATRI_RATES: NammaYatriRateCard[] = [
  {
    vehicleType: "AUTO",
    label: "Auto (Easy Commute)",
    category: "auto",
    capacity: 3,
    minFare: 40,
    minDistanceKm: 2,
    slab1Rate: 19,
    slab1EndKm: null,
    slab2Rate: null,
    pickupCharge: 25,
    driverAdditions: 0,
    priorityTip: 0,
    congestionPercentage: 0,
  },
  {
    vehicleType: "AUTO_PRIORITY",
    label: "Auto Priority",
    category: "auto",
    capacity: 3,
    minFare: 44,
    minDistanceKm: 2,
    slab1Rate: 20,
    slab1EndKm: null,
    slab2Rate: null,
    pickupCharge: 25,
    driverAdditions: 0,
    priorityTip: 0,
    congestionPercentage: 10,
  },
  {
    vehicleType: "NON_AC_CAB",
    label: "Non-AC Cab",
    category: "hatchback",
    capacity: 4,
    minFare: 85, // Calibrated from Namma Yatri screenshot
    minDistanceKm: 4,
    slab1Rate: 20, // ₹20/km
    slab1EndKm: 12, // slab 1 ends at 12km
    slab2Rate: 25, // ₹25/km after 12km (calibrated from screenshot)
    pickupCharge: 30, // ₹30 pickup charge
    driverAdditions: 0,
    priorityTip: 0,
    congestionPercentage: 9, // 9% congestion charge
  },
  {
    vehicleType: "AC_CAB",
    label: "AC Cab",
    category: "hatchback",
    capacity: 4,
    minFare: 100, // Calibrated from Namma Yatri screenshot
    minDistanceKm: 4,
    slab1Rate: 23, // ₹23/km
    slab1EndKm: 10, // slab 1 ends at 10km
    slab2Rate: 18.40, // ₹18.40/km after 10km (official rate)
    pickupCharge: 30, // ₹30 pickup charge
    driverAdditions: 0,
    priorityTip: 0,
    congestionPercentage: 15, // 15% congestion charge
  },
  {
    vehicleType: "SEDAN_PREMIUM",
    label: "Sedan Priority",
    category: "sedan",
    capacity: 4,
    minFare: 115, // Calibrated from Namma Yatri screenshot
    minDistanceKm: 4,
    slab1Rate: 27, // ₹27/km
    slab1EndKm: 12, // slab 1 ends at 12km
    slab2Rate: 21, // ₹21/km after 12km
    pickupCharge: 30, // ₹30 pickup charge
    driverAdditions: 0,
    priorityTip: 0,
    congestionPercentage: 5, // 5% congestion charge
  },
  {
    vehicleType: "XL_CAB",
    label: "XL Cab",
    category: "suv",
    capacity: 6,
    minFare: 130, // Calibrated from Namma Yatri screenshot
    minDistanceKm: 4,
    slab1Rate: 30, // ₹30/km
    slab1EndKm: 10,
    slab2Rate: 25, // ₹25/km after 10km (calibrated from screenshot)
    pickupCharge: 40,
    driverAdditions: 0,
    priorityTip: 0,
    congestionPercentage: 15, // 15% congestion charge
  },
  {
    vehicleType: "XL_PREMIUM",
    label: "XL Premium",
    category: "suv",
    capacity: 6,
    minFare: 150, // Calibrated from screenshot
    minDistanceKm: 4,
    slab1Rate: 36, // ₹36/km for first 10km
    slab1EndKm: 10,
    slab2Rate: 29.40, // ₹29.40/km after 10km (calibrated for long distance)
    pickupCharge: 60,
    driverAdditions: 0,
    priorityTip: 0,
    congestionPercentage: 0, // No congestion charge
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
    congestionPercentage?: number;
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
  forceNight: boolean = false,
  surgeMultiplier: number = 1.0
): NammaYatriEstimateResult[] {
  const night = forceNight || isNightFareIST();

  return EXACT_NAMMA_YATRI_RATES.map((cfg) => {
    const speedKmh = distanceKm / (durationMin / 60);

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

    // Congestion Surcharge:
    // - If surgeMultiplier is 1.0, congestion charge is 0
    // - If surgeMultiplier > 1.0, scale the baseline congestion charge by the multiplier
    let congestionPercentage = cfg.congestionPercentage || 0;
    if (surgeMultiplier <= 1.0) {
      congestionPercentage = 0;
    } else {
      congestionPercentage = Math.round(congestionPercentage * surgeMultiplier);
      
      // Highway speed scaling (if speed > 30 km/h)
      if (speedKmh > 30) {
        if (cfg.vehicleType === "AC_CAB") congestionPercentage = 0;
        else if (cfg.vehicleType === "SEDAN_PREMIUM") congestionPercentage = 10;
        else if (cfg.vehicleType === "XL_CAB") congestionPercentage = 4.5;
      }
    }

    const congestionCharge = congestionPercentage > 0
      ? Math.round((cfg.minFare + distanceFare) * (congestionPercentage / 100))
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
        congestionPercentage: congestionPercentage > 0 ? congestionPercentage : undefined,
        nightSurcharge: round2(nightSurcharge),
        total: Math.round(total),
      },
    };
  });
}
