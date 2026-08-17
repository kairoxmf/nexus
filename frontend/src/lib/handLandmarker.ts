import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

const WASM_PATHS = [
  `${import.meta.env.BASE_URL}mediapipe/wasm`,
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm",
];

const MODEL_PATHS = [
  `${import.meta.env.BASE_URL}models/hand_landmarker.task`,
  "https://huggingface.co/Leo-TX/mediapipe-hand/resolve/main/hand_landmarker.task",
  "https://hf-mirror.com/Leo-TX/mediapipe-hand/resolve/main/hand_landmarker.task",
  "https://cdn.jsdelivr.net/gh/sanderdesnaijer/mediapipe-model-mirrors@v1/hand_landmarker.task",
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
];

const DB_NAME = "nexus-hand-tracker";
const DB_STORE = "models";
const DB_KEY = "hand_landmarker.task";
const MIN_MODEL_BYTES = 1_000_000;
const FETCH_MS = 18_000;
const CREATE_MS = 12_000;

let landmarkerPromise: Promise<HandLandmarker> | null = null;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

function openModelDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readCachedModel(): Promise<Uint8Array | null> {
  try {
    const db = await openModelDb();
    const buf = await new Promise<ArrayBuffer | Uint8Array | null>((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readonly");
      const req = tx.objectStore(DB_STORE).get(DB_KEY);
      req.onsuccess = () => resolve((req.result as ArrayBuffer | Uint8Array | null) ?? null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    if (!buf) return null;
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    return bytes.byteLength >= MIN_MODEL_BYTES ? bytes : null;
  } catch {
    return null;
  }
}

async function writeCachedModel(bytes: Uint8Array): Promise<void> {
  try {
    const db = await openModelDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put(bytes, DB_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* cache is optional */
  }
}

async function fetchModelBytes(url: string): Promise<Uint8Array> {
  const res = await withTimeout(fetch(url, { cache: "force-cache" }), FETCH_MS, url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const buf = await res.arrayBuffer();
  if (buf.byteLength < MIN_MODEL_BYTES) throw new Error(`Model too small: ${url}`);
  return new Uint8Array(buf);
}

async function loadModelBytes(): Promise<Uint8Array> {
  const cached = await readCachedModel();
  if (cached) return cached;

  let lastError: unknown;
  for (const url of MODEL_PATHS) {
    try {
      const bytes = await fetchModelBytes(url);
      void writeCachedModel(bytes);
      return bytes;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Hand model download failed");
}

async function createFromWasm(wasmPath: string, model: Uint8Array, delegate: "CPU" | "GPU") {
  const vision = await withTimeout(
    FilesetResolver.forVisionTasks(wasmPath),
    CREATE_MS,
    `wasm ${wasmPath}`,
  );
  const copy = new Uint8Array(model.byteLength);
  copy.set(model);
  return withTimeout(
    HandLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetBuffer: copy, delegate },
      runningMode: "VIDEO",
      numHands: 1,
    }),
    CREATE_MS,
    `landmarker ${delegate}`,
  );
}

async function createLandmarker(): Promise<HandLandmarker> {
  const model = await loadModelBytes();
  let lastError: unknown;
  for (const wasm of WASM_PATHS) {
    for (const delegate of ["CPU", "GPU"] as const) {
      try {
        return await createFromWasm(wasm, model, delegate);
      } catch (err) {
        lastError = err;
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Hand landmarker init failed");
}

export function resetHandLandmarker(): void {
  landmarkerPromise = null;
}

export function getHandLandmarker(): Promise<HandLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = createLandmarker().catch((err) => {
      landmarkerPromise = null;
      throw err;
    });
  }
  return landmarkerPromise;
}
