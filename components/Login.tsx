import React from 'react';
import { signInWithGoogle } from '../firebase';
import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-yellow-400 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(250,204,21,0.3)]">
           <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C12 2 15 5 15 9C15 11.5 13.5 13.5 12 15C10.5 13.5 9 11.5 9 9C9 5 12 2 12 2Z" fill="black"/>
              <path d="M12 22C15.3137 22 18 19.3137 18 16C18 12.6863 12 8 12 8C12 8 6 12.6863 6 16C6 19.3137 8.68629 22 12 22Z" fill="black"/>
           </svg>
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight mb-2">Snapchat+</h1>
        <p className="text-zinc-400 mb-12 text-center max-w-xs">Connect with friends, share moments, and chat with AI.</p>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={signInWithGoogle}
          className="bg-white text-black font-bold py-4 px-8 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-shadow"
        >
          <LogIn className="w-5 h-5" />
          <span className="text-lg tracking-tight">Continue with Google</span>
        </motion.button>
      </motion.div>
    </div>
  );
};
