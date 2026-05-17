import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { auth, googleProvider, db } from './lib/firebase';
import { 
  signInWithPopup, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { 
  Image as ImageIcon, 
  Video, 
  Mic, 
  History as HistoryIcon, 
  LogOut, 
  LogIn, 
  Zap,
  LayoutDashboard,
  Sparkles,
  Download,
  Trash2,
  ExternalLink,
  Menu,
  Copy,
  ScrollText,
  Film,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'react-hot-toast';
import { cn } from './lib/utils';

// --- Types ---
type Tab = 'image' | 'video' | 'voice' | 'script' | 'captions' | 'history';

interface Generation {
  id: string;
  userId: string;
  type: 'image' | 'video' | 'voice';
  prompt: string;
  url: string;
  createdAt: any;
  metadata?: any;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('image');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Shared state for controls
  const [scriptTone, setScriptTone] = useState('Viral');
  const [captionFormats, setCaptionFormats] = useState(['reels', 'long']);
  const [imgModel, setImgModel] = useState('Flux');
  const [imgGuidance, setImgGuidance] = useState(7.5);
  const [imgSteps, setImgSteps] = useState(50);
  const [vidLength, setVidLength] = useState('2S');
  const [voiceStyle, setVoiceStyle] = useState('dynamic');
  const [voiceCharacter, setVoiceCharacter] = useState('Aura');
  const [voicePitch, setVoicePitch] = useState(1.1);
  const [voiceRate, setVoiceRate] = useState(1.0);
  const [scriptIndustry, setScriptIndustry] = useState('Tech');
  const [scriptGoal, setScriptGoal] = useState('Awareness'); // New: Content goals
  const [captionHashtagCount, setCaptionHashtagCount] = useState(10); // New: Caption density
  const [emojiDensity, setEmojiDensity] = useState('High'); // New: Emoji control

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Successfully logged in!');
    } catch (error: any) {
      toast.error('Login failed: ' + error.message);
    }
  };

  const logout = () => {
    signOut(auth);
    toast.success('Logged out');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-bg-dark text-white selection:bg-brand-primary/30 relative overflow-hidden flex flex-col font-sans">
      <Toaster position="bottom-right" toastOptions={{
        style: { background: '#1a1a1a', color: '#fff', border: '1px solid #333' }
      }} />

      {/* Atmospheric Blobs */}
      <div className="atmospheric-blobs pointer-events-none">
        <div className="blob-purple"></div>
        <div className="blob-blue"></div>
      </div>
      
      {/* Navbar */}
      <nav className="h-[72px] shrink-0 px-4 md:px-8 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between relative z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg text-brand-primary"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center font-bold text-black text-lg shadow-[0_0_20px_rgba(112,0,255,0.4)]">
            D
          </div>
          <span className="text-xl font-semibold tracking-tight hidden lg:block">Danscom AI Studio</span>
        </div>

        <div className="nav-pill scale-75 md:scale-100 overflow-x-auto max-w-[50vw] no-scrollbar">
          <TabButton active={activeTab === 'image'} onClick={() => { setActiveTab('image'); setSidebarOpen(false); }}>Image</TabButton>
          <TabButton active={activeTab === 'video'} onClick={() => { setActiveTab('video'); setSidebarOpen(false); }}>Video</TabButton>
          <TabButton active={activeTab === 'voice'} onClick={() => { setActiveTab('voice'); setSidebarOpen(false); }}>Voice</TabButton>
          <TabButton active={activeTab === 'script'} onClick={() => { setActiveTab('script'); setSidebarOpen(false); }}>Script</TabButton>
          <TabButton active={activeTab === 'captions'} onClick={() => { setActiveTab('captions'); setSidebarOpen(false); }}>Captions</TabButton>
          {user && <span className="hidden sm:inline-flex"><TabButton active={activeTab === 'history'} onClick={() => { setActiveTab('history'); setSidebarOpen(false); }}>Vault</TabButton></span>}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden xl:block text-right">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Balance</p>
                <p className="text-xs font-mono text-brand-secondary">42 CREDITS</p>
              </div>
              <img src={user.photoURL || ''} alt="avatar" className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-white/20 bg-white/5" />
              <button 
                onClick={logout}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white"
              >
                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={login}
              className="px-3 md:px-5 py-1.5 rounded-lg bg-white/10 text-white font-bold text-[10px] md:text-xs border border-white/20 hover:bg-white/20 transition-all tracking-tight"
            >
              SIGN IN
            </button>
          )}
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
        
        {/* Sidebar Nav Settings/Parameters */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-[280px] md:w-[320px] md:relative md:translate-x-0 transition-transform duration-300 ease-in-out border-r border-white/10 flex flex-col p-6 space-y-6 bg-[#0a0a0a] md:bg-black/20 overflow-y-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between md:hidden">
            <span className="label-caps">Parameters</span>
            <button onClick={() => setSidebarOpen(false)} className="text-white/40">×</button>
          </div>
          <AnimatePresence mode="wait">
            {activeTab === 'image' && (
              <ImageControls 
                key="img-ctrl" model={imgModel} setModel={setImgModel} 
                guidance={imgGuidance} setGuidance={setImgGuidance} 
                steps={imgSteps} setSteps={setImgSteps} 
              />
            )}
            {activeTab === 'video' && <VideoControls key="vid-ctrl" length={vidLength} setLength={setVidLength} />}
            {activeTab === 'voice' && (
              <VoiceControls 
                key="voice-ctrl" style={voiceStyle} setStyle={setVoiceStyle} 
                character={voiceCharacter} setCharacter={setVoiceCharacter}
                pitch={voicePitch} setPitch={setVoicePitch}
                rate={voiceRate} setRate={setVoiceRate}
              />
            )}
            {activeTab === 'script' && (
              <ScriptControls 
                key="script-ctrl" tone={scriptTone} setTone={setScriptTone} 
                industry={scriptIndustry} setIndustry={setScriptIndustry}
                goal={scriptGoal} setGoal={setScriptGoal}
              />
            )}
            {activeTab === 'captions' && (
              <CaptionControls 
                key="captions-ctrl" format={captionFormats} setFormat={setCaptionFormats} 
                hashtagCount={captionHashtagCount} setHashtagCount={setCaptionHashtagCount}
                emojiDensity={emojiDensity} setEmojiDensity={setEmojiDensity}
              />
            )}
            {activeTab === 'history' && <HistoryStats key="hist-stats" />}
          </AnimatePresence>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Workspace Area */}
        <main className="flex-1 p-4 md:p-8 flex flex-col gap-6 overflow-hidden relative">
          {!user && activeTab !== 'history' && (
            <div className="flex-1 glass-panel border-dashed border-white/10 flex flex-col items-center justify-center text-center p-6 md:p-12">
               <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mb-6">
                 <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-brand-primary" />
               </div>
               <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">Enter the Infinite Forge</h2>
               <p className="text-white/40 max-w-sm mb-8 italic text-sm">Where imagination meets neural architecture. Sign in to start your journey.</p>
               <button onClick={login} className="neon-button px-8">Connect with Neural ID</button>
            </div>
          )}

          {user && (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <ErrorBoundary>
                <AnimatePresence mode="wait">
                  {activeTab === 'image' && (
                    <ImageStudio 
                      userId={user.uid} 
                      model={imgModel} guidance={imgGuidance} steps={imgSteps} 
                    />
                  )}
                  {activeTab === 'video' && <VideoLab userId={user.uid} length={vidLength} />}
                  {activeTab === 'voice' && <VoiceForge userId={user.uid} style={voiceStyle} character={voiceCharacter} pitch={voicePitch} rate={voiceRate} />}
                  {activeTab === 'script' && <ScriptStudio userId={user.uid} tone={scriptTone} industry={scriptIndustry} goal={scriptGoal} />}
                  {activeTab === 'captions' && <CaptionForge userId={user.uid} formats={captionFormats} hashtagCount={captionHashtagCount} emojiDensity={emojiDensity} />}
                  {activeTab === 'history' && <History userId={user.uid} />}
                </AnimatePresence>
              </ErrorBoundary>
            </div>
          )}
        </main>
      </div>

      <footer className="h-8 bg-black/80 backdrop-blur-md border-t border-white/5 flex items-center px-8 justify-between text-[10px] text-white/30 uppercase tracking-[0.2em] z-50 shrink-0">
        <div className="flex gap-6">
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> API ACTIVE</span>
          <span>LATENCY: 18MS</span>
        </div>
        <div>
          © 2026 DANSCOM AI • BUILT FOR CREATORS
        </div>
      </footer>
    </div>
  );
}

