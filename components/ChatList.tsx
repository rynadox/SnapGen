import React, { useState, useEffect } from 'react';
import { ChatSession, User } from '../types';
import { MessageSquare, Camera, Search, UserPlus, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { subscribeToChats, getOrCreateChat } from '../services/chatService';
import { searchUsers, addFriend, getFriends } from '../services/userService';
import { auth, logout } from '../firebase';

interface ChatListProps {
  onSelectChat: (chat: ChatSession) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ onSelectChat }) => {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const unsubscribeChats = subscribeToChats(setChats);
    const unsubscribeFriends = getFriends(setFriends);
    
    return () => {
      unsubscribeChats();
      unsubscribeFriends();
    };
  }, []);

  useEffect(() => {
    const doSearch = async () => {
      if (searchQuery.trim().length > 0) {
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    };
    
    const timeoutId = setTimeout(doSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleAddFriend = async (friendId: string) => {
    await addFriend(friendId);
    setSearchQuery('');
    setIsSearching(false);
  };

  const handleStartChat = async (friendId: string) => {
    try {
      const chatId = await getOrCreateChat(friendId);
      // Find the chat in our list to select it
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        onSelectChat(chat);
      } else {
        // If it's a new chat, we might need to wait for the subscription to update
        // For now, we'll just let the user see it in the list
        setIsSearching(false);
      }
    } catch (error) {
      console.error("Error starting chat", error);
    }
  };

  return (
    <div className="h-full bg-black text-white flex flex-col pt-12">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 z-10 sticky top-0 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 overflow-hidden">
            <img src={auth.currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.currentUser?.uid}`} alt="Me" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Chat</h1>
        <div className="flex gap-4">
             <button onClick={() => setIsSearching(!isSearching)} className={`p-2 rounded-full border transition-colors ${isSearching ? 'bg-white text-black border-white' : 'bg-zinc-900 text-white border-white/5 hover:bg-zinc-800'}`}>
                 <UserPlus className="w-5 h-5" />
             </button>
             <button onClick={logout} className="p-2 bg-zinc-900 rounded-full border border-white/5 hover:bg-zinc-800 transition-colors">
                 <LogOut className="w-5 h-5 text-zinc-400" />
             </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-4">
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl flex items-center px-4 py-3 backdrop-blur-md">
            <Search className="w-5 h-5 text-zinc-500 mr-3" />
            <input 
              type="text" 
              placeholder={isSearching ? "Search users to add..." : "Search friends..."}
              className="bg-transparent outline-none w-full font-medium placeholder-zinc-500 text-white" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearching(true)}
            />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-24">
        {isSearching && searchQuery.length > 0 ? (
          // Search Results
          <div>
            <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-4 px-2">Search Results</h2>
            {searchResults.length === 0 ? (
              <div className="text-zinc-500 text-center py-8">No users found</div>
            ) : (
              searchResults.map((user, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={user.id} 
                  className="flex items-center px-4 py-4 mb-2 bg-zinc-900/30 rounded-2xl border border-white/5"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-zinc-800">
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-4 flex-1">
                      <h3 className="font-semibold text-white">{user.name}</h3>
                  </div>
                  <button 
                    onClick={() => handleAddFriend(user.id)}
                    className="px-4 py-1.5 bg-white text-black font-bold rounded-full text-sm hover:bg-zinc-200 transition-colors"
                  >
                    Add
                  </button>
                </motion.div>
              ))
            )}
          </div>
        ) : isSearching ? (
          // Friends List (when searching but empty query)
          <div>
            <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-4 px-2">My Friends</h2>
            {friends.length === 0 ? (
              <div className="text-zinc-500 text-center py-8">No friends yet. Search to add some!</div>
            ) : (
              friends.map((friend, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={friend.id} 
                  className="flex items-center px-4 py-4 mb-2 bg-zinc-900/30 hover:bg-zinc-800/50 rounded-2xl cursor-pointer border border-white/5 transition-colors"
                  onClick={() => handleStartChat(friend.id)}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-zinc-800">
                      <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-4 flex-1">
                      <h3 className="font-semibold text-white">{friend.name}</h3>
                      <p className="text-xs text-zinc-500">Tap to chat</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          // Active Chats
          chats.length === 0 ? (
            <div className="text-zinc-500 text-center py-12 flex flex-col items-center">
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              <p>No chats yet.</p>
              <button onClick={() => setIsSearching(true)} className="mt-4 text-blue-400 font-medium">Find friends</button>
            </div>
          ) : (
            chats.map((chat, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={chat.id} 
                onClick={() => onSelectChat(chat)}
                className="flex items-center px-4 py-4 mb-2 bg-zinc-900/30 hover:bg-zinc-800/50 rounded-2xl transition-all cursor-pointer border border-white/5"
              >
                {/* Avatar */}
                <div className={`relative w-14 h-14 rounded-full p-[2px] ${chat.isUnread ? 'bg-gradient-to-tr from-blue-500 to-purple-500' : 'bg-zinc-800'}`}>
                    <div className="w-full h-full rounded-full border-2 border-black overflow-hidden">
                        <img src={chat.user.avatar} alt={chat.user.name} className="w-full h-full object-cover bg-zinc-800" />
                    </div>
                    {chat.user.streak && chat.user.streak > 0 && (
                        <div className="absolute -bottom-1 -right-1 bg-zinc-900 border border-white/10 rounded-full text-[10px] px-1.5 py-0.5 shadow-lg flex items-center gap-1">
                            <span>🔥</span>
                            <span className="font-bold">{chat.user.streak}</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="ml-4 flex-1">
                    <h3 className="font-semibold text-lg text-white tracking-tight">{chat.user.name}</h3>
                    <div className="flex items-center text-sm mt-0.5">
                        {chat.isUnread ? (
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-2 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                        ) : (
                            <div className="w-2.5 h-2.5 border border-zinc-500 rounded-full mr-2"></div>
                        )}
                        <span className={`${chat.isUnread ? 'font-medium text-blue-400' : 'text-zinc-500'} truncate max-w-[180px]`}>
                            {chat.lastMessage}
                        </span>
                    </div>
                </div>

                {/* Action */}
                <div className="p-3 bg-zinc-900/50 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors border border-white/5">
                    <Camera className="w-5 h-5" />
                </div>
              </motion.div>
            ))
          )
        )}
      </div>
    </div>
  );
};
