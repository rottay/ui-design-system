/**
 * @fileoverview Upload shared utilities.
 * Normalizes internal file descriptor creation across all engines.
 */

'use client';

import type { UploadFile, UploadProps } from './Upload.types';
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
