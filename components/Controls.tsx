import React, { useState } from 'react';
import { GenerationSettings } from '../types';
import { Plus, Play, Trash2, Settings2 } from 'lucide-react';

interface ControlsProps {
  onAddPrompts: (prompts: string[], settings: GenerationSettings) => void;
  onClearAll: () => void;
  isProcessing: boolean;
  jobCount: number;
}

const Controls: React.FC<ControlsProps> = ({ onAddPrompts, onClearAll, isProcessing, jobCount }) => {
  const [textInput, setTextInput] = useState('');
  const [aspectRatio, setAspectRatio] = useState<GenerationSettings['aspectRatio']>('1:1');

  const handleSubmit = () => {
    if (!textInput.trim()) return;
    
    // Split by new line, filter empty strings
    const prompts = textInput
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (prompts.length === 0) return;

    onAddPrompts(prompts, { aspectRatio, concurrency: 1 });
    setTextInput('');
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl h-fit sticky top-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
            <Plus className="text-white" size={24} />
        </div>
        <h2 className="text-xl font-bold text-white">New Batch</h2>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-slate-400 text-sm font-medium mb-2">
            Prompts (One per line)
          </label>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="w-full h-48 bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none placeholder-slate-600 transition-all text-sm leading-relaxed"
            placeholder="A cyberpunk cat in neon rain&#10;A peaceful zen garden on Mars&#10;Portrait of a robot mechanic, oil painting style..."
          />
          <div className="flex justify-between items-center mt-2">
             <span className="text-xs text-slate-500">
               {textInput.split('\n').filter(l => l.trim()).length} prompts detected
             </span>
             <button 
               onClick={() => setTextInput('')} 
               className="text-xs text-slate-500 hover:text-slate-300"
             >
               Clear Text
             </button>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-2">
            <Settings2 size={16} /> Aspect Ratio
          </label>
          <div className="grid grid-cols-5 gap-2">
            {['1:1', '3:4', '4:3', '9:16', '16:9'].map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio as any)}
                className={`py-2 px-1 rounded-lg text-xs font-semibold border transition-all ${
                  aspectRatio === ratio
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-700 flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            disabled={!textInput.trim()}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play size={18} fill="currentColor" /> Add to Queue
          </button>

          {jobCount > 0 && (
            <button
              onClick={onClearAll}
              className="w-full py-2 bg-slate-900 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-900 hover:bg-red-900/10 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            >
              <Trash2 size={16} /> Clear All Jobs
            </button>
          )}
        </div>
      </div>
      
      {isProcessing && (
         <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-3 text-sm text-slate-300">
               <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Processing queue...
            </div>
         </div>
      )}
    </div>
  );
};

export default Controls;
