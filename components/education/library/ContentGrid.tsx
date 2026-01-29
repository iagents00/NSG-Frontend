import {
    Play,
    FileText,
    CheckCircle2,
    Clock,
    Loader2,
    RefreshCw,
} from "lucide-react";
import { EducationContent } from "@/types/education";
import Image from "next/image";
import {
    useEffect,
    useState,
    useCallback,
    useImperativeHandle,
    forwardRef,
} from "react";
import { educationService } from "@/lib/education";

interface ContentGridProps {
    onSelect?: (item: EducationContent) => void;
}

export interface ContentGridRef {
    refresh: () => void;
}

const ContentGrid = forwardRef<ContentGridRef, ContentGridProps>(
    ({ onSelect }, ref) => {
        const [contents, setContents] = useState<EducationContent[]>([]);
        const [isLoading, setIsLoading] = useState(true);

        const loadContents = useCallback(async () => {
            setIsLoading(true);
            try {
                const data = await educationService.getContents();
                setContents(data);
            } catch (error) {
                console.error("Error loading contents:", error);
            } finally {
                setIsLoading(false);
            }
        }, []);

        useEffect(() => {
            loadContents();
        }, [loadContents]);

        // Expose refresh to parent
        useImperativeHandle(ref, () => ({
            refresh: loadContents,
        }));

        if (isLoading && contents.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p className="font-medium">Cargando tu biblioteca...</p>
                </div>
            );
        }

        if (contents.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6">
                        <RefreshCw className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                        Tu biblioteca está vacía
                    </h3>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        Pega un enlace arriba para procesar tu primer contenido
                        con IA.
                    </p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                {contents.map((item) => (
                    <ContentCard
                        key={item.id}
                        item={item}
                        onClick={() => onSelect?.(item)}
                    />
                ))}
            </div>
        );
    },
);

ContentGrid.displayName = "ContentGrid";

export default ContentGrid;

function ContentCard({
    item,
    onClick,
}: {
    item: EducationContent;
    onClick?: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className="group bg-white rounded-3xl border border-slate-100 p-3 hover:border-blue-200 hover:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.15)] transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden"
        >
            {/* Thumbnail Area */}
            <div className="aspect-video rounded-2xl bg-slate-100 relative overflow-hidden mb-4">
                {item.thumbnailUrl ? (
                    <Image
                        src={item.thumbnailUrl}
                        alt={item.title}
                        width={800}
                        height={450}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        {item.type === "pdf" ? (
                            <FileText className="w-12 h-12" />
                        ) : (
                            <Play className="w-12 h-12" />
                        )}
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                    <StatusBadge status={item.status} />
                </div>

                {/* Type Icon overlay */}
                <div className="absolute bottom-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-navy-900 shadow-sm">
                    {item.type === "video" ? (
                        <Play className="w-3.5 h-3.5 fill-current" />
                    ) : (
                        <FileText className="w-3.5 h-3.5" />
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="px-2 pb-2">
                <h3 className="font-bold text-navy-900 text-lg leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                </h3>
                <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                    <span>{item.createdAt}</span>

                    {item.status === "ready" && (
                        <button className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                            Crear Plan
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === "processing") {
        return (
            <div className="bg-blue-500/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                <Loader2 className="w-3 h-3 animate-spin" />
                Processing
            </div>
        );
    }
    if (status === "ready") {
        return (
            <div className="bg-emerald-500/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                <CheckCircle2 className="w-3 h-3" />
                Ready
            </div>
        );
    }
    return (
        <div className="bg-amber-400/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
            <Clock className="w-3 h-3" />
            Pending
        </div>
    );
}
