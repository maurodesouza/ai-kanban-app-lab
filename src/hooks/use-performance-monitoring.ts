import { useCallback, useEffect, useRef, useState } from 'react';

// Performance metrics types
interface PerformanceMetrics {
  // Core Web Vitals
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  
  // Custom metrics
  dragResponseTime: number;
  filterResponseTime: number;
  renderTime: number;
  memoryUsage: number;
  
  // Frame rate
  fps: number;
  
  // Bundle size
  bundleSize: number;
}

interface PerformanceBudget {
  // Core Web Vitals thresholds
  LCP: 2500; // Good: <2.5s, Needs Improvement: 2.5s-4s, Poor: >4s
  FID: 100;  // Good: <100ms, Needs Improvement: 100ms-300ms, Poor: >300ms
  CLS: 0.1;  // Good: <0.1, Needs Improvement: 0.1-0.25, Poor: >0.25
  
  // Custom performance thresholds
  dragResponseTime: 100; // ms
  filterResponseTime: 16;  // ms (60fps)
  renderTime: 100;        // ms
  memoryUsage: 50;        // MB
  fps: 60;                // frames per second
  bundleSize: 250;        // KB
}

interface PerformanceIssue {
  metric: keyof PerformanceMetrics;
  actual: number;
  threshold: number;
  severity: 'warning' | 'error';
  message: string;
}

