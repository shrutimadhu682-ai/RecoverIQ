import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const api = {
  // Analytics
  getOverview: async () => {
    const res = await client.get('/analytics/overview');
    return res.data;
  },
  getSpending: async () => {
    const res = await client.get('/analytics/spending');
    return res.data;
  },
  getCashflow: async () => {
    const res = await client.get('/analytics/cashflow');
    return res.data;
  },

  // Transactions
  getTransactions: async (params = {}) => {
    const res = await client.get('/transactions', { params });
    return res.data;
  },
  getTransaction: async (id) => {
    const res = await client.get(`/transactions/${id}`);
    return res.data;
  },
  updateTransaction: async (id, data) => {
    const res = await client.put(`/transactions/${id}`, data);
    return res.data;
  },
  uploadBankStatement: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post('/transactions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // RiskIQ
  getRiskAlerts: async (params = {}) => {
    const res = await client.get('/risk/alerts', { params });
    return res.data;
  },
  analyzeRisk: async (txData) => {
    const res = await client.post('/risk/analyze', txData);
    return res.data;
  },
  updateAlertStatus: async (alertId, status) => {
    const res = await client.put(`/risk/alerts/${alertId}/status`, { status });
    return res.data;
  },

  // RecoverIQ
  getRecoveryEvents: async (params = {}) => {
    const res = await client.get('/recovery/events', { params });
    return res.data;
  },
  predictRecovery: async (data) => {
    const res = await client.post('/recovery/predict', data);
    return res.data;
  },
  simulateRetry: async (eventId, overrideAction = null) => {
    const res = await client.post('/recovery/retry', {
      event_id: eventId,
      override_action: overrideAction,
    });
    return res.data;
  },
  getRecoveryHistory: async () => {
    const res = await client.get('/recovery/history');
    return res.data;
  },
  getRecoveryAnalytics: async () => {
    const res = await client.get('/recovery/analytics');
    return res.data;
  },

  // AI Financial Assistant
  askAssistant: async (message, history = []) => {
    const res = await client.post('/assistant/chat', { message, history });
    return res.data;
  },

  // Reports
  getReportsSummary: async () => {
    const res = await client.get('/reports/summary');
    return res.data;
  },
  getExportUrl: (type = 'transactions') => {
    return `${API_BASE_URL}/reports/export?report_type=${type}`;
  },
};
