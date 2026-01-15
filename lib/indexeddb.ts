'use client';
/* eslint-disable  @typescript-eslint/no-explicit-any */

const DB_NAME = 'LangoApp';
const DB_VERSION = 1;
const QUIZ_STORE = 'quizzes';
const PROGRESS_STORE = 'quizProgress';
const LESSONS_STORE = 'lessons';
const VOCABS_STORE = 'vocabularies';
const INDEX_STORE = 'current_vocab_index';
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

       // Store for lessons
      if (!db.objectStoreNames.contains(LESSONS_STORE)) {
        const lessonStore = db.createObjectStore(LESSONS_STORE, { keyPath: 'slug' });
        lessonStore.createIndex('levelId', 'levelId', { unique: false });
        lessonStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // Store for vocabularies
      if (!db.objectStoreNames.contains(VOCABS_STORE)) {
        const vocabStore = db.createObjectStore(VOCABS_STORE, { keyPath: 'id' });
        vocabStore.createIndex('term', 'term', { unique: false });
        vocabStore.createIndex('language', 'language', { unique: false });
        vocabStore.createIndex('cachedAt', 'cachedAt', { unique: false });
      }

      // Store for current vocabulary index
      if (!db.objectStoreNames.contains(INDEX_STORE)) {
        db.createObjectStore(INDEX_STORE, { keyPath: 'id' });
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
 



// functions for lessons:

// Save lesson to IndexedDB
export const saveLessonToDB = async (lesson: any) => {
  const db = await initDB();
  const tx = db.transaction(LESSONS_STORE, 'readwrite');
  const store = tx.objectStore(LESSONS_STORE);
  
  const lessonWithTimestamp = {
    ...lesson,
    cachedAt: new Date().toISOString(),
  };
  
  store.put(lessonWithTimestamp);
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

// Get lesson from IndexedDB by slug
export const getLessonFromDB = async (slug: string) => {
  const db = await initDB();
  const tx = db.transaction(LESSONS_STORE, 'readonly');
  const store = tx.objectStore(LESSONS_STORE);
  
  return new Promise((resolve, reject) => {
    const request = store.get(slug);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

// Get all lessons from IndexedDB
export const getAllLessonsFromDB = async () => {
  const db = await initDB();
  const tx = db.transaction(LESSONS_STORE, 'readonly');
  const store = tx.objectStore(LESSONS_STORE);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Delete lesson from IndexedDB
export const deleteLessonFromDB = async (slug: string) => {
  const db = await initDB();
  const tx = db.transaction(LESSONS_STORE, 'readwrite');
  const store = tx.objectStore(LESSONS_STORE);
  
  store.delete(slug);
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

// Clear all lessons from IndexedDB
export const clearAllLessons = async () => {
  const db = await initDB();
  const tx = db.transaction(LESSONS_STORE, 'readwrite');
  tx.objectStore(LESSONS_STORE).clear();
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};



// functions for vocabularies:

// Save vocabularies to IndexedDB
export const saveVocabsToDB = async (vocabs: any[]) => {
  const db = await initDB();
  const tx = db.transaction(VOCABS_STORE, 'readwrite');
  const store = tx.objectStore(VOCABS_STORE);
  
  const vocabsWithTimestamp = vocabs.map(vocab => ({
    ...vocab,
    cachedAt: new Date().toISOString(),
  }));
  
  vocabsWithTimestamp.forEach(vocab => {
    store.put(vocab);
  });
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

// Save single vocabulary to IndexedDB
export const saveVocabToDB = async (vocab: any) => {
  const db = await initDB();
  const tx = db.transaction(VOCABS_STORE, 'readwrite');
  const store = tx.objectStore(VOCABS_STORE);
  
  const vocabWithTimestamp = {
    ...vocab,
    cachedAt: new Date().toISOString(),
  };
  
  store.put(vocabWithTimestamp);
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

// Get all vocabularies from IndexedDB
export const getAllVocabsFromDB = async () => {
  const db = await initDB();
  const tx = db.transaction(VOCABS_STORE, 'readonly');
  const store = tx.objectStore(VOCABS_STORE);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Get vocabulary by term
export const getVocabByTermFromDB = async (term: string) => {
  const db = await initDB();
  const tx = db.transaction(VOCABS_STORE, 'readonly');
  const store = tx.objectStore(VOCABS_STORE);
  const index = store.index('term');
  
  return new Promise((resolve, reject) => {
    const request = index.getAll(term);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Get vocabularies by language
export const getVocabsByLanguageFromDB = async (language: string) => {
  const db = await initDB();
  const tx = db.transaction(VOCABS_STORE, 'readonly');
  const store = tx.objectStore(VOCABS_STORE);
  const index = store.index('language');
  
  return new Promise((resolve, reject) => {
    const request = index.getAll(language);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Delete vocabulary by ID
export const deleteVocabFromDB = async (id: number) => {
  const db = await initDB();
  const tx = db.transaction(VOCABS_STORE, 'readwrite');
  const store = tx.objectStore(VOCABS_STORE);
  
  store.delete(id);
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

// Clear all vocabularies from IndexedDB
export const clearAllVocabs = async () => {
  const db = await initDB();
  const tx = db.transaction(VOCABS_STORE, 'readwrite');
  tx.objectStore(VOCABS_STORE).clear();
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};



// Save CurrentIndex to IndexedDB
export const saveCurrentIndexToDB = async (index: number) => {
  const db = await initDB();
  const tx = db.transaction(INDEX_STORE, 'readwrite');
  const store = tx.objectStore(INDEX_STORE);
  
  store.put({ id: 'current', index });
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

// Get current vocabulary index from IndexedDB
export const getCurrentIndexFromDB = async (): Promise<number | null> => {
  const db = await initDB();
  const tx = db.transaction(INDEX_STORE, 'readonly');
  const store = tx.objectStore(INDEX_STORE);
  
  return new Promise((resolve, reject) => {
    const request = store.get('current');
    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.index : null);
    };
    request.onerror = () => reject(request.error);
  });
};



// Update clearOldData
export const clearOldData = async () => {
  const db = await initDB();
  const tx = db.transaction([QUIZ_STORE, PROGRESS_STORE, LESSONS_STORE, VOCABS_STORE], 'readwrite');
  tx.objectStore(QUIZ_STORE).clear();
  tx.objectStore(PROGRESS_STORE).clear();
  tx.objectStore(LESSONS_STORE).clear();
  tx.objectStore(VOCABS_STORE).clear();
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};
