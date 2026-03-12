import React from 'react';
import { ViewState } from '../types';
import { Map, MessageSquare, Camera, Users, Play } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChangeView }) => {
  const getIconColor = (view: ViewState) => {
    if (currentView === view) return 'text-white';
    return 'text-zinc-500 hover:text-zinc-300';
  };

  return (
    <div className="fixed bottom-6 w-full flex justify-center items-end z-50 px-4">
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex justify-between items-center w-full max-w-md shadow-2xl">
        
        <button onClick={() => onChangeView(ViewState.MAP)} className="relative p-2 flex flex-col items-center transition-transform active:scale-90">
          <Map className={`w-6 h-6 ${getIconColor(ViewState.MAP)} transition-colors`} strokeWidth={2} />
          {currentView === ViewState.MAP && (
            <motion.div layoutId="nav-indicator" className="absolute -bottom-2 w-1 h-1 bg-white rounded-full" />
          )}
        </button>

        <button onClick={() => onChangeView(ViewState.CHAT)} className="relative p-2 flex flex-col items-center transition-transform active:scale-90">
          <MessageSquare className={`w-6 h-6 ${getIconColor(ViewState.CHAT)} transition-colors`} strokeWidth={2} />
          {currentView === ViewState.CHAT && (
            <motion.div layoutId="nav-indicator" className="absolute -bottom-2 w-1 h-1 bg-white rounded-full" />
          )}
        </button>

        <button onClick={() => onChangeView(ViewState.CAMERA)} className="relative p-2 flex flex-col items-center transition-transform active:scale-90">
          <Camera className={`w-6 h-6 ${getIconColor(ViewState.CAMERA)} transition-colors`} strokeWidth={2} />
          {currentView === ViewState.CAMERA && (
            <motion.div layoutId="nav-indicator" className="absolute -bottom-2 w-1 h-1 bg-white rounded-full" />
          )}
        </button>

        <button onClick={() => onChangeView(ViewState.STORIES)} className="relative p-2 flex flex-col items-center transition-transform active:scale-90">
          <Users className={`w-6 h-6 ${getIconColor(ViewState.STORIES)} transition-colors`} strokeWidth={2} />
          {currentView === ViewState.STORIES && (
            <motion.div layoutId="nav-indicator" className="absolute -bottom-2 w-1 h-1 bg-white rounded-full" />
          )}
        </button>

        <button onClick={() => onChangeView(ViewState.SPOTLIGHT)} className="relative p-2 flex flex-col items-center transition-transform active:scale-90">
          <Play className={`w-6 h-6 ${getIconColor(ViewState.SPOTLIGHT)} transition-colors`} strokeWidth={2} />
          {currentView === ViewState.SPOTLIGHT && (
            <motion.div layoutId="nav-indicator" className="absolute -bottom-2 w-1 h-1 bg-white rounded-full" />
          )}
        </button>

      </div>
    </div>
  );
};
