import { getColumns, getFilteredTasks } from './index';
import type { KanbanState } from '#/types/kanban';

const state: KanbanState = {
    columns: [
        { id: 'col-1', title: 'To Do' },
        { id: 'col-2', title: 'In Progress' },
    ],
    columnOrder: ['col-2', 'col-1'],
    tasks: [
        {
            id: 'task-1',
            columnId: 'col-1',
            title: 'Welcome task',
            description: 'A warm welcome',
            status: 'todo',
            dueDate: '2026-08-10',
            createdAt: '2026-08-09',
        },
        {
            id: 'task-2',
            columnId: 'col-1',
            title: 'Another task',
            description: 'Find the welcome note',
            status: 'in-progress',
            dueDate: '2026-08-15',
            createdAt: '2026-08-09',
        },
        {
            id: 'task-3',
            columnId: 'col-2',
            title: 'Other column',
            description: 'Not in col-1',
            status: 'done',
            dueDate: '2026-08-05',
            createdAt: '2026-08-09',
        },
    ],
    filter: {
        text: '',
        dateRange: {},
        statuses: [],
    },
};

describe('kanban selectors', () => {
    it('returns columns in order', () => {
        const columns = getColumns(state);

        expect(columns[0]?.id).toBe('col-2');
        expect(columns[1]?.id).toBe('col-1');
    });

    it('filters tasks by text in title and description', () => {
        const filtered = getFilteredTasks('col-1', {
            ...state,
            filter: { ...state.filter, text: 'warm' },
        });

        expect(filtered.length).toBe(1);
        expect(filtered[0]?.title).toBe('Welcome task');
    });

    it('filters tasks by status', () => {
        const filtered = getFilteredTasks('col-1', {
            ...state,
            filter: { ...state.filter, statuses: ['todo'] },
        });

        expect(filtered.length).toBe(1);
        expect(filtered[0]?.title).toBe('Welcome task');
    });

    it('filters tasks by date range', () => {
        const filtered = getFilteredTasks('col-1', {
            ...state,
            filter: {
                ...state.filter,
                dateRange: { start: '2026-08-11', end: '2026-08-16' },
            },
        });

        expect(filtered.length).toBe(1);
        expect(filtered[0]?.title).toBe('Another task');
    });

    it('composes text, status and date filters', () => {
        const filtered = getFilteredTasks('col-1', {
            ...state,
            filter: {
                text: 'task',
                statuses: ['todo'],
                dateRange: { start: '2026-08-09', end: '2026-08-11' },
            },
        });

        expect(filtered.length).toBe(1);
        expect(filtered[0]?.title).toBe('Welcome task');
    });
});
