export enum ViewState {
  MAP = 'MAP',
  CHAT = 'CHAT',
  CAMERA = 'CAMERA',
  STORIES = 'STORIES',
  SPOTLIGHT = 'SPOTLIGHT'
}

export interface User {
  id: string; // uid
  name: string;
  email: string;
  avatar: string;
  streak?: number;
  lastActive?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  type: 'text' | 'image' | 'snap';
  status: 'sent' | 'delivered' | 'read' | 'opened';
}

export interface ChatSession {
  id: string;
  participants: string[];
  user: User; // The other user in the chat
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
  isUnread: boolean;
}

export interface Story {
  id: string;
  userId: string;
  user?: User; // Populated client-side
  imageUrl: string;
  timestamp: string;
}
