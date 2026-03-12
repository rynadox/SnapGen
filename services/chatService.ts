import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, onSnapshot, serverTimestamp, addDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { ChatSession, Message, User } from '../types';

export const getOrCreateChat = async (friendId: string): Promise<string> => {
  if (!auth.currentUser) throw new Error("Not authenticated");
  const myId = auth.currentUser.uid;
  
  // Check if chat exists
  const chatsRef = collection(db, 'chats');
  const q = query(chatsRef, where('participants', 'array-contains', myId));
  const querySnapshot = await getDocs(q);
  
  let existingChatId = null;
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.participants.includes(friendId)) {
      existingChatId = doc.id;
    }
  });
  
  if (existingChatId) return existingChatId;
  
  // Create new chat
  const newChatRef = doc(collection(db, 'chats'));
  await setDoc(newChatRef, {
    participants: [myId, friendId],
    lastMessage: 'Say hi!',
    lastMessageTime: new Date().toISOString(),
    isUnread: false
  });
  
  return newChatRef.id;
};

export const subscribeToChats = (callback: (chats: ChatSession[]) => void) => {
  if (!auth.currentUser) return () => {};
  const myId = auth.currentUser.uid;
  
  const q = query(collection(db, 'chats'), where('participants', 'array-contains', myId), orderBy('lastMessageTime', 'desc'));
  
  return onSnapshot(q, async (snapshot) => {
    const chatPromises = snapshot.docs.map(async (chatDoc) => {
      const data = chatDoc.data();
      const friendId = data.participants.find((id: string) => id !== myId);
      
      let friendUser: User | null = null;
      if (friendId) {
        const userSnap = await getDoc(doc(db, 'users', friendId));
        if (userSnap.exists()) {
          friendUser = userSnap.data() as User;
        }
      }
      
      if (!friendUser) return null;
      
      return {
        id: chatDoc.id,
        participants: data.participants,
        user: friendUser,
        messages: [], // We fetch messages separately
        lastMessage: data.lastMessage || '',
        lastMessageTime: data.lastMessageTime,
        isUnread: data.isUnread || false
      } as ChatSession;
    });
    
    const chats = await Promise.all(chatPromises);
    callback(chats.filter(c => c !== null) as ChatSession[]);
  });
};

export const subscribeToMessages = (chatId: string, callback: (messages: Message[]) => void) => {
  if (!auth.currentUser) return () => {};
  const myId = auth.currentUser.uid;
  
  const q = query(collection(db, `chats/${chatId}/messages`), orderBy('timestamp', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        senderId: data.senderId,
        text: data.text,
        timestamp: data.timestamp,
        isMe: data.senderId === myId,
        type: data.type,
        status: data.status
      } as Message;
    });
    callback(messages);
  });
};

export const sendMessage = async (chatId: string, text: string, type: 'text' | 'image' | 'snap' = 'text') => {
  if (!auth.currentUser) return;
  const myId = auth.currentUser.uid;
  
  const messageRef = doc(collection(db, `chats/${chatId}/messages`));
  const timestamp = new Date().toISOString();
  
  await setDoc(messageRef, {
    senderId: myId,
    text,
    timestamp,
    type,
    status: 'sent'
  });
  
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: text.substring(0, 30) + (text.length > 30 ? '...' : ''),
    lastMessageTime: timestamp,
    isUnread: true
  });
};
