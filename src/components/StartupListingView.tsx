import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Coins, 
  FileText, 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  ArrowRight, 
  Sliders, 
  Calculator, 
  Layers, 
  TrendingUp, 
  Users, 
  PieChart as PieChartIcon, 
  Lock, 
  FileCheck, 
  Sparkles, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  Plus,
  Trash2,
  Download,
  AlertCircle,
  BarChart3,
  Search
} from 'lucide-react';
import { StartupListingApplication, SMEStock, TokenizationParams, TokenizationResult } from '../types';
import { PaginationBar } from './PaginationBar';
import { SwipeableContainer } from './SwipeableContainer';
import { BaseRWAManagementModal } from './BaseRWAManagementModal';

interface StartupListingViewProps {
  onAddStockToListing?: (newStock: SMEStock) => void;
  onNavigateToShares?: () => void;
}


const SAMPLE_APPLICATIONS: StartupListingApplication[] = [
  {
    id: 'app-bamba',
    companyName: 'Bamba ColdChain Logistics',
    tradingName: 'Bamba Agri RWA Ltd',
    ticker: 'BAMBA.zx',
    logoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=200&q=80',
    sector: 'Logistics',
    country: 'Zimbabwe',
    city: 'Harare',
    website: 'https://bamba-logistics.co.zw',
    foundedYear: 2022,
    founders: [
      { name: 'Kudzai Marere', role: 'CEO & Founder', email: 'kudzai@bamba.co.zw' },
      { name: 'Vimbai Ndlovu', role: 'COO & Logistics Lead', email: 'vimbai@bamba.co.zw' }
    ],
    problem: '35% of horticultural produce in Mashonaland spoils before reaching Harare and export hubs due to lack of refrigerated cold transport.',
    solution: 'Fleet of 18 solar-refrigerated IoT trucks and decentralized cold hubs powered by Pay-As-You-Store smart contracts.',
    tractionDescription: '$420,000 annualized GMV, 140 commercial farmer clients, 28% month-over-month volume growth.',
    stage: 'Seed',
    askAmountUSD: 250000,
    valuationUSD: 2000000,
    dataroom: {
      pitchDeckSummary: 'Series Seed Pitch: Building Sub-Saharan Africa’s largest decentralized cold chain transport network tokenized on Base L2.',
      pitchDeckFileName: 'Bamba_ColdChain_Seed_Deck_2026.pdf',
      capTableSummary: [
        { shareholder: 'Kudzai Marere (Founder)', sharesCount: 6000000, equityPercentage: 60, classType: 'Common Stock' },
        { shareholder: 'Vimbai Ndlovu (Co-Founder)', sharesCount: 2000000, equityPercentage: 20, classType: 'Common Stock' },
        { shareholder: 'Early Seed Angel Syndicate', sharesCount: 2000000, equityPercentage: 20, classType: 'Preferred SAFE' }
      ],
      financialModel: {
        revenueUSD: 380000,
        mrrUSD: 34500,
        annualBurnRateUSD: 140000,
        ebitdaUSD: 95000,
        grossMarginPercent: 44,
        projections: [
          { year: '2026', revenue: '$520,000', ebitda: '$140,000' },
          { year: '2027', revenue: '$1,450,000', ebitda: '$490,000' },
          { year: '2028', revenue: '$3,800,000', ebitda: '$1,350,000' }
        ]
      },
      complianceChecklist: {
        incorporationCertificate: true,
        taxClearanceZimra: true,
        seczimPreCheck: true,
        auditedFinancials: true,
        ipAssignment: true,
        rwaCustodyAgreement: true
      },
      uploadedDocuments: [
        { id: 'doc-1', name: 'CIPC_Certificate_Of_Incorporation.pdf', category: 'legal', size: '1.4 MB', uploadedAt: '2026-08-10', hashSha256: '0x8f3c...49e1', verified: true },
        { id: 'doc-2', name: 'ZIMRA_Tax_Clearance_2026.pdf', category: 'financials', size: '820 KB', uploadedAt: '2026-08-12', hashSha256: '0x3a1b...29df', verified: true },
        { id: 'doc-3', name: 'Deloitte_Audited_Financials_FY25.pdf', category: 'financials', size: '3.1 MB', uploadedAt: '2026-08-15', hashSha256: '0x991a...fe82', verified: true },
        { id: 'doc-4', name: 'Bamba_ColdChain_Pitch_Deck.pdf', category: 'deck', size: '6.4 MB', uploadedAt: '2026-08-18', hashSha256: '0x12dc...884a', verified: true }
      ]
    },
    tokenization: {
      preMoneyValuationUSD: 2000000,
      totalAuthorizedShares: 10000000,
      equityPercentToTokenize: 15,
      sharesToTokenize: 1500000,
      tokenSupplyToMint: 3000000,
      tokenTicker: 'BAMBA.zx',
      tokenStandard: 'ERC-3643 (Base L2)',
      minInvestmentUSD: 10,
      dividendPolicy: 'Quarterly USDC',
      targetNetwork: 'Base Mainnet'
    },
    tokenizationResult: {
      tokenPriceUSD: 0.10,
      tokenPriceZIG: 2.60,
      tokenizedValuationUSD: 300000,
      publicFloatPercentage: 15,
      foundersRetainedPercentage: 85,
      contractAddress: '0x39a041fB8246Bc7b55E7d45e4129d20c58e99D14',
      seczimCompliant: true,
      orderbookStatus: 'Live Trading',
      allocationSummary: {
        publicPool: 70,
        treasuryReserve: 15,
        founderEscrow: 10,
        liquidityPool: 5
      }
    },
    applicationStatus: 'Live Onchain',
    matchScore: 94,
    submittedAt: '2026-08-20'
  },
  {
    id: 'app-sunpower',
    companyName: 'SunPower Agritech Solutions',
    tradingName: 'SunPower RWA Solar Ltd',
    ticker: 'SPWR.zx',
    logoUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=200&q=80',
    sector: 'Clean Energy',
    country: 'Zimbabwe',
    city: 'Mutare',
    website: 'https://sunpower-zim.co.zw',
    foundedYear: 2023,
    founders: [
      { name: 'Simbarashe Moyo', role: 'CEO', email: 'simba@sunpower-zim.co.zw' }
    ],
    problem: 'Grid instability limits crop irrigation in Eastern Highlands, causing up to 40% yield drop during dry spells.',
    solution: 'Pre-assembled containerized solar irrigation microgrids tokenized per kilowatt output.',
    tractionDescription: '2.4 MW installed capacity across 35 tea & macadamia estates, generating $28,000/mo steady recurring power tariffs.',
    stage: 'Growth SME',
    askAmountUSD: 500000,
    valuationUSD: 4000000,
    dataroom: {
      pitchDeckSummary: 'SunPower Agri Mini-Grids: Tokenizing high-yield agricultural solar infrastructure on ZSE Debtbridge.',
      pitchDeckFileName: 'SunPower_Equity_Token_2026.pdf',
      capTableSummary: [
        { shareholder: 'Simbarashe Moyo', sharesCount: 7500000, equityPercentage: 75, classType: 'Founder Common' },
        { shareholder: 'CleanTech Seed Fund', sharesCount: 2500000, equityPercentage: 25, classType: 'Preferred' }
      ],
      financialModel: {
        revenueUSD: 336000,
        mrrUSD: 28000,
        annualBurnRateUSD: 90000,
        ebitdaUSD: 180000,
        grossMarginPercent: 68,
        projections: [
          { year: '2026', revenue: '$650,000', ebitda: '$380,000' },
          { year: '2027', revenue: '$1,800,000', ebitda: '$1,100,000' }
        ]
      },
      complianceChecklist: {
        incorporationCertificate: true,
        taxClearanceZimra: true,
        seczimPreCheck: true,
        auditedFinancials: true,
        ipAssignment: true,
        rwaCustodyAgreement: true
      },
      uploadedDocuments: [
        { id: 'doc-sp-1', name: 'ZERA_Energy_Regulator_License.pdf', category: 'legal', size: '2.1 MB', uploadedAt: '2026-08-05', hashSha256: '0x17fa...9921', verified: true },
        { id: 'doc-sp-2', name: 'ZIMRA_Tax_Clearance_Cert.pdf', category: 'financials', size: '650 KB', uploadedAt: '2026-08-08', hashSha256: '0xdd43...112a', verified: true }
      ]
    },
    tokenization: {
      preMoneyValuationUSD: 4000000,
      totalAuthorizedShares: 10000000,
      equityPercentToTokenize: 20,
      sharesToTokenize: 2000000,
      tokenSupplyToMint: 5000000,
      tokenTicker: 'SPWR.zx',
      tokenStandard: 'ERC-3643 (Base L2)',
      minInvestmentUSD: 20,
      dividendPolicy: 'Quarterly USDC',
      targetNetwork: 'Base Mainnet'
    },
    tokenizationResult: {
      tokenPriceUSD: 0.16,
      tokenPriceZIG: 4.16,
      tokenizedValuationUSD: 800000,
      publicFloatPercentage: 20,
      foundersRetainedPercentage: 80,
      contractAddress: '0x71cB48E59f9397f2624D1aF289569AcA750Eb786',
      seczimCompliant: true,
      orderbookStatus: 'Under Review (SECZim)',
      allocationSummary: {
        publicPool: 75,
        treasuryReserve: 10,
        founderEscrow: 10,
        liquidityPool: 5
      }
    },
    applicationStatus: 'Under Review (SECZim)',
    matchScore: 91,
    submittedAt: '2026-08-22'
  }
];

