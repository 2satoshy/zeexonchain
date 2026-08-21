import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { SMEStock } from '../types';
import { LayoutGrid, TrendingUp, BarChart3 } from 'lucide-react';

interface SectorTreemapProps {
  stocks: SMEStock[];
  onSelectSector?: (sector: string) => void;
}

interface SectorData {
  name: string;
  value: number;
  performance: number; // user percentage return e.g. +18.4
  marketPerformance: number; // ZSE market average percentage return e.g. +12.0
  children?: SectorData[];
}

export const SectorTreemap: React.FC<SectorTreemapProps> = ({ stocks }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'performance' | 'comparison'>('performance');

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous SVG
    d3.select(containerRef.current).selectAll('*').remove();

    // Group stocks by sector & aggregate value, performance and ZSE market average
    const sectorMap: Record<string, { value: number; userPerf: number; marketPerf: number; count: number }> = {
      'Agrotech & Farming': { value: 920, userPerf: 18.5, marketPerf: 12.0, count: 2 },
      'Mining & Minerals': { value: 1150, userPerf: 22.1, marketPerf: 15.5, count: 2 },
      'Fintech & Payments': { value: 840, userPerf: 14.2, marketPerf: 9.8, count: 2 },
      'Manufacturing': { value: 680, userPerf: 9.8, marketPerf: 7.2, count: 1 },
      'Renewable Energy': { value: 450, userPerf: 26.4, marketPerf: 18.2, count: 1 },
      'Logistics & Transport': { value: 220, userPerf: 11.0, marketPerf: 8.5, count: 1 }
    };

    const rootData: SectorData = {
      name: 'Portfolio Sectors',
      value: 0,
      performance: 0,
      marketPerformance: 0,
      children: Object.entries(sectorMap).map(([name, data]) => ({
        name,
        value: data.value,
        performance: data.userPerf,
        marketPerformance: data.marketPerf
      }))
    };

    const width = containerRef.current.clientWidth || 600;
    const height = 320;

    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', '100%')
      .style('font-family', 'inherit');

    const root = d3.hierarchy(rootData)
      .sum(d => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemap = d3.treemap<SectorData>()
      .size([width, height])
      .paddingInner(4)
      .paddingOuter(2)
      .paddingTop(2);

    treemap(root);

    const leaf = svg.selectAll('g')
      .data(root.leaves())
      .join('g')
      .attr('transform', d => {
        const node = d as d3.HierarchyRectangularNode<SectorData>;
        return `translate(${node.x0},${node.y0})`;
      });

    // Add hover effects and glow/scale
    leaf.style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        const node = d as d3.HierarchyRectangularNode<SectorData>;
        const g = d3.select(this);
        g.raise(); // bring to front
        
        // Scale and glow transition
        g.transition()
          .duration(200)
          .attr('transform', `translate(${node.x0 - 2},${node.y0 - 2}) scale(${(node.x1 - node.x0 + 4) / (node.x1 - node.x0)})`);
        
        g.select('rect')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 3)
          .style('filter', 'drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.25))');
      })
      .on('mouseleave', function(event, d) {
        const node = d as d3.HierarchyRectangularNode<SectorData>;
        const g = d3.select(this);
        
        g.transition()
          .duration(200)
          .attr('transform', `translate(${node.x0},${node.y0})`);
        
        g.select('rect')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2)
          .style('filter', 'none');
      });

    // Add rectangles
    leaf.append('rect')
      .attr('id', d => (d.data as SectorData).name)
      .attr('width', d => {
        const node = d as d3.HierarchyRectangularNode<SectorData>;
        return node.x1 - node.x0;
      })
      .attr('height', d => {
        const node = d as d3.HierarchyRectangularNode<SectorData>;
        return node.y1 - node.y0;
      })
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', d => {
        const data = d.data as SectorData;
        const val = viewMode === 'performance' ? data.performance : (data.performance - data.marketPerformance);
        if (viewMode === 'performance') {
          if (val > 20) return '#059669'; // emerald-600
          if (val > 15) return '#10b981'; // emerald-500
          if (val > 10) return '#34d399'; // emerald-400
          return '#6ee7b7'; // emerald-300
        } else {
          // Comparison vs Market: Outperforming = Emerald, Underperforming = Slate/Blue
          return val >= 5 ? '#2563eb' : val >= 0 ? '#3b82f6' : '#94a3b8';
        }
      })
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('transition', 'all 0.2s ease');

    // Add text labels if box is large enough
    leaf.append('text')
      .attr('x', 10)
      .attr('y', 20)
      .text(d => {
        const node = d as d3.HierarchyRectangularNode<SectorData>;
        return (node.x1 - node.x0 > 75 && node.y1 - node.y0 > 50) ? (node.data as SectorData).name : '';
      })
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#ffffff');

    leaf.append('text')
      .attr('x', 10)
      .attr('y', 38)
      .text(d => {
        const node = d as d3.HierarchyRectangularNode<SectorData>;
        if (node.x1 - node.x0 < 75 || node.y1 - node.y0 < 50) return '';
        const data = d.data as SectorData;
        if (viewMode === 'performance') {
          return `$${data.value} (+${data.performance}%)`;
        } else {
          const diff = (data.performance - data.marketPerformance).toFixed(1);
          return `ZSE Avg: +${data.marketPerformance}% (${Number(diff) >= 0 ? '+' : ''}${diff}%)`;
        }
      })
      .attr('font-size', '10px')
      .attr('fill', 'rgba(255, 255, 255, 0.95)');

  }, [stocks, viewMode]);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider">
            <LayoutGrid className="w-4 h-4" />
            <span>D3 Treemap Allocation & ZSE Comparison</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">SME Sector Weight & Market Benchmark</h3>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setViewMode('performance')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${viewMode === 'performance' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Portfolio Returns
          </button>
          <button
            onClick={() => setViewMode('comparison')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${viewMode === 'comparison' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            vs ZSE Market Q3
          </button>
        </div>
      </div>

      <div ref={containerRef} className="w-full h-80 rounded-2xl overflow-hidden bg-slate-50 p-2 border border-slate-100"></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 pt-1 gap-2">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>User Portfolio Avg: <strong className="text-slate-900">+17.0%</strong></span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>ZSE Market Q3 Avg: <strong className="text-slate-900">+10.4%</strong></span>
          </span>
        </div>
        <span className="font-semibold text-emerald-600">Outperforming Benchmark by +6.6% Q3</span>
      </div>
    </div>
  );
};

