"use client";

import { useAppStore } from "@/store/useAppStore";
import { useState, useEffect, useCallback } from "react";
import IngestInput from "./IngestInput";
import ContentGrid from "./ContentGrid";
import ContentDetail from "./ContentDetail";
import EmptyLibrary from "./EmptyLibrary";
import { Loader2, Database } from "lucide-react";
import { Banner } from "@/components/ui/Banner";
import { useToast } from "@/components/ui/ToastProvider";
import api from "@/lib/api";
import { educationService } from "@/lib/education";
import { EducationContent } from "@/types/education";

export default function ContentLibrary() {
    const { userId } = useAppStore();
    const { showToast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [libraryItems, setLibraryItems] = useState<EducationContent[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);
    const [selectedItem, setSelectedItem] = useState<EducationContent | null>(
        null,
    );

    const loadContent = useCallback(async () => {
        if (!userId) return [];
        try {
            setIsLoadingLibrary(true);
            const response = await api.get("/education/content");
            if (response.data.success) {
                const items = response.data.data;
                setLibraryItems(items);
                return items;
            }
            return [];
        } catch (error) {
            console.error("Error cargando biblioteca:", error);
            showToast("No se pudo cargar la biblioteca de recursos", "error");
            return [];
        } finally {
            setIsLoadingLibrary(false);
        }
    }, [userId, showToast]);

    useEffect(() => {
        loadContent();
    }, [loadContent]);

    const handleIngest = async (data: {
        text: string;
        document: File | null;
        image: File | null;
    }) => {
        setIsProcessing(true);
        try {
            if (!userId) {
                throw new Error(
                    "ID de usuario no encontrado. Por favor, reinicia sesión.",
                );
            }

            const formData = new FormData();
            formData.append("userId", userId);

            if (data.text) formData.append("text", data.text);
            if (data.document) formData.append("document", data.document);
            if (data.image) formData.append("image", data.image);

            const result = await educationService.ingestContent(formData);

            if (result.status === "success" || result.success === true) {
                showToast(`Recurso procesado exitosamente`, "success");
                // Recargar biblioteca
                const updatedItems = await loadContent();

                // Si n8n devolvió un ID de recurso, intentamos abrirlo directamente
                if (result.resource_id) {
                    let newItem = updatedItems.find(
                        (item: EducationContent) =>
                            item.id === result.resource_id,
                    );

                    // ⚡ RAPID HYDRATION: If webhook returns questions directly, inject them immediately
                    if (
                        newItem &&
                        (result.question_process || result.questions)
                    ) {
                        try {
                            const directProcess = result.question_process || {
                                completed: false,
                                meta: result.meta || {},
                                question_blocks: Array.isArray(result.questions)
                                    ? result.questions
                                    : [],
                            };

                            newItem = {
                                ...newItem,
                                question_process: directProcess,
                            };

                            // Update local library state to reflect this enhanced item
                            setLibraryItems((prev) =>
                                prev.map((i) =>
                                    i.id === newItem!.id ? newItem! : i,
                                ),
                            );
                        } catch (e) {
                            console.error("Hydration error:", e);
                        }
                    }

                    if (newItem) {
                        setSelectedItem(newItem);
                    }
                }
            } else {
                throw new Error(
                    result.message || "Error al procesar el recurso",
                );
            }
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : "Error en la ingesta";
            showToast(message, "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este recurso?"))
            return;
        try {
            await api.delete(`/education/content/${id}`);
            showToast("Recurso eliminado correctamente", "success");
            setLibraryItems((prev) => prev.filter((item) => item.id !== id));
        } catch {
            showToast("No se pudo eliminar el recurso", "error");
        }
    };

    if (selectedItem) {
        return (
            <ContentDetail
                item={selectedItem}
                onBack={() => setSelectedItem(null)}
            />
        );
    }

    if (isProcessing) {
        return (
            <div className="flex flex-col h-full items-center justify-center p-8 animate-fade-in bg-white">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin relative z-10" />
                </div>
                <h2 className="mt-8 text-xl font-display font-bold text-navy-900 tracking-tight">
                    Procesando Inteligencia...
                </h2>
                <p className="mt-2 text-slate-500 font-medium text-center max-w-xs">
                    Tu cerebro estratégico está analizando y clasificando el
                    nuevo recurso.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-auto gap-8 p-6 md:p-8">
            <Banner
                badge="Base de Conocimiento"
                title="NSG Education"
                description="Ingesta de Recursos Estratégicos y Consulta con IA. Envía información para expandir tu base de datos y conversa con tu agente especializado."
            />

            {/* INGEST AREA */}
            <section className="max-w-4xl mx-auto w-full">
                <div className="flex items-center gap-2 mb-6 text-navy-900">
                    <Database className="w-5 h-5 text-blue-600" />
                    <h3 className="font-display font-bold text-lg">
                        Nueva Ingesta
                    </h3>
                </div>
                <IngestInput
                    onIngest={handleIngest}
                    isProcessing={isProcessing}
                />
            </section>

            {/* LIBRARY AREA */}
            <section className="mt-4">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-navy-900">
                        <h3 className="font-display font-bold text-lg">
                            Recursos en Red
                        </h3>
                    </div>
                </div>

                {isLoadingLibrary ? (
                    <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-4" />
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                            Sincronizando...
                        </span>
                    </div>
                ) : libraryItems.length > 0 ? (
                    <ContentGrid
                        extraItems={libraryItems}
                        onSelect={setSelectedItem}
                        onDelete={handleDelete}
                    />
                ) : (
                    <EmptyLibrary />
                )}
            </section>
        </div>
    );
}
