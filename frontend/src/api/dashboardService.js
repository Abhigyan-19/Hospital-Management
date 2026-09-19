import { mockDashboard } from '../mock/data';

export const dashboardService = {
  getOverview: (role = 'ADMIN') => {
    if (role === 'DOCTOR') {
      return { ...mockDashboard, stats: mockDashboard.stats.map((stat) => stat.label === 'Total patients' ? { ...stat, value: '26', change: 'Your active cases' } : stat) };
    }
    if (role === 'RECEPTIONIST') {
      return { ...mockDashboard, stats: mockDashboard.stats.map((stat) => stat.label === 'Active doctors' ? { ...stat, value: '18', change: 'On duty today' } : stat) };
    }
    return mockDashboard;
  },
};
