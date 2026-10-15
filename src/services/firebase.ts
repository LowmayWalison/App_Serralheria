import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  collection, 
  query, 
  where 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { QuoteData } from '../types';

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onSignedOut?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onSignedOut) onSignedOut();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/spreadsheets');
    provider.addScope('https://www.googleapis.com/auth/documents');
    provider.addScope('https://www.googleapis.com/auth/drive.file');
    provider.addScope('https://www.googleapis.com/auth/gmail.send');
    provider.addScope('https://www.googleapis.com/auth/calendar.events');
    provider.addScope('https://www.googleapis.com/auth/tasks');
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }
    return { user: result.user, accessToken: cachedAccessToken || '' };
  } catch (err) {
    console.error('Google Sign-in error:', err);
    throw err;
  }
};

export const getAccessToken = () => cachedAccessToken;

export const logout = async () => {
  cachedAccessToken = null;
  await signOut(auth);
};

// Test Firestore Connection
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection check: client is offline or permissions pending.');
    }
  }
}

// Firestore Database Operations for Quotes
export async function saveQuoteToCloud(quote: QuoteData, userId: string): Promise<void> {
  const path = `quotes/${quote.id}`;
  try {
    await setDoc(doc(db, 'quotes', quote.id), {
      userId,
      clientName: quote.projectClient || 'Cliente sem nome',
      projectName: quote.observations || 'Orçamento Serralheria',
      phone: quote.clientPhone || '',
      total: Number(quote.validityDays) || 0, // safe number
      profitMargin: quote.profitMargin || 0,
      quotePayload: JSON.stringify(quote),
      createdAt: quote.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchUserQuotesFromCloud(userId: string): Promise<QuoteData[]> {
  const path = 'quotes';
  try {
    const q = query(collection(db, 'quotes'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const results: QuoteData[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      if (data.quotePayload) {
        try {
          const parsed = JSON.parse(data.quotePayload) as QuoteData;
          results.push(parsed);
        } catch (e) {
          console.error('Failed to parse quote from firestore', e);
        }
      }
    });
    return results;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function deleteQuoteFromCloud(quoteId: string): Promise<void> {
  const path = `quotes/${quoteId}`;
  try {
    await deleteDoc(doc(db, 'quotes', quoteId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
