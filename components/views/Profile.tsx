'use client';

import React, { useState } from 'react';
import { User, Mail, Key, Shield, Edit2, Camera, CheckCircle2, X, Loader2, Calendar as CalendarIcon, ExternalLink, Upload, FileUp, Download, Trash2, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { useAppStore } from '@/store/useAppStore';
import { authService } from '@/lib/auth';
import api from '@/lib/api';
import clsx from 'clsx';

export default function Profile() {
  const { showToast } = useToast();
  const { userId, setUserId } = useAppStore();

  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [telegramId, setTelegramId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);
  
  // Edit Modals
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  
  // Edit Forms
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Loading states
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  // Document upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authService.verifySession();
        if (data?.user) {
          setUsername(data.user.username);
          setEmail(data.user.email);
          setRole(data.user.role);
          setUserId(data.user.id);
          if (data.user.telegram_id) {
            setTelegramId(data.user.telegram_id);
          }
        }
      } catch (error) {
        // Silent fail
      }
    };
    fetchUser();
  }, [setUserId]);

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      showToast('Por favor ingresa un nombre de usuario', 'error');
      return;
    }
    
    setIsUpdatingUsername(true);
    try {
      const response = await api.patch('/auth/update-username', { username: newUsername });
      if (response.data.success) {
        setUsername(newUsername);
        setIsEditingUsername(false);
        setNewUsername('');
        showToast('Nombre de usuario actualizado', 'success');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error al actualizar nombre de usuario', 'error');
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Por favor completa todos los campos', 'error');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }
    
    if (newPassword.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }
    
    setIsUpdatingPassword(true);
    try {
      const response = await api.patch('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      if (response.data.success) {
        setIsEditingPassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showToast('Contraseña actualizada correctamente', 'success');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error al cambiar contraseña', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        showToast('Solo se permiten archivos PDF', 'error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        showToast('El archivo no puede superar 10MB', 'error');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) {
      showToast('Por favor selecciona un archivo', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', selectedFile);

      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToast('Documento subido exitosamente', 'success');
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error al subir documento', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleExportData = () => {
    const data = {
      username,
      email,
      role,
      userId,
      telegramId,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nsg-profile-${username || 'user'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast('Datos exportados exitosamente', 'success');
  };

  const handlePurgeCache = () => {
    if (confirm('¿Estás seguro de que quieres limpiar el caché local? Esta acción no se puede deshacer.')) {
      localStorage.clear();
      sessionStorage.clear();
      showToast('Caché local purgado exitosamente', 'success');
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fade-in-up pb-10 px-4 sm:px-0">
      
      {/* Dark Header Banner - Clarity Style */}
      <div className="relative overflow-hidden bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 px-8 py-6 rounded-3xl border border-navy-800/50 shadow-xl">
        <div className="relative z-10">
          <h2 className="font-display font-bold text-2xl lg:text-3xl tracking-tight">
            <span className="text-white">Gestión de </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Mi Perfil</span>
            <span className="text-white">.</span>
          </h2>
          <p className="text-slate-300 text-sm mt-2 max-w-3xl leading-relaxed">
            Administra tu información personal, credenciales de acceso y configuración de cuenta. Panel de usuario ejecutándose.
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white p-8 rounded-3xl shadow-card border border-slate-200">
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center gap-8 mb-10 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl -mr-32 -mt-32 opacity-60"></div>
          
          <div className="relative">
            <div className="w-32 h-32 bg-linear-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold text-5xl shadow-xl shadow-blue-200 relative overflow-hidden">
              <span className="relative z-10">{username ? username.substring(0, 2).toUpperCase() : 'US'}</span>
            </div>
            <button 
              onClick={() => showToast('Funcionalidad en desarrollo', 'info')}
              className="absolute -bottom-2 -right-2 bg-white p-3 rounded-full shadow-lg border border-slate-200 hover:bg-blue-50 transition cursor-pointer group/btn"
            >
              <Camera className="w-4 h-4 text-slate-600 group-hover/btn:text-blue-600" />
            </button>
            <div className="absolute -bottom-2 -left-2 bg-white p-2 rounded-full shadow-lg border border-slate-100">
              <div className="bg-emerald-500 w-5 h-5 rounded-full border-2 border-white animate-pulse"></div>
            </div>
          </div>

          <div className="text-center sm:text-left relative z-10 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <h3 className="font-bold text-3xl text-navy-950">{username || 'Usuario Activo'}</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold uppercase w-fit mx-auto sm:mx-0">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Verificado
              </span>
            </div>
            <p className="text-slate-500 mb-4">{email || 'usuario@nsg.com'}</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase">
                Role: {role || 'User'}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">
                ID: {userId || 'N/A'}
              </span>
              {telegramId && (
                <span className="px-3 py-1 bg-[#0088cc]/10 text-[#0088cc] rounded-lg text-xs font-bold flex items-center gap-1">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                    <path d="M11.944 0C5.352 0 0 5.352 0 11.944c0 6.592 5.352 11.944 11.944 11.944c6.592 0 11.944-5.352 11.944-11.944C23.888 5.352 18.536 0 11.944 0zm5.66 8.16l-1.928 9.096c-.144.644-.528.804-1.068.5l-2.936-2.164l-1.416 1.364c-.156.156-.288.288-.588.288l.212-3.04l5.524-4.992c.24-.212-.052-.332-.372-.12l-6.828 4.3l-2.948-.92c-.64-.2-.652-.64.132-.948l11.524-4.44c.532-.2.996.12.804.976z" />
                  </svg>
                  Telegram: {telegramId}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Information Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField
            icon={User}
            label="Nombre de Usuario"
            value={username || 'No configurado'}
            editable
            onEdit={() => {
              setNewUsername(username || '');
              setIsEditingUsername(true);
            }}
          />
          <InfoField
            icon={Mail}
            label="Email"
            value={email || 'No configurado'}
            editable={false}
          />
          <InfoField
            icon={Shield}
            label="Rol"
            value={role || 'user'}
            badge
          />
          <InfoField
            icon={Key}
            label="Contraseña"
            value="••••••••"
            editable
            onEdit={() => setIsEditingPassword(true)}
          />
        </div>
      </div>

      {/* Document Upload Section - DISABLED */}
      <div className="bg-white p-8 rounded-3xl shadow-card border border-slate-200 relative opacity-60 pointer-events-none">
        {/* Disabled Overlay Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm">
            <Lock className="w-3.5 h-3.5" />
            Próximamente
          </span>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-slate-200 rounded-2xl text-slate-400 shadow-sm">
            <FileUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-slate-400">Carga de Documentos Estratégicos</h3>
            <p className="text-slate-400 text-sm">Procesa reportes, PDFs y archivos de inteligencia para alimentar el sistema</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
            <input
              type="file"
              id="file-upload"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              disabled
            />
            <label
              className="flex flex-col items-center justify-center cursor-not-allowed"
            >
              <Upload className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-400 mb-1">
                {selectedFile ? selectedFile.name : 'Haz click para seleccionar un archivo'}
              </p>
              <p className="text-xs text-slate-400">Solo archivos PDF (máx. 10MB)</p>
            </label>
          </div>

          <button
            disabled
            className="w-full py-3 px-6 bg-slate-200 text-slate-400 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FileUp className="w-4 h-4" />
            Subir Documento
          </button>
        </div>
      </div>

      {/* Data Management Section - DISABLED */}
      <div className="bg-white p-8 rounded-3xl shadow-card border border-slate-200 relative opacity-60 pointer-events-none">
        {/* Disabled Overlay Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm">
            <Lock className="w-3.5 h-3.5" />
            Próximamente
          </span>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-slate-300 rounded-full"></div>
          <h3 className="font-display font-bold text-xl text-slate-400">Gestión de Datos</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            disabled
            className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-100 border border-slate-200 rounded-2xl cursor-not-allowed"
          >
            <Download className="w-5 h-5 text-slate-400" />
            <span className="font-bold text-sm text-slate-400">Exportar Datos (JSON)</span>
          </button>

          <button
            disabled
            className="flex items-center justify-center gap-3 px-6 py-4 bg-red-50/50 border border-red-200 rounded-2xl cursor-not-allowed"
          >
            <Trash2 className="w-5 h-5 text-red-300" />
            <span className="font-bold text-sm text-red-300">Purgar Caché Local</span>
          </button>
        </div>
      </div>

      {/* Edit Username Modal */}
      {isEditingUsername && (
        <Modal
          title="Editar Nombre de Usuario"
          onClose={() => {
            setIsEditingUsername(false);
            setNewUsername('');
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nuevo nombre de usuario</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none"
                placeholder="Ingresa tu nuevo nombre"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleUpdateUsername}
                disabled={isUpdatingUsername}
                className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUpdatingUsername ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
              <button
                onClick={() => setIsEditingUsername(false)}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Change Password Modal */}
      {isEditingPassword && (
        <Modal
          title="Cambiar Contraseña"
          onClose={() => {
            setIsEditingPassword(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Contraseña Actual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nueva Contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none"
                placeholder="••••••••"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleChangePassword}
                disabled={isUpdatingPassword}
                className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Cambiar Contraseña'
                )}
              </button>
              <button
                onClick={() => setIsEditingPassword(false)}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Info Field Component
interface InfoFieldProps {
  icon: React.ElementType;
  label: string;
  value: string;
  editable?: boolean;
  badge?: boolean;
  onEdit?: () => void;
}

function InfoField({ icon: Icon, label, value, editable, badge, onEdit }: InfoFieldProps) {
  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-blue-200 transition group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
        </div>
        {editable && (
          <button
            onClick={onEdit}
            className="p-1.5 hover:bg-white rounded-lg transition cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600" />
          </button>
        )}
      </div>
      <p className={`font-semibold text-navy-900 ${badge ? 'uppercase text-sm' : ''}`}>
        {value}
      </p>
    </div>
  );
}

// Modal Component
interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-2xl text-navy-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Integration Card Component
interface IntegrationCardProps {
  name: string;
  icon: React.ReactNode;
  color: string;
  connected: boolean;
  connectedText?: string;
  loading?: boolean;
  onAction: () => void;
}

function IntegrationCard({ name, icon, color, connected, connectedText, loading, onAction }: IntegrationCardProps) {
  return (
    <div className={clsx(
      "p-5 rounded-2xl border transition-all",
      connected 
        ? `bg-${color}/5 border-${color}/20` 
        : "bg-slate-50 border-slate-200 hover:border-slate-300"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={clsx(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            connected ? `bg-white text-${color}` : "bg-white text-slate-400"
          )}>
            {icon}
          </div>
          <div>
            <h4 className="font-bold text-navy-900 text-sm">{name}</h4>
            <p className="text-xs text-slate-500">
              {connected ? (connectedText || 'Conectado') : 'No conectado'}
            </p>
          </div>
        </div>
      </div>
      <button
        onClick={onAction}
        disabled={loading}
        className={clsx(
          "w-full py-2 px-4 rounded-xl text-xs font-bold transition",
          connected
            ? "bg-red-50 text-red-600 hover:bg-red-100"
            : `bg-${color} text-white hover:opacity-90`,
          loading && "opacity-50 cursor-not-allowed"
        )}
      >
        {loading ? 'Verificando...' : connected ? 'Desconectar' : 'Conectar'}
      </button>
    </div>
  );
}
