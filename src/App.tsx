import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'react-hot-toast';
import { cn } from './lib/utils';

// --- Types ---
type Tab = 'image' | 'video' | 'voice' | 'history';

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
    <div className="min-h-screen bg-bg-dark text-white selection:bg-brand-primary/30 relative overflow-hidden">
      <Toaster position="bottom-right" toastOptions={{
        style: { background: '#1a1a1a', color: '#fff', border: '1px solid #333' }
      }} />

      {/* Atmospheric Blobs */}
      <div className="atmospheric-blobs">
        <div className="blob-purple"></div>
        <div className="blob-blue"></div>
      </div>
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 px-8 h-18 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center font-bold text-black text-lg shadow-[0_0_20px_rgba(112,0,255,0.4)]">
            D
          </div>
          <span className="text-xl font-semibold tracking-tight hidden sm:block">Danscom AI Studio</span>
        </div>

        <div className="nav-pill">
          <TabButton active={activeTab === 'image'} onClick={() => setActiveTab('image')}>Image Studio</TabButton>
          <TabButton active={activeTab === 'video'} onClick={() => setActiveTab('video')}>Video Studio</TabButton>
          <TabButton active={activeTab === 'voice'} onClick={() => setActiveTab('voice')}>Voice Forge</TabButton>
          {user && <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')}>Archives</TabButton>}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden lg:block text-right">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Credits</p>
                <p className="text-xs font-mono text-brand-secondary">42 LEFT</p>
              </div>
              <img src={user.photoURL || ''} alt="avatar" className="w-10 h-10 rounded-full border border-white/20 bg-white/5" />
              <button 
                onClick={logout}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={login}
              className="px-6 py-1.5 rounded-lg bg-white/10 text-white font-medium text-sm border border-white/20 hover:bg-white/20 transition-all font-bold tracking-tight"
            >
              SIGN IN
            </button>
          )}
        </div>
      </nav>

      <main className="pt-18 min-h-screen flex flex-col md:flex-row relative z-10">
        
        {/* Sidebar Nav Settings/Parameters */}
        <aside className="w-full md:w-[320px] shrink-0 border-r border-white/10 flex flex-col p-6 space-y-6 bg-black/20">
          <AnimatePresence mode="wait">
            {activeTab === 'image' && <ImageControls key="img-ctrl" />}
            {activeTab === 'video' && <VideoControls key="vid-ctrl" />}
            {activeTab === 'voice' && <VoiceControls key="voice-ctrl" />}
            {activeTab === 'history' && <HistoryStats key="hist-stats" />}
          </AnimatePresence>
        </aside>

        {/* Main Workspace Area */}
        <section className="grow p-8 flex flex-col gap-6 overflow-y-auto h-[calc(100vh-72px-32px)]">
          {!user && activeTab !== 'history' && (
            <div className="flex-1 glass-panel border-dashed border-white/10 flex flex-col items-center justify-center text-center p-12">
               <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mb-6">
                 <Sparkles className="w-10 h-10 text-brand-primary" />
               </div>
               <h2 className="text-3xl font-bold mb-3 tracking-tight">Enter the Infinite Forge</h2>
               <p className="text-white/40 max-w-sm mb-8 italic">Where imagination meets neural architecture. Sign in to start your journey.</p>
               <button onClick={login} className="neon-button">Connect with Neural ID</button>
            </div>
          )}

          {user && (
            <AnimatePresence mode="wait">
              {activeTab === 'image' && <ImageStudio userId={user.uid} />}
              {activeTab === 'video' && <VideoLab userId={user.uid} />}
              {activeTab === 'voice' && <VoiceForge userId={user.uid} />}
              {activeTab === 'history' && <History userId={user.uid} />}
            </AnimatePresence>
          )}
        </section>
      </main>

      <footer className="fixed bottom-0 w-full h-8 bg-black/80 backdrop-blur-md border-t border-white/5 flex items-center px-8 justify-between text-[10px] text-white/30 uppercase tracking-[0.2em] z-50">
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

function ImageControls() {
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="space-y-2">
        <label className="label-caps">Neural Model</label>
        <div className="grid grid-cols-2 gap-2">
          <button className="p-2 rounded-lg border border-brand-primary bg-brand-primary/10 text-[10px] uppercase font-bold text-brand-primary tracking-wider">SDXL Turbo</button>
          <button className="p-2 rounded-lg border border-white/10 bg-white/5 text-[10px] uppercase font-bold text-white/40 tracking-wider">Midney V6</button>
        </div>
      </div>
      <div className="space-y-4">
        <label className="label-caps block">Parameters</label>
        <div className="space-y-3">
          <div className="flex justify-between items-center"><span className="text-[10px] text-white/40 uppercase font-mono">Guidance</span><span className="text-[10px] font-mono">7.5</span></div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full w-[75%] bg-gradient-to-r from-brand-primary to-brand-secondary"></div></div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center"><span className="text-[10px] text-white/40 uppercase font-mono">Steps</span><span className="text-[10px] font-mono">50</span></div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full w-[50%] bg-gradient-to-r from-brand-primary to-brand-secondary"></div></div>
        </div>
      </div>
    </motion.div>
  );
}

