import React from 'react';
import { useAccessibilityTesting, wcagGuidelines } from '@/hooks/use-accessibility-testing';

interface AccessibilityTestProps {
  className?: string;
}

function Root({ className }: AccessibilityTestProps) {
  const { testResults, isTesting, runAccessibilityTests } = useAccessibilityTesting();

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-md max-h-96 overflow-auto bg-white rounded-lg shadow-xl border border-gray-200 ${className || ''}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Accessibility Test</h3>
          <button
            onClick={() => runAccessibilityTests()}
            disabled={isTesting}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? 'Testing...' : 'Run Tests'}
          </button>
        </div>
        
        {testResults && (
          <div className={`p-2 rounded-lg ${getScoreBackground(testResults.score)}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Accessibility Score:</span>
              <span className={`text-lg font-bold ${getScoreColor(testResults.score)}`}>
                {testResults.score}%
              </span>
            </div>
          </div>
        )}
      </div>

      {testResults && (
        <div className="p-4">
          {/* Passed Tests */}
          {testResults.passedTests.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-green-700 mb-2">Passed Tests</h4>
              <ul className="space-y-1">
                {testResults.passedTests.map((test, index) => (
                  <li key={index} className="text-xs text-green-600 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {test}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Issues */}
          {testResults.issues.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-red-700 mb-2">
                Issues Found ({testResults.issues.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {testResults.issues.map((issue, index) => (
                  <div key={index} className={`p-2 rounded text-xs ${
                    issue.type === 'error' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <div className="flex items-start">
                      <svg className={`w-3 h-3 mr-1 mt-0.5 flex-shrink-0 ${
                        issue.type === 'error' ? 'text-red-500' : 'text-yellow-500'
                      }`} fill="currentColor" viewBox="0 0 20 20">
                        {issue.type === 'error' ? (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        )}
                      </svg>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{issue.description}</p>
                        <p className="text-gray-600 mt-1">
                          <span className="font-medium">Element:</span> {issue.element}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">WCAG:</span> {issue.wcagCriterion}
                        </p>
                        {issue.fix && (
                          <p className="text-gray-700 mt-1">
                            <span className="font-medium">Fix:</span> {issue.fix}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test timestamp */}
          <p className="text-xs text-gray-500">
            Last tested: {new Date(testResults.timestamp).toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* WCAG Guidelines Reference */}
      <div className="p-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">WCAG Guidelines</h4>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {Object.entries(wcagGuidelines).slice(0, 3).map(([criterion, description]) => (
            <div key={criterion} className="text-xs">
              <span className="font-medium text-gray-700">{criterion}:</span>
              <span className="text-gray-600 ml-1">{description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const AccessibilityTest = {
  Root,
};
