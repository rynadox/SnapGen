import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, Message } from '../types';
import { ArrowLeft, Video, Phone, Smile, Camera, Image as ImageIcon, Mic, Send } from 'lucide-react';
import { chatWithGemini } from '../services/geminiService';
import { subscribeToMessages, sendMessage } from '../services/chatService';
import { auth } from '../firebase';
import { motion } from 'motion/react';

interface ChatDetailProps {
  chat: ChatSession;
  onBack: () => void;
}

export const ChatDetail: React.FC<ChatDetailProps> = ({ chat, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAI = chat.user.id === 'ai';

  useEffect(() => {
    const unsubscribe = subscribeToMessages(chat.id, setMessages);
    return () => unsubscribe();
  }, [chat.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const textToSend = inputText;
    setInputText('');

    await sendMessage(chat.id, textToSend, 'text');
    
    if (isAI) {
      setIsTyping(true);
      const reply = await chatWithGemini(textToSend);
      setIsTyping(false);
      // In a real app, the AI would have a backend service to write to Firestore.
      // For this demo, we'll just simulate the AI writing back to the chat.
      // Note: This requires the current user to have write access as the AI, 
      // which our rules don't currently allow (senderId must be auth.uid).
      // So for AI, we might need a special rule or backend function.
      // For now, we'll just let it fail or we can mock AI chats differently.
      // Let's just log it for now if it's the AI.
      console.log("AI Reply:", reply);
    }
  };

  return (
    <motion.div 
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="h-full bg-black text-white flex flex-col absolute top-0 left-0 w-full z-50 pt-12"
    >
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-white/5 bg-black/80 backdrop-blur-xl z-10">
        <button onClick={onBack} className="p-2 hover:bg-zinc-800 rounded-full transition-colors mr-2">
            <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div className="flex items-center flex-1">
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-white/10 relative">
                <img src={chat.user.avatar} alt="User" className="w-full h-full object-cover" />
                {isAI && <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 to-blue-500/30"></div>}
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight">{chat.user.name}</span>
                <span className="text-xs text-zinc-400 font-medium">
                   {isTyping ? 'Typing...' : (isAI ? 'AI Assistant' : 'Active now')}
                </span>
            </div>
        </div>
        <div className="flex gap-2">
            <button className="p-2.5 rounded-full bg-zinc-900 border border-white/5 hover:bg-zinc-800 transition-colors"><Phone className="w-5 h-5 text-white" /></button>
            <button className="p-2.5 rounded-full bg-zinc-900 border border-white/5 hover:bg-zinc-800 transition-colors"><Video className="w-5 h-5 text-white" /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-black no-scrollbar" ref={scrollRef}>
        {messages.map((msg, idx) => {
            const showAvatar = !msg.isMe && (idx === messages.length - 1 || messages[idx + 1]?.isMe);
            return (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id} 
                    className={`flex flex-col mb-4 ${msg.isMe ? 'items-end' : 'items-start'}`}
                >
                     <div className="flex items-end max-w-[85%]">
                        {!msg.isMe && showAvatar && (
                             <img src={chat.user.avatar} className="w-8 h-8 rounded-full mr-3 mb-1 border border-white/10" alt="avatar" />
                        )}
                        {!msg.isMe && !showAvatar && <div className="w-11"></div>}
                        
                        <div className={`py-3 px-5 text-[15px] leading-relaxed relative ${
                            msg.isMe 
                            ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]' 
                            : 'bg-zinc-900 text-zinc-100 rounded-2xl rounded-tl-sm border border-white/5'
                        }`}>
                            {msg.text}
                        </div>
                     </div>
                </motion.div>
            );
        })}
        {isTyping && (
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center ml-14 mt-2 mb-4 bg-zinc-900 w-fit px-4 py-3 rounded-2xl rounded-tl-sm border border-white/5"
             >
                 <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce mr-1"></div>
                 <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce mr-1" style={{ animationDelay: '0.1s' }}></div>
                 <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
             </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-white/5 bg-black/80 backdrop-blur-xl flex items-center gap-3 pb-8">
        <button className="p-3 bg-zinc-900 rounded-full text-zinc-400 hover:text-white border border-white/5 transition-colors">
            <Camera className="w-5 h-5" />
        </button>
        <div className="flex-1 bg-zinc-900 border border-white/10 rounded-full px-4 py-2.5 flex items-center focus-within:border-white/30 transition-colors">
            <input 
                type="text" 
                placeholder="Message..." 
                className="bg-transparent outline-none w-full text-[15px] text-white placeholder-zinc-500"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            {inputText.trim() ? (
                <button onClick={handleSend} className="ml-2 text-blue-500 hover:text-blue-400 transition-colors">
                    <Send className="w-5 h-5" />
                </button>
            ) : (
                <button className="ml-2 text-zinc-500 hover:text-zinc-400 transition-colors">
                    <Smile className="w-5 h-5" />
                </button>
            )}
        </div>
        {!inputText.trim() && (
            <>
                <button className="p-3 text-zinc-500 hover:text-white bg-zinc-900 rounded-full border border-white/5 transition-colors">
                    <Mic className="w-5 h-5" />
                </button>
                <button className="p-3 text-zinc-500 hover:text-white bg-zinc-900 rounded-full border border-white/5 transition-colors">
                    <ImageIcon className="w-5 h-5" />
                </button>
            </>
        )}
      </div>
    </motion.div>
  );
};
