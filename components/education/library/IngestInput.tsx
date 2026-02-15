"use client";

import {
    FileText,
    Image as ImageIcon,
    Type,
    ArrowRight,
    X,
    MousePointer2,
    CloudUpload,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { motion, AnimatePresence, Variants } from "framer-motion";

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
    const [isDragging, setIsDragging] = useState(false);

    const handleTypeSelect = (type: InputType) => {
        setText("");
        setDocument(null);
        setImage(null);
        setSelectedType(type);
    };

    const handleIngest = () => {
        const textToProcess = text.trim();
        if (isProcessing) return;
        if (!textToProcess && !document && !image) return;

        onIngest?.({
            text: textToProcess,
            document,
            image,
        });

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

    const cardVariants: Variants = {
        initial: { y: 20, opacity: 0 },
        animate: (i: number) => ({
            y: 0,
            opacity: 1,
            transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
        }),
        hover: { y: -5, transition: { duration: 0.2 } },
    };

    return (
        <div className="w-full flex flex-col gap-8">
            {/* Type Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                    {
                        id: "text",
                        label: "Texto",
                        sub: "Contenido directo",
                        icon: Type,
                        color: "purple",
                    },
                    {
                        id: "document",
                        label: "Documento",
                        sub: "PDF, Word, TXT",
                        icon: FileText,
                        color: "blue",
                    },
                    {
                        id: "image",
                        label: "Imagen",
                        sub: "JPG, PNG, WebP",
                        icon: ImageIcon,
                        color: "emerald",
                    },
                ].map((item, i) => (
                    <motion.button
                        key={item.id}
                        custom={i}
                        variants={cardVariants}
                        initial="initial"
                        animate="animate"
                        whileHover="hover"
                        onClick={() => handleTypeSelect(item.id as InputType)}
                        className={clsx(
                            "relative p-6 rounded-4xl border-2 transition-all duration-300 text-left group overflow-hidden",
                            selectedType === item.id
                                ? `border-${item.color}-500 bg-${item.color}-50/50 shadow-2xl shadow-${item.color}-500/10`
                                : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50",
                        )}
                    >
                        {/* Background Decoration */}
                        <div
                            className={clsx(
                                "absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity",
                                `bg-${item.color}-500`,
                            )}
                        />

                        <div className="flex items-center gap-5 relative z-10">
                            <div
                                className={clsx(
                                    "p-4 rounded-2xl transition-all duration-500 shadow-sm",
                                    selectedType === item.id
                                        ? `bg-${item.color}-600 text-white shadow-${item.color}-500/40`
                                        : "bg-slate-50 text-slate-500 group-hover:bg-white group-hover:shadow-md",
                                )}
                            >
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-display font-bold text-lg text-navy-950 mb-0.5">
                                    {item.label}
                                </h3>
                                <p className="text-xs font-medium text-slate-400">
                                    {item.sub}
                                </p>
                            </div>
                        </div>

                        {selectedType === item.id && (
                            <motion.div
                                layoutId="indicator"
                                className={clsx(
                                    "absolute top-4 right-4 w-2 h-2 rounded-full",
                                    `bg-${item.color}-500`,
                                )}
                            />
                        )}
                    </motion.button>
                ))}
            </div>

            {/* Input Area */}
            <AnimatePresence mode="wait">
                {selectedType && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 200,
                        }}
                        className={clsx(
                            "bg-white/80 backdrop-blur-xl rounded-[2.5rem] border-2 p-8 shadow-2xl relative overflow-hidden",
                            selectedType === "text" &&
                                "border-purple-100 shadow-purple-500/5",
                            selectedType === "document" &&
                                "border-blue-100 shadow-blue-500/5",
                            selectedType === "image" &&
                                "border-emerald-100 shadow-emerald-500/5",
                        )}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <label className="text-xs font-black uppercase tracking-widest text-navy-950 flex items-center gap-3">
                                <span
                                    className={clsx(
                                        "p-2 rounded-lg",
                                        selectedType === "text" &&
                                            "bg-purple-100 text-purple-600",
                                        selectedType === "document" &&
                                            "bg-blue-100 text-blue-600",
                                        selectedType === "image" &&
                                            "bg-emerald-100 text-emerald-600",
                                    )}
                                >
                                    {selectedType === "text" && (
                                        <Type className="w-4 h-4" />
                                    )}
                                    {selectedType === "document" && (
                                        <FileText className="w-4 h-4" />
                                    )}
                                    {selectedType === "image" && (
                                        <ImageIcon className="w-4 h-4" />
                                    )}
                                </span>
                                Ingestar{" "}
                                {selectedType === "text"
                                    ? "Contenido"
                                    : selectedType === "document"
                                      ? "Documento"
                                      : "Imagen"}
                            </label>
                            <button
                                onClick={() => handleTypeSelect(null)}
                                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Text Content */}
                        {selectedType === "text" && (
                            <div className="space-y-4">
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Escribe o pega el contenido aquí... (Control + Enter para enviar)"
                                    onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        e.ctrlKey &&
                                        handleIngest()
                                    }
                                    className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-3xl p-6 text-navy-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-400 focus:bg-white transition-all min-h-[180px] font-medium leading-relaxed shadow-inner"
                                    autoFocus
                                />
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                                    <span>
                                        Contador: {text.length} caracteres
                                    </span>
                                    <span>
                                        Ctrl + Enter para procesar rápidamente
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* File Upload (Document or Image) */}
                        {(selectedType === "document" ||
                            selectedType === "image") && (
                            <div className="space-y-4">
                                {!document && !image ? (
                                    <label
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setIsDragging(true);
                                        }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setIsDragging(false);
                                            const file =
                                                e.dataTransfer.files[0];
                                            if (
                                                selectedType === "document" &&
                                                file
                                            )
                                                setDocument(file);
                                            if (
                                                selectedType === "image" &&
                                                file
                                            )
                                                setImage(file);
                                        }}
                                        className={clsx(
                                            "flex flex-col items-center justify-center w-full min-h-[220px] border-3 border-dashed rounded-3xl cursor-pointer transition-all gap-4 group",
                                            isDragging
                                                ? "border-blue-500 bg-blue-50/50 scale-[0.99]"
                                                : "border-slate-100 bg-slate-50/30 hover:bg-white hover:border-slate-200",
                                        )}
                                    >
                                        <div
                                            className={clsx(
                                                "p-5 rounded-4xl transition-all duration-500",
                                                isDragging
                                                    ? "bg-blue-600 text-white shadow-xl"
                                                    : "bg-white text-slate-400 group-hover:text-navy-950 shadow-sm",
                                            )}
                                        >
                                            <CloudUpload className="w-10 h-10" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-navy-950">
                                                Selecciona o arrastra tu archivo
                                            </p>
                                            <p className="text-xs font-medium text-slate-400 mt-1">
                                                {selectedType === "document"
                                                    ? "PDF, DOCX, TXT hasta 10MB"
                                                    : "JPG, PNG, WEBP hasta 5MB"}
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept={
                                                selectedType === "document"
                                                    ? ".pdf,.doc,.docx,.txt"
                                                    : "image/*"
                                            }
                                            onChange={(e) => {
                                                const file =
                                                    e.target.files?.[0] || null;
                                                if (selectedType === "document")
                                                    setDocument(file);
                                                else setImage(file);
                                            }}
                                        />
                                    </label>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div
                                                className={clsx(
                                                    "p-4 rounded-2xl text-white shadow-lg",
                                                    selectedType === "document"
                                                        ? "bg-blue-600 shadow-blue-500/30"
                                                        : "bg-emerald-600 shadow-emerald-500/30",
                                                )}
                                            >
                                                {selectedType === "document" ? (
                                                    <FileText className="w-6 h-6" />
                                                ) : (
                                                    <ImageIcon className="w-6 h-6" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-navy-950 truncate max-w-[200px] md:max-w-md">
                                                    {(document || image)?.name}
                                                </p>
                                                <p className="text-xs font-medium text-slate-400">
                                                    {(
                                                        ((document || image)
                                                            ?.size || 0) /
                                                        1024 /
                                                        1024
                                                    ).toFixed(2)}{" "}
                                                    MB • Listo para procesar
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setDocument(null);
                                                setImage(null);
                                            }}
                                            className="p-3 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-2xl transition-all"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {/* Action Footer */}
                        <div className="mt-8 flex justify-end">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleIngest}
                                disabled={!hasInput() || isProcessing}
                                className={clsx(
                                    "flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-sm transition-all shadow-xl",
                                    hasInput()
                                        ? selectedType === "text"
                                            ? "bg-purple-600 text-white shadow-purple-500/25 hover:bg-purple-700"
                                            : selectedType === "document"
                                              ? "bg-blue-600 text-white shadow-blue-500/25 hover:bg-blue-700"
                                              : "bg-emerald-600 text-white shadow-emerald-500/25 hover:bg-emerald-700"
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed",
                                )}
                            >
                                <span>
                                    {isProcessing
                                        ? "Procesando..."
                                        : "Ingestar Recurso"}
                                </span>
                                <ArrowRight className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hint */}
            {!selectedType && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-3 py-4"
                >
                    <div className="w-8 h-px bg-slate-100" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <MousePointer2 className="w-4 h-4" />
                        Selecciona una fuente cognitiva
                    </p>
                    <div className="w-8 h-px bg-slate-100" />
                </motion.div>
            )}
        </div>
    );
}
