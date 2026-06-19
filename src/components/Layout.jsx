import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Ticket, PlusCircle, Trophy, BarChart2, Settings, LogOut, Menu, X, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useState, createContext, useContext } from 'react';
import { adminLogin, adminLogout, getAdminSession, isAdminAuthenticated } from '@/lib/adminAuth';

// Context para passar o role para páginas filhas
export const AdminRoleContext = createContext({ role: null, name: null });
export const useAdminRole = () => useContext(AdminRoleContext);

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const user = adminLogin(email.trim(), password);
      if (user) {
        onLogin();
      } else {
        setError('E-mail ou senha incorretos.');
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 shadow-lg border-2 border-teal-200">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b2cfca372dc73cfc07bdae/419cb6fbb_IMG_2860.jpg" alt="CURA" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Painel Administrativo</h1>
          <p className="text-gray-500 text-sm mt-1">Centro de Umbanda Reino das Almas</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="seu@email.com" required
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••••" required
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors mt-2">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
        <p className="text-center text-gray-400 text-xs mt-6">Sistema de Sorteios CURA · Centro de Umbanda Reino das Almas</p>
      </div>
    </div>
  );
}

const NAV_ADMIN = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/sorteios', label: 'Sorteios', icon: Ticket },
  { path: '/admin/sorteios/novo', label: 'Novo Sorteio', icon: PlusCircle },
  { path: '/admin/sorteio', label: 'Sorteio', icon: Trophy },
  { path: '/admin/relatorios', label: 'Relatórios Financeiros', icon: BarChart2 },
  { path: '/admin/configuracoes', label: 'Configurações', icon: Settings },
];

const NAV_OPERADOR = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/sorteios', label: 'Sorteios', icon: Ticket },
];

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authed, setAuthed] = useState(isAdminAuthenticated);
  const [session, setSession] = useState(getAdminSession);

  const isPublic = location.pathname.startsWith('/sorteio/') || location.pathname.startsWith('/rifa/');
  if (isPublic) return <Outlet />;

  const isAdmin = location.pathname.startsWith('/admin');
  if (isAdmin && !authed) {
    return <LoginScreen onLogin={() => { setAuthed(true); setSession(getAdminSession()); }} />;
  }

  const role = session?.role ?? 'operador';
  const NAV = role === 'admin' ? NAV_ADMIN : NAV_OPERADOR;

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    // "/admin/sorteios" não deve ficar ativo em "/admin/sorteio" (sem 's')
    if (item.path === '/admin/sorteios') {
      return location.pathname.startsWith('/admin/sorteios') &&
        location.pathname !== '/admin/sorteios/novo';
    }
    return location.pathname.startsWith(item.path);
  };

  const handleLogout = () => {
    adminLogout();
    setAuthed(false);
    setSession(null);
  };

  return (
    <AdminRoleContext.Provider value={{ role, name: session?.name }}>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-200 fixed top-0 left-0 h-full z-30">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1618641986557-1ecd230959aa?w=40&h=40&fit=crop"
                  alt="CURA"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.textContent = 'C'; }} />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm leading-tight">Centro de Umbanda Reino das Almas</p>
                <p className="text-gray-400 text-xs">{role === 'admin' ? 'Administrador' : 'Operador'}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-0.5">
            {NAV.map((item) =>
              <Link key={item.path} to={item.path} className="text-gray-600 px-3 py-2.5 text-sm font-semibold rounded-lg flex items-center gap-3 transition-all hover:bg-gray-50 hover:text-gray-900">
                <item.icon size={17} className={isActive(item) ? 'text-teal-600' : 'text-gray-400'} />
                {item.label}
              </Link>
            )}
          </nav>
          <div className="p-3 border-t border-gray-100">
            <button onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full">
              <LogOut size={17} /> Sair
            </button>
          </div>
        </aside>

        {/* Top bar desktop */}
        <div className="hidden lg:flex fixed top-0 left-60 right-0 z-20 bg-white border-b border-gray-100 h-12 items-center justify-end px-6">
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors">
            <LogOut size={15} /> Sair
          </button>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-neutral-950 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center">C</div>
            <span className="font-bold text-gray-800 text-sm">Centro de Umbanda Reino das Almas</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 p-1">
              <LogOut size={18} />
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-600 p-1">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileOpen &&
          <div className="lg:hidden fixed inset-0 z-40 bg-white pt-14">
            <nav className="p-3 space-y-0.5">
              {NAV.map((item) =>
                <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(item) ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <item.icon size={17} /> {item.label}
                </Link>
              )}
            </nav>
          </div>
        }

        {/* Main */}
        <main className="flex-1 lg:ml-60 pt-14 lg:pt-12 min-h-screen">
          <Outlet />
        </main>
      </div>
    </AdminRoleContext.Provider>
  );
}