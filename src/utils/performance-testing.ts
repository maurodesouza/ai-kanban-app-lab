import { Task, TaskStatus } from '@/types/task';

// Generate test tasks for performance testing
export const generateTestTasks = (count: number): Task[] => {
  const statuses: TaskStatus[] = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];
  const titles = [
    'Design new feature',
    'Fix bug in authentication',
    'Write unit tests',
    'Update documentation',
    'Review pull request',
    'Deploy to production',
    'Optimize database queries',
    'Implement user feedback',
    'Refactor legacy code',
    'Add error handling',
    'Create API endpoints',
    'Improve user interface',
    'Set up monitoring',
    'Security audit',
    'Performance optimization',
    'Code review',
    'Integration testing',
    'User research',
    'Data migration',
    'Cache optimization'
  ];

  const descriptions = [
    'This task requires careful attention to detail and proper testing.',
    'High priority item that needs to be completed this sprint.',
    'Low priority maintenance task for future consideration.',
    'Critical security fix that must be deployed immediately.',
    'Performance improvement for better user experience.',
    'Documentation update to reflect recent changes.',
    'Code refactoring to improve maintainability.',
    'New feature implementation based on user requirements.'
  ];

  const tasks: Task[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomTitle = titles[i % titles.length] + ` #${i + 1}`;
    const randomDescription = descriptions[i % descriptions.length];
    const randomStatus = statuses[i % statuses.length];
    
    tasks.push({
      id: `task-${i + 1}`,
      title: randomTitle,
      description: randomDescription,
      status: randomStatus,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      order: i + 1,
    });
  }
  
  return tasks;
};

// Performance testing utilities
export const measureFilterPerformance = (tasks: Task[], filterFunction: (tasks: Task[], query: string) => Task[], query: string) => {
  const iterations = 100;
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    filterFunction(tasks, query);
    const end = performance.now();
    times.push(end - start);
  }
  
  const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  return {
    averageTime,
    minTime,
    maxTime,
    iterations,
    taskCount: tasks.length,
    query,
    meetsRequirement: averageTime <= 100, // 100ms requirement
  };
};

// Export test data for development
export const testTasks = generateTestTasks(150);
