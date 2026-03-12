import { doc, setDoc, getDoc, collection, query, where, getDocs, onSnapshot, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { User } from '../types';

export const createUserProfile = async (user: any) => {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const newUser: User = {
      id: user.uid,
      name: user.displayName || 'Anonymous',
      email: user.email || '',
      avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      streak: 0,
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    await setDoc(userRef, newUser);
  } else {
    // Update last active
    await updateDoc(userRef, {
      lastActive: new Date().toISOString()
    });
  }
};

export const searchUsers = async (searchTerm: string): Promise<User[]> => {
  if (!searchTerm || !auth.currentUser) return [];
  
  const usersRef = collection(db, 'users');
  // Simple prefix search (for a real app, use Algolia or similar)
  const q = query(
    usersRef, 
    where('name', '>=', searchTerm),
    where('name', '<=', searchTerm + '\uf8ff')
  );
  
  const querySnapshot = await getDocs(q);
  const users: User[] = [];
  querySnapshot.forEach((doc) => {
    if (doc.id !== auth.currentUser?.uid) {
      users.push(doc.data() as User);
    }
  });
  return users;
};

export const addFriend = async (friendId: string) => {
  if (!auth.currentUser) return;
  const myId = auth.currentUser.uid;
  
  // Add to my friends list
  await setDoc(doc(db, `users/${myId}/friends/${friendId}`), {
    status: 'accepted',
    createdAt: new Date().toISOString()
  });
  
  // Add to their friends list
  await setDoc(doc(db, `users/${friendId}/friends/${myId}`), {
    status: 'accepted',
    createdAt: new Date().toISOString()
  });
};

export const getFriends = (callback: (friends: User[]) => void) => {
  if (!auth.currentUser) return () => {};
  const myId = auth.currentUser.uid;
  
  const friendsRef = collection(db, `users/${myId}/friends`);
  
  return onSnapshot(friendsRef, async (snapshot) => {
    const friendPromises = snapshot.docs.map(async (friendDoc) => {
      const userSnap = await getDoc(doc(db, 'users', friendDoc.id));
      return userSnap.data() as User;
    });
    
    const friends = await Promise.all(friendPromises);
    callback(friends.filter(f => f !== undefined));
  });
};
