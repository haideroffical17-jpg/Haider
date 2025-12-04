import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid'; // We'll implement a simple UUID generator since we can't import external libs not in description, wait, standard is to use uuid or crypto.randomUUID
import Controls from './components/Controls';
import JobCard from './components/JobCard';
import { ImageJob, JobStatus, GenerationSettings } from './types';
import { generateImage } from './services/geminiService';
import { Layers, Image as ImageIcon, Zap } from 'lucide-react';

// Simple unique ID generator
const generateId = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);

const App: React.FC = () => {
  const [jobs, setJobs] = useState<ImageJob[]>([]);
  const [settings, setSettings] = useState<GenerationSettings>({ aspectRatio: '1:1', concurrency: 1 });
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Ref to track processing state without triggering re-renders inside the effect loop
  const processingRef = useRef(false);

  const addPrompts = (prompts: string[], newSettings: GenerationSettings) => {
    setSettings(newSettings); // Update settings for this batch
    
    const newJobs: ImageJob[] = prompts.map(prompt => ({
      id: generateId(),
      prompt,
      status: JobStatus.QUEUED,
      createdAt: Date.now(),
    }));

    setJobs(prev => [...prev, ...newJobs]);
  };

  const removeJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const clearAllJobs = () => {
    // Only clear if not currently processing heavily, or just clear all
    // Ideally we should cancel pending, but simple clear is okay
    setJobs([]);
    processingRef.current = false;
    setIsProcessing(false);
  };

  const retryJob = (id: string) => {
    setJobs(prev => prev.map(job => 
      job.id === id ? { ...job, status: JobStatus.QUEUED, error: undefined } : job
    ));
  };

  const updateJobStatus = useCallback((id: string, status: JobStatus, updates: Partial<ImageJob> = {}) => {
    setJobs(prev => prev.map(job => 
      job.id === id ? { ...job, status, ...updates } : job
    ));
  }, []);

  // Queue Processing Logic
  useEffect(() => {
    const processQueue = async () => {
      if (processingRef.current) return;
      
      const nextJob = jobs.find(j => j.status === JobStatus.QUEUED);
      if (!nextJob) {
        setIsProcessing(false);
        return;
      }

      processingRef.current = true;
      setIsProcessing(true);

      try {
        updateJobStatus(nextJob.id, JobStatus.GENERATING);
        
        // Use the settings stored or passed. For simplicity, we use current state settings.
        // In a more robust app, settings might be attached to the job.
        // We will attach the current global settings to the call.
        const imageUrl = await generateImage(nextJob.prompt, settings);
        
        updateJobStatus(nextJob.id, JobStatus.COMPLETED, { imageUrl });
      } catch (error: any) {
        updateJobStatus(nextJob.id, JobStatus.FAILED, { error: error.message || 'Generation failed' });
      } finally {
        processingRef.current = false;
        // Small delay to be gentle on the API
        setTimeout(() => {
           // Trigger next pass
           processQueue();
        }, 1000); 
      }
    };

    // If we are not processing and there are queued jobs, start processing
    const hasQueued = jobs.some(j => j.status === JobStatus.QUEUED);
    if (hasQueued && !processingRef.current) {
        processQueue();
    }
  }, [jobs, settings, updateJobStatus]);

  // Statistics
  const completedCount = jobs.filter(j => j.status === JobStatus.COMPLETED).length;
  const failedCount = jobs.filter(j => j.status === JobStatus.FAILED).length;
  const queuedCount = jobs.filter(j => j.status === JobStatus.QUEUED).length;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0f172a]/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <Layers className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
              BulkImaginator
            </h1>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-medium">
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-slate-400">Success: <span className="text-slate-200">{completedCount}</span></span>
             </div>
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span className="text-slate-400">Queued: <span className="text-slate-200">{queuedCount}</span></span>
             </div>
              {failedCount > 0 && (
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="text-slate-400">Failed: <span className="text-slate-200">{failedCount}</span></span>
                </div>
              )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Controls */}
          <div className="lg:col-span-4 xl:col-span-3">
            <Controls 
              onAddPrompts={addPrompts} 
              onClearAll={clearAllJobs}
              isProcessing={isProcessing}
              jobCount={jobs.length}
            />
          </div>

          {/* Right Panel: Gallery */}
          <div className="lg:col-span-8 xl:col-span-9">
            {jobs.length === 0 ? (
              <div className="h-[60vh] flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                <ImageIcon size={64} className="mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Ready to Create</h3>
                <p className="max-w-md text-center">
                  Enter your prompts in the sidebar to start batch generating images. 
                  Perfect for concept art, assets, or just exploring ideas.
                </p>
                <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full text-xs font-mono text-indigo-400 border border-slate-700">
                  <Zap size={14} />
                  Powered by Gemini 2.5 Flash
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {jobs.slice().reverse().map(job => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onRetry={retryJob} 
                    onRemove={removeJob}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
