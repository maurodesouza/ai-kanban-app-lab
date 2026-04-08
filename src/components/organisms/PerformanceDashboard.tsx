import React from 'react';
import { usePerformanceMonitoring } from '@/hooks/use-performance-monitoring';

interface PerformanceDashboardProps {
  className?: string;
}

export const PerformanceDashboard = ({ className = '' }: PerformanceDashboardProps) => {
  const {
    metrics,
    issues,
    isMonitoring,
    budget,
    startMonitoring,
    clearIssues,
    getPerformanceScore,
  } = usePerformanceMonitoring();

  const score = getPerformanceScore();

  const formatMetric = (value: number | undefined, unit: string) => {
    if (value === undefined) return 'N/A';
    return `${value.toFixed(2)}${unit}`;
  };

  const getStatusColor = (metric: string, value: number | undefined) => {
    if (value === undefined) return 'text-gray-500';
    
    const threshold = (budget as any)[metric];
    if (value <= threshold) return 'text-green-600';
    if (value <= threshold * 1.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Performance Monitor</h3>
        <div className="flex items-center gap-2">
          <div className={`text-sm font-bold ${getScoreColor(score)}`}>
            {score}%
          </div>
          <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`} />
        </div>
      </div>

      {/* Core Web Vitals */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-xs">
          <span>LCP:</span>
          <span className={getStatusColor('LCP', metrics.LCP)}>
            {formatMetric(metrics.LCP, 'ms')}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span>FID:</span>
          <span className={getStatusColor('FID', metrics.FID)}>
            {formatMetric(metrics.FID, 'ms')}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span>CLS:</span>
          <span className={getStatusColor('CLS', metrics.CLS)}>
            {formatMetric(metrics.CLS, '')}
          </span>
        </div>
      </div>

      {/* Custom Metrics */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-xs">
          <span>Drag:</span>
          <span className={getStatusColor('dragResponseTime', metrics.dragResponseTime)}>
            {formatMetric(metrics.dragResponseTime, 'ms')}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Filter:</span>
          <span className={getStatusColor('filterResponseTime', metrics.filterResponseTime)}>
            {formatMetric(metrics.filterResponseTime, 'ms')}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span>FPS:</span>
          <span className={getStatusColor('fps', metrics.fps)}>
            {formatMetric(metrics.fps, '')}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Memory:</span>
          <span className={getStatusColor('memoryUsage', metrics.memoryUsage)}>
            {formatMetric(metrics.memoryUsage, 'MB')}
          </span>
        </div>
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold text-red-600 mb-1">
            Issues ({issues.length})
          </div>
          <div className="max-h-20 overflow-y-auto">
            {issues.slice(-3).map((issue, index) => (
              <div
                key={index}
                className={`text-xs p-1 rounded ${
                  issue.severity === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {issue.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {!isMonitoring ? (
          <button
            onClick={startMonitoring}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Start
          </button>
        ) : (
          <button
            onClick={() => {/* Stop monitoring */}}
            className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
          >
            Stop
          </button>
        )}
        <button
          onClick={clearIssues}
          className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
        >
          Clear
        </button>
      </div>
    </div>
  );
};