function VideoControls() {
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="space-y-2">
        <label className="label-caps">Sequence Length</label>
        <div className="grid grid-cols-3 gap-2">
          <button className="p-2 rounded-lg border border-brand-primary bg-brand-primary/10 text-[10px] font-bold text-brand-primary">2S</button>
          <button className="p-2 rounded-lg border border-white/10 bg-white/5 text-[10px] font-bold text-white/40">4S</button>
          <button className="p-2 rounded-lg border border-white/10 bg-white/5 text-[10px] font-bold text-white/40">10S</button>
        </div>
      </div>
      <div className="p-4 rounded-xl bg-brand-secondary/5 border border-brand-secondary/20">
        <p className="text-[10px] leading-relaxed text-brand-secondary/80 font-medium">Video generation uses high-performance FP16 clusters for smooth cinematic interpolation.</p>
      </div>
    </motion.div>
  );
}

function VoiceControls() {
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="space-y-2">
        <label className="label-caps">Acoustic Style</label>
        <div className="flex flex-col gap-2">
           <button className="p-3 rounded-xl bg-brand-primary/10 border border-brand-primary text-left flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-tight">Dynamic Range</span>
              <Mic className="w-3 h-3 text-brand-primary" />
           </button>
           <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-left flex items-center justify-between text-white/40">
              <span className="text-xs font-bold uppercase tracking-tight text-white/40">Soft & Neural</span>
              <Mic className="w-3 h-3" />
           </button>
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

function ImageStudio({ userId }: { userId: string }) {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setResult(data.imageUrl);
      
      // Fun effect
      import('canvas-confetti').then(confetti => {
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#7000ff', '#00d1ff']
        });
      });
      
      // Save to Firestore
      await addDoc(collection(db, `users/${userId}/generations`), {
        id: crypto.randomUUID(),
        userId,
        type: 'image',
        prompt,
        url: data.imageUrl,
        createdAt: Timestamp.now()
      });

      toast.success('Asset manifested successfully.');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="flex-1 flex flex-col gap-6 h-full"
    >
      <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 group shadow-2xl min-h-[300px]">
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
           <div className="w-[500px] h-[500px] border border-white/10 rounded-full animate-pulse transition-all duration-1000 scale-110"></div>
        </div>
        
        <div className="absolute inset-0 p-8 flex flex-col">
          <div className="grow relative rounded-xl overflow-hidden border border-white/20 bg-[#111] flex items-center justify-center shadow-inner">
            {result ? (
              <>
                <img src={result} className="w-full h-full object-contain" alt="Generation" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                   <div className="max-w-[70%] text-left">
                     <h4 className="text-lg font-semibold mb-1 truncate">{prompt || 'Generated Sample'}</h4>
                     <p className="text-white/40 text-[10px] uppercase tracking-widest font-mono">Neural Nexus 8K • 32 Samples</p>
                   </div>
                   <div className="flex gap-2">
                     <a href={result} download="image.png" className="px-4 py-2 rounded-lg bg-white text-black font-bold text-[10px] uppercase tracking-wider hover:bg-white/90">Download</a>
                     <button className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-bold text-[10px] uppercase tracking-wider backdrop-blur-sm hover:bg-white/20 transition-colors">Upscale 4K</button>
                   </div>
                </div>
              </>
            ) : (
              <div className="text-center p-12">
                 {generating ? (
                    <div className="space-y-4">
                      <div className="w-12 h-12 border-2 border-white/5 border-t-brand-primary rounded-full animate-spin mx-auto"></div>
                      <p className="text-white/30 text-[10px] font-mono uppercase tracking-[0.2em] animate-pulse">Encoding Latent Space...</p>
                    </div>
                 ) : (
                    <div className="space-y-4">
                       <Sparkles className="w-12 h-12 text-white/5 mx-auto" strokeWidth={1} />
                       <p className="text-white/20 font-mono text-[10px] uppercase tracking-[0.2em]">Synthesizer Idle</p>
                    </div>
                 )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-[280px] shrink-0 glass-panel p-6 space-y-4 flex flex-col relative z-20">
        <div className="flex justify-between items-center">
          <label className="label-caps">Prompt Forge</label>
          <button 
             onClick={async () => {
               if (!prompt) return;
               toast.loading('Synthesizing...', { id: 'enhance' });
               try {
                 const res = await fetch('/api/enhance-prompt', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({ prompt }),
                 });
                 const data = await res.json();
                 if (data.enhanced) {
                   setPrompt(data.enhanced);
                   toast.success('Prompt fortified.', { id: 'enhance' });
                 }
               } catch (e) {
                 toast.error('Synthesis error', { id: 'enhance' });
               }
             }}
             className="text-[10px] uppercase text-brand-primary font-bold hover:brightness-125 transition-all flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" /> Fortify Prompt
          </button>
        </div>
        
        <textarea 
          placeholder="Describe your vision in high detail..."
          className="grow bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-brand-primary/50 resize-none font-medium placeholder:text-white/20 transition-all shadow-inner"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <div className="flex justify-between items-center gap-4">
          <div className="flex gap-2">
            <AspectRatioPill active={prompt.includes('9:16')} onClick={() => setPrompt(p => p.split(' --ar')[0].trim() + ' --ar 9:16')}>9:16</AspectRatioPill>
            <AspectRatioPill active={prompt.includes('16:9')} onClick={() => setPrompt(p => p.split(' --ar')[0].trim() + ' --ar 16:9')}>16:9</AspectRatioPill>
            <AspectRatioPill active={prompt.includes('1:1') || !prompt.includes('--ar')} onClick={() => setPrompt(p => p.split(' --ar')[0].trim() + ' --ar 1:1')}>1:1</AspectRatioPill>
          </div>
          <button 
            disabled={generating || !prompt}
            onClick={handleGenerate}
            className="neon-button disabled:opacity-50 disabled:grayscale py-3 min-w-[200px] tracking-widest uppercase"
          >
            {generating ? 'MANIFESTING...' : 'GENERATE MASTERPIECE'}
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

function VideoLab({ userId }: { userId: string }) {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      
      setResult(data.videoUrl);

      await addDoc(collection(db, `users/${userId}/generations`), {
        id: crypto.randomUUID(),
        userId,
        type: 'video',
        prompt,
        url: data.videoUrl,
        createdAt: Timestamp.now()
      });

      toast.success('Sequence synthesized.');
    } catch (e: any) {
      toast.error('Synthesis failure');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col gap-6 h-full">
      <div className="flex-1 glass-panel border-white/5 flex flex-col items-center justify-center relative overflow-hidden bg-black/40 min-h-[300px]">
        {result ? (
          <video src={result} controls className="w-full h-full object-contain" />
        ) : (
          <div className="text-center p-12 relative z-10">
            <Video className="w-16 h-16 text-white/5 mx-auto mb-4" strokeWidth={1} />
            <p className="text-white/20 font-mono text-[10px] uppercase tracking-[0.3em]">{generating ? 'Rendering Motion Vectors...' : 'Motion Engine Idle'}</p>
          </div>
        )}
      </div>

      <div className="h-[220px] shrink-0 glass-panel p-6 space-y-4 flex flex-col">
        <label className="label-caps">Motion Script</label>
        <textarea 
          placeholder="Cinema 4D render of floating liquid gold, slow motion..."
          className="grow bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-brand-primary/50 resize-none font-medium placeholder:text-white/20 transition-all shadow-inner"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button 
          disabled={generating || !prompt}
          onClick={handleGenerate}
          className="neon-button disabled:opacity-50 py-3 tracking-widest uppercase text-xs"
        >
          {generating ? 'RENDERING...' : 'ANIMATE VISION'}
        </button>
      </div>
    </motion.div>
  );
}

function VoiceForge({ userId }: { userId: string }) {
  const [text, setText] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      if (v.length > 0 && !voice) setVoice(v[0]);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const handleSpeak = () => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    toast.success('Synthesis active');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col gap-6 h-full">
      <div className="flex-1 glass-panel border-white/5 flex flex-col items-center justify-center bg-black/40 min-h-[200px]">
         <div className={cn("p-8 rounded-full border transition-all duration-1000", speaking ? "border-brand-primary scale-110 shadow-[0_0_50px_rgba(112,0,255,0.3)]" : "border-white/5")}>
           <Mic className={cn("w-12 h-12 transition-colors", speaking ? "text-brand-primary animate-pulse" : "text-white/10")} />
         </div>
         <p className="mt-8 text-white/20 font-mono text-[10px] uppercase tracking-[0.3em]">{speaking ? 'Synthesizing Waveforms...' : 'Neural Voice Idle'}</p>
      </div>

      <div className="h-[250px] shrink-0 glass-panel p-6 space-y-4 flex flex-col">
        <label className="label-caps">Neural Script</label>
        <textarea 
          placeholder="Words to be manifested into reality..."
          className="grow bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-brand-primary/50 resize-none font-medium placeholder:text-white/20 transition-all shadow-inner"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex gap-4">
          <select 
            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-medium focus:outline-none"
            onChange={(e) => setVoice(voices.find(v => v.name === e.target.value) || null)}
          >
            {voices.map(v => (
              <option key={v.name} value={v.name}>{v.name}</option>
            ))}
          </select>
          <button 
            disabled={speaking || !text}
            onClick={handleSpeak}
            className="neon-button disabled:opacity-50 py-3 min-w-[150px] tracking-widest uppercase text-xs"
          >
            {speaking ? 'SPEAKING...' : 'PLAY VOICE'}
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