export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
  const [issues, setIssues] = useState<PerformanceIssue[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const budget: PerformanceBudget = {
    LCP: 2500,
    FID: 100,
    CLS: 0.1,
    dragResponseTime: 100,
    filterResponseTime: 16,
    renderTime: 100,
    memoryUsage: 50,
    fps: 60,
    bundleSize: 250,
  };
  
  const startTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  
  // Measure operation performance
  const measureOperation = useCallback((
    operationName: keyof Omit<PerformanceMetrics, 'LCP' | 'FID' | 'CLS' | 'bundleSize'>,
    operation: () => void | Promise<void>
  ) => {
    return async (...args: any[]) => {
      const start = performance.now();
      await operation(...args);
      const end = performance.now();
      const duration = end - start;
      
      setMetrics(prev => ({
        ...prev,
        [operationName]: duration,
      }));
      
      // Check against budget
      const threshold = budget[operationName];
      if (duration > threshold) {
        const severity = duration > threshold * 2 ? 'error' : 'warning';
        const issue: PerformanceIssue = {
          metric: operationName,
          actual: duration,
          threshold,
          severity,
          message: `${operationName} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`,
        };
        
        setIssues(prev => [...prev, issue]);
        
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Performance Issue: ${issue.message}`);
        }
      }
      
      return duration;
    };
  }, [budget]);
  
  // Monitor frame rate
  const monitorFPS = useCallback(() => {
    let animationId: number;
    
    const measureFPS = (currentTime: number) => {
      if (lastFrameTimeRef.current) {
        const delta = currentTime - lastFrameTimeRef.current;
        const fps = 1000 / delta;
        
        setMetrics(prev => ({ ...prev, fps }));
        
        // Check against budget
        if (fps < budget.fps) {
          const issue: PerformanceIssue = {
            metric: 'fps',
            actual: fps,
            threshold: budget.fps,
            severity: fps < budget.fps * 0.5 ? 'error' : 'warning',
            message: `FPS dropped to ${fps.toFixed(1)} (threshold: ${budget.fps})`,
          };
          
          setIssues(prev => [...prev, issue]);
        }
      }
      
      lastFrameTimeRef.current = currentTime;
      frameCountRef.current++;
      animationId = requestAnimationFrame(measureFPS);
    };
    
    animationId = requestAnimationFrame(measureFPS);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [budget.fps]);
  
  // Monitor memory usage
  const monitorMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      
      setMetrics(prev => ({ ...prev, memoryUsage: usedMB }));
      
      if (usedMB > budget.memoryUsage) {
        const issue: PerformanceIssue = {
          metric: 'memoryUsage',
          actual: usedMB,
          threshold: budget.memoryUsage,
          severity: usedMB > budget.memoryUsage * 1.5 ? 'error' : 'warning',
          message: `Memory usage: ${usedMB.toFixed(2)}MB (threshold: ${budget.memoryUsage}MB)`,
        };
        
        setIssues(prev => [...prev, issue]);
      }
    }
  }, [budget.memoryUsage]);
  
  // Monitor Core Web Vitals
  const monitorCoreWebVitals = useCallback(() => {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      const LCP = lastEntry.startTime;
      
      setMetrics(prev => ({ ...prev, LCP }));
      
      if (LCP > budget.LCP) {
        const issue: PerformanceIssue = {
          metric: 'LCP',
          actual: LCP,
          threshold: budget.LCP,
          severity: LCP > budget.LCP * 1.5 ? 'error' : 'warning',
          message: `LCP: ${LCP.toFixed(2)}ms (threshold: ${budget.LCP}ms)`,
        };
        
        setIssues(prev => [...prev, issue]);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const FID = entries[0].processingStart - entries[0].startTime;
      
      setMetrics(prev => ({ ...prev, FID }));
      
      if (FID > budget.FID) {
        const issue: PerformanceIssue = {
          metric: 'FID',
          actual: FID,
          threshold: budget.FID,
          severity: FID > budget.FID * 2 ? 'error' : 'warning',
          message: `FID: ${FID.toFixed(2)}ms (threshold: ${budget.FID}ms)`,
        };
        
        setIssues(prev => [...prev, issue]);
      }
    }).observe({ entryTypes: ['first-input'] });
    
    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      
      setMetrics(prev => ({ ...prev, CLS: clsValue }));
      
      if (clsValue > budget.CLS) {
        const issue: PerformanceIssue = {
          metric: 'CLS',
          actual: clsValue,
          threshold: budget.CLS,
          severity: clsValue > budget.CLS * 2 ? 'error' : 'warning',
          message: `CLS: ${clsValue.toFixed(3)} (threshold: ${budget.CLS})`,
        };
        
        setIssues(prev => [...prev, issue]);
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }, [budget]);
  
  // Monitor bundle size (estimated)
  const monitorBundleSize = useCallback(() => {
    // This is a rough estimate - in production you'd use bundle analysis tools
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && src.includes('/_next/static/chunks/')) {
        // Estimate based on typical chunk sizes
        totalSize += 50; // Estimated KB per chunk
      }
    });
    
    setMetrics(prev => ({ ...prev, bundleSize: totalSize }));
    
    if (totalSize > budget.bundleSize) {
      const issue: PerformanceIssue = {
        metric: 'bundleSize',
        actual: totalSize,
        threshold: budget.bundleSize,
        severity: totalSize > budget.bundleSize * 2 ? 'error' : 'warning',
        message: `Estimated bundle size: ${totalSize}KB (threshold: ${budget.bundleSize}KB)`,
      };
      
      setIssues(prev => [...prev, issue]);
    }
  }, [budget.bundleSize]);
  
  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;
    
    setIsMonitoring(true);
    
    // Start all monitors
    const cleanupFPS = monitorFPS();
    const memoryInterval = setInterval(monitorMemory, 5000);
    
    monitorCoreWebVitals();
    monitorBundleSize();
    
    // Cleanup function
    return () => {
      cleanupFPS();
      clearInterval(memoryInterval);
      setIsMonitoring(false);
    };
  }, [isMonitoring, monitorFPS, monitorMemory, monitorCoreWebVitals, monitorBundleSize]);
  
  // Clear issues
  const clearIssues = useCallback(() => {
    setIssues([]);
  }, []);
  
  // Get performance score
  const getPerformanceScore = useCallback(() => {
    const totalMetrics = Object.keys(budget).length;
    const passingMetrics = Object.entries(budget).filter(([key, threshold]) => {
      const value = metrics[key as keyof PerformanceMetrics];
      return value !== undefined && value <= threshold;
    }).length;
    
    return Math.round((passingMetrics / totalMetrics) * 100);
  }, [budget, metrics]);
  
  // Auto-start monitoring in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !isMonitoring) {
      return startMonitoring();
    }
  }, [isMonitoring, startMonitoring]);
  
  return {
    metrics,
    issues,
    isMonitoring,
    budget,
    measureOperation,
    startMonitoring,
    clearIssues,
    getPerformanceScore,
  };
};
