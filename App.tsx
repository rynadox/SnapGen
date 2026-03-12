import React, { useState, useEffect } from 'react';
import { ViewState, ChatSession } from './types';
import { CameraView } from './components/CameraView';
import { ChatList } from './components/ChatList';
import { ChatDetail } from './components/ChatDetail';
import { StoriesView } from './components/StoriesView';
import { BottomNav } from './components/BottomNav';
import { SnapPreview } from './components/SnapPreview';
import { Login } from './components/Login';
import { Users, Play } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { auth } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { createUserProfile } from './services/userService';
import { addStory } from './services/storyService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.CAMERA);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await createUserProfile(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-screen w-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  // If in Chat View and a chat is selected, show detail
  if (currentView === ViewState.CHAT && activeChat) {
    return <ChatDetail chat={activeChat} onBack={() => setActiveChat(null)} />;
  }

  // If an image is captured, show the editing preview
  if (capturedImage) {
    return (
      <>
        <SnapPreview 
          imageSrc={capturedImage} 
          onClose={() => setCapturedImage(null)} 
          onSend={async (imageSrc, caption) => {
              setIsUploading(true);
              try {
                // For now, we just add it to stories
                await addStory(imageSrc);
                setCapturedImage(null);
                setCurrentView(ViewState.STORIES);
              } catch (error) {
                console.error("Failed to upload story", error);
                alert("Failed to upload story");
              } finally {
                setIsUploading(false);
              }
          }} 
        />
        {isUploading && (
          <div className="absolute inset-0 z-[100] bg-black/80 flex items-center justify-center">
            <div className="text-white flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-semibold">Uploading...</p>
            </div>
          </div>
        )}
      </>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case ViewState.MAP:
        return (
            <motion.div 
                key="map"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="h-full w-full bg-zinc-900 flex flex-col items-center justify-center text-zinc-400"
            >
                <div className="text-6xl mb-4">🌍</div>
                <h2 className="font-bold text-xl text-white">Snap Map</h2>
                <p className="opacity-60">Coming soon</p>
            </motion.div>
        );
      case ViewState.CHAT:
        return (
            <motion.div 
                key="chat"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="h-full w-full"
            >
                <ChatList onSelectChat={setActiveChat} />
            </motion.div>
        );
      case ViewState.CAMERA:
        return (
            <motion.div 
                key="camera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full w-full"
            >
                <CameraView onCapture={setCapturedImage} />
            </motion.div>
        );
      case ViewState.STORIES:
        return (
            <motion.div 
                key="stories"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
                className="h-full w-full"
            >
                <StoriesView />
            </motion.div>
        );
      case ViewState.SPOTLIGHT:
         return (
            <motion.div 
                key="spotlight"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.3 }}
                className="h-full w-full bg-black flex flex-col items-center justify-center text-white relative"
            >
                <img src="https://picsum.photos/500/900?grayscale" className="absolute w-full h-full object-cover opacity-50" alt="spotlight" />
                <div className="z-10 text-center">
                    <Play className="w-16 h-16 mx-auto mb-4" fill="white" />
                    <h2 className="font-bold text-2xl">Spotlight</h2>
                </div>
            </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`h-screen w-screen overflow-hidden flex flex-col bg-black text-white`}>
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
            {renderContent()}
        </AnimatePresence>
      </main>
      
      <BottomNav 
        currentView={currentView} 
        onChangeView={(view) => {
            setCurrentView(view);
            setActiveChat(null); // Reset detail view when changing tabs
        }}
      />
    </div>
  );
};

export default App;
