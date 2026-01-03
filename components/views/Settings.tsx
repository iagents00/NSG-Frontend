"use client";
import React, { useState, useRef } from 'react';
import { Bell, Shield, Moon, Download, Trash2, Edit2, FileUp, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import clsx from "clsx";
import axios from "axios";

import { useAppStore } from "@/store/useAppStore";

import { authService } from "@/lib/auth"; // Import authService

export default function Settings() {
  const { showToast } = useToast();
  const { theme, setTheme, userId, setUserId } = useAppStore(); // Connect to store

  const [username, setUsername] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authService.verifySession();
        if (data?.user?.username) {
          setUsername(data.user.username);
        }
        if (data?.user?.id) {
          setUserId(data.user.id);
        }
      } catch (error) {
        // Silent fail
      }
    };
    fetchUser();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    showToast(`Tema cambiado a ${newTheme === 'dark' ? 'Oscuro' : 'Claro'}`, 'success');
  };

  // PDF Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setUploadStatus('idle');
      setUploadMessage('');
    } else {
      setUploadStatus('error');
      setUploadMessage('Por favor selecciona un archivo PDF válido');
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('error');
      setUploadMessage('No hay archivo seleccionado');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setUploadMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', 'pdf_upload');
      formData.append('fileName', selectedFile.name);
      formData.append('fileSize', selectedFile.size.toString());
      formData.append('timestamp', new Date().toISOString());
      formData.append('userId', userId);

      // Remove manual Content-Type header to allow browser to set boundary automatically
      const response = await axios.post('/api/chat', formData);

      setUploadStatus('success');

      // Extract text from N8N response
      const responseData = response.data;
      const responseText = responseData.response ||
        responseData.output ||
        responseData.content ||
        responseData.text ||
        responseData.message ||
        `${selectedFile.name} subido exitosamente`;

      setUploadMessage(responseText);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      showToast('Documento subido correctamente', 'success');

    } catch (error: any) {

      let errorMessage = 'Error al subir el PDF';
      let debugInfo = '';

      if (error.response) {
        const data = error.response.data;

        if (error.response.status === 404) {
          errorMessage = 'Error 404: Ruta de API no encontrada (/api/upload)';
        } else if (error.response.status === 502) {
          // Try to parse the N8N error details
          let n8nDetails = data.details;
          try {
            const parsed = JSON.parse(data.details);
            // "The requested webhook is not registered"
            if (parsed.message) n8nDetails = parsed.message;
            // "Click the 'Execute workflow' button..."
            if (parsed.hint) n8nDetails += `\nSuggestion: ${parsed.hint}`;

            // Add method hint
            n8nDetails += `\nImportant: File uploads require the N8N Webhook to be set to 'POST'.`;
          } catch (e) { /* use raw details */ }

          errorMessage = `N8N Error (${data.n8n_status})`;
          debugInfo = n8nDetails;
        } else {
          errorMessage = data.error || data.message || `Error del servidor (${error.response.status})`;
          debugInfo = data.details || '';
        }
      } else if (error.request) {
        errorMessage = 'Error de red: No se recibió respuesta del servidor';
      } else {
        errorMessage = error.message;
      }

      setUploadStatus('error');
      // Use pre-line whitespace for the suggestion newline
      setUploadMessage(`${errorMessage}: \n${debugInfo}`);
      showToast(errorMessage, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in-up pb-10 px-4 sm:px-0">

      {/* 1. Main Config Card */}
      <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-card border border-slate-200">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-navy-900">Configuración del Sistema</h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Administra tus preferencias y seguridad.</p>
          </div>
          <span className="hidden xs:inline-block bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold border border-blue-100">
            Versión 14.4.0
          </span>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                <span className="relative z-10">{username ? username.substring(0, 2).toUpperCase() : 'US'}</span>
                <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-md border border-slate-100">
              <div className="bg-emerald-500 w-4 h-4 rounded-full border-2 border-white"></div>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <h4 className="font-bold text-xl text-navy-900">{username || 'Usuario Activo'}</h4>
            <p className="text-slate-500 text-sm mb-3">
              NSG-ID: {userId} • <span className="text-emerald-600 font-medium">Online</span>
            </p>
            <button
              onClick={() => showToast('Perfil actualizado', 'success')}
              className="text-xs font-bold text-white bg-navy-900 px-4 py-2 rounded-lg hover:bg-blue-600 transition shadow-md flex items-center gap-2 mx-auto sm:mx-0 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" /> Editar Perfil
            </button>
          </div>
        </div>

        {/* Toggles List */}
        <div className="space-y-4">
          <ToggleItem
            icon={Bell}
            title="Notificaciones Inteligentes"
            desc="Alertas basadas en contexto y prioridad."
            color="blue"
            active={true}
            onClick={() => showToast('Preferencia de notificaciones actualizada', 'info')}
          />
          <ToggleItem
            icon={Shield}
            title="Modo Privacidad Avanzada"
            desc="Ocultar datos sensibles en dashboard compartido."
            color="purple"
            active={false}
            onClick={() => showToast('Preferencia de privacidad actualizada', 'info')}
          />
          <ToggleItem
            icon={Moon}
            title="Modo Oscuro"
            desc="Activar interfaz oscura estilo Auth."
            color="orange"
            active={theme === 'dark'}
            onClick={toggleTheme}
          />
        </div>
      </div>

      {/* 2. Fathom Analytics Connection */}
      {/* Fathom Connection Removed */}

      {/* 3. PDF Upload Card */}
      <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-card border border-slate-200">
        <h3 className="font-display font-bold text-lg sm:text-xl text-navy-900 mb-4 sm:mb-6">Subir Documentos</h3>
        <p className="text-slate-500 text-xs sm:text-sm mb-6">Sube archivos PDF para procesamiento y análisis</p>

        <div className="space-y-4">
          {/* File Input */}
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="flex-1 text-sm text-slate-600 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed file:transition-all"
            />
          </div>

          {/* Selected File Display */}
          {selectedFile && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl animate-fade-in-up">
              <FileUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-900 font-medium flex-1">{selectedFile.name}</span>
              <span className="text-xs text-blue-600 font-bold">{(selectedFile.size / 1024).toFixed(2)} KB</span>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className={clsx(
              "w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-3 shadow-md",
              selectedFile && !isUploading
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-slate-900 hover:shadow-lg hover:scale-[1.02] cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <FileUp className="w-5 h-5" />
                Subir Documento
              </>
            )}
          </button>

          {/* Status Messages */}
          {uploadStatus === 'success' && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl animate-fade-in-up">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm text-emerald-900 font-medium">{uploadMessage}</span>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl animate-fade-in-up">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-900 font-medium">{uploadMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Data Zone Card */}
      <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-card border border-slate-200">
        <h3 className="font-display font-bold text-lg sm:text-xl text-navy-900 mb-6">Zona de Datos</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => showToast('Iniciando descarga...', 'success')}
            className="flex-1 px-6 py-4 bg-slate-50 text-navy-900 font-bold rounded-2xl border border-slate-200 hover:bg-white hover:shadow-md transition-all flex items-center justify-center gap-3 group cursor-pointer"
          >
            <Download className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            Exportar Todo (JSON)
          </button>
          <button
            onClick={() => showToast('Cache eliminado', 'success')}
            className="flex-1 px-6 py-4 bg-red-50 text-red-600 font-bold rounded-2xl border border-red-100 hover:bg-red-100 hover:shadow-md transition-all flex items-center justify-center gap-3 group cursor-pointer"
          >
            <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Limpiar Cache Local
          </button>
        </div>
      </div>

    </div>
  );
}

// --- SUB-COMPONENT: Toggle Item ---
interface ToggleItemProps {
  icon: React.ElementType;
  title: string;
  desc: string;
  color: 'blue' | 'purple' | 'orange';
  active: boolean;
  onClick?: () => void;
}

function ToggleItem({ icon: Icon, title, desc, color, active, onClick }: ToggleItemProps) {
  // Explicit mapping allows Tailwind to scan these classes correctly
  const styles = {
    blue: {
      container: "hover:border-blue-300",
      iconBox: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
    },
    purple: {
      container: "hover:border-purple-300",
      iconBox: "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white"
    },
    orange: {
      container: "hover:border-orange-300",
      iconBox: "bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white"
    }
  };

  const currentStyle = styles[color];

  return (
    <div
      className={clsx(
        "flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-200 transition-colors group cursor-pointer",
        currentStyle.container
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={clsx("p-3 rounded-xl transition-colors", currentStyle.iconBox)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-navy-900 text-sm">{title}</p>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
      </div>

      {/* Switch Toggle */}
      <div className={clsx(
        "relative w-12 h-6 rounded-full transition-colors",
        active ? "bg-emerald-500" : "bg-slate-300"
      )}>
        <div className={clsx(
          "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
          active ? "right-1" : "left-1"
        )} />
      </div>
    </div>
  );
}
