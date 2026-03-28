import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Visits from './pages/Visits';
import Leads from './pages/Leads';
import Surveys from './pages/Surveys';
import Warranties from './pages/Warranties';
import Maintenance from './pages/Maintenance';
import Loyalty from './pages/Loyalty';
import Users from './pages/Users';
import Services from './pages/Services';
import Discounts from './pages/Discounts';
import Templates from './pages/Templates';
import Logs from './pages/Logs';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="visits" element={<Visits />} />
          <Route path="leads" element={<Leads />} />
          <Route path="surveys" element={<Surveys />} />
          <Route path="warranties" element={<Warranties />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="loyalty" element={<Loyalty />} />
          <Route path="users" element={<Users />} />
          <Route path="services" element={<Services />} />
          <Route path="discounts" element={<Discounts />} />
          <Route path="templates" element={<Templates />} />
          <Route path="logs" element={<Logs />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
