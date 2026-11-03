/**
 * Expanded Ghana Stock Exchange (GSE) Market Engine
 *
 * Universal Educational Framing:
 * All market data, index indicators, and trading structures provided here
 * are purely educational. Kubes NEVER provides stock recommendations,
 * price targets, buy/sell directives, or investment advice. See SOP §7 and §10.
 */
import type { MarketAsset } from "../types/watchlist";

export interface GseIndex {
  symbol: string;
  name: string;
  level: number;
  change: number;
  changePercent: number;
  description: string;
  historicalContext: string;
}

export interface GseMarketStatus {
  isOpen: boolean;
  statusText: "Market Open" | "Market Closed" | "Pre-Trading Session";
  tradingHours: string;
  currentGmtTime: string;
  notes: string;
}

export interface GseMarketOverview {
  marketName: string;
  establishedYear: number;
  location: string;
  depository: string;
  settlementCycle: string;
  regulatoryBody: string;
  totalListedEquities: number;
  tradingCurrency: string;
  indices: GseIndex[];
  educationalTakeaways: string[];
}

export interface GseSectorBreakdown {
  sector: string;
  companiesCount: number;
  symbols: string[];
  description: string;
}

// ---------------------------------------------------------------------------
// Expanded GSE Equities Universe (Curated Educational Profiles)
// ---------------------------------------------------------------------------

