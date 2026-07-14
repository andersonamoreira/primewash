import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOADS_DIR = path.resolve(process.env.UPLOADS_DIR ?? "./data/uploads");

function safeExtension(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  const allowed = [".jpg", ".jpeg", ".png", ".webp", ".heic"];
  return allowed.includes(ext) ? ext : ".jpg";
}

export async function saveUploadedFile(file: File, subDir: string) {
  const dir = path.join(UPLOADS_DIR, subDir);
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}${safeExtension(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return path.posix.join(subDir, filename);
}

export function resolveUploadPath(relativePath: string) {
  const resolved = path.resolve(UPLOADS_DIR, relativePath);
  if (!resolved.startsWith(UPLOADS_DIR)) {
    throw new Error("Caminho de arquivo inválido");
  }
  return resolved;
}

export async function readUploadedFile(relativePath: string) {
  return readFile(resolveUploadPath(relativePath));
}

export async function deleteUploadedFile(relativePath: string) {
  try {
    await unlink(resolveUploadPath(relativePath));
  } catch {
    // arquivo já pode não existir; ignora
  }
}
