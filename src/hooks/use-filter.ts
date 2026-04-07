import { useState, useCallback, useMemo } from 'react';
import { Task } from '@/types/task';

export interface FilterCriteria {
  query: string;
  active: boolean;
}

export const useFilter = () => {
  const [filter, setFilter] = useState<FilterCriteria>({
    query: '',
    active: false,
  });

  const updateFilter = useCallback((query: string) => {
    setFilter({
      query: query.trim(),
      active: query.trim().length > 0,
    });
  }, []);

  const clearFilter = useCallback(() => {
    setFilter({
      query: '',
      active: false,
    });
  }, []);

  const filterTasks = useCallback((tasks: Task[]) => {
    if (!filter.active || !filter.query) {
      return tasks;
    }

    const query = filter.query.toLowerCase();
    
    return tasks.filter(task => {
      const titleMatch = task.title.toLowerCase().includes(query);
      const descriptionMatch = task.description?.toLowerCase().includes(query) || false;
      return titleMatch || descriptionMatch;
    });
  }, [filter]);

  const getFilteredTasksByStatus = useCallback((tasks: Task[], status: string) => {
    const filteredTasks = filterTasks(tasks);
    return filteredTasks.filter(task => task.status === status);
  }, [filterTasks]);

  const getFilterStats = useCallback((tasks: Task[]) => {
    const totalTasks = tasks.length;
    const filteredTasks = filterTasks(tasks);
    const matchedTasks = filteredTasks.length;
    
    return {
      total: totalTasks,
      matched: matchedTasks,
      filtered: matchedTasks < totalTasks,
      query: filter.query,
    };
  }, [filterTasks, filter.query]);

  return {
    filter,
    setFilter: updateFilter,
    clearFilter,
    filterTasks,
    getFilteredTasksByStatus,
    getFilterStats,
    // Computed values
    hasActiveFilter: filter.active,
    filterQuery: filter.query,
  };
};
