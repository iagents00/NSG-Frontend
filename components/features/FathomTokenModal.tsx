"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Key, CheckCircle, Lock, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import api from '@/lib/api';


interface FathomTokenModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect: (token: string) => void;
}

export default function FathomTokenModal({ isOpen, onClose, onConnect }: FathomTokenModalProps) {
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !mounted) return null;

    const handleSubmit = async () => {
        if (!token.trim()) {
            setError('El token es requerido');
            return;
        }

        setIsVerifying(true);
        setError('');

        try {
            // Save token to backend using the shared api service
            const response = await api.post('/fathom/token', {
                fathom_access_token: token.trim()
            });

            if (response.status !== 200 && response.status !== 201) {
                const detailedMessage = response.data?.message || response.data?.error || 'Error guardando el token.';
                throw new Error(detailedMessage);
            }


            // If successful, call parent callback
            onConnect(token);
            setToken('');

        } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo guardar el token.');
        } finally {
            setIsVerifying(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-8 animate-fade-in-up border border-slate-100">

                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 shadow-sm border border-blue-100">
                            <Key className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-display font-bold text-navy-900">
                            Conectar Fathom Manualmente
                        </h3>
                        <p className="text-slate-500 text-sm mt-1">
                            Ingresa tu API key personal para sincronizar.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isVerifying}
                        className="p-2 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-navy-900 uppercase tracking-wide ml-1">
                            API KEY
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={token}
                                onChange={(e) => {
                                    setToken(e.target.value);
                                    if (error) setError('');
                                }}
                                disabled={isVerifying}
                                placeholder="fathom_api_..."
                                className={clsx(
                                    "w-full bg-slate-50 border border-slate-200 text-navy-900 text-sm rounded-xl py-4 pl-11 pr-4 outline-none transition-all placeholder:text-slate-400 font-medium",
                                    "focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
                                    error && "border-red-300 focus:border-red-500 focus:ring-red-500/10 bg-red-50",
                                    isVerifying && "opacity-50 cursor-not-allowed"
                                )}
                                autoFocus
                            />
                        </div>
                        {error && (
                            <p className="text-red-500 text-xs font-bold ml-1 animate-pulse">
                                {error}
                            </p>
                        )}
                        <p className="text-xs text-slate-400 ml-1">
                            Tu API key se guardará de forma segura.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onClose}
                            disabled={isVerifying}
                            className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isVerifying}
                            className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-200 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isVerifying ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Conectar
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
}
