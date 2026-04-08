import { useCallback, useEffect, useState } from 'react';

// Accessibility audit types
interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  category: 'wcag' | 'keyboard' | 'contrast' | 'aria' | 'semantic' | 'focus';
  rule: string;
  element: string;
  message: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
  selector?: string;
  fix?: string;
}

interface AccessibilityScore {
  overall: number;
  wcagA: number;
  wcagAA: number;
  wcagAAA: number;
  issues: {
    errors: number;
    warnings: number;
    info: number;
  };
}

interface WCAGGuideline {
  id: string;
  title: string;
  level: 'A' | 'AA' | 'AAA';
  description: string;
  test: () => AccessibilityIssue[];
}

export const useAccessibilityAudit = () => {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [score, setScore] = useState<AccessibilityScore>({
    overall: 0,
    wcagA: 0,
    wcagAA: 0,
    wcagAAA: 0,
    issues: {
      errors: 0,
      warnings: 0,
      info: 0,
    },
  });
  const [isAuditing, setIsAuditing] = useState(false);

  // WCAG 2.1 Guidelines
  const wcagGuidelines: WCAGGuideline[] = [
    // 1.1 Non-text Content
    {
      id: '1.1.1',
      title: 'Non-text Content',
      level: 'A',
      description: 'All non-text content has a text alternative',
      test: () => {
        const results: AccessibilityIssue[] = [];
        
        // Check for images without alt text
        document.querySelectorAll('img:not([alt])').forEach((img, index) => {
          results.push({
            type: 'error',
            category: 'wcag',
            rule: '1.1.1',
            element: 'img',
            message: `Image ${index + 1} missing alt attribute`,
            wcagLevel: 'A',
            selector: `img:nth-child(${index + 1})`,
            fix: 'Add descriptive alt attribute to the image',
          });
        });

        // Check for empty alt text on decorative images
        document.querySelectorAll('img[alt=""]').forEach((img, index) => {
          if (!img.hasAttribute('role') || img.getAttribute('role') !== 'presentation') {
            results.push({
              type: 'warning',
              category: 'wcag',
              rule: '1.1.1',
              element: 'img',
              message: `Decorative image ${index + 1} should have role="presentation"`,
              wcagLevel: 'A',
              selector: `img[alt=""]:nth-child(${index + 1})`,
              fix: 'Add role="presentation" to decorative images',
            });
          }
        });

        return results;
      },
    },

    // 1.3.1 Info and Relationships
    {
      id: '1.3.1',
      title: 'Info and Relationships',
      level: 'A',
      description: 'Information, structure, and relationships can be programmatically determined',
      test: () => {
        const results: AccessibilityIssue[] = [];

        // Check for proper heading structure
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let lastLevel = 0;
        
        headings.forEach((heading, index) => {
          const level = parseInt(heading.tagName.charAt(1));
          if (level > lastLevel + 1) {
            results.push({
              type: 'warning',
              category: 'semantic',
              rule: '1.3.1',
              element: heading.tagName.toLowerCase(),
              message: `Heading level skipped: h${lastLevel} to h${level}`,
              wcagLevel: 'A',
              selector: heading.tagName.toLowerCase(),
              fix: 'Use proper heading hierarchy without skipping levels',
            });
          }
          lastLevel = level;
        });

        // Check for lists without proper markup
        document.querySelectorAll('[class*="list"], [class*="List"]').forEach((element) => {
          if (!element.matches('ul, ol, dl')) {
            results.push({
              type: 'warning',
              category: 'semantic',
              rule: '1.3.1',
              element: element.tagName.toLowerCase(),
              message: 'Element appears to be a list but uses incorrect markup',
              wcagLevel: 'A',
              selector: element.tagName.toLowerCase(),
              fix: 'Use proper list elements (ul, ol, dl)',
            });
          }
        });

        return results;
      },
    },

    // 1.4.3 Contrast (Minimum)
    {
      id: '1.4.3',
      title: 'Contrast (Minimum)',
      level: 'AA',
      description: 'Text has a contrast ratio of at least 4.5:1',
      test: () => {
        const results: AccessibilityIssue[] = [];

        // This is a simplified contrast check
        // In production, you'd use a library like 'color-contrast'
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button');
        
        textElements.forEach((element, index) => {
          const styles = window.getComputedStyle(element);
          const color = styles.color;
          const backgroundColor = styles.backgroundColor;
          
          // Skip transparent backgrounds
          if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
            return;
          }

          // Simple contrast check (would need proper color parsing in production)
          if (color === backgroundColor) {
            results.push({
              type: 'error',
              category: 'contrast',
              rule: '1.4.3',
              element: element.tagName.toLowerCase(),
              message: `Text has insufficient contrast with background`,
              wcagLevel: 'AA',
              selector: element.tagName.toLowerCase(),
              fix: 'Increase color contrast to meet WCAG AA standards (4.5:1 minimum)',
            });
          }
        });

        return results;
      },
    },

    // 2.1.1 Keyboard
    {
      id: '2.1.1',
      title: 'Keyboard',
      level: 'A',
      description: 'All functionality is available using a keyboard',
      test: () => {
        const results: AccessibilityIssue[] = [];

        // Check for interactive elements without keyboard access
        document.querySelectorAll('[onclick], [onmousedown], [onmouseup]').forEach((element, index) => {
          if (!element.matches('button, a, input, select, textarea, [tabindex]')) {
            results.push({
              type: 'error',
              category: 'keyboard',
              rule: '2.1.1',
              element: element.tagName.toLowerCase(),
              message: `Interactive element ${index + 1} not keyboard accessible`,
              wcagLevel: 'A',
              selector: element.tagName.toLowerCase(),
              fix: 'Add tabindex or use keyboard-accessible elements',
            });
          }
        });

        // Check for focus management
        document.querySelectorAll('[role="dialog"], [role="modal"]').forEach((element) => {
          const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements.length === 0) {
            results.push({
              type: 'error',
              category: 'focus',
              rule: '2.1.1',
              element: element.tagName.toLowerCase(),
              message: 'Modal/dialog has no focusable elements',
              wcagLevel: 'A',
              selector: '[role="dialog"], [role="modal"]',
              fix: 'Ensure modals have focusable elements and proper focus management',
            });
          }
        });

        return results;
      },
    },

    // 2.4.1 Bypass Blocks
    {
      id: '2.4.1',
      title: 'Bypass Blocks',
      level: 'A',
      description: 'Mechanism is available to bypass blocks of content',
      test: () => {
        const results: AccessibilityIssue[] = [];

        // Check for skip links
        const skipLinks = document.querySelectorAll('a[href^="#"]');
        const hasSkipLink = Array.from(skipLinks).some(link => {
          const text = link.textContent?.toLowerCase() || '';
          return text.includes('skip') || text.includes('main') || text.includes('content');
        });

        if (!hasSkipLink && document.querySelectorAll('nav, header, aside').length > 0) {
          results.push({
            type: 'warning',
            category: 'wcag',
            rule: '2.4.1',
            element: 'body',
            message: 'Consider adding skip links for better navigation',
            wcagLevel: 'A',
            fix: 'Add skip links to bypass navigation blocks',
          });
        }

        return results;
      },
    },

    // 3.2.1 On Focus
    {
      id: '3.2.1',
      title: 'On Focus',
      level: 'A',
      description: 'Changing focus does not substantially change context',
      test: () => {
        const results: AccessibilityIssue[] = [];

        // Check for elements that change context on focus
        document.querySelectorAll('[onfocus]').forEach((element, index) => {
          results.push({
            type: 'warning',
            category: 'wcag',
            rule: '3.2.1',
            element: element.tagName.toLowerCase(),
            message: `Element ${index + 1} has onfocus handler - ensure it doesn't change context`,
            wcagLevel: 'A',
            selector: element.tagName.toLowerCase(),
            fix: 'Ensure focus events don\'t cause unexpected context changes',
          });
        });

        return results;
      },
    },

    // 4.1.1 Parsing
    {
      id: '4.1.1',
      title: 'Parsing',
      level: 'A',
      description: 'Content is well-formed and valid',
      test: () => {
        const results: AccessibilityIssue[] = [];

        // Check for duplicate IDs
        const allElements = document.querySelectorAll('[id]');
        const ids = Array.from(allElements).map(el => el.id);
        const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

        duplicateIds.forEach(id => {
          results.push({
            type: 'error',
            category: 'wcag',
            rule: '4.1.1',
            element: 'duplicate-id',
            message: `Duplicate ID found: ${id}`,
            wcagLevel: 'A',
            selector: `#${id}`,
            fix: 'Ensure all IDs are unique within the page',
          });
        });

        return results;
      },
    },

    // 4.1.2 Name, Role, Value
    {
      id: '4.1.2',
      title: 'Name, Role, Value',
      level: 'A',
      description: 'Elements have appropriate names, roles, and values',
      test: () => {
        const results: AccessibilityIssue[] = [];

        // Check for buttons without accessible names
        document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').forEach((button, index) => {
          if (!button.textContent?.trim()) {
            results.push({
              type: 'error',
              category: 'aria',
              rule: '4.1.2',
              element: 'button',
              message: `Button ${index + 1} has no accessible name`,
              wcagLevel: 'A',
              selector: 'button',
              fix: 'Add aria-label, aria-labelledby, or text content to button',
            });
          }
        });

        // Check for form inputs without labels
        document.querySelectorAll('input:not([type="hidden"]):not([aria-label]):not([aria-labelledby])').forEach((input, index) => {
          const hasLabel = document.querySelector(`label[for="${input.id}"]`) || 
                           input.closest('label') ||
                           input.getAttribute('placeholder');
          
          if (!hasLabel) {
            results.push({
              type: 'error',
              category: 'aria',
              rule: '4.1.2',
              element: 'input',
              message: `Input ${index + 1} has no accessible label`,
              wcagLevel: 'A',
              selector: 'input',
              fix: 'Add label, aria-label, or placeholder to input',
            });
          }
        });

        return results;
      },
    },
  ];

  // Run accessibility audit
  const runAudit = useCallback(() => {
    setIsAuditing(true);
    const allIssues: AccessibilityIssue[] = [];

    // Run all WCAG guideline tests
    wcagGuidelines.forEach(guideline => {
      try {
        const issues = guideline.test();
        allIssues.push(...issues);
      } catch (error) {
        console.error(`Error testing ${guideline.id}:`, error);
      }
    });

    setIssues(allIssues);
    
    // Calculate scores
    const errorCount = allIssues.filter(i => i.type === 'error').length;
    const warningCount = allIssues.filter(i => i.type === 'warning').length;
    const infoCount = allIssues.filter(i => i.type === 'info').length;
    
    const totalTests = wcagGuidelines.length;
    const passedTests = totalTests - allIssues.filter(i => i.type === 'error').length;
    const overallScore = Math.round((passedTests / totalTests) * 100);

    const wcagAScore = Math.round((totalTests - allIssues.filter(i => i.wcagLevel === 'A' && i.type === 'error').length) / totalTests * 100);
    const wcagAAScore = Math.round((totalTests - allIssues.filter(i => i.wcagLevel === 'AA' && i.type === 'error').length) / totalTests * 100);
    const wcagAAAScore = Math.round((totalTests - allIssues.filter(i => i.wcagLevel === 'AAA' && i.type === 'error').length) / totalTests * 100);

    setScore({
      overall: overallScore,
      wcagA: wcagAScore,
      wcagAA: wcagAAScore,
      wcagAAA: wcagAAAScore,
      issues: {
        errors: errorCount,
        warnings: warningCount,
        info: infoCount,
      },
    });

    setIsAuditing(false);
  }, [wcagGuidelines]);

  // Get WCAG compliance status
  const getComplianceStatus = useCallback((level: 'A' | 'AA' | 'AAA') => {
    const levelIssues = issues.filter(issue => issue.wcagLevel === level);
    const errors = levelIssues.filter(issue => issue.type === 'error');
    
    return {
      compliant: errors.length === 0,
      errors: errors.length,
      warnings: levelIssues.filter(issue => issue.type === 'warning').length,
      score: score[`wcag${level}`],
    };
  }, [issues, score]);

  // Clear audit results
  const clearAudit = useCallback(() => {
    setIssues([]);
    setScore({
      overall: 0,
      wcagA: 0,
      wcagAA: 0,
      wcagAAA: 0,
      issues: {
        errors: 0,
        warnings: 0,
        info: 0,
      },
    });
  }, []);

  // Auto-run audit in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Delay to ensure DOM is ready
      const timer = setTimeout(() => {
        runAudit();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [runAudit]);

  return {
    issues,
    score,
    isAuditing,
    runAudit,
    clearAudit,
    getComplianceStatus,
    wcagGuidelines,
  };
};
