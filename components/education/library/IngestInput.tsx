"use client";

import {
    FileText,
    Image as ImageIcon,
    Type,
    ArrowRight,
    X,
    MousePointer2,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

interface IngestInputProps {
    onIngest?: (data: {
        text: string;
        document: File | null;
        image: File | null;
    }) => void;
    isProcessing?: boolean;
}

type InputType = "text" | "document" | "image" | null;

export default function IngestInput({
    onIngest,
    isProcessing = false,
}: IngestInputProps) {
    const [selectedType, setSelectedType] = useState<InputType>(null);
    const [text, setText] = useState("");
    const [document, setDocument] = useState<File | null>(null);
    const [image, setImage] = useState<File | null>(null);

    const handleTypeSelect = (type: InputType) => {
        // Reset all inputs when changing type
        setText("");
        setDocument(null);
        setImage(null);
        setSelectedType(type);
    };

    const handleIngest = () => {
        const textToProcess = text.trim();

        // Prevent double submission
        if (isProcessing) return;
        if (!textToProcess && !document && !image) return;

        onIngest?.({
            text: textToProcess,
            document,
            image,
        });

        // Reset all
        setText("");
        setDocument(null);
        setImage(null);
        setSelectedType(null);
    };

    const hasInput = () => {
        if (selectedType === "text") return text.trim().length > 0;
        if (selectedType === "document") return document !== null;
        if (selectedType === "image") return image !== null;
        return false;
    };

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Type Selector - Card Style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Text Option */}
                <button
                    onClick={() => handleTypeSelect("text")}
                    className={clsx(
                        "relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group",
                        selectedType === "text"
                            ? "border-purple-500 bg-purple-50 shadow-lg scale-105"
                            : "border-slate-200 bg-white hover:border-purple-300 hover:shadow-md",
                    )}
                >
                    <div className="flex items-start gap-4">
                        <div
                            className={clsx(
                                "p-3 rounded-xl transition-colors",
                                selectedType === "text"
                                    ? "bg-purple-500 text-white"
                                    : "bg-slate-100 text-slate-600 group-hover:bg-purple-100 group-hover:text-purple-600",
                            )}
                        >
                            <Type className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-navy-900 mb-1">
                                Texto
                            </h3>
                            <p className="text-sm text-slate-500">
                                Escribe o pega contenido directamente
                            </p>
                        </div>
                    </div>
                    {selectedType === "text" && (
                        <div className="absolute top-2 right-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                        </div>
                    )}
                </button>

                {/* Document Option */}
                <button
                    onClick={() => handleTypeSelect("document")}
                    className={clsx(
                        "relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group",
                        selectedType === "document"
                            ? "border-blue-500 bg-blue-50 shadow-lg scale-105"
                            : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md",
                    )}
                >
                    <div className="flex items-start gap-4">
                        <div
                            className={clsx(
                                "p-3 rounded-xl transition-colors",
                                selectedType === "document"
                                    ? "bg-blue-500 text-white"
                                    : "bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600",
                            )}
                        >
                            <FileText className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-navy-900 mb-1">
                                Documento
                            </h3>
                            <p className="text-sm text-slate-500">
                                PDF, Word, TXT
                            </p>
                        </div>
                    </div>
                    {selectedType === "document" && (
                        <div className="absolute top-2 right-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        </div>
                    )}
                </button>

                {/* Image Option */}
                <button
                    onClick={() => handleTypeSelect("image")}
                    className={clsx(
                        "relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group",
                        selectedType === "image"
                            ? "border-green-500 bg-green-50 shadow-lg scale-105"
                            : "border-slate-200 bg-white hover:border-green-300 hover:shadow-md",
                    )}
                >
                    <div className="flex items-start gap-4">
                        <div
                            className={clsx(
                                "p-3 rounded-xl transition-colors",
                                selectedType === "image"
                                    ? "bg-green-500 text-white"
                                    : "bg-slate-100 text-slate-600 group-hover:bg-green-100 group-hover:text-green-600",
                            )}
                        >
                            <ImageIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-navy-900 mb-1">
                                Imagen
                            </h3>
                            <p className="text-sm text-slate-500">
                                JPG, PNG, WebP
                            </p>
                        </div>
                    </div>
                    {selectedType === "image" && (
                        <div className="absolute top-2 right-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                    )}
                </button>
            </div>

            {/* Input Area - Shows based on selected type */}
            {selectedType && (
                <div
                    className={clsx(
                        "bg-white rounded-2xl border-2 p-6 transition-all duration-500 animate-fade-in",
                        selectedType === "text" &&
                            "border-purple-200 bg-purple-50/30",
                        selectedType === "document" &&
                            "border-blue-200 bg-blue-50/30",
                        selectedType === "image" &&
                            "border-green-200 bg-green-50/30",
                    )}
                >
                    {/* Text Input */}
                    {selectedType === "text" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-navy-900 flex items-center gap-2">
                                    <Type className="w-4 h-4 text-purple-500" />
                                    Ingresa tu contenido
                                </label>
                                <button
                                    onClick={() => handleTypeSelect(null)}
                                    className="text-xs text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    Cancelar
                                </button>
                            </div>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && e.ctrlKey) {
                                        handleIngest();
                                    }
                                }}
                                placeholder="Escribe o pega tu texto aquí... (Ctrl+Enter para procesar)"
                                className="w-full bg-white border-2 border-purple-200 rounded-xl px-4 py-3 text-navy-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 resize-none min-h-[120px] text-[15px] leading-relaxed"
                                rows={5}
                                autoFocus
                            />
                            <div className="text-xs text-slate-500 italic">
                                {text.trim().length} caracteres
                            </div>
                        </div>
                    )}

                    {/* Document Input */}
                    {selectedType === "document" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-navy-900 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-500" />
                                    Selecciona tu documento
                                </label>
                                <button
                                    onClick={() => handleTypeSelect(null)}
                                    className="text-xs text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    Cancelar
                                </button>
                            </div>

                            {!document ? (
                                <label
                                    htmlFor="doc-upload"
                                    className="block w-full border-2 border-dashed border-blue-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
                                >
                                    <FileText className="w-12 h-12 mx-auto text-blue-400 group-hover:text-blue-600 mb-3" />
                                    <p className="text-sm font-bold text-navy-900 mb-1">
                                        Haz clic para seleccionar
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Formatos: PDF, DOC, DOCX, TXT
                                    </p>
                                    <input
                                        id="doc-upload"
                                        type="file"
                                        accept=".pdf,.doc,.docx,.txt"
                                        onChange={(e) =>
                                            setDocument(
                                                e.target.files?.[0] || null,
                                            )
                                        }
                                        className="hidden"
                                    />
                                </label>
                            ) : (
                                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500 rounded-lg">
                                            <FileText className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-navy-900 text-sm">
                                                {document.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {(document.size / 1024).toFixed(
                                                    2,
                                                )}{" "}
                                                KB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setDocument(null)}
                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                                    >
                                        <X className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Image Input */}
                    {selectedType === "image" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-navy-900 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-green-500" />
                                    Selecciona tu imagen
                                </label>
                                <button
                                    onClick={() => handleTypeSelect(null)}
                                    className="text-xs text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    Cancelar
                                </button>
                            </div>

                            {!image ? (
                                <label
                                    htmlFor="image-upload"
                                    className="block w-full border-2 border-dashed border-green-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all group"
                                >
                                    <ImageIcon className="w-12 h-12 mx-auto text-green-400 group-hover:text-green-600 mb-3" />
                                    <p className="text-sm font-bold text-navy-900 mb-1">
                                        Haz clic para seleccionar
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Formatos: JPG, PNG, WebP, GIF
                                    </p>
                                    <input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setImage(
                                                e.target.files?.[0] || null,
                                            )
                                        }
                                        className="hidden"
                                    />
                                </label>
                            ) : (
                                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-500 rounded-lg">
                                            <ImageIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-navy-900 text-sm">
                                                {image.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {(image.size / 1024).toFixed(2)}{" "}
                                                KB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setImage(null)}
                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                                    >
                                        <X className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleIngest}
                            disabled={!hasInput() || isProcessing}
                            className={clsx(
                                "flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg",
                                hasInput()
                                    ? selectedType === "text"
                                        ? "bg-purple-500 text-white hover:bg-purple-600 hover:scale-105 active:scale-95"
                                        : selectedType === "document"
                                          ? "bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 active:scale-95"
                                          : "bg-green-500 text-white hover:bg-green-600 hover:scale-105 active:scale-95"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed opacity-50",
                            )}
                        >
                            <span>Procesar Recurso</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Help Text */}
            {!selectedType && (
                <div className="text-center py-4">
                    <p className="text-sm text-slate-500 italic flex items-center justify-center gap-2">
                        <MousePointer2 className="w-4 h-4 text-slate-400" />
                        Selecciona el tipo de recurso que deseas procesar
                    </p>
                </div>
            )}
        </div>
    );
}
