/**
 * Utility để lưu và lấy audio Blob từ IndexedDB
 * IndexedDB có thể lưu Blob trực tiếp, không cần serialize
 */

const DB_NAME = "ToeicExamAudioDB";
const STORE_NAME = "audioBlobs";
const DB_VERSION = 1;

/**
 * Mở database IndexedDB
 */
export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Lưu audio Blob vào IndexedDB
 * @param {string} key - Key để lưu (thường là testQuestionId hoặc testQuestionId_subQuestionIndex)
 * @param {Blob} blob - Audio Blob cần lưu
 */
export async function saveAudioBlob(key, blob) {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.put(blob, key);
      request.onsuccess = () => {
        console.log(`[AudioStorage] Saved audio blob for key: ${key}`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`[AudioStorage] Error saving audio blob for key ${key}:`, error);
    throw error;
  }
}

/**
 * Lấy audio Blob từ IndexedDB
 * @param {string} key - Key để lấy
 * @returns {Promise<Blob|null>} - Audio Blob hoặc null nếu không tìm thấy
 */
export async function getAudioBlob(key) {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const blob = request.result || null;
        if (blob) {
          console.log(`[AudioStorage] Retrieved audio blob for key: ${key}`);
        }
        resolve(blob);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`[AudioStorage] Error getting audio blob for key ${key}:`, error);
    return null;
  }
}

/**
 * Xóa audio Blob khỏi IndexedDB
 * @param {string} key - Key để xóa
 */
export async function deleteAudioBlob(key) {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => {
        console.log(`[AudioStorage] Deleted audio blob for key: ${key}`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`[AudioStorage] Error deleting audio blob for key ${key}:`, error);
    throw error;
  }
}

/**
 * Xóa tất cả audio Blob (dọn dẹp sau khi submit thành công)
 */
export async function clearAllAudioBlobs() {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => {
        console.log(`[AudioStorage] Cleared all audio blobs`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`[AudioStorage] Error clearing audio blobs:`, error);
    throw error;
  }
}

/**
 * Lấy tất cả keys trong IndexedDB (để debug)
 */
export async function getAllAudioKeys() {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.getAllKeys();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`[AudioStorage] Error getting all keys:`, error);
    return [];
  }
}

