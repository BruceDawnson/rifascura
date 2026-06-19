import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from '@/components/Layout';

// Add page imports here
import AdminDashboard from '@/pages/AdminDashboard';
import AdminRifas from '@/pages/AdminRifas';
import NovaRifa from '@/pages/NovaRifa';
import AdminRifaDetalhe from '@/pages/AdminRifaDetalhe';
import Sorteio from '@/pages/Sorteio';
import RelatoriosFinanceiros from '@/pages/RelatoriosFinanceiros';
import Configuracoes from '@/pages/Configuracoes';
import PublicRifa from '@/pages/PublicRifa';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <Routes>
      {/* Admin - wrapped in layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/sorteios" element={<AdminRifas />} />
        <Route path="/admin/sorteios/novo" element={<NovaRifa />} />
        <Route path="/admin/sorteios/:id" element={<AdminRifaDetalhe />} />
        {/* Legado /admin/rifas → redireciona */}
        <Route path="/admin/rifas" element={<Navigate to="/admin/sorteios" replace />} />
        <Route path="/admin/rifas/nova" element={<Navigate to="/admin/sorteios/novo" replace />} />
        <Route path="/admin/rifas/:id" element={<AdminRifaDetalhe />} />
        <Route path="/admin/sorteio" element={<Sorteio />} />
        <Route path="/admin/relatorios" element={<RelatoriosFinanceiros />} />
        <Route path="/admin/configuracoes" element={<Configuracoes />} />

        {/* Redirect legacy/auto-generated routes to correct admin paths */}
        <Route path="/AdminDashboard" element={<Navigate to="/admin" replace />} />
        <Route path="/AdminRifas" element={<Navigate to="/admin/sorteios" replace />} />
        <Route path="/NovaRifa" element={<Navigate to="/admin/sorteios/novo" replace />} />
        <Route path="/Sorteio" element={<Navigate to="/admin/sorteio" replace />} />
        <Route path="/RelatoriosFinanceiros" element={<Navigate to="/admin/relatorios" replace />} />
        <Route path="/Configuracoes" element={<Navigate to="/admin/configuracoes" replace />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            {/* PUBLIC route — completely outside AuthProvider guard */}
            <Route path="/sorteio/:slug" element={<PublicRifa />} />
            <Route path="/rifa/:slug" element={<PublicRifa />} />
            {/* All other routes require authentication */}
            <Route path="/*" element={<AuthenticatedApp />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;