/**
 * Lapisan cache Firestore untuk mengurangi pembacaan berulang
 * dan menyediakan akses data yang teroptimalkan antar komponen.
 */

import { collection, getDocs, query, where, limit, QueryConstraint } from 'firebase/firestore';
import { db } from './firebase';

interface CacheEntry<T> {
  data: T[];
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

const cache = new Map<string, CacheEntry<any>>();

const DEFAULT_TTL = 5 * 60 * 1000; // 5 menit default cache

/**
 * Mengambil data dari Firestore dengan caching.
 * Data akan disimpan di cache selama `ttl` milidetik.
 */
export async function fetchWithCache<T>(
  collectionName: string,
  ttl: number = DEFAULT_TTL,
  constraints: QueryConstraint[] = [],
  forceRefresh: boolean = false
): Promise<T[]> {
  const cacheKey = `${collectionName}:${JSON.stringify(constraints)}`;

  if (!forceRefresh) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T[];
    }
  }

  const colRef = collection(db, collectionName);
  const q = constraints.length > 0 
    ? query(colRef, ...constraints, limit(1000)) 
    : query(colRef, limit(1000));

  const snapshot = await getDocs(q);
  const data: T[] = [];
  snapshot.forEach(doc => data.push(doc.data() as T));

  cache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl,
  });

  return data;
}

/**
 * Menghapus cache untuk koleksi tertentu.
 * Panggil setelah operasi write (create/update/delete).
 */
export function invalidateCache(collectionName: string) {
  const keysToDelete: string[] = [];
  
  cache.forEach((_, key) => {
    if (key.startsWith(collectionName)) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => cache.delete(key));
}

/**
 * Menghapus seluruh cache.
 */
export function clearAllCache() {
  cache.clear();
}
