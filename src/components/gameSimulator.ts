import React, { useState, useEffect } from 'react';
import { Arrow, Direction, GameLevel } from '../types';
import { PRESET_LEVELS } from '../data/architectureData';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, Sparkles, AlertCircle, CheckCircle2, Play, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Simple Synth Audio Manager to prevent missing assets error of MP3 files
const playSynthSound = (type: 'chirp' | 'block' | 'success' | 'generate') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'chirp') {
      // Light escape whoosh
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'block') {
      // Blunt thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.setValueAtTime(80, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'success') {
      // Chord progression
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.2);
      });
    } else if (type === 'generate') {
      // Cosmic beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    // Audio Context blocked by autoplays or unsupported browser
  }
};

interface GameSimulatorProps {
  onLevelCompleted: (levelId: number, moves: number, timeTaken: number) => void;
}

export default function GameSimulator({ onLevelCompleted }: GameSimulatorProps) {
  const [currentLevel, setCurrentLevel] = useState<GameLevel>(PRESET_LEVELS[0]);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [levelCleared, setLevelCleared] = useState<boolean>(false);
  const [blockedArrowId, setBlockedArrowId] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // Initialize level
  useEffect(() => {
    resetLevelState(currentLevel);
  }, [currentLevel]);

  const resetLevelState = (level: GameLevel) => {
    // Clone arrows to prevent side effects
    const clonedArrows = level.arrows.map(a => ({ ...a, status: 'active' as const }));
    setArrows(clonedArrows);
    setMovesCount(0);
    setStartTime(Date.now());
    setLevelCleared(false);
    setBlockedArrowId(null);
  };

  // Logic to determine if path is clear
  const findBlockingArrow = (arrow: Arrow, activeArrows: Arrow[]): Arrow | null => {
    const { row, col, dir } = arrow;
    
    // Filter out exited or inactive or the candidate itself
    const otherActive = activeArrows.filter(a => a.id !== arrow.id && a.status === 'active');

    if (dir === 'UP') {
      // Check rows above (row-1 down to 0) in same col
      const blockers = otherActive.filter(a => a.col === col && a.row < row);
      if (blockers.length > 0) {
        // Find closest blocker (largest row number that is less than current row)
        return blockers.reduce((closest, current) => (current.row > closest.row ? current : closest), blockers[0]);
      }
    } else if (dir === 'DOWN') {
      // Check rows below (row+1 up to 4) in same col
      const blockers = otherActive.filter(a => a.col === col && a.row > row);
      if (blockers.length > 0) {
        return blockers.reduce((closest, current) => (current.row < closest.row ? current : closest), blockers[0]);
      }
    } else if (dir === 'LEFT') {
      // Check cols left (col-1 down to 0) in same row
      const blockers = otherActive.filter(a => a.row === row && a.col < col);
      if (blockers.length > 0) {
        return blockers.reduce((closest, current) => (current.col > closest.col ? current : closest), blockers[0]);
      }
    } else if (dir === 'RIGHT') {
      // Check cols right (col+1 up to 4) in same row
      const blockers = otherActive.filter(a => a.row === row && a.col > col);
      if (blockers.length > 0) {
        return blockers.reduce((closest, current) => (current.col < closest.col ? current : closest), blockers[0]);
      }
    }

    return null;
  };

  const handleArrowClick = (arrow: Arrow) => {
    if (levelCleared || arrow.status !== 'active') return;

    const blocker = findBlockingArrow(arrow, arrows);

    if (blocker) {
      // Arrow is blocked! Trigger wobble effect on current, highlight blocker
      setBlockedArrowId(arrow.id);
      playSynthSound('block');
      setTimeout(() => {
        setBlockedArrowId(null);
      }, 500);
      return;
    }

    // Path is free! Animate flight exit
    playSynthSound('chirp');
    setMovesCount(prev => prev + 1);

    // Update status to exited
    setArrows(prev =>
      prev.map(a => (a.id === arrow.id ? { ...a, status: 'exited' as const } : a))
    );
  };

  // Monitor for complete clearance
  useEffect(() => {
    if (arrows.length > 0 && arrows.every(a => a.status === 'exited') && !levelCleared) {
      setLevelCleared(true);
      playSynthSound('success');
      const timeElapsed = (Date.now() - startTime) / 1000;
      onLevelCompleted(currentLevel.id, movesCount, timeElapsed);
    }
  }, [arrows, levelCleared]);

  // Request neural-generated level from Server's Gemini Endpoint
  const handleGenerateAiLevel = async (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    setIsAiLoading(true);
    setAiNotice(null);
    playSynthSound('generate');

    try {
      const response = await fetch('/api/gemini/generate-level', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ difficulty })
      });

      const data = await response.json();
      if (data.success) {
        const genLevel: GameLevel = {
          id: Math.floor(Math.random() * 10000) + 100,
          name: data.level.name || `Neural ${difficulty}`,
          difficulty: difficulty,
          gridSize: data.level.gridSize || 5,
          arrows: data.level.arrows.map((a: any, idx: number) => ({
            id: a.id || `ai-${idx}`,
            row: a.row,
            col: a.col,
            dir: a.dir as Direction,
            status: 'active'
          }))
        };
        setCurrentLevel(genLevel);
      } else {
        // Fallback occurred, warning of offline profile
        if (data.warning) {
          setAiNotice(data.warning);
        }
        const genLevel: GameLevel = {
          id: Math.floor(Math.random() * 10000) + 100,
          name: data.level.name,
          difficulty: difficulty,
          gridSize: data.level.gridSize || 5,
          arrows: data.level.arrows.map((a: any, idx: number) => ({
            id: a.id || `ea-${idx}`,
            row: a.row,
            col: a.col,
            dir: a.dir as Direction,
            status: 'active'
          }))
        };
        setCurrentLevel(genLevel);
      }
    } catch (err: any) {
      setAiNotice("Could not connect to backend level service. Initializing offline puzzle generation...");
    } finally {
      setIsAiLoading(false);
    }
  };

  const shuffleLocalPlacement = () => {
    playSynthSound('generate');
    const cols = 5;
    const rows = 5;
    const cellCount = 6 + Math.floor(Math.random() * 4); // 6 to 9 arrows
    const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    
    const coordinates: string[] = [];
    const randomizedArrows: Arrow[] = [];

    for (let i = 0; i < cellCount; i++) {
      let r = Math.floor(Math.random() * rows);
      let c = Math.floor(Math.random() * cols);
      while (coordinates.includes(`${r},${c}`)) {
        r = Math.floor(Math.random() * rows);
        c = Math.floor(Math.random() * cols);
      }
      coordinates.push(`${r},${c}`);
      randomizedArrows.push({
        id: `local-${i}-${Math.random().toString(36).substr(2, 4)}`,
        row: r,
        col: c,
        dir: directions[Math.floor(Math.random() * 4)],
        status: 'active'
      });
    }

    const shuffledLevel: GameLevel = {
      id: 999,
      name: "Locally Shuffled Matrix",
      difficulty: "Medium",
      gridSize: 5,
      arrows: randomizedArrows
    };
    setCurrentLevel(shuffledLevel);
  };

  const getArrowIcon = (dir: Direction) => {
    switch (dir) {
      case 'UP': return <ArrowUp className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform" />;
      case 'DOWN': return <ArrowDown className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />;
      case 'LEFT': return <ArrowLeft className="w-8 h-8 text-pink-400 group-hover:scale-110 transition-transform" />;
      case 'RIGHT': return <ArrowRight className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform" />;
    }
  };

  return (
    <div id="game-simulator-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
      {/* Level bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
        <div>
          <span className="text-xs font-mono font-bold tracking-wider uppercase bg-indigo-950/80 text-indigo-300 border border-indigo-900/60 rounded px-2.5 py-1">
            Core Client Engine Demo
          </span>
          <h2 className="text-lg font-sans font-medium text-slate-100 mt-2">
            Puzzle State & Arrow Physics Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Test the client-side swipe/tap logic. Arrows move immediately unless blocked by physical obstacles.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => resetLevelState(currentLevel)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
            title="Reset active state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset State
          </button>
          <button
            onClick={shuffleLocalPlacement}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Shuffle Level
          </button>
        </div>
      </div>

      {/* Grid Layout & Info columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Game grid block */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* Main Visual Board */}
          <div className="relative w-full max-w-[340px] aspect-square bg-slate-950 rounded-xl border border-slate-800 p-4 shadow-inner">
            {/* Grid background markers */}
            <div className="absolute inset-4 grid grid-cols-5 grid-rows-5 gap-2 pointer-events-none opacity-20">
              {Array.from({ length: 25 }).map((_, idx) => (
                <div key={idx} className="border border-dashed border-slate-700 rounded-md" />
              ))}
            </div>

            {/* Grid arrow assets */}
            <div className="absolute inset-4 grid grid-cols-5 grid-rows-5 gap-2">
              <AnimatePresence>
                {arrows.map((arrow) => {
                  if (arrow.status !== 'active') return null;

                  const isBlockedWiggle = blockedArrowId === arrow.id;

                  // Directional animations
                  const getMoveOffset = () => {
                    switch (arrow.dir) {
                      case 'UP': return { y: -200, opacity: 0 };
                      case 'DOWN': return { y: 200, opacity: 0 };
                      case 'LEFT': return { x: -200, opacity: 0 };
                      case 'RIGHT': return { x: 200, opacity: 0 };
                    }
                  };

                  return (
                    <motion.div
                      key={arrow.id}
                      style={{
                        gridRowStart: arrow.row + 1,
                        gridColumnStart: arrow.col + 1,
                      }}
                      initial={{ scale: 0.2, opacity: 0 }}
                      animate={{ 
                        scale: 1, 
                        opacity: 1,
                        x: isBlockedWiggle ? [0, -4, 4, -4, 4, 0] : 0, 
                        y: 0 
                      }}
                      exit={getMoveOffset()}
                      transition={{ 
                        type: isBlockedWiggle ? 'tween' : 'spring', 
                        duration: isBlockedWiggle ? 0.3 : 0.45 
                      }}
                      className="relative flex items-center justify-center bg-slate-800/90 border border-slate-700 hover:border-indigo-500 rounded-xl cursor-pointer shadow group select-none active:scale-95 transition-all"
                      onClick={() => handleArrowClick(arrow)}
                    >
                      {getArrowIcon(arrow.dir)}
                      <span className="absolute bottom-1 right-1 text-[8px] font-mono text-slate-500 group-hover:text-slate-300">
                        {arrow.dir[0]}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Full Clear screen splash */}
            {levelCleared && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-6 text-center"
              >
                <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-400 text-indigo-400 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-md font-sans font-semibold text-slate-100">
                  Level Cleared!
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                  Level completed successfully in <span className="text-slate-100 font-mono font-semibold">{movesCount}</span> moves. Client anti-cheat payload generated.
                </p>
                <button
                  onClick={() => resetLevelState(currentLevel)}
                  className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-colors"
                >
                  Play Grid Again
                </button>
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-4 mt-4 text-xs text-slate-400 font-mono">
            <div>Moves: <span className="text-white font-bold">{movesCount}</span></div>
            <div>•</div>
            <div>Remaining Arrows: <span className="text-white font-bold">{arrows.filter(a => a.status === 'active').length}</span></div>
          </div>
        </div>

        {/* Configuration settings & Level Generators */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Preset Levels select */}
          <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl">
            <h4 className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase mb-3">
              Standard Static Levels
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setCurrentLevel(level)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg text-center border transition-all ${
                    currentLevel.id === level.id
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/80 shadow-md shadow-indigo-950'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="font-sans font-medium">{level.name}</div>
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">{level.difficulty}</div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Neural Generation block using Gemini */}
          <div className="bg-indigo-950/20 border border-indigo-900/40 p-4 rounded-xl">
            <div className="flex items-center gap-1.5 text-indigo-300">
              <Sparkles className="w-4 h-4" />
              <h4 className="text-xs font-mono font-semibold tracking-wider uppercase">
                Dynamically Tuned Levels
              </h4>
            </div>
            <p className="text-[11px] text-indigo-200/70 mt-1">
              Request standard or custom-tuned level matrices directly from the model, simulating our LiveOps dynamically served games pipeline.
            </p>

            <div className="grid grid-cols-3 gap-2 mt-3.5">
              <button
                disabled={isAiLoading}
                onClick={() => handleGenerateAiLevel('Easy')}
                className="py-1.5 px-2 bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-800/40 text-[11px] rounded transition-all disabled:opacity-40"
              >
                Neural Easy
              </button>
              <button
                disabled={isAiLoading}
                onClick={() => handleGenerateAiLevel('Medium')}
                className="py-1.5 px-2 bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-800/40 text-[11px] rounded transition-all disabled:opacity-40"
              >
                Neural Medium
              </button>
              <button
                disabled={isAiLoading}
                onClick={() => handleGenerateAiLevel('Hard')}
                className="py-1.5 px-2 bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-800/40 text-[11px] rounded transition-all disabled:opacity-40"
              >
                Neural Hard
              </button>
            </div>

            {isAiLoading && (
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-mono mt-3 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                Prompting server model to lay out puzzle coordinates...
              </div>
            )}

            {aiNotice && (
              <div className="flex gap-1.5 text-[10px] text-yellow-500/90 font-mono mt-3.5 bg-yellow-950/10 border border-yellow-950/40 p-2 rounded">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{aiNotice}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