export const StartupListingView: React.FC<StartupListingViewProps> = ({ onAddStockToListing, onNavigateToShares }) => {
  const SUBTABS: ('apply' | 'tokenize' | 'dataroom' | 'matching' | 'directory')[] = ['apply', 'tokenize', 'dataroom', 'matching', 'directory'];
  const [activeSubTab, setActiveSubTab] = useState<'apply' | 'tokenize' | 'dataroom' | 'directory' | 'matching'>('apply');
  const currentPage = SUBTABS.indexOf(activeSubTab) + 1;
  const totalPages = SUBTABS.length;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setActiveSubTab(SUBTABS[page - 1]);
    }
  };

  const handleSwipeLeft = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handleSwipeRight = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };
  const [applications, setApplications] = useState<StartupListingApplication[]>(SAMPLE_APPLICATIONS);
  const [selectedAppId, setSelectedAppId] = useState<string>('app-bamba');
  const [isRwaModalOpen, setIsRwaModalOpen] = useState(false);

  // Form State for creating a new startup application
  const [companyName, setCompanyName] = useState('');
  const [tradingName, setTradingName] = useState('');
  const [ticker, setTicker] = useState('');
  const [sector, setSector] = useState<StartupListingApplication['sector']>('AgriTech');
  const [country, setCountry] = useState('Zimbabwe');
  const [city, setCity] = useState('Harare');
  const [website, setWebsite] = useState('');
  const [foundedYear, setFoundedYear] = useState(2024);
  const [founderName, setFounderName] = useState('Tendai Moyo');
  const [founderEmail, setFounderEmail] = useState('tendai.moyo@zeex.co.zw');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [traction, setTraction] = useState('');
  const [stage, setStage] = useState<StartupListingApplication['stage']>('Seed');
  const [askAmountUSD, setAskAmountUSD] = useState(200000);
  const [preMoneyValuationUSD, setPreMoneyValuationUSD] = useState(1500000);

  // Tokenization Engine interactive parameters
  const [totalAuthorizedShares, setTotalAuthorizedShares] = useState(10000000);
  const [equityPercentToTokenize, setEquityPercentToTokenize] = useState(20);
  const [tokenSupplyToMint, setTokenSupplyToMint] = useState(2000000);
  const [tokenStandard, setTokenStandard] = useState<TokenizationParams['tokenStandard']>('ERC-3643 (Base L2)');
  const [dividendPolicy, setDividendPolicy] = useState<TokenizationParams['dividendPolicy']>('Quarterly USDC');
  const [targetNetwork, setTargetNetwork] = useState<TokenizationParams['targetNetwork']>('Base Mainnet');
  const [minInvestmentUSD, setMinInvestmentUSD] = useState(10);

  // Dataroom State
  const [pitchDeckSummary, setPitchDeckSummary] = useState(
    '1. The Opportunity: Digitizing agribusiness value chains across Southern Africa.\n2. Market Size: $8.4B TAM with high unbanked SME penetration.\n3. Business Model: 2.5% transaction fee on settlement & asset-backed token custody.\n4. Unit Economics: 65% gross margins with 14-month customer payback period.'
  );
  const [capTable, setCapTable] = useState([
    { shareholder: 'Founder & Core Team', sharesCount: 7000000, equityPercentage: 70, classType: 'Common Stock' },
    { shareholder: 'Advisors & ESOP Pool', sharesCount: 1000000, equityPercentage: 10, classType: 'Options Pool' },
    { shareholder: 'Target ZEEX Public RWA Token Pool', sharesCount: 2000000, equityPercentage: 20, classType: 'Tokenized Equity (ERC-3643)' }
  ]);
  const [complianceState, setComplianceState] = useState({
    incorporationCertificate: true,
    taxClearanceZimra: true,
    seczimPreCheck: true,
    auditedFinancials: false,
    ipAssignment: true,
    rwaCustodyAgreement: false
  });
  const [uploadedDocs, setUploadedDocs] = useState([
    { id: 'u-1', name: 'SECZim_Applicant_Charter.pdf', category: 'legal' as const, size: '1.2 MB', uploadedAt: 'Today', hashSha256: '0x49c1...91ba', verified: true },
    { id: 'u-2', name: 'ZIMRA_Tax_Clearance_2026.pdf', category: 'financials' as const, size: '940 KB', uploadedAt: 'Today', hashSha256: '0x81ee...20fa', verified: true }
  ]);

  // Deployment feedback
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState<string | null>(null);

  // Algorithmic calculations
  const USD_TO_ZIG_RATE = 26.0;
  
  // Real-world Asset Tokenization Calculations
  const calculatedSharesToTokenize = Math.round((totalAuthorizedShares * equityPercentToTokenize) / 100);
  const tokenizedPoolValuationUSD = (preMoneyValuationUSD * equityPercentToTokenize) / 100;
  const tokenPriceUSD = tokenSupplyToMint > 0 ? tokenizedPoolValuationUSD / tokenSupplyToMint : 0;
  const tokenPriceZIG = tokenPriceUSD * USD_TO_ZIG_RATE;
  const foundersRetainedPercentage = 100 - equityPercentToTokenize;

  // Active selected application
  const selectedApp = applications.find(a => a.id === selectedAppId) || applications[0];

  // Handler for uploading files
  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const newDoc = {
        id: `doc-${Date.now()}`,
        name: file.name,
        category: 'legal' as const,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadedAt: 'Just now',
        hashSha256: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
        verified: true
      };
      setUploadedDocs(prev => [newDoc, ...prev]);
    }
  };

  // Handler for token minting and ZEEX listing
  const handleDeployAndTokenize = () => {
    setIsMinting(true);
    setMintSuccess(null);

    const cleanTicker = (ticker || companyName.slice(0, 4)).toUpperCase().replace(/[^A-Z]/g, '') + '.zx';
    const cleanTradingName = tradingName || `${companyName || 'Enterprise'} Tokenized Equity`;
    const cleanCompanyName = companyName || 'New Onchain Enterprise';

    setTimeout(() => {
      const contractAddr = `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;

      const tokenResult: TokenizationResult = {
        tokenPriceUSD: Number(tokenPriceUSD.toFixed(3)),
        tokenPriceZIG: Number(tokenPriceZIG.toFixed(2)),
        tokenizedValuationUSD: tokenizedPoolValuationUSD,
        publicFloatPercentage: equityPercentToTokenize,
        foundersRetainedPercentage: foundersRetainedPercentage,
        contractAddress: contractAddr,
        seczimCompliant: true,
        orderbookStatus: 'Live Trading',
        allocationSummary: {
          publicPool: 70,
          treasuryReserve: 15,
          founderEscrow: 10,
          liquidityPool: 5
        }
      };

      const newApplication: StartupListingApplication = {
        id: `app-${Date.now()}`,
        companyName: cleanCompanyName,
        tradingName: cleanTradingName,
        ticker: cleanTicker,
        logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80',
        sector: sector,
        country: country,
        city: city,
        website: website || 'https://zeex.co.zw/listed/' + cleanTicker.toLowerCase(),
        foundedYear: foundedYear,
        founders: [{ name: founderName, role: 'Founder & CEO', email: founderEmail }],
        problem: problem || 'High cost of traditional banking finance and lack of transparent secondary liquidity.',
        solution: solution || 'SECZim licensed Real World Asset tokenization on Base L2 blockchain.',
        tractionDescription: traction || '$350k annual turnover, strong domestic client traction.',
        stage: stage,
        askAmountUSD: tokenizedPoolValuationUSD,
        valuationUSD: preMoneyValuationUSD,
        dataroom: {
          pitchDeckSummary: pitchDeckSummary,
          pitchDeckFileName: `${cleanTicker}_PitchDeck.pdf`,
          capTableSummary: capTable,
          financialModel: {
            revenueUSD: 300000,
            mrrUSD: 25000,
            annualBurnRateUSD: 80000,
            ebitdaUSD: 90000,
            grossMarginPercent: 55,
            projections: [
              { year: '2026', revenue: `$${(preMoneyValuationUSD * 0.4).toLocaleString()}`, ebitda: `$${(preMoneyValuationUSD * 0.15).toLocaleString()}` },
              { year: '2027', revenue: `$${(preMoneyValuationUSD * 0.9).toLocaleString()}`, ebitda: `$${(preMoneyValuationUSD * 0.35).toLocaleString()}` }
            ]
          },
          complianceChecklist: complianceState,
          uploadedDocuments: uploadedDocs
        },
        tokenization: {
          preMoneyValuationUSD,
          totalAuthorizedShares,
          equityPercentToTokenize,
          sharesToTokenize: calculatedSharesToTokenize,
          tokenSupplyToMint,
          tokenTicker: cleanTicker,
          tokenStandard,
          minInvestmentUSD,
          dividendPolicy,
          targetNetwork
        },
        tokenizationResult: tokenResult,
        applicationStatus: 'Live Onchain',
        matchScore: 96,
        submittedAt: 'Just now'
      };

      setApplications(prev => [newApplication, ...prev]);
      setSelectedAppId(newApplication.id);
      setIsMinting(false);
      setMintSuccess(contractAddr);

      // Add to public shares view if handler provided
      if (onAddStockToListing) {
        const newStock: SMEStock = {
          id: newApplication.id,
          name: cleanTradingName,
          ticker: cleanTicker,
          sector: sector,
          priceUSD: Number(tokenPriceUSD.toFixed(3)),
          priceZIG: Number(tokenPriceZIG.toFixed(2)),
          change24h: 3.5,
          marketCap: `$${(preMoneyValuationUSD / 1000000).toFixed(1)}M`,
          dividendYield: 10.5,
          fractionalUnitsAvailable: tokenSupplyToMint,
          backingTrust: `ZSE Debtbridge Trust #${Math.floor(100 + Math.random() * 900)}`,
          description: solution || `${cleanCompanyName} tokenized equity listed under SECZim regulatory sandbox on Base L2.`,
          riskRating: 'Growth',
          image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'
        };
        onAddStockToListing(newStock);
      }
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>SECZim Licensed Issuer Portal</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Base L2 ERC-3643 Standard
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              ZEEX Startup Listing & RWA Tokenization Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Upload your business profile, dealroom documents, and audited financials. Tokenize equity or revenue share into compliant fractional security tokens traded across Zimbabwe and global onchain liquidity pools.
            </p>
          </div>

          {/* Action Button & Metrics */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => setIsRwaModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-md border border-blue-400/30 flex items-center space-x-2 cursor-pointer transition-all shrink-0"
            >
              <Coins className="w-4 h-4 text-blue-200" />
              <span>Base RWA Specification Manager</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80 shrink-0 text-xs">
              <div className="text-center px-3 border-r border-slate-700">
                <div className="text-[10px] text-slate-400 font-medium uppercase">Active Listings</div>
                <div className="text-sm font-extrabold text-blue-400">14 SMEs</div>
              </div>
              <div className="text-center px-3">
                <div className="text-[10px] text-slate-400 font-medium uppercase">Token Standard</div>
                <div className="text-xs font-bold text-emerald-400">ERC-3643</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('apply')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeSubTab === 'apply'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>1. Business Profile & Listing</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tokenize')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeSubTab === 'tokenize'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>2. RWA Tokenization Engine</span>
          <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-500 text-white font-black">
            Algo
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('dataroom')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeSubTab === 'dataroom'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>3. Dealroom & Compliance</span>
        </button>

        <button
          onClick={() => setActiveSubTab('matching')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeSubTab === 'matching'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>4. Investor Matching (ZeexMatch)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('directory')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeSubTab === 'directory'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>5. Listed Startups ({applications.length})</span>
        </button>
      </div>

      <SwipeableContainer
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        showMobileSwipeIndicator={true}
      >


      {/* 1. APPLY / BUSINESS PROFILE TAB */}
      {activeSubTab === 'apply' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Left 2 Cols: Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Startup & SME Business Application</h2>
              <p className="text-xs text-slate-500 mt-1">
                Provide verifiable company details to begin the ZEEX listing process under SECZim sandbox regulations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Registered Company Name *</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Bamba ColdChain Logistics Ltd"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Desired Stock / Token Ticker *</label>
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  placeholder="e.g., BAMBA.zx or AGRI.zx"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Industry Sector *</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="AgriTech">AgriTech & Agro-Processing</option>
                  <option value="FinTech & Payments">FinTech & Payments</option>
                  <option value="Clean Energy">Clean Energy & Solar RWA</option>
                  <option value="Mining & Metals">Mining & Strategic Minerals</option>
                  <option value="Logistics">Logistics & Supply Chain</option>
                  <option value="HealthTech">HealthTech & Pharmaceuticals</option>
                  <option value="Real Estate RWA">Real Estate & Infrastructure RWA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Growth Stage *</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="Pre-Seed">Pre-Seed ($50k - $150k)</option>
                  <option value="Seed">Seed ($150k - $500k)</option>
                  <option value="Series A">Series A ($500k - $2M)</option>
                  <option value="Growth SME">Growth SME / Pre-IPO ($2M+)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pre-Money Valuation (USD) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    value={preMoneyValuationUSD}
                    onChange={(e) => setPreMoneyValuationUSD(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Synced: ZIG {(preMoneyValuationUSD * USD_TO_ZIG_RATE).toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Capital Ask (USD) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    value={askAmountUSD}
                    onChange={(e) => setAskAmountUSD(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Headquarters City & Country</label>
                <input
                  type="text"
                  value={`${city}, ${country}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(',');
                    setCity(parts[0] || 'Harare');
                    setCountry(parts[1] ? parts[1].trim() : 'Zimbabwe');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Company Website / Data Link</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourcompany.co.zw"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">The Problem You Are Solving *</label>
                <textarea
                  rows={2}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Describe the regional economic or industrial bottleneck..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Your Solution & Product Architecture *</label>
                <textarea
                  rows={2}
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="Explain how your company delivers value and captures margin..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Key Traction & Financial Metrics *</label>
                <input
                  type="text"
                  value={traction}
                  onChange={(e) => setTraction(e.target.value)}
                  placeholder="e.g., $380,000 GMV, 140 enterprise clients, 28% MoM growth"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-100 gap-3">
              <div className="text-[11px] text-slate-500">
                Step 1 of 3: Next, configure RWA Token Pricing & Dataroom.
              </div>
              <button
                onClick={() => setActiveSubTab('tokenize')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-sm flex items-center space-x-1.5"
              >
                <span>Proceed to Tokenization Engine</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Col: Listing Checklist & SECZim Badges */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">SECZim Regulatory Verification</h3>
              </div>
              <p className="text-xs text-slate-500">
                Every asset tokenized on ZEEX is verified under the Securities and Exchange Commission of Zimbabwe (SECZim) regulatory sandbox framework.
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-700 font-medium">ZSE Debtbridge Custody</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Active 1:1
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-700 font-medium">Fractional Unit Rails</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    ERC-3643 Base
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-700 font-medium">Secondary Market Liquidity</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                    24/7 Automated
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Template Loader */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Fast Start</div>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <h4 className="text-sm font-bold">Load Pre-Configured SME Template</h4>
              <p className="text-xs text-slate-300">
                Populate with tested high-yield Agribusiness or Clean Energy parameters for immediate listing simulation.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setCompanyName('Bamba ColdChain Logistics');
                    setTicker('BAMBA.zx');
                    setSector('Logistics');
                    setStage('Seed');
                    setPreMoneyValuationUSD(2000000);
                    setAskAmountUSD(300000);
                    setProblem('35% agricultural spoilage in transit across Zimbabwe.');
                    setSolution('Solar-powered refrigerated IoT trucks with onchain custody.');
                    setTraction('$420k annualized GMV, 140 commercial farmer clients.');
                  }}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded-xl text-left text-[11px] font-bold transition-colors"
                >
                  🚚 Bamba Logistics
                </button>
                <button
                  onClick={() => {
                    setCompanyName('SunPower Agritech');
                    setTicker('SPWR.zx');
                    setSector('Clean Energy');
                    setStage('Growth SME');
                    setPreMoneyValuationUSD(4000000);
                    setAskAmountUSD(500000);
                    setProblem('Rural grid outages causing 40% crop yield drops.');
                    setSolution('Containerized microgrid solar pumps tokenized per kW.');
                    setTraction('2.4 MW installed, $28,000/mo steady recurring power tariffs.');
                  }}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded-xl text-left text-[11px] font-bold transition-colors"
                >
                  ⚡ SunPower Solar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. RWA TOKENIZATION ENGINE & ALGORITHMIC PRICING TAB */}
      {activeSubTab === 'tokenize' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <Coins className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">Real World Asset (RWA) Tokenization Engine</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select quantity of shares/equity to tokenize. The algorithmic pricing engine calculates par price, market float, and syncs orderbook rates in real-time.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                1 USD = {USD_TO_ZIG_RATE} ZIG
              </span>
            </div>

            {/* Main Interactive Controls Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Interactive Parameters (7 Cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1. Valuation & Equity Slider */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">1. Total Company Valuation (Pre-Money)</span>
                    <span className="text-xs font-extrabold text-blue-600 font-mono">
                      ${preMoneyValuationUSD.toLocaleString()} USD
                    </span>
                  </div>

                  <input
                    type="range"
                    min={250000}
                    max={20000000}
                    step={50000}
                    value={preMoneyValuationUSD}
                    onChange={(e) => setPreMoneyValuationUSD(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>$250,000 (Early Seed)</span>
                    <span>$20,000,000 (Growth SME)</span>
                  </div>
                </div>

                {/* 2. Equity % to Tokenize */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-slate-800">2. Equity / Shares Quantity to Tokenize</span>
                      <p className="text-[11px] text-slate-500">Allocated to public secondary tokenized liquidity pool.</p>
                    </div>
                    <span className="text-sm font-extrabold text-emerald-600 font-mono bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                      {equityPercentToTokenize}% of Company
                    </span>
                  </div>

                  <input
                    type="range"
                    min={5}
                    max={49}
                    step={1}
                    value={equityPercentToTokenize}
                    onChange={(e) => setEquityPercentToTokenize(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>5% (Micro-Float)</span>
                    <span>25% (Standard IPO Float)</span>
                    <span>49% (Maximum Non-Control Float)</span>
                  </div>
                </div>

                {/* 3. Token Supply to Mint & Standard */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">3. Total Tokens to Mint</label>
                    <input
                      type="number"
                      min={100000}
                      max={100000000}
                      step={100000}
                      value={tokenSupplyToMint}
                      onChange={(e) => setTokenSupplyToMint(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="text-[10px] text-slate-500">
                      Standard: 1M - 10M tokens for fractional precision.
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">4. Smart Contract Standard</label>
                    <select
                      value={tokenStandard}
                      onChange={(e) => setTokenStandard(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ERC-3643 (Base L2)">ERC-3643 (Base L2 Permissioned)</option>
                      <option value="ERC-1400 (SECZim Compliant)">ERC-1400 (SECZim Hybrid)</option>
                      <option value="ERC-20 + Identity">ERC-20 + ONCHAINID</option>
                    </select>
                    <div className="text-[10px] text-emerald-600 font-medium">
                      ✓ Instant KYC on transfer whitelist.
                    </div>
                  </div>
                </div>

                {/* 4. Dividend Policy & Minimum Ticket */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">Dividend / Yield Model</label>
                    <select
                      value={dividendPolicy}
                      onChange={(e) => setDividendPolicy(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Quarterly USDC">Quarterly USDC Stablecoin Distribution</option>
                      <option value="Annual Staking Yield">Annual $ZIG Yield Compounding</option>
                      <option value="Revenue Share">Direct 5% Top-Line Revenue Share</option>
                      <option value="Reinvested">100% Growth Reinvestment</option>
                    </select>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">Min Investment Ticket</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">$</span>
                      <input
                        type="number"
                        value={minInvestmentUSD}
                        onChange={(e) => setMinInvestmentUSD(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ≈ {(minInvestmentUSD * USD_TO_ZIG_RATE).toFixed(0)} ZIG per minimum order.
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Real-Time Algorithmic Output (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-6 text-white space-y-5 border border-slate-800 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

                  <div className="flex justify-between items-center border-b border-slate-700/80 pb-3 relative z-10">
                    <div className="flex items-center space-x-2">
                      <Calculator className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Algorithmic Valuation Output</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                      Live Dynamic Peg
                    </span>
                  </div>

                  {/* Big Calculated Price Display */}
                  <div className="space-y-1 relative z-10">
                    <div className="text-[11px] text-slate-400 font-medium">Calculated Par Mint Price per Token:</div>
                    <div className="flex items-baseline space-x-3">
                      <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        ${tokenPriceUSD.toFixed(3)}
                      </div>
                      <div className="text-base sm:text-lg font-bold text-emerald-400">
                        {tokenPriceZIG.toFixed(2)} $ZIG
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Calculated from: ({preMoneyValuationUSD.toLocaleString()} USD × {equityPercentToTokenize}%) ÷ {tokenSupplyToMint.toLocaleString()} tokens
                    </div>
                  </div>

                  {/* Metric Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/80 text-xs relative z-10">
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                      <div className="text-[10px] text-slate-400">Tokenized Capital Raised</div>
                      <div className="text-sm font-extrabold text-white mt-0.5">
                        ${tokenizedPoolValuationUSD.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-emerald-400 font-medium">
                        {(tokenizedPoolValuationUSD * USD_TO_ZIG_RATE).toLocaleString()} ZIG
                      </div>
                    </div>

                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                      <div className="text-[10px] text-slate-400">Public Float vs Founders</div>
                      <div className="text-sm font-extrabold text-blue-300 mt-0.5">
                        {equityPercentToTokenize}% / {foundersRetainedPercentage}%
                      </div>
                      <div className="text-[9px] text-slate-400">Retained Control</div>
                    </div>
                  </div>

                  {/* Token Distribution Model */}
                  <div className="space-y-2 pt-1 text-xs relative z-10">
                    <div className="flex justify-between text-[11px] font-bold text-slate-300">
                      <span>Token Pool Distribution</span>
                      <span>100% Minted</span>
                    </div>

                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                      <div style={{ width: '70%' }} className="bg-emerald-500" title="70% Public Investor Pool"></div>
                      <div style={{ width: '15%' }} className="bg-blue-500" title="15% Treasury Reserve (12m Lock)"></div>
                      <div style={{ width: '10%' }} className="bg-purple-500" title="10% Founder Vesting Escrow"></div>
                      <div style={{ width: '5%' }} className="bg-amber-500" title="5% ZEEX AMM Liquidity Provision"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
                      <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>70% Public Pool</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span>15% Treasury Lock</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        <span>10% Founder Escrow</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span>5% AMM Liquidity</span>
                      </div>
                    </div>
                  </div>

                  {/* Mint Execution Action */}
                  <div className="pt-3 border-t border-slate-700/80 relative z-10 space-y-2">
                    <button
                      onClick={handleDeployAndTokenize}
                      disabled={isMinting}
                      className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      {isMinting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Deploying ERC-3643 Contract on Base L2...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Mint Security Tokens & Launch on ZEEX</span>
                        </>
                      )}
                    </button>

                    {mintSuccess && (
                      <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/40 text-xs text-emerald-300 space-y-1 animate-fade-in">
                        <div className="font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Tokenized Successfully & Live on Base!</span>
                        </div>
                        <div className="font-mono text-[10px] truncate text-slate-300">
                          Contract: {mintSuccess}
                        </div>
                        {onNavigateToShares && (
                          <button
                            onClick={onNavigateToShares}
                            className="mt-1 text-[11px] font-bold text-white hover:underline flex items-center space-x-1"
                          >
                            <span>View Live in ZEEX Shares Marketplace</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. DEALROOM & COMPLIANCE TAB */}
      {activeSubTab === 'dataroom' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-900">Virtual Dealroom & Regulatory Dataroom</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Institutional-grade document repository with SHA-256 cryptographic proofs for accredited investors and SECZim compliance audits.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <label className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-colors shadow-xs flex items-center space-x-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Document</span>
                  <input type="file" onChange={handleSimulatedFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Dataroom Grid: Compliance + Documents + Cap Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Compliance Checklist */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">SECZim Compliance Checklist</h3>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {Object.values(complianceState).filter(Boolean).length}/6 Verified
                  </span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { key: 'incorporationCertificate', label: 'CIPC Incorporation Certificate' },
                    { key: 'taxClearanceZimra', label: 'ZIMRA Tax Clearance Status' },
                    { key: 'seczimPreCheck', label: 'SECZim Sandbox Pre-Approval' },
                    { key: 'auditedFinancials', label: 'Independent 2-Year Financial Audit' },
                    { key: 'ipAssignment', label: 'Proprietary IP Assignment Deed' },
                    { key: 'rwaCustodyAgreement', label: 'ZSE Debtbridge Custody Agreement' }
                  ].map((item) => {
                    const isChecked = (complianceState as any)[item.key];
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          setComplianceState(prev => ({
                            ...prev,
                            [item.key]: !(prev as any)[item.key]
                          }));
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="font-medium">{item.label}</span>
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">Cryptographically Verified Files ({uploadedDocs.length})</h3>
                    <span className="text-[10px] text-slate-500 font-mono">SHA-256 Onchain Stamped</span>
                  </div>

                  <div className="space-y-2">
                    {uploadedDocs.map((doc) => (
                      <div key={doc.id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">{doc.name}</div>
                            <div className="text-[10px] text-slate-400 flex items-center space-x-2 mt-0.5 font-mono">
                              <span>{doc.size}</span>
                              <span>•</span>
                              <span>Hash: {doc.hashSha256}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Verified
                          </span>
                          <button
                            onClick={() => {
                              alert(`Accessing encrypted sandbox record for ${doc.name}`);
                            }}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
                            title="Download / Inspect"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pitch Deck Summary Text Editor */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900">Executive Pitch Summary</label>
                    <span className="text-[10px] text-slate-400">Available to Whitelisted Investors</span>
                  </div>
                  <textarea
                    rows={4}
                    value={pitchDeckSummary}
                    onChange={(e) => setPitchDeckSummary(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. INVESTOR MATCHING (ZeexMatch Engine) */}
      {activeSubTab === 'matching' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-bold text-slate-900">ZeexMatch Investor & Liquidity Matching Engine</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Algorithmically matches tokenized Zimbabwean SMEs with global institutional venture pools, diaspora syndicates, and retail liquidity.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                142 Active Institutional LPs
              </span>
            </div>

            {/* Investor Matches Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Zim Diaspora Wealth Syndicate</h3>
                    <p className="text-[11px] text-slate-500">London & Johannesburg Chapters</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    98% Match
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Sectors:</span>
                    <span className="font-semibold text-slate-800">AgriTech, Logistics</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ticket Size:</span>
                    <span className="font-semibold text-slate-800">$25,000 - $150,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Settlement:</span>
                    <span className="font-semibold text-emerald-600">Base L2 USDC / ZIG</span>
                  </div>
                </div>

                <button
                  onClick={() => alert('Dealroom invite dispatched to Zim Diaspora Wealth Syndicate.')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-xl text-xs transition-colors shadow-2xs"
                >
                  Share Encrypted Dataroom
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Southern Africa Climate Tech Fund</h3>
                    <p className="text-[11px] text-slate-500">Cape Town / Nairobi VC</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    92% Match
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Sectors:</span>
                    <span className="font-semibold text-slate-800">Clean Energy, Solar RWA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ticket Size:</span>
                    <span className="font-semibold text-slate-800">$100,000 - $500,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Settlement:</span>
                    <span className="font-semibold text-blue-600">Smart Escrow SAFE</span>
                  </div>
                </div>

                <button
                  onClick={() => alert('Dealroom invite dispatched to Climate Tech Fund.')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-xl text-xs transition-colors shadow-2xs"
                >
                  Share Encrypted Dataroom
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">ZEEX Retail Public Pool</h3>
                    <p className="text-[11px] text-slate-500">12,400+ WhatsApp & Base Investors</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    100% Instant
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Sectors:</span>
                    <span className="font-semibold text-slate-800">All SECZim Approved</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ticket Size:</span>
                    <span className="font-semibold text-slate-800">$5 - $5,000 (Micro-lots)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Settlement:</span>
                    <span className="font-semibold text-slate-800">EcoCash, InnBucks, Base L2</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveSubTab('tokenize')}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition-colors shadow-2xs"
                >
                  Configure Token Float
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. DIRECTORY OF LISTED STARTUPS TAB */}
      {activeSubTab === 'directory' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Listed Startups & RWA Issuers ({applications.length})</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Explore verified Zimbabwean enterprises with active onchain equity tokens.
                </p>
              </div>

              <button
                onClick={() => setActiveSubTab('apply')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-2xs flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Apply as New Startup</span>
              </button>
            </div>

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {applications.map((app) => (
                <div key={app.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <img
                        src={app.logoUrl}
                        alt={app.companyName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-slate-900">{app.companyName}</h3>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                            {app.ticker}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{app.sector} • {app.city}, {app.country}</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {app.applicationStatus}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {app.solution}
                  </p>

                  <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-slate-200 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">Valuation</div>
                      <div className="font-extrabold text-slate-800">${(app.valuationUSD / 1000000).toFixed(1)}M</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Token Price</div>
                      <div className="font-extrabold text-blue-600">${app.tokenizationResult?.tokenPriceUSD.toFixed(2) || '0.10'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Public Float</div>
                      <div className="font-extrabold text-emerald-600">{app.tokenization.equityPercentToTokenize}%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Match Score: {app.matchScore || 90}%
                    </span>
                    {onNavigateToShares && (
                      <button
                        onClick={onNavigateToShares}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <span>Trade Shares</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </SwipeableContainer>

      {/* Bottom Pagination Bar for Startup Listing Hub */}
      <PaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemName="listing hub steps"
      />

      <BaseRWAManagementModal
        isOpen={isRwaModalOpen}
        onClose={() => setIsRwaModalOpen(false)}
      />
    </div>
  );
};

