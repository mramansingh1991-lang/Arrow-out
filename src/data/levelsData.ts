import { GameLevel } from '../types';

export const THEMES = [
  {
    id: 'cyber',
    name: 'Neon Cyber',
    bgClass: 'bg-[#0B0F19]',
    cardClass: 'bg-slate-900/90 border-indigo-500/30',
    accentColor: 'text-cyan-400',
    gridBgClass: 'bg-slate-950/80 border-indigo-950',
    arrowUp: 'bg-indigo-950/40 border-cyan-500/60 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.2)]',
    arrowDown: 'bg-indigo-950/40 border-fuchsia-500/60 text-fuchsia-400 shadow-[0_0_12px_rgba(236,72,153,0.2)]',
    arrowLeft: 'bg-indigo-950/40 border-pink-500/60 text-pink-400 shadow-[0_0_12px_rgba(244,63,94,0.2)]',
    arrowRight: 'bg-indigo-950/40 border-emerald-500/60 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    uiText: 'text-slate-300',
    primaryBtn: 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]',
    gridBorderColor: 'border-slate-800/65',
    titleGradient: 'from-cyan-400 via-indigo-400 to-fuchsia-400'
  },
  {
    id: 'candy',
    name: 'Candy Dream',
    bgClass: 'bg-[#FFF0F5]',
    cardClass: 'bg-white border-pink-200 shadow-xl shadow-pink-100/60',
    accentColor: 'text-pink-500',
    gridBgClass: 'bg-pink-50/50 border-pink-100',
    arrowUp: 'bg-pink-100 border-pink-300 text-pink-600 shadow-[0_4px_6px_rgba(244,63,94,0.15)] hover:bg-pink-200',
    arrowDown: 'bg-purple-100 border-purple-300 text-purple-600 shadow-[0_4px_6px_rgba(168,85,247,0.15)] hover:bg-purple-200',
    arrowLeft: 'bg-amber-100 border-amber-300 text-amber-600 shadow-[0_4px_6px_rgba(245,158,11,0.15)] hover:bg-amber-200',
    arrowRight: 'bg-emerald-100 border-emerald-300 text-emerald-600 shadow-[0_4px_6px_rgba(16,185,129,0.15)] hover:bg-emerald-200',
    uiText: 'text-slate-700',
    primaryBtn: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-[0_4px_15px_rgba(244,63,94,0.35)]',
    gridBorderColor: 'border-pink-200/50',
    titleGradient: 'from-pink-500 via-purple-500 to-amber-500'
  },
  {
    id: 'forest',
    name: 'Magic Canopy',
    bgClass: 'bg-[#0E1B15]',
    cardClass: 'bg-emerald-950/40 border-emerald-900/50',
    accentColor: 'text-emerald-400',
    gridBgClass: 'bg-[#060D0A] border-emerald-950',
    arrowUp: 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.15)]',
    arrowDown: 'bg-teal-950/60 border-teal-500/50 text-teal-300 shadow-[0_0_10px_rgba(20,184,166,0.15)]',
    arrowLeft: 'bg-yellow-950/60 border-yellow-500/50 text-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.15)]',
    arrowRight: 'bg-lime-950/60 border-lime-500/50 text-lime-300 shadow-[0_0_10px_rgba(132,204,22,0.15)]',
    uiText: 'text-emerald-100/90',
    primaryBtn: 'bg-emerald-600 hover:bg-emerald-500 text-emerald-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    gridBorderColor: 'border-emerald-900/60',
    titleGradient: 'from-emerald-400 via-teal-300 to-yellow-300'
  },
  {
    id: 'solar',
    name: 'Cosmic Golden',
    bgClass: 'bg-[#150F05]',
    cardClass: 'bg-amber-950/30 border-amber-900/60',
    accentColor: 'text-amber-400',
    gridBgClass: 'bg-[#0B0703] border-amber-950',
    arrowUp: 'bg-amber-950/50 border-amber-500/55 text-amber-300 shadow-[0_4px_10px_rgba(245,158,11,0.2)]',
    arrowDown: 'bg-rose-950/50 border-rose-500/55 text-rose-300 shadow-[0_4px_10px_rgba(244,63,94,0.2)]',
    arrowLeft: 'bg-orange-950/50 border-orange-500/55 text-orange-300 shadow-[0_4px_10px_rgba(249,115,22,0.2)]',
    arrowRight: 'bg-yellow-950/50 border-yellow-500/55 text-yellow-300 shadow-[0_4px_10px_rgba(234,179,8,0.2)]',
    uiText: 'text-amber-100/80',
    primaryBtn: 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]',
    gridBorderColor: 'border-amber-900/40',
    titleGradient: 'from-amber-400 via-orange-400 to-rose-450'
  }
];

