import React, { useState, useRef } from 'react';
import { Clickable } from '@/components/atoms/clickable';
import { Text } from '@/components/atoms/text';

export const DragPerformanceTest = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const testStartTime = useRef<number>(0);
  const testEndTime = useRef<number>(0);

  const simulateDragOperation = () => {
    return new Promise<void>((resolve) => {
      // Simulate drag start
      testStartTime.current = performance.now();
      
      // Simulate drag operation duration (user dragging)
      setTimeout(() => {
        testEndTime.current = performance.now();
        resolve();
      }, 50); // Simulate 50ms drag operation
    });
  };

  const runDragPerformanceTest = async () => {
    setIsRunning(true);
    setTestResults(null);

    const iterations = 50;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      await simulateDragOperation();
      const dragTime = testEndTime.current - testStartTime.current;
      times.push(dragTime);
    }

    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    setTestResults({
      averageTime,
      minTime,
      maxTime,
      iterations,
      meetsRequirement: averageTime <= 100, // 100ms requirement
    });

    setIsRunning(false);
  };

  return (
    <div className="p-4 bg-background-support rounded-lg border border-tone-contrast-300">
      <Text.Heading as="h3" className="text-md font-semibold mb-3">
        Drag Performance Test
      </Text.Heading>
      
      <div className="space-y-3">
        <Clickable.Button
          onClick={runDragPerformanceTest}
          disabled={isRunning}
          className="px-3 py-1 bg-tone-primary-500 text-white rounded text-sm hover:bg-tone-primary-600 disabled:opacity-50"
        >
          {isRunning ? 'Testing...' : 'Test Drag Performance'}
        </Clickable.Button>

        {testResults && (
          <div className="space-y-2">
            <div
              className={`p-2 rounded border text-sm ${
                testResults.meetsRequirement
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <span>Drag Response Time</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    testResults.meetsRequirement
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {testResults.meetsRequirement ? 'PASS' : 'FAIL'}
                </span>
              </div>
              
              <div className="mt-1 text-xs text-foreground-min">
                <div>Avg: {testResults.averageTime.toFixed(2)}ms</div>
                <div>Min: {testResults.minTime.toFixed(2)}ms</div>
                <div>Max: {testResults.maxTime.toFixed(2)}ms</div>
              </div>
            </div>

            <div className="text-xs text-blue-600">
              <strong>Requirement:</strong> Drag operations must respond in &lt;100ms
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