// --- Subcomponents ---

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;
  
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 glass-panel border-red-500/20 flex flex-col items-center justify-center p-12 text-center h-full">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-red-500 uppercase tracking-widest mb-2">Neural Interface Crash</h3>
          <p className="text-xs text-white/40 uppercase tracking-widest leading-loose max-w-xs">A cognitive error occurred in this module. Reboots recommended.</p>
          <button onClick={() => window.location.reload()} className="mt-6 text-[10px] text-brand-primary font-bold uppercase tracking-[0.2em] border border-brand-primary/20 px-4 py-2 rounded-lg hover:bg-brand-primary/10 transition-all">Manually Restart Core</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function TabButton({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-6 py-1.5 rounded-lg font-medium text-sm transition-all",
        active 
          ? "bg-white/10 text-white border border-white/20" 
          : "text-white/50 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function ImageControls({ model, setModel, guidance, setGuidance, steps, setSteps }: { 
  model: string, setModel: (m: string) => void, 
  guidance: number, setGuidance: (g: number) => void,
  steps: number, setSteps: (s: number) => void,
  key?: string
}) {
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="space-y-2">
        <label className="label-caps">Neural Model</label>
        <div className="grid grid-cols-2 gap-2">
          {['Flux', 'Flux Realism', 'Flux Anime', 'Flux 3D', 'Turbo', 'SDV 1.5', 'SDXL BASE'].map(m => (
            <button 
              key={m}
              onClick={() => setModel(m)}
              className={cn(
                "p-2 rounded-lg border text-[9px] uppercase font-bold tracking-wider transition-all",
                model === m ? "border-brand-primary bg-brand-primary/10 text-brand-primary" : "border-white/10 bg-white/5 text-white/40"
              )}
            >
              {['Flux', 'Flux Realism', 'Flux Anime', 'Flux 3D', 'Turbo'].includes(m) ? `${m} (Free)` : m}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <label className="label-caps block">Parameters</label>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-white/40 uppercase font-mono">Guidance</span>
            <span className="text-[10px] font-mono">{guidance}</span>
          </div>
          <input 
            type="range" min="1" max="20" step="0.5" value={guidance} onChange={(e) => setGuidance(parseFloat(e.target.value))}
            className="w-full transition-all accent-brand-primary h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
          />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-white/40 uppercase font-mono">Steps</span>
            <span className="text-[10px] font-mono">{steps}</span>
          </div>
          <input 
            type="range" min="10" max="100" step="1" value={steps} onChange={(e) => setSteps(parseInt(e.target.value))}
            className="w-full transition-all accent-brand-primary h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
          />
        </div>
      </div>
    </motion.div>
  );
}

function VideoControls({ length, setLength }: { length: string, setLength: (l: string) => void, key?: string }) {
  const lengths = ['2S', '4S', '10S'];
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="space-y-2">
        <label className="label-caps">Sequence Length</label>
        <div className="grid grid-cols-3 gap-2">
          {lengths.map(l => (
            <button 
              key={l}
              onClick={() => setLength(l)}
              className={cn(
                "p-2 rounded-lg border text-[10px] font-bold transition-all",
                length === l ? "border-brand-primary bg-brand-primary/10 text-brand-primary" : "border-white/10 bg-white/5 text-white/40"
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 rounded-xl bg-brand-secondary/5 border border-brand-secondary/20">
        <p className="text-[10px] leading-relaxed text-brand-secondary/80 font-medium">Video generation uses high-performance FP16 clusters for smooth cinematic interpolation.</p>
      </div>
    </motion.div>
  );
}

function VoiceControls({ style, setStyle, character, setCharacter, pitch, setPitch, rate, setRate }: { 
  style: string, setStyle: (s: string) => void, 
  character: string, setCharacter: (c: string) => void,
  pitch: number, setPitch: (p: number) => void,
  rate: number, setRate: (r: number) => void,
  key?: string 
}) {
  const styles = [
    { id: 'dynamic', label: 'High Fidelity' },
    { id: 'soft', label: 'Neural Calm' }
  ];
  const characters = [
    { id: 'Aura', label: 'Aura (Smooth)' },
    { id: 'Nova', label: 'Nova (Energetic)' },
    { id: 'Atlas', label: 'Atlas (Deep)' },
    { id: 'Echo', label: 'Echo (Digital)' },
    { id: 'Clone', label: 'Voice Clone (Active)' }
  ];
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="space-y-2">
        <label className="label-caps">Vocal Persona</label>
        <div className="grid grid-cols-2 gap-2">
           {characters.map(c => (
             <button 
               key={c.id}
               onClick={() => setCharacter(c.id)}
               className={cn(
                 "p-2 rounded-xl border text-left flex items-center justify-between transition-all",
                 character === c.id ? "bg-brand-primary/10 border-brand-primary text-white" : "bg-white/5 border-white/10 text-white/40"
               )}
             >
                <span className="text-[10px] font-bold uppercase tracking-tight">{c.id}</span>
                {character === c.id && <Sparkles className="w-3 h-3 text-brand-primary" />}
             </button>
           ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="label-caps">Modulation</label>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[9px] text-white/40 uppercase font-mono">Pitch</span>
            <span className="text-[9px] font-mono">{pitch}</span>
          </div>
          <input 
            type="range" min="0.5" max="2" step="0.1" value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="w-full transition-all accent-brand-primary h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
          />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[9px] text-white/40 uppercase font-mono">Speed</span>
            <span className="text-[9px] font-mono">{rate}</span>
          </div>
          <input 
            type="range" min="0.5" max="2" step="0.1" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full transition-all accent-brand-primary h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="label-caps">Acoustic Style</label>
        <div className="flex flex-col gap-2">
           {styles.map(s => (
             <button 
               key={s.id}
               onClick={() => setStyle(s.id)}
               className={cn(
                 "p-3 rounded-xl border text-left flex items-center justify-between transition-all font-mono text-[10px] uppercase",
                 style === s.id ? "bg-brand-primary/10 border-brand-primary text-white" : "bg-white/5 border-white/10 text-white/40"
               )}
             >
                <span>{s.label}</span>
                <Mic className={cn("w-3 h-3 transition-colors", style === s.id ? "text-brand-primary": "text-white/20")} />
             </button>
           ))}
        </div>
      </div>
    </motion.div>
  );
}

function HistoryStats() {
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="p-6 rounded-2xl border border-brand-primary/20 bg-brand-primary/5">
         <div className="text-[10px] text-brand-primary uppercase font-bold tracking-widest mb-1">Vault Status</div>
         <div className="text-3xl font-bold tracking-tighter">SECURED</div>
         <div className="mt-4 text-[9px] text-white/30 uppercase tracking-widest leading-loose">
           Persistent storage active.<br />Generations are encrypted at rest.
         </div>
      </div>
    </motion.div>
  );
}

function ScriptControls({ tone, setTone, industry, setIndustry, goal, setGoal }: { 
  tone: string, setTone: (t: string) => void, 
  industry: string, setIndustry: (i: string) => void,
  goal: string, setGoal: (g: string) => void,
  key?: string 
}) {
  const tones = ['Viral', 'Educational', 'Story', 'Humorous'];
  const industries = ['Tech', 'Beauty', 'Finance', 'Lifestyle', 'Real Estate'];
  const goals = ['Awareness', 'Conversion', 'Engagement'];
  
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="space-y-2">
        <label className="label-caps">Market Segment</label>
        <select 
          value={industry} onChange={(e) => setIndustry(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white/60 focus:border-brand-primary/50 outline-none transition-all"
        >
          {industries.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <label className="label-caps">Content Goal</label>
        <div className="grid grid-cols-1 gap-2">
          {goals.map(g => (
            <button 
              key={g} onClick={() => setGoal(g)}
              className={cn(
                "p-2 rounded-lg border text-[10px] uppercase font-bold tracking-wider text-left",
                goal === g ? "border-brand-primary bg-brand-primary/10 text-brand-primary" : "border-white/10 bg-white/5 text-white/40"
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className="label-caps">Tone Selection</label>
        <div className="grid grid-cols-2 gap-2">
          {tones.map(t => (
            <button 
              key={t}
              onClick={() => setTone(t)}
              className={cn(
                "p-2 rounded-lg border text-[10px] uppercase font-bold transition-all",
                tone === t 
                  ? "border-brand-primary bg-brand-primary/10 text-brand-primary" 
                  : "border-white/10 bg-white/5 text-white/40"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function CaptionControls({ format, setFormat, hashtagCount, setHashtagCount, emojiDensity, setEmojiDensity }: { 
  format: string[], setFormat: (f: string[]) => void,
  hashtagCount: number, setHashtagCount: (c: number) => void,
  emojiDensity: string, setEmojiDensity: (d: string) => void,
  key?: string 
}) {
  const formats = [
    { id: 'reels', label: 'Short-form Reels' },
    { id: 'long', label: 'Long-form descriptions' },
    { id: 'seo', label: 'SEO Meta Data' }
  ];

  const densities = ['None', 'Low', 'High'];

  const toggle = (id: string) => {
    if (format.includes(id)) setFormat(format.filter(f => f !== id));
    else setFormat([...format, id]);
  };

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="space-y-2">
        <label className="label-caps">Platform Formats</label>
        <div className="space-y-2">
           {formats.map(f => (
             <button 
               key={f.id}
               onClick={() => toggle(f.id)}
               className={cn(
                 "w-full flex items-center gap-2 p-3 rounded-lg bg-white/5 border transition-all",
                 format.includes(f.id) ? "border-brand-primary/40 bg-brand-primary/5" : "border-white/10"
               )}
             >
                <div className={cn("w-3 h-3 rounded border transition-all", format.includes(f.id) ? "bg-brand-primary border-brand-primary" : "border-white/20")}>
                  {format.includes(f.id) && <Sparkles className="w-2 h-2 text-white mx-auto mt-0.5" />}
                </div>
                <span className={cn("text-[10px] uppercase font-bold transition-colors", format.includes(f.id) ? "text-white" : "text-white/40")}>{f.label}</span>
             </button>
           ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
           <div className="flex justify-between items-center"><label className="label-caps">Hashtag Count</label><span className="text-xs font-mono">{hashtagCount}</span></div>
           <input type="range" min="0" max="30" value={hashtagCount} onChange={(e) => setHashtagCount(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none accent-brand-secondary cursor-pointer" />
        </div>
        <div className="space-y-2">
           <label className="label-caps">Emoji Density</label>
           <div className="grid grid-cols-3 gap-1">
             {densities.map(d => (
               <button 
                 key={d} onClick={() => setEmojiDensity(d)}
                 className={cn(
                   "p-2 rounded border text-[8px] uppercase font-bold",
                   emojiDensity === d ? "border-brand-secondary bg-brand-secondary/10 text-brand-secondary" : "border-white/10 text-white/20"
                 )}
               >
                 {d}
               </button>
             ))}
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left",
        active 
          ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20" 
          : "text-white/60 hover:bg-white/5 hover:text-white"
      )}
    >
      <div className={cn(
        "transition-transform",
        active ? "scale-110" : "group-hover:scale-110"
      )}>
        {icon}
      </div>
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

function ScriptStudio({ userId, tone, industry, goal }: { userId: string, tone: string, industry: string, goal: string }) {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('YouTube');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic) return;
    setGenerating(true);
    setMessage(null);
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, tone, industry, goal }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.script);
      setMessage(data.message);
      toast.success(data.message ? 'Demo script manifested.' : 'Script drafted.');
    } catch (e: any) {
      toast.error(e.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col gap-6 h-full">
      <div className="flex-1 glass-panel border-white/5 flex flex-col bg-black/40 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-brand-primary" />
            <span className="label-caps">Output Console</span>
          </div>
          <div className="flex items-center gap-4">
            {message && <span className="text-[9px] text-amber-500 font-mono italic animate-pulse hidden sm:block">{message}</span>}
            {result && (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  toast.success('Copied to clipboard');
                }}
                className="text-[10px] uppercase text-brand-primary font-bold"
              >
                Copy Script
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 p-6 overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre-wrap text-white/80">
          {result || (
            <div className="h-full flex items-center justify-center text-white/10 uppercase tracking-widest text-[10px]">
              {generating ? 'Transcribing Neural Patterns...' : 'Ready for script input'}
            </div>
          )}
        </div>
      </div>

      <div className="h-[220px] shrink-0 glass-panel p-6 space-y-4 flex flex-col">
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <label className="label-caps">Topic / Concept</label>
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-primary/50"
              placeholder="e.g. Benefits of AI in 2026..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="w-40 space-y-2">
             <label className="label-caps">Platform</label>
             <select 
               className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none"
               value={platform}
               onChange={(e) => setPlatform(e.target.value)}
             >
               <option>YouTube</option>
               <option>TikTok</option>
               <option>Instagram</option>
               <option>Podcast</option>
             </select>
          </div>
        </div>
        <button 
          disabled={generating || !topic}
          onClick={handleGenerate}
          className="neon-button disabled:opacity-50 py-3 tracking-widest uppercase text-xs"
        >
          {generating ? 'GENERATING...' : 'WRITE VIRAL SCRIPT'}
        </button>
      </div>
    </motion.div>
  );
}

function CaptionForge({ userId, formats, hashtagCount, emojiDensity }: { 
  userId: string, formats: string[], hashtagCount: number, emojiDensity: string 
}) {
  const [context, setContext] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!context) return;
    setGenerating(true);
    setMessage(null);
    try {
      const res = await fetch('/api/generate-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, formats, hashtagCount, emojiDensity }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.captions);
      setMessage(data.message);
      toast.success(data.message ? 'Demo captions manifested.' : 'Captions forged.');
    } catch (e: any) {
      toast.error(e.message || 'Forging failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col gap-4 md:gap-6 h-full pb-8">
      <div className="flex-1 glass-panel border-white/5 flex flex-col bg-black/40 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Zap className="w-24 h-24" />
        </div>
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full transition-all", message ? "bg-amber-500 animate-pulse" : "bg-brand-secondary")} />
            <span className="label-caps">{message ? 'Simulation: Captions' : 'Manifested Captions'}</span>
          </div>
          <div className="flex items-center gap-4">
            {message && <span className="text-[9px] text-amber-500 font-mono italic hidden sm:block">{message}</span>}
            {result && (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  toast.success('Captions copied.');
                }}
                className="text-[10px] uppercase text-brand-secondary font-bold hover:brightness-125 transition-all flex items-center gap-1.5"
              >
                <Copy className="w-3 h-3" /> Copy Output
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 p-6 md:p-8 overflow-y-auto font-mono text-[11px] leading-loose whitespace-pre-wrap text-white/80 custom-scrollbar">
          {result ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{result}</motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-white/5 uppercase tracking-[0.3em] text-[10px] space-y-4 text-center">
               <Zap className="w-8 h-8 opacity-20" />
               <span>{generating ? 'Extracting Virality...' : 'Waiting for content context'}</span>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 glass-panel p-4 md:p-6 space-y-4 flex flex-col bg-white/[0.02]">
        <label className="label-caps">Content Context</label>
        <textarea 
          placeholder="Describe your video or photo for the AI to analyze..."
          className="w-full min-h-[100px] bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-brand-primary/50 resize-none font-medium placeholder:text-white/20 transition-all shadow-inner"
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
        <button 
          disabled={generating || !context}
          onClick={handleGenerate}
          className="neon-button disabled:opacity-30 py-3 tracking-widest uppercase text-xs"
        >
          {generating ? 'ANALYZING...' : 'FORGE CAPTIONS'}
        </button>
      </div>
    </motion.div>
  );
}

function ImageStudio({ userId, model, guidance, steps }: { 
  userId: string, model: string, guidance: number, steps: number 
}) {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setGenerating(true);
    setResult(null);
    setMessage(null);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model, guidance, steps }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Nexus fault' }));
        throw new Error(errorData.error || 'Neural link unstable');
      }

      const data = await res.json();
      setResult(data.imageUrl);
      setMessage(data.message);
      
      import('canvas-confetti').then(confetti => {
        confetti.default({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#7000FF', '#00D1FF'] });
      });

      // Save to Firestore
      await addDoc(collection(db, `users/${userId}/generations`), {
        id: crypto.randomUUID(),
        userId,
        type: 'image',
        prompt,
        url: data.imageUrl,
        createdAt: Timestamp.now(),
        model
      });

      toast.success(data.message ? 'Demo asset manifested.' : 'Asset manifested.');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col gap-4 md:gap-6 h-full pb-8"
    >
      <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 group shadow-2xl min-h-[300px]">
        {/* Status indicator */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
           <div className={cn(
             "px-2 py-0.5 rounded-md border flex items-center gap-1.5 backdrop-blur-md transition-all",
             message ? "bg-amber-500/10 border-amber-500/20" : "bg-brand-primary/10 border-brand-primary/20"
           )}>
              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", message ? "bg-amber-500" : "bg-brand-primary")} />
              <span className={cn("text-[9px] font-bold uppercase tracking-widest", message ? "text-amber-500" : "text-brand-primary")}>
                {message ? 'Neural Preview' : 'Active Synthesis'}
              </span>
           </div>
           {message && <span className="text-[8px] text-white/40 font-mono italic hidden lg:block">{message}</span>}
        </div>

        <div className="absolute inset-0 p-4 md:p-8 flex flex-col">
          <div className="grow relative rounded-xl overflow-hidden border border-white/20 bg-[#0a0a0a] flex items-center justify-center shadow-inner">
            {result ? (
              <>
                <img src={result} className="w-full h-full object-contain" alt="Generation" />
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col md:flex-row justify-between items-start md:items-end gap-4 translate-y-4 group-hover:translate-y-0 transition-transform">
                   <div className="max-w-full md:max-w-[70%]">
                     <h4 className="text-sm md:text-lg font-semibold mb-1 truncate">{prompt}</h4>
                     <p className="text-white/40 text-[9px] md:text-[10px] uppercase tracking-widest font-mono">{model} • G:{guidance} • S:{steps}</p>
                   </div>
                   <div className="flex gap-2 w-full md:w-auto">
                     <a href={result} download="nexus-asset.png" className="flex-1 md:flex-none text-center px-4 py-2 rounded-lg bg-white text-black font-bold text-[10px] uppercase tracking-wider hover:bg-white/90">Download</a>
                   </div>
                </div>
              </>
            ) : (
              <div className="text-center p-6 bg-transparent">
                 {generating ? (
                    <div className="space-y-4">
                      <div className="w-10 h-10 border-2 border-white/5 border-t-brand-primary rounded-full animate-spin mx-auto"></div>
                      <p className="text-white/30 text-[10px] font-mono uppercase tracking-[0.2em] animate-pulse">Encoding Latent Space...</p>
                    </div>
                 ) : (
                    <div className="space-y-4 opacity-20">
                       <Sparkles className="w-12 h-12 mx-auto text-white" />
                       <p className="text-[9px] uppercase tracking-widest font-bold">Neural engine idle</p>
                    </div>
                 )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 glass-panel p-4 md:p-6 space-y-4 bg-white/[0.02]">
        <div className="flex justify-between items-center">
          <label className="label-caps">Cerebro Prompt</label>
        </div>
        
        <textarea 
          placeholder="Cyberpunk city in neon rain, hyper-realistic, 8k..."
          className="w-full min-h-[80px] bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-brand-primary/50 resize-none font-medium placeholder:text-white/20 transition-all shadow-inner"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <div className="flex flex-col md:flex-row gap-3">
          <button 
            disabled={generating || !prompt}
            onClick={handleGenerate}
            className="flex-1 neon-button py-3 tracking-widest uppercase text-xs disabled:opacity-30"
          >
            {generating ? 'MANIFESTING...' : 'MANIFEST ASSET'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function AspectRatioPill({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <button 
       onClick={onClick}
       className={cn(
         "px-4 py-1.5 rounded-lg border text-[10px] font-bold tracking-widest transition-all",
         active 
           ? "border-brand-primary bg-brand-primary/10 text-brand-primary" 
           : "border-white/10 bg-white/5 text-white/40 hover:text-white"
       )}
    >
      {children}
    </button>
  );
}

function VideoLab({ userId, length }: { userId: string, length: string }) {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioMode, setAudioMode] = useState<'auto' | 'custom'>('auto');
  const [audioScript, setAudioScript] = useState('');

  const handleGenerate = async () => {
    if (!prompt && !imageFile) return;
    setGenerating(true);
    setResult(null);
    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          hasImage: !!imageFile, 
          length,
          audioMode,
          audioScript: audioMode === 'custom' ? audioScript : undefined
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Simulation engine failure' }));
        throw new Error(errorData.error || 'Sequence synthesis unreachable');
      }

      const data = await res.json();
      
      setResult(data.videoUrl);
      setMessage(data.message);

      await addDoc(collection(db, `users/${userId}/generations`), {
        id: crypto.randomUUID(),
        userId,
        type: 'video',
        prompt: prompt || 'Image-to-Video Animation (Simulation)',
        url: data.videoUrl,
        createdAt: Timestamp.now()
      });

      toast.success('Simulation rendered.');
    } catch (e: any) {
      toast.error('Synthesis failure');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col gap-4 md:gap-6 h-full pb-8"
    >
      <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 group shadow-2xl min-h-[350px]">
        {/* Status Indicator */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
           <div className={cn(
             "px-2 py-1 rounded-full border flex items-center gap-1.5 backdrop-blur-md transition-all",
             message?.includes('Simulation') ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20"
           )}>
              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", message?.includes('Simulation') ? "bg-amber-500" : "bg-emerald-500")} />
              <span className={cn("text-[9px] font-bold uppercase tracking-widest text-white/80", message?.includes('Simulation') ? "text-amber-500" : "text-emerald-500")}>
                {message?.includes('Simulation') ? 'Neural Preview' : 'Real-time Synthesis'}
              </span>
           </div>
        </div>

        <div className="absolute inset-0 p-4 md:p-8 flex flex-col">
          <div className="grow relative rounded-xl overflow-hidden border border-white/20 bg-[#0a0a0a] flex items-center justify-center shadow-inner">
            {result ? (
              <div className="w-full h-full relative group/vid">
                <video src={result} autoPlay muted loop controls className="w-full h-full object-contain" />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover/vid:opacity-100 transition-opacity">
                   <a href={result} download className="p-2 rounded-lg bg-black/60 border border-white/10 text-white hover:bg-black/80">
                      <Download className="w-4 h-4" />
                   </a>
                </div>
                {message && (
                  <div className="absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-black/60 backdrop-blur-sm border border-white/5 opacity-0 group-hover/vid:opacity-100 transition-opacity">
                    <p className="text-[9px] text-white/40 font-mono italic truncate">Nexus Log: {message}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-6 bg-transparent">
                {generating ? (
                  <div className="space-y-4">
                    <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-white/20 text-[9px] font-mono tracking-widest uppercase animate-pulse">Computing Temporal Frame {length}...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6 opacity-20">
                    <Film className="w-8 h-8 mx-auto" />
                    <p className="text-[9px] font-bold uppercase tracking-widest">Temporal core idle</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 glass-panel p-4 md:p-6 space-y-4 bg-white/[0.02]">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="label-caps">Motion Script</label>
            <div className="flex gap-2">
              <button 
                onClick={() => setAudioMode('auto')}
                className={cn(
                  "px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all border",
                  audioMode === 'auto' ? "bg-brand-primary/20 border-brand-primary text-brand-primary" : "bg-white/5 border-white/10 text-white/40"
                )}
              >
                Auto Audio
              </button>
              <button 
                onClick={() => setAudioMode('custom')}
                className={cn(
                  "px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all border",
                  audioMode === 'custom' ? "bg-brand-secondary/20 border-brand-secondary text-brand-secondary" : "bg-white/5 border-white/10 text-white/40"
                )}
              >
                Custom Script
              </button>
            </div>
          </div>
          <textarea 
            placeholder="E.g. A sunset over the ocean with gentle waves..."
            className="w-full min-h-[80px] bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-brand-primary/50 resize-none font-medium placeholder:text-white/20"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        {audioMode === 'custom' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2"
          >
            <label className="label-caps text-brand-secondary">Audio Script / TTS</label>
            <textarea 
              placeholder="Enter words for the AI to speak over your video..."
              className="w-full min-h-[60px] bg-white/5 border border-brand-secondary/30 rounded-xl p-4 text-xs focus:outline-none focus:border-brand-secondary/50 resize-none font-medium placeholder:text-white/20"
              value={audioScript}
              onChange={(e) => setAudioScript(e.target.value)}
            />
          </motion.div>
        )}

        <button 
          disabled={generating || (!prompt && !imageFile)}
          onClick={handleGenerate}
          className="w-full neon-button py-3 tracking-widest uppercase text-xs disabled:opacity-30"
        >
          {generating ? 'RENDERING...' : 'ANIMATE VISION'}
        </button>
      </div>
    </motion.div>
  );
}

function VoiceForge({ userId, style, character, pitch, rate }: { 
  userId: string, style: string, character: string, pitch: number, rate: number 
}) {
  const [text, setText] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [clonedProfile, setClonedProfile] = useState<{ pitch: number, rate: number } | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      if (v.length > 0 && !voice) {
        // Try to find a default for Aura
        const defaultVoice = v.find(v => v.name.includes('Samantha') || v.name.includes('Google UK English Female')) || v[0];
        setVoice(defaultVoice);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    if (voices.length > 0) {
      const lowerChar = character.toLowerCase();
      let candidates = voices.filter(v => {
        if (lowerChar === 'atlas') return v.name.includes('David') || v.name.includes('Alex') || v.name.includes('Daniel') || v.name.includes('Male');
        if (lowerChar === 'aura' || lowerChar === 'nova') return v.name.includes('Google UK English Female') || v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('Female');
        if (lowerChar === 'echo') return v.name.includes('Whisper') || v.name.includes('Google') || v.name.includes('Natural');
        return false;
      });
      
      if (candidates.length > 0) {
        // Nova vs Aura variety
        if (lowerChar === 'nova' && candidates.length > 1) setVoice(candidates[1]);
        else setVoice(candidates[0]);
      }
    }
  }, [character, voices]);

  const handleSpeak = () => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Character logic modulation
    if (character === 'Clone' && clonedProfile) {
       utterance.pitch = pitch * clonedProfile.pitch;
       utterance.rate = rate * clonedProfile.rate;
    } else {
       utterance.pitch = pitch;
       utterance.rate = rate;
       
       if (style === 'soft') {
         utterance.rate *= 0.8;
         utterance.pitch *= 0.9;
       }
    }

    if (voice) utterance.voice = voice;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    toast.success(`${character} manifestation active`);
  };

  const startCloning = async () => {
    setIsRecording(true);
    toast('Recording sample... Speak for 3 seconds.', { icon: '🎙️' });
    
    // Simulated cloning logic
    setTimeout(() => {
      setIsRecording(false);
      setIsCloning(true);
      toast.loading('Analyzing neural harmonics...');
      
      setTimeout(() => {
        setIsCloning(false);
        setClonedProfile({ pitch: 0.8 + Math.random() * 0.4, rate: 0.9 + Math.random() * 0.2 });
        toast.success('Voice Clone Successful. Neural profile matched.');
      }, 3000);
    }, 3000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col gap-4 md:gap-6 h-full pb-8">
      <div className="flex-1 glass-panel border-white/5 flex flex-col bg-black/40 overflow-hidden relative shadow-2xl">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <Mic className="w-24 h-24" />
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
           <div className={cn(
             "p-10 rounded-full border transition-all duration-1000 relative", 
             speaking ? "border-brand-primary scale-110 shadow-[0_0_50px_rgba(112,0,255,0.3)] bg-brand-primary/5" : 
             isRecording ? "border-red-500 scale-105 shadow-[0_0_30px_rgba(239,68,68,0.2)] bg-red-500/10" :
             "border-white/5 bg-transparent"
           )}>
             {isCloning ? (
               <Loader2 className="w-12 h-12 text-brand-secondary animate-spin" />
             ) : (
               <Mic className={cn("w-12 h-12 transition-colors", speaking ? "text-brand-primary animate-pulse" : isRecording ? "text-red-500 animate-bounce" : "text-white/10")} />
             )}
             {clonedProfile && (
               <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-brand-secondary rounded-full border border-black flex items-center justify-center shadow-lg">
                 <Zap className="w-3 h-3 text-black" />
               </div>
             )}
           </div>
           
           <div className="space-y-1">
             <p className="text-white/20 font-mono text-[10px] uppercase tracking-[0.3em]">
               {speaking ? 'Modulating Waveforms...' : 
                isRecording ? 'Capturing Voice Signature...' : 
                isCloning ? 'Neural Pattern Matching...' :
                clonedProfile ? 'Clone Loaded & Ready' :
                'Neural Voice Idle'}
             </p>
             {character === 'Clone' && !clonedProfile && !isRecording && !isCloning && (
               <p className="text-[10px] text-brand-primary font-bold uppercase tracking-widest animate-pulse">Neural Identity Missing</p>
             )}
           </div>
        </div>
      </div>

      <div className="shrink-0 glass-panel p-4 md:p-6 space-y-4 flex flex-col bg-white/[0.02]">
        <div className="flex justify-between items-center">
            <label className="label-caps">Neural Script</label>
            {character === 'Clone' && (
              <button 
                onClick={startCloning}
                disabled={isRecording || isCloning}
                className="text-[9px] uppercase font-bold text-brand-secondary hover:brightness-125 transition-all flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse" />
                {clonedProfile ? 'Re-Clone Voice' : 'Clone My Voice'}
              </button>
            )}
        </div>
        <textarea 
          placeholder={character === 'Clone' && !clonedProfile ? "Please clone your voice above first..." : "Words to be manifested into reality..."}
          className="w-full min-h-[100px] bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-brand-primary/50 resize-none font-medium placeholder:text-white/20 transition-all shadow-inner"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-[8px] uppercase tracking-widest text-white/30 font-bold ml-1">Output Hardware</label>
            <select 
              className="w-full bg-[#111] border border-white/10 rounded-xl p-3 text-xs font-medium focus:outline-none text-white/80"
              onChange={(e) => setVoice(voices.find(v => v.name === e.target.value) || null)}
            >
              {voices.map((v, i) => (
                <option key={`${v.name}-${v.lang}-${i}`} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>
          <button 
            disabled={speaking || !text || (character === 'Clone' && !clonedProfile)}
            onClick={handleSpeak}
            className="neon-button disabled:opacity-30 h-[48px] mt-auto min-w-[200px] tracking-widest uppercase text-xs"
          >
            {speaking ? 'SYNTHESIZING...' : character === 'Clone' ? 'CLONE SPEAK' : 'PLAY VOICE'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function History({ userId }: { userId: string }) {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, `users/${userId}/generations`),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGenerations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Generation)));
      setLoading(false);
    });
    return unsubscribe;
  }, [userId]);

  if (loading) return <div className="p-12 text-center text-white/40 font-mono animate-pulse uppercase tracking-[0.3em]">Querying Vault...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h2 className="text-xl font-bold tracking-tight">Access Archives</h2>
        <div className="label-caps">{generations.length} SECURED ASSETS</div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
        {generations.map((gen) => (
          <div key={gen.id} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group bg-black/40 hover:border-brand-primary/50 transition-all duration-300">
            {gen.type === 'image' && <img src={gen.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />}
            {gen.type === 'video' && <video src={gen.url} className="w-full h-full object-cover" />}
            {gen.type === 'voice' && <div className="w-full h-full flex items-center justify-center bg-brand-primary/5"><Mic className="w-8 h-8 text-brand-primary" /></div>}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
               <div className="flex gap-2">
                 <a href={gen.url} target="_blank" rel="noreferrer" className="p-1.5 bg-white/10 rounded-lg hover:bg-brand-primary transition-colors">
                   <ExternalLink className="w-3 h-3 text-white" />
                 </a>
                 <button className="p-1.5 bg-white/10 rounded-lg hover:bg-red-500/50 transition-colors">
                   <Trash2 className="w-3 h-3 text-white" />
                 </button>
               </div>
            </div>
            <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/80 rounded text-[8px] font-bold uppercase tracking-widest text-brand-primary border border-brand-primary/20">
              {gen.type}
            </div>
          </div>
        ))}
        {generations.length === 0 && (
          <div className="col-span-full py-20 text-center glass-panel border-dashed border-white/10">
            <p className="text-white/20 font-mono text-xs uppercase tracking-widest">Archive Empty</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
