'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Users, Shield, Crown, Briefcase, HeartPulse, User as UserIcon, RefreshCw, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import clsx from 'clsx';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const ROLE_CONFIG = {
  user: {
    label: 'Usuario',
    icon: UserIcon,
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  patient: {
    label: 'Paciente',
    icon: HeartPulse,
    color: 'bg-pink-100 text-pink-700 border-pink-200',
  },
  consultant: {
    label: 'Consultor',
    icon: Briefcase,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  psychologist: {
    label: 'Psicólogo',
    icon: Users,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  manager: {
    label: 'Manager',
    icon: Crown,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  admin: {
    label: 'Administrador',
    icon: Shield,
    color: 'bg-red-100 text-red-700 border-red-200',
  },
};

export default function UserManagement() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/user/get_all');
      setUsers(response.data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      showToast('Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string, currentRole: string) => {
    if (newRole === currentRole) return;

    const roleConfig = ROLE_CONFIG[newRole as keyof typeof ROLE_CONFIG];
    const confirmMessage = `¿Estás seguro de cambiar el rol de este usuario a "${roleConfig.label}"?`;
    if (!confirm(confirmMessage)) return;

    setUpdatingUserId(userId);
    try {
      await api.post('/auth/assign-role', { userId, newRole });
      await fetchUsers();
      showToast(`Rol actualizado exitosamente a ${roleConfig.label}`, 'success');
    } catch (error: any) {
      console.error('Error updating role:', error);
      showToast(error.response?.data?.message || 'Error al actualizar el rol', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getRoleStats = () => {
    const stats: Record<string, number> = {};
    users.forEach(user => {
      stats[user.role] = (stats[user.role] || 0) + 1;
    });
    return stats;
  };

  const roleStats = getRoleStats();

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-linear-to-r from-navy-950 via-navy-900 to-navy-950 px-6 py-4 rounded-2xl border border-navy-800/50 shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-cyan-500/20 rounded-lg">
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="font-display font-bold text-xl lg:text-2xl tracking-tight">
              <span className="text-white">Gestión de </span>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">Usuarios</span>
              <span className="text-white">.</span>
            </h2>
          </div>
          <p className="text-slate-300 text-xs max-w-3xl leading-relaxed">
            Administra roles y permisos de usuarios. Total: <span className="font-bold text-cyan-400">{users.length}</span> usuarios registrados.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {Object.entries(ROLE_CONFIG).map(([role, config]) => {
          const Icon = config.icon;
          const count = roleStats[role] || 0;
          return (
            <div key={role} className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center gap-1 mb-1">
                <div className={clsx('p-1 rounded', config.color)}>
                  <Icon className="w-3 h-3" />
                </div>
              </div>
              <p className="text-lg font-bold text-navy-900">{count}</p>
              <p className="text-[9px] text-slate-500 font-medium leading-tight">{config.label}{count !== 1 ? 's' : ''}</p>
            </div>
          );
        })}
      </div>

      {/* Search and Refresh */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={clsx('w-3.5 h-3.5', loading && 'animate-spin')} />
          Actualizar
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Rol Actual</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Fecha Registro</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Cargando usuarios...
                    </div>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    {searchTerm ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios registrados'}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const roleConfig = ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.user;
                  const RoleIcon = roleConfig.icon;
                  const isUpdating = updatingUserId === user._id;

                  return (
                    <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {user.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-navy-900">{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">{user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={clsx('p-1.5 rounded-lg', roleConfig.color)}>
                            <RoleIcon className="w-4 h-4" />
                          </div>
                          <span className={clsx(
                            'px-3 py-1 rounded-lg text-xs font-bold border',
                            roleConfig.color
                          )}>
                            {roleConfig.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">
                          {new Date(user.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value, user.role)}
                          disabled={isUpdating}
                          className={clsx(
                            'border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all',
                            isUpdating && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                            <option key={role} value={role}>
                              {config.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {!loading && filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Mostrando {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} de {filteredUsers.length} usuarios
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={clsx(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-linear-to-br from-slate-50 to-slate-100 p-6 rounded-3xl border border-slate-200">
        <h3 className="font-bold text-sm text-slate-700 mb-3 uppercase tracking-wider">Descripción de Roles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(ROLE_CONFIG).map(([role, config]) => {
            const Icon = config.icon;
            return (
              <div key={role} className="flex items-center gap-3">
                <div className={clsx('p-2 rounded-lg', config.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-navy-900">{config.label}</p>
                  <p className="text-xs text-slate-500 capitalize">{role}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
