/**
 * @fileoverview Upload shared utilities.
 * Normalizes internal file descriptor creation across all engines.
 */

'use client';

import type { UploadFile, UploadProps } from '../../contracts';
export function createUploadFile(
  file: File,
  originalFile: File = file
): UploadFile {
  return {
    uid: `${Date.now()}-${Math.random()}`,
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

    const uploadFile = createUploadFile(normalizedFile, file) as UploadFile<T>;
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
 */
export function removeUploadFile<T = unknown>(
  fileList: UploadFile<T>[],
  fileToRemove: UploadFile<T>
): UploadFile<T>[] {
  return fileList.filter((file) => file.uid !== fileToRemove.uid);
}
