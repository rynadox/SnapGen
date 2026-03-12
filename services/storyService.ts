import { collection, doc, setDoc, getDoc, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase';
import { Story, User } from '../types';

export const uploadImage = async (base64Image: string, path: string): Promise<string> => {
  const imageRef = ref(storage, path);
  await uploadString(imageRef, base64Image, 'data_url');
  return await getDownloadURL(imageRef);
};

export const addStory = async (base64Image: string) => {
  if (!auth.currentUser) return;
  const myId = auth.currentUser.uid;
  
  try {
    const storyId = Date.now().toString();
    const path = `stories/${myId}/${storyId}.jpg`;
    const imageUrl = await uploadImage(base64Image, path);
    
    const storyRef = doc(collection(db, 'stories'));
    await setDoc(storyRef, {
      userId: myId,
      imageUrl,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error adding story:", error);
    throw error;
  }
};

export const subscribeToStories = (callback: (stories: Story[]) => void) => {
  if (!auth.currentUser) return () => {};
  
  // In a real app, we'd only query stories from friends within the last 24h.
  // For simplicity, we just get recent stories.
  const q = query(collection(db, 'stories'), orderBy('timestamp', 'desc'));
  
  return onSnapshot(q, async (snapshot) => {
    const storyPromises = snapshot.docs.map(async (storyDoc) => {
      const data = storyDoc.data();
      
      let user: User | undefined;
      const userSnap = await getDoc(doc(db, 'users', data.userId));
      if (userSnap.exists()) {
        user = userSnap.data() as User;
      }
      
      return {
        id: storyDoc.id,
        userId: data.userId,
        user,
        imageUrl: data.imageUrl,
        timestamp: data.timestamp
      } as Story;
    });
    
    const stories = await Promise.all(storyPromises);
    callback(stories);
  });
};
