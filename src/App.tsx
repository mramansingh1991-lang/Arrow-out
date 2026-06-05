import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  Trophy, 
  Award, 
  Lock, 
  Unlock, 
  Volume2, 
  VolumeX, 
  Lightbulb, 
  Zap, 
  ArrowRightCircle, 
  RefreshCw, 
  Gift, 
  Flame, 
  Coins, 
  Smile, 
  Info, 
  Sparkle,
  Send,
  BookOpen,
  ArrowRight as LucideArrowRight,
  BrainCircuit,
  MessageSquare,
  HelpCircle,
  Undo2,
  CheckCircle2,
  Gamepad2,
  Menu,
  Settings,
  LogOut,
  List,
  Palette
} from 'lucide-react';
import { GAME_LEVELS, THEMES } from './data/levelsData';
import { Arrow, Direction, GameLevel } from './types';
import { motion, AnimatePresence } from 'motion/react';

// Shared AudioContext to prevent hitting maximum concurrent contexts limit
let globalAudioCtx: AudioContext | null = null;

// Client-side synthesizer for gorgeous cute pop, swoosh, and victory sound effects (No external files needed)
const playSynthSound = (type: 'chirp' | 'block' | 'success' | 'click' | 'unlock' | 'powerup', soundOn: boolean) => {
  if (!soundOn) return;
  try {
    if (!globalAudioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      globalAudioCtx = new AudioContextClass();
    }
    const ctx = globalAudioCtx;
    
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    if (type === 'chirp') {
      // Swipe/Escape sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'block') {
      // Bounce fail thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.setValueAtTime(90, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'success') {
      // Heavenly ascending chord progression
      const freqs = [329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // E4, G4, C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.35);
      });
    } else if (type === 'click') {
      // Woodblock click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === 'unlock') {
      // Magical sparkle
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc2.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
      osc2.frequency.setValueAtTime(900, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc2.start();
      osc.stop(ctx.currentTime + 0.3);
      osc2.stop(ctx.currentTime + 0.3);
    } else if (type === 'powerup') {
      // Super beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.45);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    }
  } catch (e) {
    // browser autoplay blocks
  }
};

const calculateLevelIQScores = (lvlId: number, moves: number, elapsedSec: number) => {
  // Baseline IQ starts at 90 for level 1, climbs linearly up to 165 for level 50
  const baseIQ = 90 + (lvlId * 1.5);
  
  // High-efficiency moves bonus (relative to progressive estimated optimal moves)
  const expectedMoves = Math.max(5, 4 + Math.floor(lvlId / 4));
  let efficiencyBonus = 0;
  if (moves <= expectedMoves) {
    efficiencyBonus = (expectedMoves - moves) * 2.5 + 8; // bonus up to 20 points
  } else {
    efficiencyBonus = Math.max(-12, (expectedMoves - moves) * 0.4); // mild trial deduction
  }
  
  // Speed reflection index
  const speedBonus = elapsedSec < lvlId * 2 + 5 ? 6 : lvlId * 4 > elapsedSec ? 3 : 0;
  
  const finalIQ = Math.min(180, Math.max(82, Math.round(baseIQ + efficiencyBonus + speedBonus)));
  
  // Logical designate labels
  let title = "Novice Grid Tracker";
  let description = "Developing primary spatial coordinates and basic direction clearance.";
  
  if (finalIQ >= 155) {
    title = "Ascendant Logic Oracle (IQ 155+)";
    description = "God-like planning. Absolutely flawless containment parsing & multi-tier unblocking.";
  } else if (finalIQ >= 143) {
    title = "Quantum Spatial Grandmaster";
    description = "Phenomenal working memory! Flawlessly sequencing dense interlocking chains.";
  } else if (finalIQ >= 132) {
    title = "Elite Grid Strategist";
    description = "Exquisite forward analysis and rapid cycle detection under heavy constraints.";
  } else if (finalIQ >= 120) {
    title = "Advanced Spatial Architect";
    description = "Highly capable pathfinder with excellent coordinate clearance proficiency.";
  } else if (finalIQ >= 105) {
    title = "Proficient Logic Weaver";
    description = "Above-average cognitive planning. You resolve medium bottlenecks lookaheads beautifully!";
  } else if (finalIQ >= 90) {
    title = "Cognitive Spatial Tracker";
    description = "Solid logical solver. Ready to break into more complex multivariable layers.";
  }
  
  // Visual metrics percentages
  const pathfinding = Math.min(99, Math.round(72 + (lvlId * 0.45) + (efficiencyBonus * 0.6)));
  const workingMemory = Math.min(99, Math.round(68 + (lvlId * 0.5) - (moves * 0.12)));
  const constraintLogic = Math.min(99, Math.round(75 + (lvlId * 0.4) + speedBonus));

  return {
    iq: finalIQ,
    title,
    description,
    metrics: {
      pathfinding,
      workingMemory,
      constraintLogic
    }
  };
};

export default function App() {
  // Onboarding screens
  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);


  // Sound Config
  const [soundOn, setSoundOn] = useState<boolean>(true);

  // Active theme selections
  const [activeTheme, setActiveTheme] = useState<typeof THEMES[0]>(THEMES[0]);
  const [activeTab, setActiveTab] = useState<'game' | 'levels' | 'themes'>('game');

  // Saved levels progression index
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const [maxUnlockedIdx, setMaxUnlockedIdx] = useState<number>(0);

  // Active level state (cloned from original definition)
  const [currentLevel, setCurrentLevel] = useState<GameLevel>(GAME_LEVELS[0]);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [levelStatus, setLevelStatus] = useState<'playing' | 'solved'>('playing');

  // Move history stack for Un-doing erroneous clicks! Best for spatial brain calculation
  const [historyStack, setHistoryStack] = useState<Arrow[][]>([]);

  // Bumping triggers status to shake blocked arrow visually
  const [blockedArrowId, setBlockedArrowId] = useState<string | null>(null);
  const [hoveredArrowId, setHoveredArrowId] = useState<string | null>(null);

  // In-game economy, rewards, and multipliers to keep kids motivated!
  const [scoreCoins, setScoreCoins] = useState<number>(100);
  const [streakDays, setStreakDays] = useState<number>(1);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(['onboarding']);

  // AI Adviser Chat System configurations
  const [chatInput, setChatInput] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; offlineTip?: boolean }>>([
    {
      role: 'assistant',
      text: "💫 Hi there, young Genius! 🧬 I am your Arrow Out AI sidekick. Slide arrows that have a clear path to make them fly off! Stuck? Ask me for hints or try a different order!"
    }
  ]);

  // Load state from local storage on mount
  useEffect(() => {
    try {
      const savedMax = localStorage.getItem('arrow_out_max_unlocked');
      if (savedMax) {
        setMaxUnlockedIdx(parseInt(savedMax, 10));
      }
      const savedCoins = localStorage.getItem('arrow_out_coins');
      if (savedCoins) {
        setScoreCoins(parseInt(savedCoins, 10));
      }
      const savedThemeId = localStorage.getItem('arrow_out_theme_id');
      if (savedThemeId) {
        const matchingTheme = THEMES.find(t => t.id === savedThemeId);
        if (matchingTheme) setActiveTheme(matchingTheme);
      }
      const savedStreak = localStorage.getItem('arrow_out_streak');
      if (savedStreak) {
        setStreakDays(parseInt(savedStreak, 10));
      }
    } catch (e) {
      console.warn("Storage unreachable");
    }
  }, []);

  // Update dynamic level state whenever level index shifts
  useEffect(() => {
    if (GAME_LEVELS[currentLevelIdx]) {
      setupLevel(GAME_LEVELS[currentLevelIdx]);
    }
  }, [currentLevelIdx]);

  const setupLevel = (level: GameLevel) => {
    // Target gridSize is at least 9x9 as requested:
    const targetGridSize = Math.max(9, level.gridSize);
    const rowOffset = Math.max(0, Math.floor((targetGridSize - level.gridSize) / 2));
    const colOffset = Math.max(0, Math.floor((targetGridSize - level.gridSize) / 2));

    const adjustedLevel: GameLevel = {
      ...level,
      gridSize: targetGridSize
    };
    setCurrentLevel(adjustedLevel);
    
    // Enrich level arrows with custom shapes and cells if they are missing
    const enrichedArrows = level.arrows.map(a => {
      let originalCells = a.cells && a.cells.length > 0 ? a.cells : [];
      if (originalCells.length === 0) {
        // Fallback adapter for un-customized inputs
        const r = a.row;
        const c = a.col;
        const dir = a.dir;
        const isVertical = dir === 'UP' || dir === 'DOWN';
        originalCells = isVertical 
          ? [{ row: r, col: c }, { row: r + 1, col: c }]
          : [{ row: r, col: c }, { row: r, col: c + 1 }];
      }
      
      const shiftedCells = originalCells.map(c => ({
        row: c.row + rowOffset,
        col: c.col + colOffset
      }));
      
      return {
        ...a,
        row: a.row + rowOffset,
        col: a.col + colOffset,
        cells: shiftedCells,
        shape: a.shape || (shiftedCells.length === 1 ? 'single' as const : shiftedCells.length === 2 ? 'double' as const : 'L-shape' as const),
        status: 'active' as const
      };
    });

    // Ensure we have at least 5 arrows as requested!
    const occupied = new Set<string>();
    enrichedArrows.forEach(a => {
      a.cells.forEach(c => occupied.add(`${c.row},${c.col}`));
    });

    let finalArrows = [...enrichedArrows];
    const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    
    let injectTries = 0;
    while (finalArrows.length < 5 && injectTries < 200) {
      injectTries++;
      const dir = directions[Math.floor(Math.random() * 4)];
      const isVertical = dir === 'UP' || dir === 'DOWN';
      
      const isSingle = Math.random() > 0.4;
      const shape = isSingle ? 'single' : 'double';
      
      const r = Math.floor(Math.random() * targetGridSize);
      const c = Math.floor(Math.random() * targetGridSize);
      
      let cellsToPlace = [{ row: r, col: c }];
      if (shape === 'double') {
        cellsToPlace = isVertical
          ? [{ row: r, col: c }, { row: r + 1, col: c }]
          : [{ row: r, col: c }, { row: r, col: c + 1 }];
      }
      
      const canPlace = cellsToPlace.every(cell => 
        cell.row >= 0 && cell.row < targetGridSize &&
        cell.col >= 0 && cell.col < targetGridSize &&
        !occupied.has(`${cell.row},${cell.col}`)
      );
      
      if (canPlace) {
        cellsToPlace.forEach(cell => occupied.add(`${cell.row},${cell.col}`));
        
        finalArrows.push({
          id: `injected-${finalArrows.length}-${Date.now()}`,
          row: r,
          col: c,
          dir,
          status: 'active' as const,
          shape: shape as any,
          cells: cellsToPlace,
          isZigZag: false
        });
      }
    }

    // Ensure puzzle is fully solvable via active healing
    let solvable = isPuzzleSolvable(targetGridSize, finalArrows);
    let healerAttempts = 0;
    while (!solvable && healerAttempts < 60) {
      healerAttempts++;
      const cloned = finalArrows.map(a => ({ ...a }));
      const idx = Math.floor(Math.random() * cloned.length);
      cloned[idx].dir = directions[Math.floor(Math.random() * 4)];
      
      if (isPuzzleSolvable(targetGridSize, cloned)) {
        finalArrows = cloned;
        solvable = true;
        break;
      }
    }

    // Secondary fallback in case of extremely stubborn cycles: reset to simple solvable edge layout
    if (!solvable) {
      finalArrows = [
        { id: 'g1', row: 0, col: 2, dir: 'UP', status: 'active', shape: 'single' as const, cells: [{ row: 0, col: 2 }] },
        { id: 'g2', row: 2, col: 0, dir: 'LEFT', status: 'active', shape: 'single' as const, cells: [{ row: 2, col: 0 }] },
        { id: 'g3', row: 8, col: 4, dir: 'DOWN', status: 'active', shape: 'single' as const, cells: [{ row: 8, col: 4 }] },
        { id: 'g4', row: 4, col: 8, dir: 'RIGHT', status: 'active', shape: 'single' as const, cells: [{ row: 4, col: 8 }] },
        { id: 'g5', row: 4, col: 4, dir: 'UP', status: 'active', shape: 'single' as const, cells: [{ row: 4, col: 4 }] }
      ];
    }

    setArrows(finalArrows);
    setMovesCount(0);
    setStartTime(Date.now());
    setLevelStatus('playing');
    setHistoryStack([]);
    setBlockedArrowId(null);
    setHoveredArrowId(null);
  };

  const getChainOfCells = (cells: { row: number; col: number }[]): { row: number; col: number }[] => {
    if (cells.length <= 2) return cells;
    
    // For contiguous cells, check neighbors with Manhattan distance = 1
    const getDist = (a: { row: number; col: number }, b: { row: number; col: number }) => 
      Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
      
    // Build adjacency list for graph traversal
    const adj = new Map<number, number[]>();
    for (let i = 0; i < cells.length; i++) {
      const neighbors: number[] = [];
      for (let j = 0; j < cells.length; j++) {
        if (i !== j && getDist(cells[i], cells[j]) === 1) {
          neighbors.push(j);
        }
      }
      adj.set(i, neighbors);
    }
    
    // Find an endpoint index: cell with exactly 1 neighbor. Fallback to index 0 if none found (e.g. loops)
    let startIdx = 0;
    for (let i = 0; i < cells.length; i++) {
      if ((adj.get(i)?.length || 0) === 1) {
        startIdx = i;
        break;
      }
    }
    
    const visited = new Set<number>();
    const chain: { row: number; col: number }[] = [];
    let current: number | undefined = startIdx;
    
    while (current !== undefined && chain.length < cells.length) {
      visited.add(current);
      chain.push(cells[current]);
      
      const nexts = adj.get(current) || [];
      const unvisitedNext = nexts.find(n => !visited.has(n));
      current = unvisitedNext;
    }
    
    if (chain.length === cells.length) {
      return chain;
    }
    return cells; // fallback sorting if needed
  };

  const getSortedCells = (arrow: Arrow): { row: number; col: number }[] => {
    const cells = arrow.cells || [];
    if (cells.length === 0) return [];
    
    const dir = arrow.dir;
    const score = (cell: { row: number; col: number }) => {
      if (dir === 'UP') return -cell.row;
      if (dir === 'DOWN') return cell.row;
      if (dir === 'LEFT') return -cell.col;
      if (dir === 'RIGHT') return cell.col;
      return 0;
    };
    
    return [...cells].sort((a, b) => score(a) - score(b));
  };

  const getSortedChain = (arrow: Arrow): { row: number; col: number }[] => {
    const cells = arrow.cells || [];
    if (cells.length <= 2) {
      return getSortedCells(arrow);
    }
    const chain = getChainOfCells(cells);
    if (chain.length < 3) return chain;
    
    const end1 = chain[0];
    const end2 = chain[chain.length - 1];
    
    const dir = arrow.dir;
    const score = (cell: { row: number; col: number }) => {
      if (dir === 'UP') return -cell.row;
      if (dir === 'DOWN') return cell.row;
      if (dir === 'LEFT') return -cell.col;
      if (dir === 'RIGHT') return cell.col;
      return 0;
    };
    
    if (score(end1) > score(end2)) {
      return [...chain].reverse();
    }
    return chain;
  };

  const getThemeColors = (themeId: string, dir: Direction, isZigZag?: boolean, colorTheme?: string) => {
    const isCyber = themeId === 'cyber';
    const isCandy = themeId === 'candy';
    const isForest = themeId === 'forest';
    
    let strokeColor = '#22d3ee'; // cyan-400
    let bodyBg = 'rgba(15, 23, 42, 0.45)'; // dark slate
    let glowColor = 'rgba(34, 211, 238, 0.3)';

    // If a specific color theme is requested, override dir mapping
    const themeKey = colorTheme ? colorTheme : dir;

    if (themeKey === 'UP' || themeKey === 'cyan') {
      if (isCyber) { strokeColor = '#22d3ee'; bodyBg = 'rgba(15, 23, 42, 0.55)'; glowColor = 'rgba(34, 211, 238, 0.45)'; }
      else if (isCandy) { strokeColor = '#ec4899'; bodyBg = 'rgba(253, 244, 245, 0.85)'; glowColor = 'rgba(236, 72, 153, 0.25)'; }
      else if (isForest) { strokeColor = '#10b981'; bodyBg = 'rgba(6, 78, 59, 0.55)'; glowColor = 'rgba(16, 185, 129, 0.3)'; }
      else { strokeColor = '#22d3ee'; bodyBg = 'rgba(30, 58, 138, 0.6)'; glowColor = 'rgba(34, 211, 238, 0.3)'; }
    }
    else if (themeKey === 'DOWN' || themeKey === 'fuchsia') {
      if (isCyber) { strokeColor = '#d946ef'; bodyBg = 'rgba(15, 23, 42, 0.55)'; glowColor = 'rgba(217, 70, 239, 0.45)'; }
      else if (isCandy) { strokeColor = '#8b5cf6'; bodyBg = 'rgba(243, 232, 255, 0.85)'; glowColor = 'rgba(139, 92, 246, 0.25)'; }
      else if (isForest) { strokeColor = '#14b8a6'; bodyBg = 'rgba(19, 78, 74, 0.55)'; glowColor = 'rgba(20, 184, 166, 0.3)'; }
      else { strokeColor = '#d946ef'; bodyBg = 'rgba(88, 28, 135, 0.6)'; glowColor = 'rgba(217, 70, 239, 0.3)'; }
    }
    else if (themeKey === 'LEFT' || themeKey === 'pink') {
      if (isCyber) { strokeColor = '#ec4899'; bodyBg = 'rgba(15, 23, 42, 0.55)'; glowColor = 'rgba(236, 72, 153, 0.45)'; }
      else if (isCandy) { strokeColor = '#f59e0b'; bodyBg = 'rgba(254, 243, 199, 0.85)'; glowColor = 'rgba(245, 158, 11, 0.25)'; }
      else if (isForest) { strokeColor = '#eab308'; bodyBg = 'rgba(113, 63, 18, 0.6)'; glowColor = 'rgba(234, 179, 8, 0.3)'; }
      else { strokeColor = '#f472b6'; bodyBg = 'rgba(131, 24, 67, 0.6)'; glowColor = 'rgba(244, 114, 182, 0.3)'; }
    }
    else if (themeKey === 'RIGHT' || themeKey === 'emerald') {
      if (isCyber) { strokeColor = '#10b981'; bodyBg = 'rgba(15, 23, 42, 0.55)'; glowColor = 'rgba(16, 185, 129, 0.45)'; }
      else if (isCandy) { strokeColor = '#10b981'; bodyBg = 'rgba(209, 250, 229, 0.85)'; glowColor = 'rgba(16, 185, 129, 0.25)'; }
      else if (isForest) { strokeColor = '#84cc16'; bodyBg = 'rgba(63, 98, 18, 0.6)'; glowColor = 'rgba(132, 204, 22, 0.3)'; }
      else { strokeColor = '#a3e635'; bodyBg = 'rgba(54, 83, 20, 0.6)'; glowColor = 'rgba(163, 230, 53, 0.3)'; }
    }
    else if (themeKey === 'amber') {
      strokeColor = '#f59e0b'; bodyBg = 'rgba(120, 53, 15, 0.6)'; glowColor = 'rgba(245, 158, 11, 0.3)';
    }
    else if (themeKey === 'indigo') {
      strokeColor = '#6366f1'; bodyBg = 'rgba(49, 46, 129, 0.6)'; glowColor = 'rgba(99, 102, 241, 0.3)';
    }

    return { strokeColor, bodyBg, glowColor };
  };

  const generateSvgPath = (cells: { row: number; col: number }[], minRow: number, minCol: number, arrow: Arrow) => {
    const chain = getSortedChain(arrow);
    if (chain.length === 0) return '';
    
    const points = chain.map(cell => {
      const x = (cell.col - minCol) * 100 + 50;
      const y = (cell.row - minRow) * 100 + 50;
      return `${x},${y}`;
    });
    
    if (points.length === 1) {
      const { x, y } = chain.map(cell => ({
        x: (cell.col - minCol) * 100 + 50,
        y: (cell.row - minRow) * 100 + 50
      }))[0];
      return `M ${x} ${y - 0.1} L ${x} ${y + 0.1}`;
    }
    
    return `M ${points.join(' L ')}`;
  };

  // Return the cells that this arrow occupies in its stationary state
  function getArrowOccupiedCells(arrow: Arrow): { row: number; col: number }[] {
    return arrow.cells || [];
  }

  // Get the sequence of cell groups occupied by an arrow as it slides toward the edge to exit
  function getArrowSlideSteps(arrow: Arrow, gridSize: number): { row: number; col: number }[][] {
    if (!arrow.cells || arrow.cells.length === 0) return [];
    
    const steps: { row: number; col: number }[][] = [];
    let stepOffset = 1;
    const dir = arrow.dir;
    
    while (true) {
      let dr = 0;
      let dc = 0;
      
      if (dir === 'UP') dr = -stepOffset;
      else if (dir === 'DOWN') dr = stepOffset;
      else if (dir === 'LEFT') dc = -stepOffset;
      else if (dir === 'RIGHT') dc = stepOffset;
      
      const stepCells = arrow.cells.map(cell => ({
        row: cell.row + dr,
        col: cell.col + dc
      }));
      
      const allOut = stepCells.every(cell => 
        cell.row < 0 || cell.row >= gridSize || cell.col < 0 || cell.col >= gridSize
      );
      
      if (allOut) {
        break;
      }
      
      steps.push(stepCells);
      stepOffset++;
      
      if (stepOffset > gridSize * 4) {
        break;
      }
    }
    return steps;
  };

  // Logic to calculate if path in specified direction is free of other active arrows
  const checkBlocker = (arrow: Arrow, activeArrows: Arrow[]): Arrow | null => {
    const otherActive = activeArrows.filter(a => a.id !== arrow.id && a.status === 'active');
    const steps = getArrowSlideSteps(arrow, currentLevel.gridSize);
    
    for (const stepCells of steps) {
      for (const stepCell of stepCells) {
        // Only trigger collision if the step cell is within the board boundaries
        if (stepCell.row >= 0 && stepCell.row < currentLevel.gridSize && stepCell.col >= 0 && stepCell.col < currentLevel.gridSize) {
          const blocker = otherActive.find(other => {
            const occupied = getArrowOccupiedCells(other);
            return occupied.some(c => c.row === stepCell.row && c.col === stepCell.col);
          });
          if (blocker) {
            return blocker;
          }
        }
      }
    }
    return null;
  };

  // 100% deterministic local puzzle solver to verify levels and heal unsolvable configurations on the fly
  function isPuzzleSolvable(gridSize: number, initialArrows: Arrow[]): boolean {
    const canSlideOut = (arrow: Arrow, activeIds: Set<string>, allArrows: Arrow[]) => {
      const otherActive = allArrows.filter(a => a.id !== arrow.id && activeIds.has(a.id));
      const steps = getArrowSlideSteps(arrow, gridSize);
      for (const stepCells of steps) {
        for (const stepCell of stepCells) {
          if (stepCell.row >= 0 && stepCell.row < gridSize && stepCell.col >= 0 && stepCell.col < gridSize) {
            const isBlocked = otherActive.some(other => {
              const occupied = other.cells || [];
              return occupied.some(c => c.row === stepCell.row && c.col === stepCell.col);
            });
            if (isBlocked) return false;
          }
        }
      }
      return true;
    };

    const activeIds = new Set(initialArrows.map(a => a.id));
    const solvedStateCache = new Set<string>();
    
    const solve = (currentActive: Set<string>): boolean => {
      if (currentActive.size === 0) return true;
      
      const cacheKey = Array.from(currentActive).sort().join(',');
      if (solvedStateCache.has(cacheKey)) return false;
      
      for (const arrow of initialArrows) {
        if (currentActive.has(arrow.id)) {
          if (canSlideOut(arrow, currentActive, initialArrows)) {
            const nextActive = new Set(currentActive);
            nextActive.delete(arrow.id);
            if (solve(nextActive)) {
              return true;
            }
          }
        }
      }
      
      solvedStateCache.add(cacheKey);
      return false;
    };
    
    return solve(activeIds);
  };

  // Perform slide motion click
  const slideArrow = (arrow: Arrow) => {
    if (levelStatus === 'solved' || arrow.status !== 'active') return;

    // Check if path is clear
    const blockingArrow = checkBlocker(arrow, arrows);

    if (blockingArrow) {
      // Shakes arrow and thuds
      setBlockedArrowId(arrow.id);
      playSynthSound('block', soundOn);
      setTimeout(() => setBlockedArrowId(null), 400);

      // Trigger automatic learning Tip in robot chat
      triggerCuteTeachingTips(arrow, blockingArrow);
      return;
    }

    // Sound swoop
    playSynthSound('chirp', soundOn);

    // Save previous state to Undo stack before mutating
    setHistoryStack(prev => [...prev, arrows.map(a => ({ ...a }))]);

    // Track total moves slider clears
    setMovesCount(prev => prev + 1);

    // Mutate state
    setArrows(prev =>
      prev.map(a => (a.id === arrow.id ? { ...a, status: 'exited' as const } : a))
    );
  };

  // Check solve status
  useEffect(() => {
    if (arrows.length > 0 && arrows.every(a => a.status === 'exited') && levelStatus === 'playing') {
      handleLevelSolved();
    }
  }, [arrows, levelStatus]);

  const handleLevelSolved = () => {
    setLevelStatus('solved');
    playSynthSound('success', soundOn);

    // Earn coin reward
    const elapsedSeconds = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
    const isUnderPar = elapsedSeconds < (currentLevel.gridSize * 4);
    const rewardReward = isUnderPar ? 30 : 15;
    const newCoins = scoreCoins + rewardReward;
    setScoreCoins(newCoins);
    
    // Auto-save coins to storage
    try {
      localStorage.setItem('arrow_out_coins', newCoins.toString());
    } catch(e){}

    // Trigger next level unlock calculations
    const nextIdx = currentLevelIdx + 1;
    if (nextIdx < GAME_LEVELS.length) {
      if (nextIdx > maxUnlockedIdx) {
        setMaxUnlockedIdx(nextIdx);
        playSynthSound('unlock', soundOn);
        try {
          localStorage.setItem('arrow_out_max_unlocked', nextIdx.toString());
        } catch(e){}
      }
    }

    // Achievements evaluation
    const updatedAc = [...unlockedAchievements];
    if (currentLevel.id === 1 && !updatedAc.includes('first_win')) {
      updatedAc.push('first_win');
    }
    if (elapsedSeconds <= 5 && !updatedAc.includes('speed_demon')) {
      updatedAc.push('speed_demon');
    }
    if (nextIdx === GAME_LEVELS.length && !updatedAc.includes('grand_puzzle_master')) {
      updatedAc.push('grand_puzzle_master');
    }
    setUnlockedAchievements(updatedAc);

    // Dynamic celebration chatbot congrats
    setChatMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        text: `🎉 SENSATIONAL! You cleared "${currentLevel.name}" like an absolute spatial superstar! ⭐️ You gained +${rewardReward} logic coins for your quick brain work! Can you conquer the next unlock level?`
      }
    ]);
  };

  // Undo last slide action to promote continuous logic correction without frustration!
  const triggerUndo = () => {
    if (historyStack.length === 0) return;
    playSynthSound('click', soundOn);
    const previousState = historyStack[historyStack.length - 1];
    setArrows(previousState);
    setHistoryStack(prev => prev.slice(0, prev.length - 1));
    setMovesCount(prev => Math.max(0, prev - 1));
  };

  // Teach child why the arrow failed to escape
  const triggerCuteTeachingTips = (arrow: Arrow, blocker: Arrow) => {
    const obstacleDir = arrow.dir;
    let desc = "";
    if (obstacleDir === 'UP') desc = "above it";
    else if (obstacleDir === 'DOWN') desc = "below it";
    else if (obstacleDir === 'LEFT') desc = "to its left";
    else if (obstacleDir === 'RIGHT') desc = "to its right";

    const sweetAdvice = [
      `Oops! The arrow pointing ${arrow.dir} bumped into a friend ${desc}! 🚧 Check if you can clear the blocking arrow first to helper this one slide off!`,
      `Hold on! That arrow path is blocked! 🧩 Work backwards from the edges to find the master escape button first!`,
      `Spatial block detected! 🚦 Can you find an arrow near the border pointing outwards with nothing in its way? Try that one first!`
    ];

    setChatMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        text: sweetAdvice[Math.floor(Math.random() * sweetAdvice.length)]
      }
    ]);
  };

  // Execute Hint highlights next possible solvable arrow
  const queryHintHighlights = () => {
    playSynthSound('click', soundOn);
    
    // Look for any active arrow that does not have checkBlocker
    const activeArrows = arrows.filter(a => a.status === 'active');
    const solvable = activeArrows.find(a => checkBlocker(a, arrows) === null);

    if (solvable) {
      setBlockedArrowId(solvable.id);
      setTimeout(() => setBlockedArrowId(null), 1200); // highlight with wobble pulse

      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `💡 Brain Spark! Psst... Look closely at the arrow pointing ${solvable.dir} at Row ${solvable.row + 1}, Col ${solvable.col + 1}. Its path is completely clear! Click it!`
        }
      ]);
    } else {
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: "🔍 Hmm... No arrows are free right now! Try clicking 'Undo' ↩️ to pull back an arrow, or hit 'Reset Grid' to try a brand new mental approach!"
        }
      ]);
    }
  };

  // Spin the Magic Wheel of IQ (gains dynamic random coins!)
  const spinDailyGifts = () => {
    playSynthSound('powerup', soundOn);
    const added = Math.floor(20 + Math.random() * 40);
    const updatedCoins = scoreCoins + added;
    setScoreCoins(updatedCoins);
    
    try {
      localStorage.setItem('arrow_out_coins', updatedCoins.toString());
    } catch(e){}

    const newSc = streakDays + 1;
    setStreakDays(newSc);
    try {
      localStorage.setItem('arrow_out_streak', newSc.toString());
    } catch(e){}

    // Track state achievements
    if (!unlockedAchievements.includes('daily_spin')) {
      setUnlockedAchievements(prev => [...prev, 'daily_spin']);
    }

    setChatMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        text: `🎁 Hurrah! You claimed your Daily Brain Gift! You spun the logic wheel and found +${added} Logic Coins! Your current brain streak is now ${newSc} days! 🔥`
      }
    ]);
  };

  // Switch custom kids design theme
  const handleThemeShift = (themeItem: typeof THEMES[0]) => {
    playSynthSound('click', soundOn);
    setActiveTheme(themeItem);
    try {
      localStorage.setItem('arrow_out_theme_id', themeItem.id);
    } catch(e){}
  };

  // Ask AI Robot for logical reasoning help via Gemini consult endpoint
  const queryGeminiConsult = async (customPromptText?: string) => {
    const promptToSend = customPromptText || chatInput;
    if (!promptToSend.trim()) return;

    playSynthSound('click', soundOn);
    
    // append user text
    const intermediateMsgs = [...chatMessages, { role: 'user' as const, text: promptToSend }];
    setChatMessages(intermediateMsgs);
    setChatInput('');
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/gemini/consult', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: `The player is asking standard or high-IQ spatial puzzles questions.
The active level they play is "${currentLevel.name}" of difficulty "${currentLevel.difficulty}".
There are ${arrows.filter(a => a.status === 'active').length} arrows remaining.
User Question: "${promptToSend}"
Respond in a warm, child-friendly, interactive, encouraging way (like a fun puzzle companion), giving advice on arrow layout, logic principles, or puzzle-solving skills.`
        })
      });

      const resData = await res.json();
      if (resData.success) {
        setChatMessages(prev => [...prev, { role: 'assistant', text: resData.answer }]);
      } else {
        // use fallback beautiful offline tips context
        setChatMessages(prev => [
          ...prev,
          { 
            role: 'assistant', 
            text: resData.fallbackMessage, 
            offlineTip: resData.isKeyMissing 
          }
        ]);
      }
    } catch (e) {
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: "🌟 Good thinking! Keep your eyes on the arrows pointing completely outward to slide them off safely. Keep testing your amazing IQ!"
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Generate dynamic solvable Level layout via Gemini Server API
  const handleAiLevelGeneration = async (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    setIsAiLoading(true);
    playSynthSound('powerup', soundOn);

    try {
      const response = await fetch('/api/gemini/generate-level', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ difficulty })
      });

      const data = await response.json();
      if (data.level) {
        const generatedLevel: GameLevel = {
          id: 99 + Math.floor(Math.random() * 2000),
          name: data.level.name || `Cosmic ${difficulty}`,
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
        
        setCurrentLevel(generatedLevel);
        setArrows(generatedLevel.arrows.map(a => ({ ...a, status: 'active' as const })));
        setMovesCount(0);
        setStartTime(Date.now());
        setLevelStatus('playing');
        setHistoryStack([]);
        setBlockedArrowId(null);

        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: `🛸 WOOSH! I channeled the cosmic brain wave to craft a neural level just for you: "${generatedLevel.name}" (${difficulty})! Solve it to supercharge your logical reason powers!`
          }
        ]);
      }
    } catch (e) {
      // offline random shuffle layout
      triggerOfflineShufflePlacement(difficulty);
    } finally {
      setIsAiLoading(false);
    }
  };

  // offline randomized placement backup safely generating custom multi-box blocks (single, double, and L-shape)
  const triggerOfflineShufflePlacement = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    const size = 9;
    const arrowCount = difficulty === 'Easy' ? 5 : difficulty === 'Medium' ? 7 : 9;
    const occupiedCells = new Set<string>();
    const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    const newArrows: Arrow[] = [];
    
    for (let i = 0; i < arrowCount; i++) {
      let placed = false;
      let tries = 0;
      while (!placed && tries < 200) {
        // Choose shape: 25% single, 50% double, 25% L-shape
        const rSelect = Math.random();
        const shape: 'single' | 'double' | 'L-shape' = rSelect < 0.25 ? 'single' : rSelect < 0.75 ? 'double' : 'L-shape';
        const makeZigZag = difficulty === 'Hard' && Math.random() > 0.4;
        const dir = directions[Math.floor(Math.random() * 4)];
        
        const r = Math.floor(Math.random() * size);
        const c = Math.floor(Math.random() * size);
        
        let blockCells: { row: number; col: number }[] = [];
        if (shape === 'single') {
          blockCells = [{ row: r, col: c }];
        } else if (shape === 'double') {
          const isVertical = dir === 'UP' || dir === 'DOWN';
          if (isVertical) {
            blockCells = [{ row: r, col: c }, { row: r + 1, col: c }];
          } else {
            blockCells = [{ row: r, col: c }, { row: r, col: c + 1 }];
          }
        } else {
          // L-shape
          const isVertical = dir === 'UP' || dir === 'DOWN';
          if (isVertical) {
            const side = Math.random() > 0.5 ? 1 : -1;
            blockCells = [
              { row: r, col: c },
              { row: r + 1, col: c },
              { row: r + 1, col: c + side }
            ];
          } else {
            const side = Math.random() > 0.5 ? 1 : -1;
            blockCells = [
              { row: r, col: c },
              { row: r, col: c + 1 },
              { row: r + side, col: c + 1 }
            ];
          }
        }
        
        const allValid = blockCells.every(cell => 
          cell.row >= 0 && cell.row < size && 
          cell.col >= 0 && cell.col < size && 
          !occupiedCells.has(`${cell.row},${cell.col}`)
        );
        
        if (allValid) {
          blockCells.forEach(cell => occupiedCells.add(`${cell.row},${cell.col}`));
          newArrows.push({
            id: `shuf-${i}-${Date.now()}`,
            row: r,
            col: c,
            dir,
            status: 'active',
            isZigZag: makeZigZag,
            shape,
            cells: blockCells
          });
          placed = true;
        }
        tries++;
      }
    }

    const shufLevel: GameLevel = {
      id: 888,
      name: `Creative Cosmic ${difficulty}`,
      difficulty,
      gridSize: size,
      arrows: newArrows
    };

    setupLevel(shufLevel);

    setChatMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        text: `🎲 Dynamic 9x9 puzzle generated! Standard escape path is active. Slide each block strategically to escape!`
      }
    ]);
  };

  const getArrowIcon = (arrow: Arrow) => {
    if (arrow.isZigZag) {
      switch (arrow.dir) {
        case 'UP': // Moving UP then RIGHT
          return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-9 h-9 animate-pulse">
              <path d="M 6 18 L 6 12 L 12 12 L 12 6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 9 9 L 12 6 L 15 9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          );
        case 'DOWN': // Moving DOWN then LEFT
          return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-9 h-9 animate-pulse">
              <path d="M 18 6 L 18 12 L 12 12 L 12 18" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 15 15 L 12 18 L 9 15" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          );
        case 'LEFT': // Moving LEFT then UP
          return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-9 h-9 animate-pulse">
              <path d="M 18 18 L 12 18 L 12 12 L 6 12" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 9 15 L 6 12 L 9 9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          );
        case 'RIGHT': // Moving RIGHT then DOWN
          return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-9 h-9 animate-pulse">
              <path d="M 6 6 L 12 6 L 12 12 L 18 12" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 15 9 L 18 12 L 15 15" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          );
      }
    }

    switch (arrow.dir) {
      case 'UP': return <ArrowUp className="w-9 h-9" />;
      case 'DOWN': return <ArrowDown className="w-9 h-9" />;
      case 'LEFT': return <ArrowLeft className="w-9 h-9" />;
      case 'RIGHT': return <ArrowRight className="w-9 h-9" />;
    }
  };

  return (
    <div className={`w-full min-h-screen ${activeTheme.bgClass} text-slate-800 transition-colors duration-500 overflow-x-hidden flex flex-col`}>
      
      {/* Onboarding Welcome Screen Modal (Child Attractive Onboarding) */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-slate-900 text-white rounded-3xl border border-indigo-500/30 p-8 max-w-lg w-full text-center relative shadow-2xl shadow-indigo-500/20"
            >
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500 via-indigo-500 to-cyan-500 p-1 animate-spin-slow">
                  <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                    <Zap className="w-10 h-10 text-cyan-400 animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="mt-12 space-y-4">
                <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase font-mono">
                  ✨ COGNITIVE ACCELERATION ENGINE ✨
                </span>
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400 tracking-tight">
                  Arrow Out
                </h2>
                
                <p className="text-sm bg-slate-950/50 p-4 border border-indigo-950 rounded-2xl text-slate-300 leading-relaxed text-left">
                  🚀 <b>The Goal:</b> Twist and turn! Slide directional arrows on the grid to clear the board. But watch out! If an arrow runs into another active arrow, it blocks in place! 
                  <br /><br />
                  🧩 <b>Brain Power Booster:</b> Planning ahead and finding the clean sequence stimulates spatial reasoning, logical planning, and bumps up kids' IQ level-by-level!
                </p>

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="bg-slate-950/45 border border-slate-800 p-3 rounded-xl flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px] text-slate-400 font-medium">10 Unlocking Levels</span>
                  </div>
                  <div className="bg-slate-950/45 border border-slate-800 p-3 rounded-xl flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-[11px] text-slate-400 font-medium">Infinite AI Levels</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    playSynthSound('success', soundOn);
                    setShowOnboarding(false);
                  }}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-500 rounded-2xl font-bold text-white text-md tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-indigo-950/50"
                >
                  START BRAIN EXERCISE 🧠
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <header className="w-full bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 md:px-6 py-3 z-30 shadow-lg shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <BrainCircuit className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
          <h1 className="text-base md:text-xl font-black text-white hidden sm:block">Kids IQ Booster</h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1.5 md:gap-2 bg-slate-800 text-amber-400 px-2 py-1 md:px-3 md:py-1.5 rounded-full font-mono text-xs md:text-sm border border-slate-700">
             <Flame className="w-3 h-3 md:w-4 md:h-4" /> {streakDays} <span className="hidden sm:inline">🔥</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 bg-slate-800 text-yellow-400 px-2 py-1 md:px-3 md:py-1.5 rounded-full font-mono text-xs md:text-sm border border-slate-700">
             <Coins className="w-3 h-3 md:w-4 md:h-4" /> {scoreCoins} <span className="hidden sm:inline">💰</span>
          </div>

          <div className="h-6 w-px bg-slate-700 mx-0.5 md:mx-2 hidden sm:block"></div>

          <nav className="flex items-center gap-1 md:gap-2">
            <button 
              onClick={() => setActiveTab('game')}
              title="Play Game"
              className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all ${activeTab === 'game' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
            >
              <Gamepad2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button 
              onClick={() => setActiveTab('levels')}
              title="Levels & Achievements"
              className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all ${activeTab === 'levels' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
            >
              <List className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button 
              onClick={() => setActiveTab('themes')}
              title="Themes"
              className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all ${activeTab === 'themes' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50 shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
            >
              <Palette className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button 
              onClick={() => { window.location.reload(); }}
              title="Exit / Reload"
              className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all ml-0.5 md:ml-1"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </nav>
        </div>
      </header>

      {/* Main layout wrapper */}
      <div className="flex flex-1 overflow-hidden w-full relative bg-slate-950">

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 no-scrollbar w-full relative min-h-0" style={{ backgroundColor: activeTheme.bgClass.replace('bg-', '') }}>
          
          <div className="max-w-6xl mx-auto w-full pb-20 flex flex-col items-center justify-center min-h-full">
            
            {activeTab === 'game' && (
            <div className="flex flex-col items-center w-full max-w-full md:max-w-3xl mx-auto h-full justify-center">

              <div className={`relative p-2 sm:p-4 md:p-6 rounded-2xl md:rounded-3xl border shadow-2xl ${activeTheme.cardClass} backdrop-blur-md transition-all duration-300 w-full aspect-square max-w-full md:max-w-2xl mb-4 md:mb-8`}>
              {/* THE GAME GRID ZONE */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-40 animate-pulse">
                  <ArrowUp className="w-5 h-5 text-indigo-400" />
                  <span className="text-[8px] font-mono font-black text-indigo-400">EXIT UP</span>
                </div>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-40 animate-pulse">
                  <span className="text-[8px] font-mono font-black text-purple-400">EXIT DOWN</span>
                  <ArrowDown className="w-5 h-5 text-purple-400" />
                </div>
                <div className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center opacity-40 animate-pulse">
                  <ArrowLeft className="w-5 h-5 text-pink-400" />
                  <span className="text-[8px] font-mono font-black text-pink-400 ml-1">EXIT LEFT</span>
                </div>
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center opacity-40 animate-pulse">
                  <span className="text-[8px] font-mono font-black text-emerald-400 mr-1">EXIT RIGHT</span>
                  <ArrowRight className="w-5 h-5 text-emerald-400" />
                </div>

                {/* Thin lines solid board grid lines */}
                <div 
                  className="absolute inset-5 grid gap-0 pointer-events-none text-slate-400"
                  style={{
                    gridTemplateColumns: `repeat(${currentLevel.gridSize}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${currentLevel.gridSize}, minmax(0, 1fr))`
                  }}
                >
                  {Array.from({ length: currentLevel.gridSize * currentLevel.gridSize }).map((_, i) => {
                    const r = Math.floor(i / currentLevel.gridSize);
                    const c = i % currentLevel.gridSize;
                    
                    // Check if cell is in hovered arrow's slide trajectory
                    let isTrajectory = false;
                    let blockAccent = 'text-cyan-400';
                    if (hoveredArrowId) {
                      const hArrow = arrows.find(a => a.id === hoveredArrowId && a.status === 'active');
                      if (hArrow) {
                        const steps = getArrowSlideSteps(hArrow, currentLevel.gridSize);
                        isTrajectory = steps.some(stepCells => stepCells.some(sc => sc.row === r && sc.col === c));
                        if (hArrow.dir === 'UP') blockAccent = 'text-cyan-450';
                        else if (hArrow.dir === 'DOWN') blockAccent = 'text-fuchsia-450';
                        else if (hArrow.dir === 'LEFT') blockAccent = 'text-pink-450';
                        else if (hArrow.dir === 'RIGHT') blockAccent = 'text-emerald-455';
                      }
                    }

                    return (
                      <div 
                        key={i} 
                        className={`border-b-[0.5px] border-r-[0.5px] border-solid opacity-25 ${activeTheme.gridBorderColor} ${
                          r === 0 ? `border-t-[0.5px]` : ''
                        } ${
                          c === 0 ? `border-l-[0.5px]` : ''
                        } relative flex items-center justify-center`}
                      >
                        {isTrajectory && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [0.7, 1.1, 0.7], opacity: [0.4, 0.9, 0.4] }}
                            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                            className={`w-3 h-3 rounded-full bg-current ${blockAccent} shadow-md`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* GRID CONTENT ARROWS */}
                <div 
                  className="absolute inset-5 grid gap-0"
                  style={{
                    gridTemplateColumns: `repeat(${currentLevel.gridSize}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${currentLevel.gridSize}, minmax(0, 1fr))`
                  }}
                >
                  <AnimatePresence>
                    {arrows.map((arrow) => {
                      if (arrow.status !== 'active') return null;

                      const cells = getArrowOccupiedCells(arrow);
                      if (cells.length === 0) return null;
                      
                      const rows = cells.map(c => c.row);
                      const cols = cells.map(c => c.col);
                      const minRow = Math.min(...rows);
                      const maxRow = Math.max(...rows);
                      const minCol = Math.min(...cols);
                      const maxCol = Math.max(...cols);
                      
                      const numRows = maxRow - minRow + 1;
                      const numCols = maxCol - minCol + 1;

                      const isWobbly = blockedArrowId === arrow.id;

                      let styleClasses = '';
                      if (arrow.dir === 'UP') styleClasses = activeTheme.arrowUp;
                      else if (arrow.dir === 'DOWN') styleClasses = activeTheme.arrowDown;
                      else if (arrow.dir === 'LEFT') styleClasses = activeTheme.arrowLeft;
                      else if (arrow.dir === 'RIGHT') styleClasses = activeTheme.arrowRight;

                      const getFlyOffMotion = () => {
                        const dist = 350;
                        switch (arrow.dir) {
                          case 'UP': return { y: -dist, scale: 0.1, opacity: 0 };
                          case 'DOWN': return { y: dist, scale: 0.1, opacity: 0 };
                          case 'LEFT': return { x: -dist, scale: 0.1, opacity: 0 };
                          case 'RIGHT': return { x: dist, scale: 0.1, opacity: 0 };
                        }
                      };

                      const tColors = getThemeColors(activeTheme.id, arrow.dir, arrow.isZigZag, arrow.colorTheme);
                      const isHovered = hoveredArrowId === arrow.id;
                      const pathD = generateSvgPath(cells, minRow, minCol, arrow);

                      const sorted = getSortedChain(arrow);
                      const hCell = sorted[sorted.length - 1] || cells[0];
                      const hx = (hCell.col - minCol) * 100 + 50;
                      const hy = (hCell.row - minRow) * 100 + 50;

                      return (
                        <motion.div
                          key={arrow.id}
                          style={{
                            gridRow: `${minRow + 1} / span ${numRows}`,
                            gridColumn: `${minCol + 1} / span ${numCols}`,
                          }}
                          initial={{ scale: 0.4, rotate: 180, opacity: 0 }}
                          animate={{ 
                            scale: 1, 
                            rotate: 0,
                            opacity: 1,
                            x: isWobbly ? [0, -6, 6, -6, 6, 0] : 0,
                            y: 0
                          }}
                          exit={getFlyOffMotion()}
                          transition={{ 
                            type: isWobbly ? 'tween' : 'spring', 
                            stiffness: 140, 
                            damping: 15,
                            duration: isWobbly ? 0.35 : 0.5 
                          }}
                          onClick={() => slideArrow(arrow)}
                          onMouseEnter={() => setHoveredArrowId(arrow.id)}
                          onMouseLeave={() => setHoveredArrowId(null)}
                          className="relative w-full h-full p-2 cursor-pointer select-none group transition-all duration-150 active:scale-95"
                        >
                          {/* Continuous SVG capsule shape for unified arrow piece */}
                          <svg
                            className="absolute inset-0 w-full h-full overflow-visible"
                            viewBox={`0 0 ${numCols * 100} ${numRows * 100}`}
                            preserveAspectRatio="none"
                          >
                            <defs>
                              <filter id={`glow-${arrow.id}`} x="-35%" y="-35%" width="170%" height="170%">
                                <feGaussianBlur stdDeviation={isHovered ? "12" : "6"} result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                              </filter>
                            </defs>

                             {/* Border and backglow of the capsule */}
                            {pathD && (
                              <path
                                d={pathD}
                                fill="none"
                                stroke={tColors.strokeColor}
                                strokeWidth={76}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                opacity={isHovered ? 0.65 : 0.25}
                                filter={`url(#glow-${arrow.id})`}
                                className="transition-all duration-350 animate-pulse"
                              />
                            )}

                            {/* Solid translucent matching color fill of the capsule body */}
                            {pathD && (
                              <path
                                d={pathD}
                                fill="none"
                                stroke={tColors.bodyBg}
                                strokeWidth={68}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="transition-all duration-300"
                              />
                            )}

                            {/* Sleek retro tech center thread line indicator (thin outline) */}
                            {pathD && (
                              <path
                                d={pathD}
                                fill="none"
                                stroke={tColors.strokeColor}
                                strokeWidth={70}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                opacity={0.15}
                                className="transition-all duration-300"
                              />
                            )}

                            {/* Bold Continuous Arrow Line to make the arrow extremely clear & visible */}
                            {pathD && cells.length > 1 && (
                              <path
                                d={pathD}
                                fill="none"
                                stroke={tColors.strokeColor}
                                strokeWidth={18}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                opacity={isHovered ? 1.0 : 0.85}
                                className="transition-all duration-200"
                              />
                            )}

                            {/* Bright white core thread line inside the line */}
                            {pathD && cells.length > 1 && (
                              <path
                                d={pathD}
                                fill="none"
                                stroke="#ffffff"
                                strokeWidth={5}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                opacity={isHovered ? 0.95 : 0.6}
                                strokeDasharray={arrow.isZigZag ? "6 8" : undefined}
                                className="transition-all duration-200"
                              />
                            )}

                            {/* Bold Dynamic Solid Arrowhead at Exit/Exit Cell with neon backglow and crisp white inner pointer */}
                            {cells.length > 1 && (
                              <g className="transition-all duration-300">
                                {arrow.dir === 'UP' && (
                                  <>
                                    <polygon
                                      points={`${hx},${hy - 26} ${hx - 20},${hy + 8} ${hx + 20},${hy + 8}`}
                                      fill={tColors.strokeColor}
                                      stroke={tColors.strokeColor}
                                      strokeWidth={4}
                                      strokeLinejoin="round"
                                    />
                                    <polygon
                                      points={`${hx},${hy - 20} ${hx - 10},${hy + 6} ${hx + 10},${hy + 6}`}
                                      fill="#ffffff"
                                    />
                                  </>
                                )}
                                {arrow.dir === 'DOWN' && (
                                  <>
                                    <polygon
                                      points={`${hx},${hy + 26} ${hx - 20},${hy - 8} ${hx + 20},${hy - 8}`}
                                      fill={tColors.strokeColor}
                                      stroke={tColors.strokeColor}
                                      strokeWidth={4}
                                      strokeLinejoin="round"
                                    />
                                    <polygon
                                      points={`${hx},${hy + 20} ${hx - 10},${hy - 6} ${hx + 10},${hy - 6}`}
                                      fill="#ffffff"
                                    />
                                  </>
                                )}
                                {arrow.dir === 'LEFT' && (
                                  <>
                                    <polygon
                                      points={`${hx - 26},${hy} ${hx + 8},${hy - 20} ${hx + 8},${hy + 20}`}
                                      fill={tColors.strokeColor}
                                      stroke={tColors.strokeColor}
                                      strokeWidth={4}
                                      strokeLinejoin="round"
                                    />
                                    <polygon
                                      points={`${hx - 20},${hy} ${hx + 6},${hy - 10} ${hx + 6},${hy + 10}`}
                                      fill="#ffffff"
                                    />
                                  </>
                                )}
                                {arrow.dir === 'RIGHT' && (
                                  <>
                                    <polygon
                                      points={`${hx + 26},${hy} ${hx - 8},${hy - 20} ${hx - 8},${hy + 20}`}
                                      fill={tColors.strokeColor}
                                      stroke={tColors.strokeColor}
                                      strokeWidth={4}
                                      strokeLinejoin="round"
                                    />
                                    <polygon
                                      points={`${hx + 20},${hy} ${hx - 6},${hy - 10} ${hx - 6},${hy + 10}`}
                                      fill="#ffffff"
                                    />
                                  </>
                                )}
                              </g>
                            )}

                            {/* For single cells, draw a spectacular bold arrow centered inside */}
                            {cells.length === 1 && (
                              <g className="transition-all duration-300">
                                {arrow.dir === 'UP' && (
                                  <>
                                    <line x1={50} y1={80} x2={50} y2={22} stroke={tColors.strokeColor} strokeWidth={16} strokeLinecap="round" />
                                    <path d="M 22 46 L 50 18 L 78 46" fill="none" stroke={tColors.strokeColor} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
                                    <line x1={50} y1={80} x2={50} y2={22} stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />
                                  </>
                                )}
                                {arrow.dir === 'DOWN' && (
                                  <>
                                    <line x1={50} y1={20} x2={50} y2={78} stroke={tColors.strokeColor} strokeWidth={16} strokeLinecap="round" />
                                    <path d="M 22 54 L 50 82 L 78 54" fill="none" stroke={tColors.strokeColor} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
                                    <line x1={50} y1={20} x2={50} y2={78} stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />
                                  </>
                                )}
                                {arrow.dir === 'LEFT' && (
                                  <>
                                    <line x1={80} y1={50} x2={22} y2={50} stroke={tColors.strokeColor} strokeWidth={16} strokeLinecap="round" />
                                    <path d="M 46 22 L 18 50 L 46 78" fill="none" stroke={tColors.strokeColor} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
                                    <line x1={80} y1={50} x2={22} y2={50} stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />
                                  </>
                                )}
                                {arrow.dir === 'RIGHT' && (
                                  <>
                                    <line x1={20} y1={50} x2={78} y2={50} stroke={tColors.strokeColor} strokeWidth={16} strokeLinecap="round" />
                                    <path d="M 54 22 L 82 50 L 54 78" fill="none" stroke={tColors.strokeColor} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
                                    <line x1={20} y1={50} x2={78} y2={50} stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />
                                  </>
                                )}
                              </g>
                            )}
                          </svg>

                          {/* Overlaid cell controls & indicators */}
                          <div className="absolute inset-0 w-full h-full pointer-events-none">
                            {cells.map((cell, idx) => {
                              const left = ((cell.col - minCol) / numCols) * 100;
                              const top = ((cell.row - minRow) / numRows) * 100;
                              const width = (1 / numCols) * 100;
                              const height = (1 / numRows) * 100;
                              
                              return (
                                <div
                                  key={`${cell.row}-${cell.col}`}
                                  style={{
                                    position: 'absolute',
                                    left: `${left}%`,
                                    top: `${top}%`,
                                    width: `${width}%`,
                                    height: `${height}%`
                                  }}
                                  className="flex items-center justify-center p-1 relative"
                                >
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

              </div>

              {/* Moves and Hint buttons bar */}
              <div className="flex items-center gap-4 mt-6 text-xs text-slate-100 font-mono w-full justify-center">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-1.5 text-slate-300">
                  Total moves made: <b className="text-white text-sm">{movesCount}</b>
                </div>

                <button
                  onClick={queryHintHighlights}
                  className="flex items-center gap-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 rounded-xl px-4 py-1.5 transition-all font-bold group"
                >
                  <Lightbulb className="w-4 h-4 text-yellow-400 group-hover:scale-110" />
                  <span>Get Smart Hint</span>
                </button>
              </div>
            </div>
            )}

            {activeTab === 'themes' && (
            <div className="flex flex-col gap-6 max-w-2xl mx-auto">
              {/* Custom Theme Skin Changer block (Attractive to kids!) */}
              <h4 className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase mb-3.5">
                🎨 Match your mood! SELECT SKIN THEME:
              </h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => handleThemeShift(th)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      activeTheme.id === th.id
                        ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-950/20'
                        : 'bg-slate-950 text-slate-500 border-slate-850 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <span>{th.name}</span>
                    <div className="flex gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-400"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 font-mono"></span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* Level Clear overlay popup celebration splash covering the entire screen cleanly with z-[999] layer to prevent layout overlaps and clicks */}
            {levelStatus === 'solved' && (() => {
              const elapsedSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
              const iqData = calculateLevelIQScores(currentLevel.id, movesCount, elapsedSec);
              
              return (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[999] overflow-y-auto"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="w-full max-w-[390px] bg-slate-900 border-2 border-indigo-500/40 rounded-3xl flex flex-col items-center justify-center p-6 md:p-8 text-center text-white gap-5 max-h-[92vh] overflow-y-auto shadow-2xl relative"
                  >
                    {/* Decorative Top Accent line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[3px] bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 rounded-full" />

                    {/* Title Header */}
                    <div className="flex flex-col items-center">
                      <motion.div 
                        animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                        className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-400 text-amber-400 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                      >
                        <Trophy className="w-8 h-8 text-amber-400" />
                      </motion.div>

                      <h3 className="text-3xl font-black tracking-wider bg-gradient-to-r from-amber-300 via-emerald-400 to-cyan-300 bg-clip-text text-transparent uppercase animate-pulse">
                        GREAT JOB!
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        Grid Clearance Successful • Level {currentLevel.id}
                      </p>
                    </div>

                    {/* Dynamic Spatial IQ Score Board */}
                    <div className="flex flex-col items-center w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 shadow-inner relative overflow-hidden">
                      <span className="text-[9px] text-indigo-300 tracking-widest font-extrabold uppercase font-mono mb-2">
                        COGNITIVE IQ ASSESSMENT
                      </span>

                      {/* Interactive Neon Ring with Huge Score */}
                      <div className="relative w-24 h-24 flex items-center justify-center rounded-full border-4 border-dashed border-cyan-400/40 my-1 animate-spin-slow">
                        <div className="absolute w-20 h-20 rounded-full border-2 border-indigo-500/50 flex flex-col items-center justify-center bg-slate-900 shadow-[0_0_20px_rgba(34,211,238,0.2)] animate-none">
                          <span className="text-3xl font-black text-cyan-300 tracking-tighter font-mono">
                            {iqData.iq}
                          </span>
                          <span className="text-[8px] text-slate-400 font-bold tracking-tight">
                            EST. IQ
                          </span>
                        </div>
                      </div>

                      {/* Rank Badge */}
                      <div className="text-xs font-black tracking-tight text-amber-300 px-4 py-1 bg-amber-950/50 border border-amber-500/30 rounded-full font-mono mt-3 shadow-md uppercase">
                        ⚡ {iqData.title}
                      </div>

                      <p className="text-[11px] text-slate-300 mt-2.5 leading-relaxed font-sans max-w-[250px]">
                        {iqData.description}
                      </p>
                    </div>

                    {/* Cognitive Skill breakdown with beautiful progress animations */}
                    <div className="w-full space-y-2.5 font-sans">
                      {/* Metric 1 */}
                      <div>
                        <div className="flex justify-between items-center text-[10px] font-bold font-mono text-slate-400 mb-0.5">
                          <span>SPATIAL PATHFINDING</span>
                          <span className="text-cyan-400 font-black">{iqData.metrics.pathfinding}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${iqData.metrics.pathfinding}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                          />
                        </div>
                      </div>

                      {/* Metric 2 */}
                      <div>
                        <div className="flex justify-between items-center text-[10px] font-bold font-mono text-slate-400 mb-0.5">
                          <span>CONSTRAINT SOLVING</span>
                          <span className="text-emerald-400 font-black">{iqData.metrics.constraintLogic}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${iqData.metrics.constraintLogic}%` }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                          />
                        </div>
                      </div>

                      {/* Metric 3 */}
                      <div>
                        <div className="flex justify-between items-center text-[10px] font-bold font-mono text-slate-400 mb-0.5">
                          <span>WORKING MEMORY INDEX</span>
                          <span className="text-fuchsia-400 font-black">{iqData.metrics.workingMemory}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${iqData.metrics.workingMemory}%` }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                            className="h-full bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom action buttons with full visibility and clickability */}
                    <div className="flex gap-3 mt-2 w-full">
                      <button
                        onClick={() => {
                          setupLevel(currentLevel);
                        }}
                        className="flex-1 py-3 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold tracking-wider rounded-xl border border-slate-800 transition-all font-mono active:scale-95"
                      >
                        Replay
                      </button>
                      
                      {currentLevelIdx + 1 < GAME_LEVELS.length ? (
                        <button
                          onClick={() => {
                            playSynthSound('unlock', soundOn);
                            setCurrentLevelIdx(prev => prev + 1);
                          }}
                          className="flex-2 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-95 active:scale-95 transition-all shadow-[0_4px_15px_rgba(6,182,212,0.3)] font-sans text-white text-center"
                        >
                          NEXT LEVEL →
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            playSynthSound('powerup', soundOn);
                            const nextRnd = Math.floor(Math.random() * GAME_LEVELS.length);
                            setCurrentLevelIdx(nextRnd);
                          }}
                          className="flex-2 py-3 bg-gradient-to-r from-pink-500 to-fuchsia-500 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_15px_rgba(236,72,153,0.35)] active:scale-95"
                        >
                          RANDOM LEVEL
                        </button>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })()}

            {activeTab === 'levels' && (
            <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
            {/* Gamified Achievements Progress Matrix */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 text-white text-xs">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
              <Award className="w-5 h-5 text-yellow-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono">
                My Spatial brain Achievements ({unlockedAchievements.filter(x => x !== 'onboarding').length}/4)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-sans">
              <div className={`p-3 rounded-2xl border ${unlockedAchievements.includes('daily_spin') ? 'bg-emerald-950/20 border-emerald-900 text-emerald-300' : 'bg-slate-950/40 border-slate-850 text-slate-500'}`}>
                <div className="font-bold flex items-center gap-1.5 text-xs text-slate-100">
                  <Gift className="w-3.5 h-3.5 text-emerald-400" />
                  Lucky Spinner
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Claim your first Daily Reward to accumulate bonus gold.</p>
              </div>

              <div className={`p-3 rounded-2xl border ${unlockedAchievements.includes('first_win') ? 'bg-indigo-950/20 border-indigo-900 text-indigo-300' : 'bg-slate-950/40 border-slate-850 text-slate-500'}`}>
                <div className="font-bold flex items-center gap-1.5 text-xs text-slate-100">
                  <Smile className="w-3.5 h-3.5 text-indigo-400" />
                  First Escape Artist
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Clear Level 1 without bumping any intersecting arrow path.</p>
              </div>

              <div className={`p-3 rounded-2xl border ${unlockedAchievements.includes('speed_demon') ? 'bg-rose-950/20 border-rose-900 text-rose-300' : 'bg-slate-950/40 border-slate-850 text-slate-500'}`}>
                <div className="font-bold flex items-center gap-1.5 text-xs text-slate-100">
                  <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  Sub-5s Lightning Solver
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Solve any puzzle level in under 5 seconds utilizing speed logic calculation.</p>
              </div>

              <div className={`p-3 rounded-2xl border ${unlockedAchievements.includes('grand_puzzle_master') ? 'bg-amber-950/20 border-amber-900 text-amber-300' : 'bg-slate-950/40 border-slate-850 text-slate-500'}`}>
                <div className="font-bold flex items-center gap-1.5 text-xs text-slate-100">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  Grand Puzzle Mastermind
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Conquer all 10 progressively challenging puzzle levels successfully.</p>
              </div>
            </div>
          </div>
          
          {/* Main Campaign Grid level selection list */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-black uppercase tracking-wider">
                  Arrow Out Level Roadmap Index
                </h3>
              </div>
              <span className="text-[10px] font-mono text-indigo-400">Streak: {streakDays}d</span>
            </div>

            <p className="text-[11px] text-slate-400 mb-4 font-sans">
              Solve each puzzle sequentially to unlock the next harder setup. Complete all 125 levels to demonstrate Ultimate Spatial IQ Logic Grandmaster status!
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 text-xs">
              {GAME_LEVELS.map((level, index) => {
                const isUnlocked = true; // index <= maxUnlockedIdx;
                const isActive = index === currentLevelIdx;

                return (
                  <button
                    key={level.id}
                    disabled={!isUnlocked}
                    onClick={() => {
                      playSynthSound('click', soundOn);
                      setCurrentLevelIdx(index);
                      setActiveTab('game');
                    }}
                    className={`p-3 rounded-2xl text-left border relative transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-900 to-indigo-950/90 border-indigo-500 text-white shadow-lg'
                        : isUnlocked
                          ? 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-200'
                          : 'bg-slate-950/50 border-slate-950/60 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold font-mono opacity-60">Level {index + 1}</span>
                      {isActive ? (
                        <Unlock className="w-3 h-3 text-cyan-400" />
                      ) : isUnlocked ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Lock className="w-3 h-3 text-slate-700" />
                      )}
                    </div>
                    
                    <div className="font-bold truncate mt-1">
                      {level.name.split(": ")[1] || level.name}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[9px] font-mono uppercase bg-slate-900/60 px-1.5 py-0.5 rounded text-slate-400 group-hover:text-slate-200">
                        {level.difficulty}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">
                        {level.gridSize}x{level.gridSize} Grid
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Daily logic spin button */}
            <div className="mt-4 bg-slate-950 p-4 border border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-200">Spin the IQ Wheel!</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Collect daily starting coins rewards!</p>
                </div>
                <button
                  onClick={spinDailyGifts}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 font-bold hover:scale-105 rounded-xl transition-all shadow text-[11px]"
                >
                  Spin wheel 🎁
                </button>
              </div>
            </div>
          </div>

          {/* DYNAMIC DISSOLVING TUNES / MODEL-POWERED LEVELS GENERATORS */}
          <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-3xl p-5 text-white">
            <div className="flex items-center gap-1.5 text-indigo-300">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <h4 className="text-xs font-mono font-bold tracking-wider uppercase">
                Dynamic Dynamic Level Ingress (Gemini Live)
              </h4>
            </div>

            <p className="text-[11px] text-indigo-200/70 mt-1 font-sans">
              Simulates live game tuning. Rather than shipping manual bundle updates, request puzzle structures directly from the neural endpoint!
            </p>

            <div className="grid grid-cols-3 gap-2 mt-4 text-[10px]">
              <button
                onClick={() => handleAiLevelGeneration('Easy')}
                className="py-1.5 px-1 bg-indigo-900/35 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-800/40 font-mono rounded-xl transition-all"
              >
                Inflow Easy
              </button>
              <button
                onClick={() => handleAiLevelGeneration('Medium')}
                className="py-1.5 px-1 bg-indigo-900/35 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-800/40 font-mono rounded-xl transition-all"
              >
                Inflow Medium
              </button>
              <button
                onClick={() => handleAiLevelGeneration('Hard')}
                className="py-1.5 px-1 bg-indigo-900/35 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-800/40 font-mono rounded-xl transition-all"
              >
                Inflow Hard
              </button>
            </div>
          </div>

          {/* DYNAMIC AI ROBOT COMPANION CHAT PANEL */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 text-white">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-white">
                <BrainCircuit className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-mono font-black uppercase tracking-wider">
                  Brainiac AI logic sidekick
                </h3>
                <p className="text-[9px] text-slate-500">
                  Ask strategy tips, logic tricks, or quiz me!
                </p>
              </div>
            </div>

            {/* Simulated/Gemini Message feeds */}
            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1 text-xs">
              {chatMessages.map((msg, idx) => {
                const isRobot = msg.role === 'assistant';
                return (
                  <div key={idx} className={`flex flex-col ${isRobot ? 'items-start' : 'items-end'}`}>
                    <span className="text-[8px] text-slate-500 font-mono mb-0.5">
                      {isRobot ? 'Brainiac Robot' : 'Me (Spatial Genius)'}
                    </span>
                    <div className={`p-3 rounded-2xl max-w-[90%] leading-relaxed ${
                      isRobot 
                        ? 'bg-slate-950 text-indigo-200 border border-indigo-950/60' 
                        : 'bg-indigo-600 text-white'
                    }`}>
                      {msg.text}

                      {msg.offlineTip && (
                        <div className="mt-2 text-[9px] text-yellow-500 border-t border-slate-800/80 pt-1.5 font-mono">
                          ⚡ <b>Setup Secret Key hint:</b> Create an API secret named <code>GEMINI_API_KEY</code> on your bottom-left Settings secret panel for real-time live AI conversations!
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick helper prompts buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                onClick={() => queryGeminiConsult("Explain why sliding arrows is a great exercise for child cognitive logic?")}
                className="px-2 py-1 bg-slate-955 hover:bg-slate-900 text-[10px] text-cyan-400 border border-slate-800 rounded-lg"
              >
                Why is this educational? 🧠
              </button>
              <button
                onClick={() => queryGeminiConsult("Give me a cool puzzle quote or riddle to motivate spatial IQ!")}
                className="px-2 py-1 bg-slate-955 hover:bg-slate-900 text-[10px] text-cyan-400 border border-slate-800 rounded-lg"
              >
                Give me a logical joke! 🤖
              </button>
            </div>

            {/* Dynamic chat interact input area */}
            <div className="flex items-center gap-2 mt-2 bg-slate-950 p-2 border border-slate-850 rounded-2xl shadow-inner">
              <input
                type="text"
                placeholder="Ask Brainiac any logic queries..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') queryGeminiConsult();
                }}
                disabled={isAiLoading}
                className="flex-1 bg-transparent px-2.5 py-1 text-xs outline-none text-white placeholder-slate-600"
              />
              <button
                onClick={() => queryGeminiConsult()}
                disabled={isAiLoading || !chatInput.trim()}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all disabled:opacity-30"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
          </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
}
