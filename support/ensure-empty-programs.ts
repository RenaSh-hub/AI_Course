import { deleteAllPrograms, getAllProgramIds } from './delete-program.js';

export async function ensureNoPrograms(): Promise<void> {
  await deleteAllPrograms();
}

export async function hasApiCleanupConfig(): Promise<boolean> {
  return Boolean(process.env.DIDAXIS_API_TOKEN && process.env.DIDAXIS_URL);
}

export async function programCount(): Promise<number> {
  const ids = await getAllProgramIds();
  return ids.length;
}