const initialLevels: GameLevel[] = [
  {
    id: 1,
    name: "Level 1: Launch Pad",
    difficulty: "Easy",
    gridSize: 4,
    arrows: [
      { id: '1-1', row: 1, col: 1, dir: 'UP', status: 'active', shape: 'double', cells: [{ row: 1, col: 1 }, { row: 2, col: 1 }] },
      { id: '1-2', row: 0, col: 1, dir: 'LEFT', status: 'active', shape: 'single', cells: [{ row: 0, col: 1 }] }
    ]
  },
  {
    id: 2,
    name: "Level 2: Follow Me",
    difficulty: "Easy",
    gridSize: 4,
    arrows: [
      { id: '2-1', row: 1, col: 1, dir: 'UP', status: 'active', shape: 'double', cells: [{ row: 1, col: 1 }, { row: 2, col: 1 }] },
      { id: '2-2', row: 0, col: 1, dir: 'LEFT', status: 'active', shape: 'single', cells: [{ row: 0, col: 1 }] },
      { id: '2-3', row: 0, col: 0, dir: 'DOWN', status: 'active', shape: 'double', cells: [{ row: 0, col: 0 }, { row: 1, col: 0 }] }
    ]
  },
  {
    id: 3,
    name: "Level 3: Underpass",
    difficulty: "Easy",
    gridSize: 4,
    arrows: [
      { id: '3-1', row: 2, col: 1, dir: 'RIGHT', status: 'active', shape: 'double', cells: [{ row: 2, col: 1 }, { row: 2, col: 2 }] },
      { id: '3-2', row: 1, col: 3, dir: 'UP', status: 'active', shape: 'double', cells: [{ row: 1, col: 3 }, { row: 2, col: 3 }] },
      { id: '3-3', row: 0, col: 2, dir: 'LEFT', status: 'active', shape: 'double', cells: [{ row: 0, col: 2 }, { row: 0, col: 3 }] }
    ]
  },
  {
    id: 4,
    name: "Level 4: Corner Gate",
    difficulty: "Easy",
    gridSize: 5,
    arrows: [
      { id: '4-1', row: 1, col: 1, dir: 'LEFT', status: 'active', shape: 'single', cells: [{ row: 1, col: 1 }] },
      { id: '4-2', row: 1, col: 3, dir: 'DOWN', status: 'active', shape: 'double', cells: [{ row: 1, col: 3 }, { row: 2, col: 3 }] },
      { id: '4-3', row: 3, col: 2, dir: 'LEFT', status: 'active', shape: 'double', cells: [{ row: 3, col: 2 }, { row: 3, col: 3 }] },
      { id: '4-4', row: 2, col: 1, dir: 'UP', status: 'active', shape: 'double', cells: [{ row: 2, col: 1 }, { row: 3, col: 1 }] }
    ]
  },
  {
    id: 5,
    name: "Level 5: Squeeze Key",
    difficulty: "Medium",
    gridSize: 5,
    arrows: [
      { id: '5-1', row: 1, col: 1, dir: 'LEFT', status: 'active', shape: 'double', cells: [{ row: 1, col: 1 }, { row: 1, col: 2 }] },
      { id: '5-2', row: 2, col: 1, dir: 'DOWN', status: 'active', shape: 'double', cells: [{ row: 2, col: 1 }, { row: 3, col: 1 }] },
      { id: '5-3', row: 3, col: 2, dir: 'RIGHT', status: 'active', shape: 'double', cells: [{ row: 3, col: 2 }, { row: 3, col: 3 }] },
      { id: '5-4', row: 1, col: 3, dir: 'UP', status: 'active', shape: 'double', cells: [{ row: 1, col: 3 }, { row: 2, col: 3 }] },
      { id: '5-5', row: 2, col: 2, dir: 'UP', status: 'active', shape: 'single', cells: [{ row: 2, col: 2 }] }
    ]
  },
  {
    id: 6,
    name: "Level 6: Interlock Spiral",
    difficulty: "Medium",
    gridSize: 5,
    arrows: [
      { id: '6-1', row: 1, col: 2, dir: 'RIGHT', status: 'active', shape: 'double', cells: [{ row: 1, col: 2 }, { row: 1, col: 3 }] },
      { id: '6-2', row: 2, col: 3, dir: 'DOWN', status: 'active', shape: 'double', cells: [{ row: 2, col: 3 }, { row: 3, col: 3 }] },
      { id: '6-3', row: 3, col: 1, dir: 'LEFT', status: 'active', shape: 'double', cells: [{ row: 3, col: 1 }, { row: 3, col: 2 }] },
      { id: '6-4', row: 2, col: 1, dir: 'UP', status: 'active', shape: 'double', cells: [{ row: 2, col: 1 }, { row: 2, col: 2 }] },
      { id: '6-5', row: 0, col: 2, dir: 'UP', status: 'active', shape: 'single', cells: [{ row: 0, col: 2 }] }
    ]
  },
  {
    id: 7,
    name: "Level 7: Double Gate",
    difficulty: "Medium",
    gridSize: 5,
    arrows: [
      { id: '7-1', row: 1, col: 1, dir: 'UP', status: 'active', shape: 'double', cells: [{ row: 1, col: 1 }, { row: 2, col: 1 }] },
      { id: '7-2', row: 0, col: 1, dir: 'LEFT', status: 'active', shape: 'single', cells: [{ row: 0, col: 1 }] },
      { id: '7-3', row: 2, col: 3, dir: 'DOWN', status: 'active', shape: 'double', cells: [{ row: 2, col: 3 }, { row: 3, col: 3 }] },
      { id: '7-4', row: 4, col: 2, dir: 'RIGHT', status: 'active', shape: 'double', cells: [{ row: 4, col: 2 }, { row: 4, col: 3 }] },
      { id: '7-5', row: 3, col: 2, dir: 'LEFT', status: 'active', shape: 'single', cells: [{ row: 3, col: 2 }] }
    ]
  },
  {
    id: 8,
    name: "Level 8: Highway Junction",
    difficulty: "Medium",
    gridSize: 6,
    arrows: [
      { id: '8-1', row: 0, col: 3, dir: 'DOWN', status: 'active', shape: 'double', cells: [{ row: 0, col: 3 }, { row: 1, col: 3 }] },
      { id: '8-2', row: 2, col: 3, dir: 'DOWN', status: 'active', shape: 'double', cells: [{ row: 2, col: 3 }, { row: 3, col: 3 }] },
      { id: '8-3', row: 4, col: 3, dir: 'DOWN', status: 'active', shape: 'double', cells: [{ row: 4, col: 3 }, { row: 5, col: 3 }] },
      { id: '8-4', row: 1, col: 4, dir: 'LEFT', status: 'active', shape: 'double', cells: [{ row: 1, col: 4 }, { row: 1, col: 5 }] },
      { id: '8-5', row: 3, col: 1, dir: 'RIGHT', status: 'active', shape: 'double', cells: [{ row: 3, col: 1 }, { row: 3, col: 2 }] },
      { id: '8-6', row: 2, col: 2, dir: 'UP', status: 'active', shape: 'single', cells: [{ row: 2, col: 2 }] }
    ]
  },
  {
    id: 9,
    name: "Level 9: Dual Vortex",
    difficulty: "Hard",
    gridSize: 6,
    arrows: [
      { id: '9-1', row: 1, col: 1, dir: 'RIGHT', status: 'active', shape: 'single', cells: [{ row: 1, col: 1 }] },
      { id: '9-2', row: 1, col: 3, dir: 'DOWN', status: 'active', shape: 'double', cells: [{ row: 1, col: 3 }, { row: 2, col: 3 }] },
      { id: '9-3', row: 3, col: 3, dir: 'LEFT', status: 'active', shape: 'double', cells: [{ row: 3, col: 3 }, { row: 3, col: 4 }] },
      { id: '9-4', row: 2, col: 2, dir: 'UP', status: 'active', shape: 'double', cells: [{ row: 2, col: 2 }, { row: 3, col: 2 }] },
      { id: '9-5', row: 4, col: 4, dir: 'LEFT', status: 'active', shape: 'double', cells: [{ row: 4, col: 4 }, { row: 4, col: 5 }] },
      { id: '9-6', row: 0, col: 2, dir: 'UP', status: 'active', shape: 'single', cells: [{ row: 0, col: 2 }] },
      { id: '9-7', row: 5, col: 1, dir: 'RIGHT', status: 'active', shape: 'double', cells: [{ row: 5, col: 1 }, { row: 5, col: 2 }] }
    ]
  },
  {
    id: 10,
    name: "Level 10: Infinite Maze Lock",
    difficulty: "Hard",
    gridSize: 6,
    arrows: [
      { id: '10-1', row: 1, col: 1, dir: 'RIGHT', status: 'active', shape: 'double', cells: [{ row: 1, col: 1 }, { row: 1, col: 2 }] },
      { id: '10-2', row: 1, col: 3, dir: 'DOWN', status: 'active', shape: 'double', cells: [{ row: 1, col: 3 }, { row: 2, col: 3 }] },
      { id: '10-3', row: 3, col: 2, dir: 'LEFT', status: 'active', shape: 'double', cells: [{ row: 3, col: 2 }, { row: 3, col: 3 }] },
      { id: '10-4', row: 2, col: 1, dir: 'UP', status: 'active', shape: 'double', cells: [{ row: 2, col: 1 }, { row: 3, col: 1 }] },
      { id: '10-5', row: 4, col: 1, dir: 'RIGHT', status: 'active', shape: 'double', cells: [{ row: 4, col: 1 }, { row: 4, col: 2 }] },
      { id: '10-6', row: 4, col: 3, dir: 'UP', status: 'active', shape: 'double', cells: [{ row: 4, col: 3 }, { row: 5, col: 3 }] },
      { id: '10-7', row: 0, col: 4, dir: 'RIGHT', status: 'active', shape: 'double', cells: [{ row: 0, col: 4 }, { row: 0, col: 5 }] },
      { id: '10-8', row: 2, col: 5, dir: 'DOWN', status: 'active', shape: 'single', cells: [{ row: 2, col: 5 }] }
    ]
  }
];

