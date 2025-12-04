import React from 'react';
import { ImageJob, JobStatus } from '../types';
import { Download, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface JobCardProps {
  job: ImageJob;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onRetry, onRemove }) => {
  const handleDownload = () => {
    if (job.imageUrl) {
      const link = document.createElement('a');
      link.href = job.imageUrl;
      link.download = `generated-${job.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-lg flex flex-col h-full transition-all hover:border-slate-600">
      {/* Image Area */}
      <div className="relative w-full aspect-square bg-slate-900 flex items-center justify-center group">
        {job.status === JobStatus.COMPLETED && job.imageUrl ? (
          <>
            <img 
              src={job.imageUrl} 
              alt={job.prompt} 
              className="w-full h-full object-cover" 
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
              <button 
                onClick={handleDownload}
                className="p-2 bg-white text-slate-900 rounded-full hover:bg-slate-200 transition-colors"
                title="Download"
              >
                <Download size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 p-4 text-center">
             {job.status === JobStatus.GENERATING && (
               <div className="animate-spin mb-2 text-indigo-500">
                 <RefreshCw size={24} />
               </div>
             )}
             {job.status === JobStatus.QUEUED && <Clock size={24} className="mb-2" />}
             {job.status === JobStatus.IDLE && <div className="w-2 h-2 rounded-full bg-slate-600 mb-2" />}
             {job.status === JobStatus.FAILED && <AlertCircle size={24} className="mb-2 text-red-500" />}
             
             <span className="text-sm font-medium">
               {job.status === JobStatus.GENERATING ? 'Dreaming...' :
                job.status === JobStatus.QUEUED ? 'Queued' :
                job.status === JobStatus.FAILED ? 'Failed' :
                'Ready'}
             </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
              job.status === JobStatus.COMPLETED ? 'bg-green-900 text-green-300' :
              job.status === JobStatus.FAILED ? 'bg-red-900 text-red-300' :
              job.status === JobStatus.GENERATING ? 'bg-indigo-900 text-indigo-300' :
              'bg-slate-700 text-slate-400'
            }`}>
              {job.status}
            </span>
             <button 
              onClick={() => onRemove(job.id)}
              className="text-slate-500 hover:text-red-400 text-xs transition-colors"
            >
              Remove
            </button>
          </div>
          <p className="text-slate-300 text-sm line-clamp-3 leading-relaxed" title={job.prompt}>
            {job.prompt}
          </p>
        </div>

        {job.status === JobStatus.FAILED && (
          <div className="mt-3">
             <p className="text-xs text-red-400 mb-2 truncate" title={job.error}>
               {job.error}
             </p>
             <button 
               onClick={() => onRetry(job.id)}
               className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
             >
               <RefreshCw size={12} /> Retry
             </button>
          </div>
        )}
        
        {job.status === JobStatus.COMPLETED && (
           <div className="mt-3 flex justify-end">
              <CheckCircle size={16} className="text-green-500" />
           </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;
