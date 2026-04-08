import { useEffect, useState, useCallback } from 'react';

interface AccessibilityIssue {
  type: 'error' | 'warning';
  element: string;
  description: string;
  wcagCriterion: string;
  fix?: string;
}

interface AccessibilityTestResult {
  score: number;
  issues: AccessibilityIssue[];
  passedTests: string[];
  timestamp: string;
}

export function useAccessibilityTesting() {
  const [testResults, setTestResults] = useState<AccessibilityTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const runAccessibilityTests = useCallback(async () => {
    setIsTesting(true);
    
    const issues: AccessibilityIssue[] = [];
    const passedTests: string[] = [];

    // Test 1: Color Contrast
    const testColorContrast = () => {
      const elements = document.querySelectorAll('*');
      let contrastIssues = 0;

      elements.forEach(element => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;

        if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          // This is a simplified contrast check
          // In a real implementation, you'd use a proper contrast calculation library
          const colorRgb = color.match(/\d+/g);
          const bgRgb = backgroundColor.match(/\d+/g);
          
          if (colorRgb && bgRgb) {
            const contrast = calculateContrast(
              parseInt(colorRgb[0]), parseInt(colorRgb[1]), parseInt(colorRgb[2]),
              parseInt(bgRgb[0]), parseInt(bgRgb[1]), parseInt(bgRgb[2])
            );
            
            if (contrast < 4.5) {
              issues.push({
                type: 'error',
                element: element.tagName.toLowerCase(),
                description: `Insufficient color contrast: ${contrast.toFixed(2)}:1 (minimum 4.5:1 required)`,
                wcagCriterion: 'WCAG 1.4.3 Contrast',
                fix: 'Increase color contrast between text and background'
              });
              contrastIssues++;
            }
          }
        }
      });

      if (contrastIssues === 0) {
        passedTests.push('Color contrast meets WCAG AA standards');
      }
    };

    // Test 2: Keyboard Navigation
    const testKeyboardNavigation = () => {
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      let keyboardIssues = 0;

      focusableElements.forEach(element => {
        const tabIndex = parseInt(element.getAttribute('tabindex') || '0');
        
        // Check for reasonable tab order
        if (tabIndex < 0) {
          issues.push({
            type: 'warning',
            element: element.tagName.toLowerCase(),
            description: 'Element has negative tabindex, may be inaccessible to keyboard users',
            wcagCriterion: 'WCAG 2.1.1 Keyboard',
            fix: 'Use tabindex="0" or positive values for logical tab order'
          });
          keyboardIssues++;
        }

        // Check for focus indicators
        const styles = window.getComputedStyle(element);
        const focusStyles = styles.outline || styles.boxShadow;
        
        if (!focusStyles || focusStyles === 'none') {
          issues.push({
            type: 'error',
            element: element.tagName.toLowerCase(),
            description: 'Interactive element lacks visible focus indicator',
            wcagCriterion: 'WCAG 2.4.7 Focus Visible',
            fix: 'Add visible focus styles (outline, box-shadow, or border)'
          });
          keyboardIssues++;
        }
      });

      if (keyboardIssues === 0) {
        passedTests.push('Keyboard navigation is properly implemented');
      }
    };

    // Test 3: ARIA Labels and Roles
    const testAriaLabels = () => {
      const interactiveElements = document.querySelectorAll('button, input, a');
      let ariaIssues = 0;

      interactiveElements.forEach(element => {
        const hasLabel = element.getAttribute('aria-label') || 
                        element.getAttribute('aria-labelledby') ||
                        element.textContent?.trim() ||
                        (element as HTMLInputElement).placeholder;

        if (!hasLabel) {
          issues.push({
            type: 'error',
            element: element.tagName.toLowerCase(),
            description: 'Interactive element lacks accessible label',
            wcagCriterion: 'WCAG 1.3.1 Info and Relationships',
            fix: 'Add aria-label, aria-labelledby, or visible text content'
          });
          ariaIssues++;
        }
      });

      // Check for proper heading structure
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let lastLevel = 0;
      let headingStructureIssues = 0;

      headings.forEach(heading => {
        const level = parseInt(heading.tagName.substring(1));
        
        if (level > lastLevel + 1) {
          issues.push({
            type: 'warning',
            element: heading.tagName.toLowerCase(),
            description: `Heading level skipped from h${lastLevel} to h${level}`,
            wcagCriterion: 'WCAG 1.3.1 Info and Relationships',
            fix: 'Use sequential heading levels without skipping'
          });
          headingStructureIssues++;
        }
        lastLevel = level;
      });

      if (ariaIssues === 0 && headingStructureIssues === 0) {
        passedTests.push('ARIA labels and heading structure are correct');
      }
    };

    // Test 4: Touch Targets (44px minimum)
    const testTouchTargets = () => {
      const interactiveElements = document.querySelectorAll('button, a, input, [role="button"]');
      let touchTargetIssues = 0;

      interactiveElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        if (width < 44 || height < 44) {
          issues.push({
            type: 'error',
            element: element.tagName.toLowerCase(),
            description: `Touch target too small: ${width}x${height}px (minimum 44x44px required)`,
            wcagCriterion: 'WCAG 2.5.5 Target Size',
            fix: 'Increase element size to at least 44x44px or add padding'
          });
          touchTargetIssues++;
        }
      });

      if (touchTargetIssues === 0) {
        passedTests.push('All touch targets meet minimum size requirements');
      }
    };

    // Test 5: Screen Reader Announcements
    const testScreenReaderAnnouncements = () => {
      const liveRegions = document.querySelectorAll('[aria-live], [role="status"], [role="alert"]');
      
      if (liveRegions.length === 0) {
        issues.push({
          type: 'warning',
          element: 'document',
          description: 'No ARIA live regions found for dynamic content announcements',
          wcagCriterion: 'WCAG 4.1.3 Status Messages',
          fix: 'Add aria-live regions for dynamic content changes'
        });
      } else {
        passedTests.push('Screen reader live regions are implemented');
      }
    };

    // Run all tests
    testColorContrast();
    testKeyboardNavigation();
    testAriaLabels();
    testTouchTargets();
    testScreenReaderAnnouncements();

    // Calculate score
    const totalTests = 5;
    const passedCount = passedTests.length;
    const score = Math.round((passedCount / totalTests) * 100);

    const result: AccessibilityTestResult = {
      score,
      issues,
      passedTests,
      timestamp: new Date().toISOString(),
    };

    setTestResults(result);
    setIsTesting(false);

    return result;
  }, []);

  return {
    testResults,
    isTesting,
    runAccessibilityTests,
  };
}

// Helper function for contrast calculation (simplified)
function calculateContrast(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  const lum1 = (0.299 * r1 + 0.587 * g1 + 0.114 * b1) / 255;
  const lum2 = (0.299 * r2 + 0.587 * g2 + 0.114 * b2) / 255;
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

// Accessibility guidelines reference
export const wcagGuidelines = {
  'WCAG 1.4.3 Contrast': 'Text must have a contrast ratio of at least 4.5:1 against its background',
  'WCAG 2.1.1 Keyboard': 'All functionality must be available via keyboard',
  'WCAG 2.4.7 Focus Visible': 'Keyboard focus must be clearly visible',
  'WCAG 1.3.1 Info and Relationships': 'Content structure and relationships must be programmatically determinable',
  'WCAG 2.5.5 Target Size': 'Touch targets must be at least 44x44px',
  'WCAG 4.1.3 Status Messages': 'Dynamic content changes must be announced to screen readers',
};
