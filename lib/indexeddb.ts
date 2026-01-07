'use client';
/* eslint-disable  @typescript-eslint/no-explicit-any */

const DB_NAME = 'LangoApp';
const DB_VERSION = 1;
const QUIZ_STORE = 'quizzes';
const PROGRESS_STORE = 'quizProgress';

interface Quiz {
  id: string | number;
  level: string;
  type: string;
  [key: string]: any;
}

export const initDB = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Store for quiz questions
      if (!db.objectStoreNames.contains(QUIZ_STORE)) {
        const quizStore = db.createObjectStore(QUIZ_STORE, { keyPath: 'id' });
        quizStore.createIndex('level', 'level', { unique: false });
        quizStore.createIndex('type', 'type', { unique: false });
      }
      
      // Store for quiz progress
      if (!db.objectStoreNames.contains(PROGRESS_STORE)) {
        db.createObjectStore(PROGRESS_STORE, { keyPath: 'id' });
      }
    };
  });
};

// Save quizzes
export const saveQuizzesToDB = async (quizzes: Quiz[]) => {
  const db = await initDB();
  const tx = db.transaction(QUIZ_STORE, 'readwrite');
  const store = tx.objectStore(QUIZ_STORE);
  
  quizzes.forEach(quiz => {
    store.put(quiz);
  });
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

// Get quizzes from DB
export const getQuizzesFromDB = async (level?: string, type?: string) => {
  const db = await initDB();
  const tx = db.transaction(QUIZ_STORE, 'readonly');
  const store = tx.objectStore(QUIZ_STORE);
  
  return new Promise((resolve, reject) => {
    let request: IDBRequest;
    
    if (level && type) {
      request = store.getAll();
      request.onsuccess = () => {
        const filtered = request.result.filter(
          (q: Quiz) => q.level === level && q.type === type
        );
        resolve(filtered);
      };
    } else {
      request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    }
    
    request.onerror = () => reject(request.error);
  });
};

// Save quiz progress
export const saveProgress = async (questionId: number, answers: any, isCorrect: boolean) => {
  const db = await initDB();
  const tx = db.transaction(PROGRESS_STORE, 'readwrite');
  const store = tx.objectStore(PROGRESS_STORE);
  
  const progress = {
    id: questionId,
    answers,
    isCorrect,
    timestamp: new Date().toISOString(),
  };
  
  store.put(progress);
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

// Get progress
export const getProgress = async (questionId?: number) => {
  const db = await initDB();
  const tx = db.transaction(PROGRESS_STORE, 'readonly');
  const store = tx.objectStore(PROGRESS_STORE);
  
  return new Promise((resolve, reject) => {
    const request = questionId 
      ? store.get(questionId)
      : store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getLatestProgress = async () => {
  const db = await initDB();
  const tx = db.transaction(PROGRESS_STORE, 'readonly');
  const store = tx.objectStore(PROGRESS_STORE);

  return new Promise<{id: number; data: any} | null>((resolve, reject) => {
    const request = store.openCursor(null, 'prev'); // reverse order

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        resolve(null);
        return;
      }

      resolve({
        id: cursor.key as number,
        data: cursor.value
      });
    };
    request.onerror = () => reject(request.error);
  });
};


// Clear old data
export const clearOldData = async () => {
  const db = await initDB();
  const tx = db.transaction([QUIZ_STORE, PROGRESS_STORE], 'readwrite');
  tx.objectStore(QUIZ_STORE).clear();
  tx.objectStore(PROGRESS_STORE).clear();
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};
