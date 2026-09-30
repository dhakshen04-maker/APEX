export type Memory = {
  id: string;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "ultron.memory.v1";

function read(): Memory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Memory[]) : [];
  } catch {
    return [];
  }
}

function write(items: Memory[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function listMemories(): Memory[] {
  return read().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function remember(key: string, value: string): Memory {
  const now = new Date().toISOString();
  const items = read();
  const existing = items.find(item => item.key === key);
  const memory: Memory = existing
    ? { ...existing, value, updatedAt: now }
    : { id: crypto.randomUUID(), key, value, createdAt: now, updatedAt: now };
  write(existing ? items.map(item => item.id === existing.id ? memory : item) : [...items, memory]);
  return memory;
}

export function forget(id: string): void {
  write(read().filter(item => item.id !== id));
}

export function clearMemories(): void {
  localStorage.removeItem(STORAGE_KEY);
}
