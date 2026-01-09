import { account, databases } from './appwrite';
// @ts-ignore
import Appwrite from 'appwrite';

const AW: any = Appwrite;

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE || '';
const PROFILES_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILES || '';
const POSTS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_POSTS || '';
const COMMENTS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_COMMENTS || '';

export async function signUp(name: string, email: string, password: string) {
  try {
    // Try common account create signature variations
    if (typeof account.create === 'function') {
      // Some SDKs use account.create(userId, email, password, name)
      try {
        // @ts-ignore
        return await account.create(AW.ID.unique(), email, password, name);
      } catch (e) {
        // fallback to other signature
      }
    }

    if (typeof account.createEmail === 'function') {
      // fallback older SDKs
      // @ts-ignore
      return await account.createEmail(email, password, name);
    }

    throw new Error('Account create not supported by SDK');
  } catch (err) {
    throw err;
  }
}

export async function signIn(email: string, password: string) {
  try {
    if (typeof account.createEmailSession === 'function') {
      // @ts-ignore
      return await account.createEmailSession(email, password);
    }
    if (typeof account.createSession === 'function') {
      // @ts-ignore
      return await account.createSession(email, password);
    }
    throw new Error('Account session creation not supported by SDK');
  } catch (err) {
    throw err;
  }
}

export async function createProfile(data: Record<string, any>) {
  try {
    const id = AW?.ID?.unique ? AW.ID.unique() : 'unique()';
    // @ts-ignore
    return await databases.createDocument(DB_ID, PROFILES_COLLECTION, id, data);
  } catch (err) {
    throw err;
  }
}

export async function getCurrentUser() {
  try {
    // @ts-ignore
    return await account.get();
  } catch (err) {
    return null;
  }
}

export async function getProfile(profileId: string) {
  try {
    // @ts-ignore
    return await databases.getDocument(DB_ID, PROFILES_COLLECTION, profileId);
  } catch (err) {
    throw err;
  }
}

export async function getProfileByUserId(userId: string) {
  try {
    // @ts-ignore
    const res = await databases.listDocuments(DB_ID, PROFILES_COLLECTION, ["userId=" + JSON.stringify(userId)]);
    return res?.documents?.[0] || null;
  } catch (err) {
    return null;
  }
}

export async function updateProfile(profileId: string, data: Record<string, any>) {
  try {
    // @ts-ignore
    return await databases.updateDocument(DB_ID, PROFILES_COLLECTION, profileId, data);
  } catch (err) {
    throw err;
  }
}

export async function listDevelopers() {
  try {
    // @ts-ignore
    const res = await databases.listDocuments(DB_ID, PROFILES_COLLECTION);
    return res?.documents || [];
  } catch (err) {
    // If collection not configured, return empty
    return [];
  }
}

export async function createPost(data: Record<string, any>) {
  try {
    const id = AW?.ID?.unique ? AW.ID.unique() : 'unique()';
    // @ts-ignore
    return await databases.createDocument(DB_ID, POSTS_COLLECTION, id, data);
  } catch (err) {
    throw err;
  }
}

export async function listPosts() {
  try {
    // @ts-ignore
    const res = await databases.listDocuments(DB_ID, POSTS_COLLECTION);
    return res?.documents || [];
  } catch (err) {
    return [];
  }
}

export async function likePost(postId: string) {
  try {
    // @ts-ignore
    const post = await databases.getDocument(DB_ID, POSTS_COLLECTION, postId);
    const newLikes = (post.likes || 0) + 1;
    // @ts-ignore
    return await databases.updateDocument(DB_ID, POSTS_COLLECTION, postId, { ...post, likes: newLikes });
  } catch (err) {
    throw err;
  }
}

export async function dislikePost(postId: string) {
  try {
    // @ts-ignore
    const post = await databases.getDocument(DB_ID, POSTS_COLLECTION, postId);
    const newDislikes = (post.dislikes || 0) + 1;
    // @ts-ignore
    return await databases.updateDocument(DB_ID, POSTS_COLLECTION, postId, { ...post, dislikes: newDislikes });
  } catch (err) {
    throw err;
  }
}

export async function createComment(postId: string, data: Record<string, any>) {
  try {
    const id = AW?.ID?.unique ? AW.ID.unique() : 'unique()';
    // @ts-ignore
    return await databases.createDocument(DB_ID, COMMENTS_COLLECTION, id, { postId, ...data });
  } catch (err) {
    throw err;
  }
}

export async function listComments(postId: string) {
  try {
    // @ts-ignore
    const res = await databases.listDocuments(DB_ID, COMMENTS_COLLECTION, ["postId=" + JSON.stringify(postId)]);
    return res?.documents || [];
  } catch (err) {
    return [];
  }
}

export async function deletePost(postId: string) {
  try {
    // @ts-ignore
    return await databases.deleteDocument(DB_ID, POSTS_COLLECTION, postId);
  } catch (err) {
    throw err;
  }
}