// High-fidelity Tech-logical level name generator
function getLevelTechTitle(id: number): string {
  const prefixes = ["Quantum", "Helix", "Hyper", "Cyber", "Vector", "Cosmic", "Neon", "Turing", "Neural", "Matrix", "Chrono", "Aether", "Dynamic", "Boolean", "Spectral", "Krypton", "Omni", "Prism", "Solenoid", "Titan"];
  const roots = ["Labyrinth", "Gatekeeper", "Vortex", "Squeeze", "Interlock", "Escape", "Junction", "Circuit", "Synapse", "Cascade", "Paradox", "Crypt", "Matrix", "Nexus", "Conundrum", "Gridlock", "Entanglement", "Weave"];
  const suffixes = ["Protocol", "Alpha", "Prime", "Sync", "Modulus", "Infinite", "Cascade", "Grid", "Helix", "Zero", "Core", "Theta", "Lambda", "Entropy", "Overload"];
  
  const prefix = prefixes[id % prefixes.length];
  const root = roots[(id + 3) % roots.length];
  const suffix = suffixes[(id + 7) % suffixes.length];
  
  if (id === 50) return "Ultimate IQ Logic Grandmaster";
  if (id === 25) return "Midpoint Cognitive Barrier";
  if (id === 40) return "Master Chronos Core";
  return `${prefix} ${root} ${suffix}`;
}