export const EXPANDED_GSE_ASSETS: MarketAsset[] = [
  {
    symbol: "MTNGH",
    name: "Scancom PLC (MTN Ghana)",
    assetType: "gh_stock",
    currency: "GHS",
    price: 1.85,
    change24h: 0.03,
    changePercent24h: 1.65,
    market: "GSE (Accra)",
    sector: "Telecommunications & FinTech",
    educationalNotes:
      "MTN Ghana is the largest telecommunications and mobile money network operator in Ghana. Often observed by beginners due to its widespread consumer brand and consistent historical dividend distributions on the Ghana Stock Exchange.",
    riskFactors: [
      "Regulatory policy updates in the telecommunications and mobile money sector.",
      "Macroeconomic currency depreciation affecting foreign equipment procurement.",
    ],
    metrics: {
      marketCapOrSize: "GH₵ 22.7 Billion",
      range52w: "GH₵ 1.40 - GH₵ 1.95",
      dividendYieldOrNote: "Historically pays interim and final dividends",
      tradingHours: "10:00 AM - 3:00 PM GMT",
    },
  },
  {
    symbol: "GCB",
    name: "GCB Bank PLC",
    assetType: "gh_stock",
    currency: "GHS",
    price: 4.2,
    change24h: -0.05,
    changePercent24h: -1.18,
    market: "GSE (Accra)",
    sector: "Commercial Banking",
    educationalNotes:
      "One of Ghana's longest-standing commercial banks with a massive national retail branch footprint. Reflects trends in domestic interest rates, government treasury holdings, and corporate credit performance.",
    riskFactors: [
      "Domestic sovereign debt restructuring exposures and banking sector reserve requirements.",
      "Fluctuations in commercial loan repayment defaults during inflation spikes.",
    ],
    metrics: {
      marketCapOrSize: "GH₵ 1.11 Billion",
      range52w: "GH₵ 3.10 - GH₵ 4.60",
      dividendYieldOrNote: "Varies based on annual capital adequacy thresholds",
      tradingHours: "10:00 AM - 3:00 PM GMT",
    },
  },
  {
    symbol: "TOTAL",
    name: "TotalEnergies Marketing Ghana PLC",
    assetType: "gh_stock",
    currency: "GHS",
    price: 9.8,
    change24h: 0.15,
    changePercent24h: 1.55,
    market: "GSE (Accra)",
    sector: "Energy Distribution",
    educationalNotes:
      "A leading petroleum products distributor and retail service station network across Ghana. Its revenue correlates with domestic vehicular transport volumes and global refined fuel pricing dynamics.",
    riskFactors: [
      "Volatility in global crude import costs and national petroleum pricing deregulation policies.",
      "Foreign exchange volatility affecting bulk fuel importation margins.",
    ],
    metrics: {
      marketCapOrSize: "GH₵ 1.09 Billion",
      range52w: "GH₵ 6.80 - GH₵ 10.20",
      dividendYieldOrNote: "Historically regular dividend payer",
      tradingHours: "10:00 AM - 3:00 PM GMT",
    },
  },
  {
    symbol: "EGH",
    name: "Ecobank Ghana PLC",
    assetType: "gh_stock",
    currency: "GHS",
    price: 5.5,
    change24h: 0.0,
    changePercent24h: 0.0,
    market: "GSE (Accra)",
    sector: "Pan-African Banking",
    educationalNotes:
      "A prominent Tier-1 bank in Ghana with deep integration into cross-border trade finance and digital banking. Serves as a barometer for West African regional commerce and corporate deposits.",
    riskFactors: [
      "Cross-border currency volatility across regional trading corridors.",
      "Central Bank of Ghana monetary policy and capital preservation requirements.",
    ],
    metrics: {
      marketCapOrSize: "GH₵ 1.77 Billion",
      range52w: "GH₵ 4.80 - GH₵ 6.20",
      dividendYieldOrNote: "Board discretion subject to regulatory reserves",
      tradingHours: "10:00 AM - 3:00 PM GMT",
    },
  },
  {
    symbol: "SCB",
    name: "Standard Chartered Bank Ghana PLC",
    assetType: "gh_stock",
    currency: "GHS",
    price: 18.5,
    change24h: 0.2,
    changePercent24h: 1.09,
    market: "GSE (Accra)",
    sector: "Commercial Banking",
    educationalNotes:
      "One of the oldest financial institutions in Ghana, operating since 1896. Known for servicing multinational corporations, high-net-worth retail banking, and institutional custody services.",
    riskFactors: [
      "Sovereign debt exposure and domestic debt restructuring parameters.",
      "Corporate credit provisioning during tight macroeconomic conditions.",
    ],
    metrics: {
      marketCapOrSize: "GH₵ 2.49 Billion",
      range52w: "GH₵ 14.50 - GH₵ 20.00",
      dividendYieldOrNote: "Subject to Bank of Ghana statutory capital buffers",
      tradingHours: "10:00 AM - 3:00 PM GMT",
    },
  },
  {
    symbol: "GOIL",
    name: "GOIL PLC",
    assetType: "gh_stock",
    currency: "GHS",
    price: 1.5,
    change24h: -0.02,
    changePercent24h: -1.32,
    market: "GSE (Accra)",
    sector: "Energy Distribution",
    educationalNotes:
      "The premier indigenous oil and gas marketing entity in Ghana with the country's largest service station footprint. Teaches learners how domestic retail fuel volume, bunkering, and bitumen supplies influence cash flows.",
    riskFactors: [
      "Petroleum pricing deregulatory competition from private oil marketing firms.",
      "National bulk transportation logistics and depot inventory carrying costs.",
    ],
    metrics: {
      marketCapOrSize: "GH₵ 587 Million",
      range52w: "GH₵ 1.25 - GH₵ 1.75",
      dividendYieldOrNote: "Historically maintains consistent modest dividend payouts",
      tradingHours: "10:00 AM - 3:00 PM GMT",
    },
  },
  {
    symbol: "UNIL",
    name: "Unilever Ghana PLC",
    assetType: "gh_stock",
    currency: "GHS",
    price: 8.25,
    change24h: 0.1,
    changePercent24h: 1.23,
    market: "GSE (Accra)",
    sector: "Consumer FMCG & Manufacturing",
    educationalNotes:
      "A leading manufacturer of personal care, home care, and household staples. Teaches how raw material import expenses, domestic factory operations, and everyday consumer purchasing habits affect corporate balance sheets.",
    riskFactors: [
      "Heavy reliance on imported raw ingredients subject to GHS/USD foreign exchange swings.",
      "Pressure on household disposable income leading to consumer brand substitution.",
    ],
    metrics: {
      marketCapOrSize: "GH₵ 515 Million",
      range52w: "GH₵ 6.50 - GH₵ 9.00",
      dividendYieldOrNote: "Board discretion based on net operational profitability",
      tradingHours: "10:00 AM - 3:00 PM GMT",
    },
  },
  {
    symbol: "FML",
    name: "Fan Milk PLC",
    assetType: "gh_stock",
    currency: "GHS",
    price: 3.15,
    change24h: 0.0,
    changePercent24h: 0.0,
    market: "GSE (Accra)",
    sector: "Consumer FMCG & Manufacturing",
    educationalNotes:
      "A renowned Ghanaian dairy and frozen confectionery brand under Danone ownership. Illustrates the dynamics of consumer impulse purchasing, cold-chain distribution logistics, and street vendor sales models.",
    riskFactors: [
      "Cold-chain electrical power stability and commercial cooling distribution expenses.",
      "Milk powder and sugar import pricing exposure.",
    ],
    metrics: {
      marketCapOrSize: "GH₵ 366 Million",
      range52w: "GH₵ 2.80 - GH₵ 3.50",
      dividendYieldOrNote: "Determined at annual general meetings based on operating performance",
      tradingHours: "10:00 AM - 3:00 PM GMT",
    },
  },
  {
    symbol: "CAL",
    name: "CalBank PLC",
    assetType: "gh_stock",
    currency: "GHS",
    price: 0.45,
    change24h: 0.01,
    changePercent24h: 2.27,
    market: "GSE (Accra)",
    sector: "Commercial Banking",
    educationalNotes:
      "A commercial bank known for digital banking innovation and financing domestic small-to-medium enterprises (SMEs). Highlights banking recovery cycles, capital restoration rights issues, and corporate loan restructurings.",
    riskFactors: [
      "High Non-Performing Loan (NPL) exposure in small commercial enterprise segments.",
      "Dilution from capital recapitalization rights issues.",
    ],
    metrics: {
      marketCapOrSize: "GH₵ 310 Million",
      range52w: "GH₵ 0.35 - GH₵ 0.65",
      dividendYieldOrNote: "Preserving regulatory capital; distributions suspended during capital recovery",
      tradingHours: "10:00 AM - 3:00 PM GMT",
    },
  },
  {
    symbol: "BOPP",
    name: "Benso Oil Palm Plantation PLC",
    assetType: "gh_stock",
    currency: "GHS",
    price: 21.0,
    change24h: 0.5,
    changePercent24h: 2.44,
    market: "GSE (Accra)",
    sector: "Agribusiness & Plantation",
    educationalNotes:
      "One of the leading agribusinesses listed on the GSE, producing crude palm oil and palm kernels in the Western Region. Teaches learners how agricultural commodity cycles, global vegetable oil prices, and local processing demand impact plantation returns.",
    riskFactors: [
      "Rainfall and seasonal crop yield fluctuations.",
      "Global crude palm oil (CPO) benchmark pricing trends on international commodity exchanges.",
    ],
    metrics: {
      marketCapOrSize: "GH₵ 730 Million",
      range52w: "GH₵ 16.00 - GH₵ 23.50",
      dividendYieldOrNote: "Historically known for substantial dividend payouts during strong commodity cycles",
      tradingHours: "10:00 AM - 3:00 PM GMT",
    },
  },
  {
    symbol: "EGL",
    name: "Enterprise Group PLC",
    assetType: "gh_stock",
    currency: "GHS",
    price: 2.3,
    change24h: -0.01,
    changePercent24h: -0.43,
    market: "GSE (Accra)",
    sector: "Financial Services & Insurance",
    educationalNotes:
      "A premier non-banking financial services holding company in Ghana offering life assurance, property and casualty insurance, pensions administration, and real estate development. Demonstrates long-term actuarial pooling and premium underwriting reserves.",
    riskFactors: [
      "Regulatory solvency margins and insurance claims loss ratios.",
      "Investment return volatility on underlying pension and life reserve asset pools.",
    ],
    metrics: {
      marketCapOrSize: "GH₵ 393 Million",
      range52w: "GH₵ 1.90 - GH₵ 2.70",
      dividendYieldOrNote: "Maintains conservative periodic dividend policy based on consolidated group performance",
      tradingHours: "10:00 AM - 3:00 PM GMT",
    },
  },
];

