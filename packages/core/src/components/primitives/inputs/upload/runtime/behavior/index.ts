/**
 * @fileoverview Upload shared utilities.
 * Normalizes internal file descriptor creation across all engines.
 */

'use client';

import type { UploadFile, UploadProps } from '../../contracts';

/**
 * The allocator state, owned by the runtime rather than by one module
 * instance: `fileList` / `defaultFileList` restore descriptors created in an
 * earlier session, and a bundle that loads two copies of this module must not
 * hand the same uid to two different rows.
 *
 * It is a counter plus a reservation set, not a die roll: an upload descriptor
 * is a React list key, and a key that differs between two renders of the same
 * list remounts the row it identifies.
 */
interface UploadUidAllocator {
  sequence: number;
  reserved: Set<string>;
}

const UPLOAD_UID_ALLOCATOR_KEY = Symbol.for('rottay.design-system.upload.uids');

function getAllocator(): UploadUidAllocator {
  const host = globalThis as Record<symbol, unknown>;
  const existing = host[UPLOAD_UID_ALLOCATOR_KEY] as UploadUidAllocator | undefined;
  if (existing) return existing;
  const created: UploadUidAllocator = { sequence: 0, reserved: new Set<string>() };
  host[UPLOAD_UID_ALLOCATOR_KEY] = created;
  return created;
}

/**
 * Reserves the uids of a supplied or restored file list, so a later
 * {@link createUploadFile} can never reissue one of them.
 */
export function reserveUploadUids<T = unknown>(
  fileList: ReadonlyArray<UploadFile<T>> | null | undefined
): void {
  if (!fileList) return;
  const { reserved } = getAllocator();
  for (const file of fileList) {
    if (file && typeof file.uid === 'string' && file.uid) reserved.add(file.uid);
  }
}

/**
 * Creates the internal descriptor for a newly accepted file.
 *
 * @param existingFileList - The list the descriptor joins, whose uids are
 * reserved first so a restored row keeps its own identity.
 */
export function createUploadFile<T = unknown>(
  file: File,
  originalFile: File = file,
  existingFileList?: ReadonlyArray<UploadFile<T>> | null
): UploadFile {
  reserveUploadUids(existingFileList);
  const allocator = getAllocator();
  let uid: string;
  do {
    allocator.sequence += 1;
    uid = `upload-${allocator.sequence}`;
  } while (allocator.reserved.has(uid));
  allocator.reserved.add(uid);
  return {
    uid,
    name: file.name,
    status: 'done',
    size: file.size,
    type: file.type,
    originFileObj: originalFile,
  };
}

/**
 * Does a file satisfy one `accept` clause? The three grammars the HTML
 * attribute defines: an extension (`.png`), a wildcard type (`image/*`) and an
 * exact MIME type (`image/png`).
 */
function matchesAcceptClause(file: File, clause: string): boolean {
  const rule = clause.trim().toLowerCase();
  if (!rule) return false;
  if (rule.startsWith('.')) return file.name.toLowerCase().endsWith(rule);
  const type = (file.type || '').toLowerCase();
  if (rule.endsWith('/*')) return type.startsWith(`${rule.slice(0, -1)}`);
  return type === rule;
}

/**
 * Applies the declared `accept` / `multiple` constraints to a DROPPED batch.
 *
 * The native `<input type="file">` enforces both for the picker path, but a
 * drop never passes through it: a dropzone declaring `accept="image/*"` used to
 * ingest a dropped executable, and `multiple={false}` used to ingest the whole
 * batch. Selection and drop must agree before `beforeUpload`/`maxCount` run.
 */
export function filterDroppedFiles(
  files: File[],
  accept: string | undefined,
  multiple: boolean | undefined
): File[] {
  const clauses = accept ? accept.split(',').map((c) => c.trim()).filter(Boolean) : [];
  const allowed = clauses.length === 0
    ? files
    : files.filter((file) => clauses.some((clause) => matchesAcceptClause(file, clause)));
  return multiple === false ? allowed.slice(0, 1) : allowed;
}

/**
 * Resuelve los archivos aceptados respetando:
 * - `maxCount` sobre la lista que va creciendo en esta misma interacción
 * - `beforeUpload` síncrono o asíncrono
 * - la variante de `beforeUpload` que puede devolver un `File` transformado
 *
 * Antes cada engine comparaba contra la lista vieja (`actualFileList`) y eso
 * dejaba pasar más archivos de los permitidos cuando el usuario seleccionaba
 * varios en un solo evento.
 */
export async function resolveAcceptedUploadFiles<T = unknown>(
  existingFileList: UploadFile<T>[],
  incomingFiles: File[],
  maxCount: UploadProps<T>['maxCount'],
  beforeUpload: UploadProps<T>['beforeUpload']
): Promise<{
  nextFileList: UploadFile<T>[];
  acceptedFiles: UploadFile<T>[];
}> {
  reserveUploadUids(existingFileList);

  let nextFileList = [...existingFileList];
  const acceptedFiles: UploadFile<T>[] = [];

  for (const file of incomingFiles) {
    if (maxCount && nextFileList.length >= maxCount) {
      break;
    }

    let normalizedFile = file;

    if (beforeUpload) {
      const result = await beforeUpload(file, incomingFiles);

      if (result === false) {
        continue;
      }

      if (result instanceof File) {
        normalizedFile = result;
      }
    }

    const uploadFile = createUploadFile(normalizedFile, file, nextFileList) as UploadFile<T>;
    nextFileList = [...nextFileList, uploadFile];
    acceptedFiles.push(uploadFile);
  }

  return {
    nextFileList,
    acceptedFiles,
  };
}

/**
 * Mantiene la eliminación de archivos consistente entre engines y centraliza
 * la comparación por `uid`, que es la identidad real del Upload interno.
 *
 * Elimina EXACTAMENTE UN descriptor: el mismo objeto si está en la lista, y si
 * no, el primero que comparta `uid`. Borrar todas las coincidencias hacía que
 * un archivo restaurado desapareciera junto con el nuevo.
 */
export function removeUploadFile<T = unknown>(
  fileList: UploadFile<T>[],
  fileToRemove: UploadFile<T>
): UploadFile<T>[] {
  const identityIndex = fileList.indexOf(fileToRemove);
  const index =
    identityIndex === -1
      ? fileList.findIndex((file) => file.uid === fileToRemove.uid)
      : identityIndex;
  if (index === -1) return [...fileList];
  return [...fileList.slice(0, index), ...fileList.slice(index + 1)];
}
