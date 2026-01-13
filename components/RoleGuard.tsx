'use client';

import { useAppStore, Role } from '@/store/useAppStore';
import { ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  redirectTo?: string;
}

/**
 * Role Guard Component
 * Protects content based on user roles
 */
export default function RoleGuard({ 
  children, 
  allowedRoles, 
  redirectTo = '/dashboard' 
}: RoleGuardProps) {
  const { currentRole } = useAppStore();
  const router = useRouter();

  const isAllowed = allowedRoles.includes(currentRole);

  if (!isAllowed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-navy-900 mb-2">
            Acceso Restringido
          </h2>
          
          <p className="text-slate-600 mb-6">
            No tienes permisos para acceder a esta sección. Esta funcionalidad solo está disponible para usuarios con rol de <span className="font-semibold text-navy-900">{allowedRoles.join(', ')}</span>.
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-700">Tu rol actual:</span>{' '}
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase">
                {currentRole}
              </span>
            </p>
          </div>
          
          <button
            onClick={() => router.push(redirectTo)}
            className="w-full bg-linear-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-cyan-500/50"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
