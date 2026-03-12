import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { subscribeToStories } from '../services/storyService';
import { Story } from '../types';
import { auth } from '../firebase';

export const StoriesView: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToStories(setStories);
    return () => unsubscribe();
  }, []);

  return (
    <div className="h-full bg-black text-white overflow-y-auto no-scrollbar pt-12">
       {/* Header */}
       <div className="px-6 py-4 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-xl z-10 border-b border-white/5">
            <h1 className="text-2xl font-bold tracking-tight">Stories</h1>
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden">
                 <img src={auth.currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.currentUser?.uid}`} className="w-full h-full object-cover" alt="me" />
            </div>
       </div>

       {/* My Story */}
       <div className="px-6 mb-8 mt-4">
            <div className="font-semibold text-xs tracking-widest uppercase text-zinc-500 mb-4">My Story</div>
            <motion.div 
                whileTap={{ scale: 0.98 }}
                className="flex items-center bg-zinc-900/30 p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-zinc-800/50 transition-colors"
            >
                <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center bg-zinc-800 relative">
                    <img src={auth.currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.currentUser?.uid}`} className="w-full h-full rounded-full object-cover opacity-50" alt="me" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Plus className="w-6 h-6 text-white" />
                    </div>
                </div>
                <div className="ml-4">
                    <div className="font-semibold text-lg">Add to My Story</div>
                    <div className="text-zinc-500 text-sm">Share a moment with friends</div>
                </div>
            </motion.div>
       </div>

       {/* Friends */}
       <div className="px-6 mb-8">
            <div className="font-semibold text-xs tracking-widest uppercase text-zinc-500 mb-4">Friends</div>
            <div className="grid grid-cols-2 gap-4">
                {stories.length === 0 ? (
                  <div className="text-zinc-500 text-sm col-span-2">No stories yet.</div>
                ) : (
                  stories.map((story, i) => (
                      <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          key={story.id} 
                          className="relative aspect-[3/5] rounded-2xl overflow-hidden border border-white/10 shadow-lg cursor-pointer group"
                      >
                          <img src={story.imageUrl} alt="story" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                          
                          <div className="absolute top-4 left-4 w-10 h-10 rounded-full border-2 border-blue-500 p-[2px] bg-black/50 backdrop-blur-sm">
                               <img src={story.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${story.userId}`} className="w-full h-full rounded-full object-cover" alt="avatar" />
                          </div>
                          
                          <div className="absolute bottom-4 left-4 right-4 text-white">
                              <div className="font-bold text-base tracking-tight">{story.user?.name || 'Unknown'}</div>
                              <div className="text-xs text-zinc-300">New</div>
                          </div>
                      </motion.div>
                  ))
                )}
            </div>
       </div>
        
       {/* Discover */}
       <div className="px-6 pb-32">
            <div className="font-semibold text-xs tracking-widest uppercase text-zinc-500 mb-4">Discover</div>
             <div className="grid grid-cols-2 gap-4">
                 {[1,2,3,4].map((i, index) => (
                     <motion.div 
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: index * 0.1 + 0.2 }}
                         key={i} 
                         className="relative aspect-[3/5] rounded-2xl overflow-hidden border border-white/5 shadow-lg group cursor-pointer"
                     >
                         <img src={`https://picsum.photos/400/600?random=${i+10}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="discover" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                         
                         <div className="absolute bottom-4 left-4 right-4">
                            <div className="font-bold text-white leading-tight text-lg tracking-tight">
                                Daily Vibes Ep. {i}
                            </div>
                            <div className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-semibold">Trending</div>
                         </div>
                     </motion.div>
                 ))}
             </div>
       </div>
    </div>
  );
};
