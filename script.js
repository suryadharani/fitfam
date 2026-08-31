/**
 * FitFam Preview Interactive Script
 * Handles sample member insight tab switching, dynamic SVG chart updates,
 * and family setup mockup interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Member Profile Demo Data
  const memberData = {
    dad: {
      name: "Dad",
      currentWeight: "78.4 kg",
      wowChange: "↓ 0.3 kg",
      wowTrendClass: "trend-down",
      totalChange: "↓ 0.9 kg",
      totalTrendClass: "trend-down",
      historyWeeks: 5,
      trendSummary: "Gradual decrease",
      avgWeight: "78.8 kg",
      chartPoints: [
        { cx: 40, cy: 30, val: "79.3" },
        { cx: 120, cy: 45, val: "79.0" },
        { cx: 200, cy: 60, val: "78.8" },
        { cx: 280, cy: 75, val: "78.7" },
        { cx: 360, cy: 95, val: "78.4" }
      ],
      areaPath: "M 40,30 L 120,45 L 200,60 L 280,75 L 360,95 L 360,120 L 40,120 Z",
      linePath: "M 40,30 L 120,45 L 200,60 L 280,75 L 360,95"
    },
    mom: {
      name: "Mom",
      currentWeight: "65.1 kg",
      wowChange: "↓ 0.2 kg",
      wowTrendClass: "trend-down",
      totalChange: "↓ 0.6 kg",
      totalTrendClass: "trend-down",
      historyWeeks: 5,
      trendSummary: "Steady consistency",
      avgWeight: "65.4 kg",
      chartPoints: [
        { cx: 40, cy: 35, val: "65.7" },
        { cx: 120, cy: 45, val: "65.5" },
        { cx: 200, cy: 55, val: "65.3" },
        { cx: 280, cy: 65, val: "65.3" },
        { cx: 360, cy: 80, val: "65.1" }
      ],
      areaPath: "M 40,35 L 120,45 L 200,55 L 280,65 L 360,80 L 360,120 L 40,120 Z",
      linePath: "M 40,35 L 120,45 L 200,55 L 280,65 L 360,80"
    },
    daughter: {
      name: "Daughter",
      currentWeight: "52.3 kg",
      wowChange: "→ 0.0 kg",
      wowTrendClass: "text-muted",
      totalChange: "↓ 0.4 kg",
      totalTrendClass: "trend-down",
      historyWeeks: 4,
      trendSummary: "Stable baseline",
      avgWeight: "52.4 kg",
      chartPoints: [
        { cx: 40, cy: 40, val: "52.7" },
        { cx: 120, cy: 50, val: "52.5" },
        { cx: 200, cy: 60, val: "52.3" },
        { cx: 280, cy: 60, val: "52.3" },
        { cx: 360, cy: 60, val: "52.3" }
      ],
      areaPath: "M 40,40 L 120,50 L 200,60 L 280,60 L 360,60 L 360,120 L 40,120 Z",
      linePath: "M 40,40 L 120,50 L 200,60 L 280,60 L 360,60"
    }
  };

  // 2. Member Tab Switching Interaction
  const tabButtons = document.querySelectorAll('.tab-btn');
  const currentWeightEl = document.getElementById('current-weight');
  const wowChangeEl = document.getElementById('wow-change');
  const totalChangeEl = document.getElementById('total-change');
  const trendSummaryEl = document.getElementById('trend-summary');
  const avgWeightEl = document.getElementById('avg-weight');
  const chartAreaEl = document.getElementById('chart-area');
  const chartLineEl = document.getElementById('chart-line');
  const chartPointsEl = document.getElementById('chart-points');

  function updateMemberInsight(memberKey) {
    const data = memberData[memberKey];
    if (!data) return;

    // Update Text Elements
    if (currentWeightEl) currentWeightEl.textContent = data.currentWeight;
    if (wowChangeEl) {
      wowChangeEl.textContent = data.wowChange;
      wowChangeEl.className = `metric-value ${data.wowTrendClass}`;
    }
    if (totalChangeEl) {
      totalChangeEl.textContent = data.totalChange;
      totalChangeEl.className = `metric-value ${data.totalTrendClass}`;
    }
    if (trendSummaryEl) trendSummaryEl.textContent = data.trendSummary;
    if (avgWeightEl) avgWeightEl.textContent = data.avgWeight;

    // Update SVG Chart
    if (chartAreaEl) chartAreaEl.setAttribute('d', data.areaPath);
    if (chartLineEl) chartLineEl.setAttribute('d', data.linePath);

    if (chartPointsEl) {
      chartPointsEl.innerHTML = '';
      data.chartPoints.forEach((pt, idx) => {
        const isLast = idx === data.chartPoints.length - 1;
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pt.cx);
        circle.setAttribute('cy', pt.cy);
        circle.setAttribute('r', isLast ? '6' : '5');
        circle.setAttribute('fill', isLast ? 'var(--accent-emerald)' : '#fff');
        circle.setAttribute('stroke', isLast ? '#fff' : 'var(--accent-emerald)');
        circle.setAttribute('stroke-width', '2');
        chartPointsEl.appendChild(circle);
      });
    }
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const member = btn.getAttribute('data-member');
      updateMemberInsight(member);
    });
  });

  // 3. Family Setup Custom Chips Interaction
  const chips = document.querySelectorAll('.chip');
  const mockInput = document.querySelector('.mock-input');

  chips.forEach(chip => {
    chip.style.cursor = 'pointer';
    chip.addEventListener('click', () => {
      if (mockInput) {
        mockInput.textContent = chip.textContent.trim();
        mockInput.style.borderColor = 'var(--accent-emerald)';
        setTimeout(() => {
          mockInput.style.borderColor = 'rgba(16, 185, 129, 0.35)';
        }, 600);
      }
    });
  });

  // 4. Smooth Anchor Scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