// ---------------------------------------------------------------------------
// GSE Benchmark Indices
// ---------------------------------------------------------------------------

export const GSE_BENCHMARK_INDICES: GseIndex[] = [
  {
    symbol: "GSE-CI",
    name: "GSE Composite Index",
    level: 4325.8,
    change: 18.4,
    changePercent: 0.43,
    description:
      "The benchmark index measuring the overall performance of all listed ordinary shares on the Ghana Stock Exchange.",
    historicalContext:
      "Calculated based on market capitalization weighting. Serves as the primary temperature check for the broad Ghanaian equity market.",
  },
  {
    symbol: "GSE-FSI",
    name: "GSE Financial Stock Index",
    level: 3110.25,
    change: -4.1,
    changePercent: -0.13,
    description:
      "Tracks the performance of financial institutions (banks, insurers, and financial holding firms) listed on the GSE.",
    historicalContext:
      "Because financial services represent a substantial share of GSE liquidity and market depth, this specialized index reveals banking sector momentum.",
  },
];

// ---------------------------------------------------------------------------
// Market Schedule & Status Logic (10:00 AM - 3:00 PM GMT, Monday - Friday)
// ---------------------------------------------------------------------------

export function getGseMarketStatus(targetDate?: Date): GseMarketStatus {
  const d = targetDate ?? new Date();

  // Get GMT time
  const dayOfWeek = d.getUTCDay(); // 0 = Sun, 6 = Sat
  const hours = d.getUTCHours();
  const minutes = d.getUTCMinutes();
  const totalMinutes = hours * 60 + minutes;

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isPreOpen = !isWeekend && totalMinutes >= 9 * 60 + 30 && totalMinutes < 10 * 60;
  const isRegularSession = !isWeekend && totalMinutes >= 10 * 60 && totalMinutes < 15 * 60;

  const currentGmtTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} GMT`;

  if (isRegularSession) {
    return {
      isOpen: true,
      statusText: "Market Open",
      tradingHours: "10:00 AM – 3:00 PM GMT (Mon–Fri)",
      currentGmtTime,
      notes: "The GSE Automated Trading System (ATS) is currently executing matching orders for listed equities.",
    };
  }

  if (isPreOpen) {
    return {
      isOpen: false,
      statusText: "Pre-Trading Session",
      tradingHours: "10:00 AM – 3:00 PM GMT (Mon–Fri)",
      currentGmtTime,
      notes: "Orders may be entered and validated by Licensed Dealing Members before regular auction matching begins at 10:00 AM GMT.",
    };
  }

  return {
    isOpen: false,
    statusText: "Market Closed",
    tradingHours: "10:00 AM – 3:00 PM GMT (Mon–Fri)",
    currentGmtTime,
    notes: isWeekend
      ? "The GSE is closed on weekends. Regular trading resumes Monday at 10:00 AM GMT."
      : "The trading session has ended for today. Orders can be submitted to licensed brokers for the next business day's opening.",
  };
}

// ---------------------------------------------------------------------------
// GSE Market Overview & Structural Education
// ---------------------------------------------------------------------------

export function getGseMarketOverview(): GseMarketOverview {
  const gseAssets = getExpandedGseAssets();

  return {
    marketName: "Ghana Stock Exchange (GSE)",
    establishedYear: 1989,
    location: "Accra, Ghana (Cedi House / Heritage Towers)",
    depository: "Central Securities Depository (CSD) Ghana LTD",
    settlementCycle: "T+3 (Transaction day plus three business days)",
    regulatoryBody: "Securities and Exchange Commission (SEC) Ghana",
    totalListedEquities: gseAssets.length,
    tradingCurrency: "Ghana Cedi (GH₵)",
    indices: GSE_BENCHMARK_INDICES,
    educationalTakeaways: [
      "The GSE provides a transparent public marketplace for Ghanaian enterprises to raise long-term capital from individual and institutional savers.",
      "Ownership is 100% paperless: All shares are held electronically in the Central Securities Depository (CSD), linked to the investor's Ghana Card and bank/MoMo account.",
      "Trading is mediated strictly through SEC-licensed brokers (Licensed Dealing Members). Individuals cannot trade directly on the exchange floor or ATS without a brokerage account.",
      "Cash dividends declared by listed companies are paid directly into the investor's verified Mobile Money or local bank account through the CSD registry.",
    ],
  };
}

// ---------------------------------------------------------------------------
// Filter and Retrieve GSE Assets
// ---------------------------------------------------------------------------

export function getExpandedGseAssets(): MarketAsset[] {
  return EXPANDED_GSE_ASSETS;
}

export function getGseAssetBySymbol(symbol: string): MarketAsset | undefined {
  if (!symbol) return undefined;
  const clean = symbol.trim().toUpperCase();
  return EXPANDED_GSE_ASSETS.find((a) => a.symbol.toUpperCase() === clean);
}

// ---------------------------------------------------------------------------
// Sector Breakdown
// ---------------------------------------------------------------------------

export function getGseSectorBreakdown(): GseSectorBreakdown[] {
  const gseAssets = getExpandedGseAssets();
  const map = new Map<string, string[]>();

  for (const asset of gseAssets) {
    const sector = asset.sector;
    const existing = map.get(sector) || [];
    existing.push(asset.symbol);
    map.set(sector, existing);
  }

  const sectorDescriptions: Record<string, string> = {
    "Commercial Banking":
      "Deposit-taking institutions facilitating commercial credit, foreign exchange, and treasury operations.",
    "Pan-African Banking":
      "Financial institutions with regional cross-border networks and multinational treasury desks.",
    "Telecommunications & FinTech":
      "Mobile voice, broadband, data, and digital mobile payment ecosystems.",
    "Energy Distribution":
      "Petroleum product distribution, lubricants, bulk storage, and retail fuel service networks.",
    "Consumer FMCG & Manufacturing":
      "Producers of packaged food, beverages, hygiene, and domestic consumer essentials.",
    "Agribusiness & Plantation":
      "Cultivation, harvesting, and processing of agricultural export and edible oil commodities.",
    "Financial Services & Insurance":
      "Life assurance, general insurance, pension trusteeship, and asset management.",
  };

  const results: GseSectorBreakdown[] = [];
  for (const [sector, symbols] of map.entries()) {
    results.push({
      sector,
      companiesCount: symbols.length,
      symbols,
      description:
        sectorDescriptions[sector] ||
        "Key economic sector represented on the Ghana Stock Exchange.",
    });
  }

  return results.sort((a, b) => b.companiesCount - a.companiesCount);
}

// ---------------------------------------------------------------------------
// Practical Steps: How Trading Works in Ghana
// ---------------------------------------------------------------------------

export interface GseHowToBuyStep {
  step: number;
  title: string;
  description: string;
  keyDetails: string[];
}

export const GSE_TRADING_STEPS: GseHowToBuyStep[] = [
  {
    step: 1,
    title: "Obtain a Central Securities Depository (CSD) Account",
    description:
      "All physical share certificates were dematerialized in Ghana. You must hold an electronic CSD account before acquiring any shares.",
    keyDetails: [
      "Requires a valid Ghana Card (National Identification).",
      "Opened free of charge through any SEC-licensed stockbroker or bank investment arm.",
      "Generates a unique CSD Account Number linked to your personal identity.",
    ],
  },
  {
    step: 2,
    title: "Select a Licensed Dealing Member (Stockbroker)",
    description:
      "Trading on the GSE is carried out exclusively through licensed brokers approved by the SEC Ghana.",
    keyDetails: [
      "Check the SEC Ghana directory to confirm the broker is active and licensed in good standing.",
      "Most modern brokers offer mobile apps, USSD (*code#), or web portals to submit orders.",
      "Connect your Ghana Cedi bank account or Mobile Money (MTN MoMo, Telecel Cash) for wallet funding.",
    ],
  },
  {
    step: 3,
    title: "Place a Limit or Market Order",
    description:
      "Instruct your broker with the company symbol, quantity of shares, and purchase price parameters.",
    keyDetails: [
      "Market order: Executes at the prevailing best available ask price during trading hours (10 AM - 3 PM GMT).",
      "Limit order: Executes only if the market price matches or improves upon your specified limit.",
      "GSE settlement takes place on a T+3 timeline (settled 3 business days following trade execution).",
    ],
  },
  {
    step: 4,
    title: "Receive Dividends and Corporate Notices",
    description:
      "When companies declare cash dividends from net earnings, funds flow automatically to your registered payment channel.",
    keyDetails: [
      "Dividends are credited straight to your linked Mobile Money wallet or bank account.",
      "Dividends on GSE equities are subject to a final 8% withholding tax under Ghana tax regulations.",
      "Annual General Meeting (AGM) proxy materials and annual financial reports are delivered electronically.",
    ],
  },
];
