import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Overview from './pages/Overview';
import Transactions from './pages/Transactions';
import FinanceIQ from './pages/FinanceIQ';
import RiskIQ from './pages/RiskIQ';
import PaymentRecovery from './pages/PaymentRecovery';
import AIAssistant from './pages/AIAssistant';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/overview" element={<Navigate to="/" replace />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/finance" element={<FinanceIQ />} />
          <Route path="/risk" element={<RiskIQ />} />
          <Route path="/recovery" element={<PaymentRecovery />} />
          <Route path="/assistant" element={<AIAssistant />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
