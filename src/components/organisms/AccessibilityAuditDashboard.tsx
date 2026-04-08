import React from 'react';
import { useAccessibilityAudit } from '@/hooks/use-accessibility-audit';

interface AccessibilityAuditDashboardProps {
  className?: string;
}

export const AccessibilityAuditDashboard = ({ className = '' }: AccessibilityAuditDashboardProps) => {
  const {
    issues,
    score,
    isAuditing,
    runAudit,
    clearAudit,
    getComplianceStatus,
    wcagGuidelines,
  } = useAccessibilityAudit();

  const wcagA = getComplianceStatus('A');
  const wcagAA = getComplianceStatus('AA');
  const wcagAAA = getComplianceStatus('AAA');

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceBadge = (compliant: boolean) => {
    return compliant
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const getIssueTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'wcag': return 'WCAG';
      case 'keyboard': return 'KB';
      case 'contrast': return 'CR';
      case 'aria': return 'ARIA';
      case 'semantic': return 'SEM';
      case 'focus': return 'FO';
      default: return '??';
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className={`fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-y-auto ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Accessibility Audit</h3>
        <div className="flex items-center gap-2">
          <div className={`text-sm font-bold ${getScoreColor(score.overall)}`}>
            {score.overall}%
          </div>
          <div className={`w-2 h-2 rounded-full ${isAuditing ? 'bg-yellow-500' : 'bg-green-500'}`} />
        </div>
      </div>

      {/* WCAG Compliance Status */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium">WCAG A:</span>
          <div className="flex items-center gap-1">
            <span className={`text-xs px-2 py-1 rounded ${getComplianceBadge(wcagA.compliant)}`}>
              {wcagA.compliant ? 'PASS' : 'FAIL'}
            </span>
            <span className="text-xs text-gray-600">{wcagA.score}%</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium">WCAG AA:</span>
          <div className="flex items-center gap-1">
            <span className={`text-xs px-2 py-1 rounded ${getComplianceBadge(wcagAA.compliant)}`}>
              {wcagAA.compliant ? 'PASS' : 'FAIL'}
            </span>
            <span className="text-xs text-gray-600">{wcagAA.score}%</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium">WCAG AAA:</span>
          <div className="flex items-center gap-1">
            <span className={`text-xs px-2 py-1 rounded ${getComplianceBadge(wcagAAA.compliant)}`}>
              {wcagAAA.compliant ? 'PASS' : 'FAIL'}
            </span>
            <span className="text-xs text-gray-600">{wcagAAA.score}%</span>
          </div>
        </div>
      </div>

      {/* Issue Summary */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-xs">
          <span className="font-medium">Issues:</span>
          <span className="text-red-600">{score.issues.errors} errors</span>
        </div>
        <div className="flex justify-between text-xs">
          <span></span>
          <span className="text-yellow-600">{score.issues.warnings} warnings</span>
        </div>
        <div className="flex justify-between text-xs">
          <span></span>
          <span className="text-blue-600">{score.issues.info} info</span>
        </div>
      </div>

      {/* Recent Issues */}
      {issues.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold text-gray-700 mb-1">
            Recent Issues ({issues.length})
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {issues.slice(-5).map((issue, index) => (
              <div
                key={index}
                className="text-xs p-2 rounded border border-gray-200"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <span className={`px-1 py-0.5 rounded text-xs ${getIssueTypeColor(issue.type)}`}>
                      {issue.type.toUpperCase()}
                    </span>
                    <span className="text-gray-500">{getCategoryIcon(issue.category)}</span>
                    <span className="font-medium">{issue.rule}</span>
                  </div>
                  <span className="text-gray-500">{issue.wcagLevel}</span>
                </div>
                <div className="text-gray-700">{issue.message}</div>
                {issue.fix && (
                  <div className="text-gray-500 italic mt-1">Fix: {issue.fix}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guidelines Summary */}
      <div className="mb-3">
        <div className="text-xs font-semibold text-gray-700 mb-1">
          Guidelines Tested ({wcagGuidelines.length})
        </div>
        <div className="grid grid-cols-2 gap-1">
          {wcagGuidelines.slice(0, 4).map((guideline) => {
            const hasIssues = issues.some(issue => issue.rule === guideline.id);
            return (
              <div
                key={guideline.id}
                className={`text-xs p-1 rounded text-center ${
                  hasIssues ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                }`}
              >
                {guideline.id}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={runAudit}
          disabled={isAuditing}
          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isAuditing ? 'Running...' : 'Run Audit'}
        </button>
        <button
          onClick={clearAudit}
          className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
        >
          Clear
        </button>
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-600">
          <div className="font-semibold mb-1">WCAG Levels:</div>
          <div>A - Essential (Required)</div>
          <div>AA - Standard Support (Target)</div>
          <div>AAA - Enhanced Support</div>
        </div>
      </div>
    </div>
  );
};