// Straight line sliding steps for compile-time validation
function getArrowSlideSteps(arrow: any, gridSize: number): { row: number; col: number }[][] {
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
    
    const stepCells = arrow.cells.map((cell: any) => ({
      row: cell.row + dr,
      col: cell.col + dc
    }));
    
    const allOut = stepCells.every((cell: any) => 
      cell.row < 0 || cell.row >= gridSize || cell.col < 0 || cell.col >= gridSize
    );
    
    if (allOut) {
      break;
    }
    
    steps.push(stepCells);
    stepOffset++;
  }
  
  return steps;
}

// 100% deterministic puzzle solver during level pre-generation
function isLevelSolvable(gridSize: number, initialArrows: any[]): boolean {
  const canSlideOut = (arrow: any, activeIds: Set<string>, allArrows: any[]) => {
    const otherActive = allArrows.filter(a => a.id !== arrow.id && activeIds.has(a.id));
    const steps = getArrowSlideSteps(arrow, gridSize);
    for (const stepCells of steps) {
      for (const stepCell of stepCells) {
        if (stepCell.row >= 0 && stepCell.row < gridSize && stepCell.col >= 0 && stepCell.col < gridSize) {
          const isBlocked = otherActive.some(other => {
            const occupied = other.cells || [];
            return occupied.some((c: any) => c.row === stepCell.row && c.col === stepCell.col);
          });
          if (isBlocked) return false;
        }
      }
    }
    return true;
  };

  const activeIds = new Set<string>(initialArrows.map(a => a.id));
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
}

