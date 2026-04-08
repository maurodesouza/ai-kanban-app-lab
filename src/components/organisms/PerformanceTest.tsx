import React, { useState, useEffect } from 'react';
import { useFilter } from '@/hooks/use-filter';
import { generateTestTasks, measureFilterPerformance } from '@/utils/performance-testing';
import { Clickable } from '@/components/atoms/clickable';
import { Text } from '@/components/atoms/text';

export const PerformanceTest = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { filterTasks } = useFilter();

  const runPerformanceTest = async () => {
    setIsRunning(true);
    setTestResults(null);

    // Generate test data
    const testTasks = generateTestTasks(150);
    
    // Test different filter scenarios
    const testQueries = [
      '', // No filter (baseline)
      'design', // Common word
      'bug', // Common word
      'performance', // Longer word
      'test #50', // Specific task
      'nonexistent', // No results
    ];

    const results = [];

    for (const query of testQueries) {
      const performance = measureFilterPerformance(testTasks, (tasks, q) => filterTasks(tasks), query);
      results.push({
        filterQuery: query || 'No filter',
        ...performance,
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  return (
    <div className="p-6 bg-background-support rounded-lg border border-tone-contrast-300">
      <Text.Heading as="h2" className="text-lg font-semibold mb-4">
        Filter Performance Test
      </Text.Heading>
      
      <div className="space-y-4">
        <Clickable.Button
          onClick={runPerformanceTest}
          disabled={isRunning}
          className="px-4 py-2 bg-tone-primary-500 text-white rounded-lg hover:bg-tone-primary-600 disabled:opacity-50"
        >
          {isRunning ? 'Running Tests...' : 'Run Performance Test'}
        </Clickable.Button>

        {testResults && (
          <div className="space-y-3">
            <Text.Heading as="h3" className="text-md font-medium">
              Results (150 tasks, 100 iterations each):
            </Text.Heading>
            
            {testResults.map((result: any, index: number) => (
              <div
                key={index}
                className={`p-3 rounded border ${
                  result.meetsRequirement
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{result.filterQuery}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      result.meetsRequirement
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {result.meetsRequirement ? 'PASS' : 'FAIL'}
                  </span>
                </div>
                
                <div className="mt-2 text-sm text-foreground-min">
                  <div>Average: {result.averageTime.toFixed(2)}ms</div>
                  <div>Min: {result.minTime.toFixed(2)}ms</div>
                  <div>Max: {result.maxTime.toFixed(2)}ms</div>
                </div>
              </div>
            ))}

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="text-sm text-blue-800">
                <strong>Requirement:</strong> Filter operations must complete in &lt;100ms
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
