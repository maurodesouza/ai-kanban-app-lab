'use client';

import { PerformanceTest } from '@/components/organisms/PerformanceTest';
import { DragPerformanceTest } from '@/components/organisms/DragPerformanceTest';
import { AccessibilityTest } from '@/components/organisms/AccessibilityTest';
import { PerformanceDashboard } from '@/components/organisms/PerformanceDashboard';
import { AccessibilityAuditDashboard } from '@/components/organisms/AccessibilityAuditDashboard';

export const DevelopmentTools = () => {
  return (
    <>
      {/* Performance Test Components (for development) */}
      <div className="fixed bottom-4 left-4 z-40 space-y-3">
        <PerformanceTest />
        <DragPerformanceTest />
      </div>

      {/* Performance Dashboard (for development) */}
      <PerformanceDashboard />

      {/* Accessibility Audit Dashboard (for development) */}
      <AccessibilityAuditDashboard />

      {/* Accessibility Test Component (for development) */}
      <AccessibilityTest.Root />
    </>
  );
};
