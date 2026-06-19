// Sistema de autenticação com dois níveis de acesso
const SESSION_KEY = 'cura_admin_auth';

export const USERS = [
  {
    email: 'curaterreiro@gmail.com',
    password: 'Mei@noite333!',
    role: 'admin', // acesso total
    name: 'Administrador',
  },
  {
    email: 'operador@cura.com',
    password: 'Curaterreiro777!',
    role: 'operador', // só edita números
    name: 'Operador',
  },
];

export function adminLogin(email, password) {
  const user = USERS.find(u => u.email === email.trim() && u.password === password);
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email, role: user.role, name: user.name }));
    return user;
  }
  return null;
}

export function adminLogout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getAdminSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAdminAuthenticated() {
  return getAdminSession() !== null;
}

export function isAdmin() {
  const s = getAdminSession();
  return s?.role === 'admin';
}