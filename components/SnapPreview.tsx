import React, { useState } from 'react';
import { X, Send, Sparkles, Download, Type } from 'lucide-react';
import { generateSnapCaption } from '../services/geminiService';
import { motion } from 'motion/react';

interface SnapPreviewProps {
  imageSrc: string;
  onClose: () => void;
  onSend: (imageSrc: string, caption: string) => void;
}

export const SnapPreview: React.FC<SnapPreviewProps> = ({ imageSrc, onClose, onSend }) => {
  const [caption, setCaption] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handleAiCaption = async () => {
    setIsGenerating(true);
    const aiText = await generateSnapCaption(imageSrc);
    setCaption(aiText);
    setIsGenerating(false);
    setShowInput(true);
  };

  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        className="relative h-full w-full bg-black flex flex-col overflow-hidden"
    >
      {/* Top Bar */}
      <div className="absolute top-12 left-6 z-50">
        <button onClick={onClose} className="p-3 bg-black/20 backdrop-blur-xl rounded-full border border-white/10 hover:bg-black/40 transition-colors">
            <X className="w-6 h-6 text-white" strokeWidth={2.5} />
        </button>
      </div>

      {/* Main Image */}
      <div className="relative flex-1 bg-black">
        <img src={imageSrc} alt="Snap" className="w-full h-full object-cover" />
        
        {/* Caption Overlay */}
        {(showInput || caption) && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-1/2 left-0 w-full bg-black/40 backdrop-blur-md px-6 py-4 flex items-center justify-center cursor-text border-y border-white/10 shadow-2xl"
                onClick={() => document.getElementById('caption-input')?.focus()}
            >
                <input 
                    id="caption-input"
                    type="text" 
                    value={caption} 
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full bg-transparent text-white text-center text-2xl font-semibold tracking-tight outline-none placeholder-white/50"
                    placeholder="Add a caption..."
                    autoFocus
                />
            </motion.div>
        )}
      </div>

      {/* Side Tools */}
      <div className="absolute top-12 right-6 flex flex-col gap-4 z-40">
        <button className="p-3 bg-black/20 backdrop-blur-xl rounded-full border border-white/10 hover:bg-black/40 transition-colors flex flex-col items-center justify-center" onClick={() => setShowInput(!showInput)}>
            <Type className="w-6 h-6 text-white" />
        </button>
        <button className="p-3 bg-black/20 backdrop-blur-xl rounded-full border border-white/10 hover:bg-black/40 transition-colors flex flex-col items-center justify-center">
             <Download className="w-6 h-6 text-white" />
        </button>
        <button 
            onClick={handleAiCaption}
            className="p-3 bg-black/20 backdrop-blur-xl rounded-full border border-white/10 hover:bg-black/40 transition-colors flex flex-col items-center justify-center relative group"
            disabled={isGenerating}
        >
            {isGenerating ? (
                <Sparkles className="w-6 h-6 text-yellow-400 animate-spin" />
            ) : (
                <Sparkles className="w-6 h-6 text-white group-hover:text-yellow-400 transition-colors" />
            )}
            <span className="absolute -bottom-6 text-white text-[10px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">AI Fix</span>
        </button>
      </div>

      {/* Bottom Send Bar */}
      <div className="absolute bottom-12 right-6 z-50">
        <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSend(imageSrc, caption)}
            className="bg-white text-black font-bold py-4 px-8 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] transition-shadow"
        >
            <span className="text-lg tracking-tight">Send</span>
            <Send className="w-5 h-5 -rotate-45 mb-1" strokeWidth={2.5} />
        </motion.button>
      </div>
    </motion.div>
  );
};
