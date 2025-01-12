import { Injectable } from '@nestjs/common';
import { Buffer } from 'buffer';

export abstract class UtilsService {
  /**
   * Inserts a derivation path into a descriptor.
   * @param descriptor - The descriptor string.
   * @param path - The derivation path to insert.
   * @returns The descriptor with the inserted derivation path.
   */
  static insertDerivationPath(descriptor: string, path: string): string {
    return descriptor.replace(/(\([^\(\)]+)\)$/, `$1${path})`);
  }

  /**
   * Reads a VarInt from a buffer starting at a given offset.
   * @param buffer - The buffer containing the VarInt.
   * @param offset - The offset to start reading from.
   * @returns An object with the number read and its size in bytes.
   */
  static readVarInt(buffer: Buffer, offset: number): { number: number; size: number } {
    const firstByte = buffer[offset];
    let number = 0;
    let size = 0;

    if (firstByte < 0xfd) {
      number = firstByte;
      size = 1;
    } else if (firstByte === 0xfd) {
      number = buffer.readUInt16LE(offset + 1);
      size = 3;
    } else if (firstByte === 0xfe) {
      number = buffer.readUInt32LE(offset + 1);
      size = 5;
    } else {
      number = Number(buffer.readBigUInt64LE(offset + 1));
      size = 9;
    }

    return { number, size };
  }
}