// Programmatic Generator to yield levels 11 through 50 logically
const generatedLevels: GameLevel[] = [];
const directions: ('UP' | 'DOWN' | 'LEFT' | 'RIGHT')[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

for (let id = 11; id <= 50; id++) {
  // Systematic level sizing and arrow counts for strictly increasing toughness
  let gridSize = 6;
  let arrowCount = 8;
  let difficulty: 'Medium' | 'Hard' | 'Expert' = 'Medium';

  if (id <= 11) {
    gridSize = 6;
    arrowCount = 8;
    difficulty = 'Hard';
  } else if (id <= 17) {
    gridSize = 6;
    arrowCount = 9 + (id - 12); // 9 to 14
    difficulty = 'Hard';
  } else if (id <= 25) {
    gridSize = 7;
    arrowCount = 13 + Math.floor((id - 18) * 0.75); // 13 to 18
    difficulty = 'Expert';
  } else if (id <= 35) {
    gridSize = 8;
    arrowCount = 19 + Math.floor((id - 26) * 0.7); // 19 to 25
    difficulty = 'Expert';
  } else {
    gridSize = 9;
    arrowCount = 26 + Math.floor((id - 36) * 1.05); // 26 to 40
    difficulty = 'Expert';
  }

  const placedArrows: any[] = [];
  const occupiedCells = new Set<string>();
  let layoutSeed = id * 7891;

  const lcgRandom = () => {
    layoutSeed = (layoutSeed * 9301 + 49297) % 233280;
    return layoutSeed / 233280;
  };

  let attempts = 0;
  const maxAttempts = 500;

  while (placedArrows.length < arrowCount && attempts < maxAttempts) {
    attempts++;

    const r = Math.floor(lcgRandom() * gridSize);
    const c = Math.floor(lcgRandom() * gridSize);
    const dir = directions[Math.floor(lcgRandom() * 4)];
    
    // Straight single, straight inline double, or L-shape (Zig-Zag)
    const shapeSelect = lcgRandom();
    const shape: 'single' | 'double' | 'L-shape' = shapeSelect < 0.2 ? 'single' : (shapeSelect < 0.5 ? 'double' : 'L-shape');
    
    let cells: { row: number; col: number }[] = [];
    if (shape === 'single') {
      cells = [{ row: r, col: c }];
    } else if (shape === 'double') {
      const isVert = dir === 'UP' || dir === 'DOWN';
      if (isVert) {
        const nextR = r + 1 < gridSize ? r + 1 : r - 1;
        cells = [{ row: r, col: c }, { row: nextR, col: c }].sort((a, b) => a.row - b.row);
      } else {
        const nextC = c + 1 < gridSize ? c + 1 : c - 1;
        cells = [{ row: r, col: c }, { row: r, col: nextC }].sort((a, b) => a.col - b.col);
      }
    } else {
      // L-shape (Zig-Zag)
      const nextR = r + 1 < gridSize ? r + 1 : r - 1;
      const nextC = c + 1 < gridSize ? c + 1 : c - 1;
      cells = [
        { row: r, col: c },
        { row: nextR, col: c },
        { row: nextR, col: nextC }
      ];
    }
    
    const boundsOk = cells.every(cell => cell.row >= 0 && cell.row < gridSize && cell.col >= 0 && cell.col < gridSize);
    if (!boundsOk) continue;

    const hasCollision = cells.some(cell => occupiedCells.has(`${cell.row},${cell.col}`));
    if (hasCollision) continue;

    // Constructive solvability path check is complex for L-shapes. 
    // Simplified: check if bounding box of arrow is mostly clear or if another arrow exists
    
    // Constructive solvability path check: exit path must have no collisions with ALREADY placed arrows
    let pathOk = true;
    for (const cell of cells) {
      if (dir === 'UP') {
        for (let rowIdx = 0; rowIdx < cell.row; rowIdx++) {
          if (occupiedCells.has(`${rowIdx},${cell.col}`)) { pathOk = false; break; }
        }
      } else if (dir === 'DOWN') {
        for (let rowIdx = cell.row + 1; rowIdx < gridSize; rowIdx++) {
          if (occupiedCells.has(`${rowIdx},${cell.col}`)) { pathOk = false; break; }
        }
      } else if (dir === 'LEFT') {
        for (let colIdx = 0; colIdx < cell.col; colIdx++) {
          if (occupiedCells.has(`${cell.row},${colIdx}`)) { pathOk = false; break; }
        }
      } else if (dir === 'RIGHT') {
        for (let colIdx = cell.col + 1; colIdx < gridSize; colIdx++) {
          if (occupiedCells.has(`${cell.row},${colIdx}`)) { pathOk = false; break; }
        }
      }
      if (!pathOk) break;
    }

    if (!pathOk) continue;

    // Safe to place!
    cells.forEach(cell => occupiedCells.add(`${cell.row},${cell.col}`));
    placedArrows.push({
      id: `${id}-${placedArrows.length}`,
      row: cells[0].row,
      col: cells[0].col,
      dir,
      status: 'active' as const,
      shape,
      cells,
      isZigZag: shape === 'L-shape' && (difficulty === 'Hard' || difficulty === 'Expert')
    });
  }

  generatedLevels.push({
    id,
    name: `Level ${id}: ${getLevelTechTitle(id)}`,
    difficulty,
    gridSize,
    arrows: placedArrows
  });
}

export const GAME_LEVELS: GameLevel[] = [...initialLevels, ...generatedLevels];
