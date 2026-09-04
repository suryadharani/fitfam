import { MemberInsight } from '../types';

export const DEMO_MEMBERS: Record<string, MemberInsight> = {
  dad: {
    name: 'Dad',
    currentWeight: '78.4 kg',
    wowChange: '↓ 0.3 kg',
    wowTrendClass: 'trend-down',
    totalChange: '↓ 0.9 kg',
    totalTrendClass: 'trend-down',
    historyWeeks: 5,
    trendSummary: 'Gradual decrease',
    avgWeight: '78.8 kg',
    chartPoints: [
      { cx: 40, cy: 30, val: '79.3' },
      { cx: 120, cy: 45, val: '79.0' },
      { cx: 200, cy: 60, val: '78.8' },
      { cx: 280, cy: 75, val: '78.7' },
      { cx: 360, cy: 95, val: '78.4' }
    ],
    areaPath: 'M 40,30 L 120,45 L 200,60 L 280,75 L 360,95 L 360,120 L 40,120 Z',
    linePath: 'M 40,30 L 120,45 L 200,60 L 280,75 L 360,95'
  },
  mom: {
    name: 'Mom',
    currentWeight: '65.1 kg',
    wowChange: '↓ 0.2 kg',
    wowTrendClass: 'trend-down',
    totalChange: '↓ 0.6 kg',
    totalTrendClass: 'trend-down',
    historyWeeks: 5,
    trendSummary: 'Steady consistency',
    avgWeight: '65.4 kg',
    chartPoints: [
      { cx: 40, cy: 35, val: '65.7' },
      { cx: 120, cy: 45, val: '65.5' },
      { cx: 200, cy: 55, val: '65.3' },
      { cx: 280, cy: 65, val: '65.3' },
      { cx: 360, cy: 80, val: '65.1' }
    ],
    areaPath: 'M 40,35 L 120,45 L 200,55 L 280,65 L 360,80 L 360,120 L 40,120 Z',
    linePath: 'M 40,35 L 120,45 L 200,55 L 280,65 L 360,80'
  },
  daughter: {
    name: 'Daughter',
    currentWeight: '52.3 kg',
    wowChange: '→ 0.0 kg',
    wowTrendClass: 'text-muted',
    totalChange: '↓ 0.4 kg',
    totalTrendClass: 'trend-down',
    historyWeeks: 4,
    trendSummary: 'Stable baseline',
    avgWeight: '52.4 kg',
    chartPoints: [
      { cx: 40, cy: 40, val: '52.7' },
      { cx: 120, cy: 50, val: '52.5' },
      { cx: 200, cy: 60, val: '52.3' },
      { cx: 280, cy: 60, val: '52.3' },
      { cx: 360, cy: 60, val: '52.3' }
    ],
    areaPath: 'M 40,40 L 120,50 L 200,60 L 280,60 L 360,60 L 360,120 L 40,120 Z',
    linePath: 'M 40,40 L 120,50 L 200,60 L 280,60 L 360,60'
  }
};

export const RELATIONSHIP_SHORTCUTS = ['Me', 'Dad', 'Mom', 'Son', 'Daughter'];
export const RELATIONSHIP_CUSTOM = ['Cousin Ravi', 'Aunt', 'Grandmother', 'Brother', 'Priya', 'Uncle', 'Roommate'];
