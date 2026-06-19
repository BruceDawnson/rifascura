import { useAuth } from '@/lib/AuthContext';

/**
 * Hook para verificar permissões baseado no role do usuário
 * 
 * Roles:
 * - admin: Acesso completo
 * - operador: Acesso limitado (apenas editar números)
 */
export const usePermissions = () => {
  const { user } = useAuth();

  const userRole = user?.role || 'operador';

  return {
    // Admin permissions
    canCreateRifa: userRole === 'admin',
    canEditRifa: userRole === 'admin',
    canDeleteRifa: userRole === 'admin',
    canPerformSorteio: userRole === 'admin',
    canExportCSV: userRole === 'admin',
    canViewRelatorios: userRole === 'admin',
    canAccessConfiguracoes: userRole === 'admin',
    canManageUsers: userRole === 'admin',

    // Operador permissions
    canViewDashboard: userRole === 'admin' || userRole === 'operador',
    canViewRifas: userRole === 'admin' || userRole === 'operador',
    canEditNumeros: userRole === 'admin' || userRole === 'operador',

    // Helper methods
    isAdmin: userRole === 'admin',
    isOperador: userRole === 'operador',
    userRole,
  };
};

export default usePermissions;
