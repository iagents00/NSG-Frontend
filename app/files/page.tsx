"use client";

import { useState } from "react";
import { Upload, FileText, Search, Filter, MoreVertical, Trash2, Download, Eye } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  status: "processed" | "processing" | "error";
}

const MOCK_FILES: FileItem[] = [
  { id: "1", name: "Q4_Financial_Report.pdf", type: "PDF", size: "2.4 MB", date: "2024-10-24", status: "processed" },
  { id: "2", name: "Employee_Handbook_v2.docx", type: "DOCX", size: "1.1 MB", date: "2024-10-22", status: "processed" },
  { id: "3", name: "Market_Analysis_2025.pdf", type: "PDF", size: "5.8 MB", date: "2024-10-20", status: "processing" },
  { id: "4", name: "Client_List_Nov.xlsx", type: "XLSX", size: "850 KB", date: "2024-10-18", status: "processed" },
];

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>(MOCK_FILES);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Simulate upload
    setTimeout(() => {
      const newFile: FileItem = {
        id: Date.now().toString(),
        name: file.name,
        type: file.name.split('.').pop()?.toUpperCase() || "FILE",
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        date: new Date().toISOString().split('T')[0],
        status: "processing"
      };
      setFiles([newFile, ...files]);
      setIsUploading(false);
    }, 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scroll p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl text-navy-900">Knowledge Base</h1>
            <p className="text-slate-500 mt-1">Manage documents for RAG context</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search files..." 
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            
            <label className={`flex items-center gap-2 px-4 py-2.5 bg-navy-900 text-white rounded-xl font-bold text-sm cursor-pointer hover:bg-blue-600 transition shadow-lg ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}>
              <Upload className="w-4 h-4" />
              {isUploading ? 'Uploading...' : 'Upload File'}
              <input type="file" className="hidden" onChange={handleUpload} />
            </label>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <DashboardCard title="Total Documents" icon={FileText} iconColor="text-blue-600" iconBg="bg-blue-50">
              <p className="text-3xl font-display font-bold text-navy-900">{files.length}</p>
           </DashboardCard>
           <DashboardCard title="Storage Used" icon={Filter} iconColor="text-purple-600" iconBg="bg-purple-50">
              <div className="space-y-2">
                 <p className="text-3xl font-display font-bold text-navy-900">45%</p>
                 <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 w-[45%] h-full rounded-full"></div>
                 </div>
              </div>
           </DashboardCard>
           <DashboardCard title="Processing Status" icon={Eye} iconColor="text-emerald-600" iconBg="bg-emerald-50">
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                 <span className="font-bold text-navy-900">System Ready</span>
              </div>
           </DashboardCard>
        </div>

        {/* Files List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Name</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Type</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Size</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Date</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {files.map((file) => (
                <tr key={file.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-navy-900">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{file.type}</td>
                  <td className="px-6 py-4 text-slate-500">{file.size}</td>
                  <td className="px-6 py-4 text-slate-500">{file.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                      file.status === 'processed' ? 'bg-emerald-50 text-emerald-600' :
                      file.status === 'processing' ? 'bg-amber-50 text-amber-600' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {file.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
