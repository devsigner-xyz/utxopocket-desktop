import { TxInput, TxOutput, UTXO } from '../types/types';
import { createAvatar } from '@dicebear/core';
import { shapes } from '@dicebear/collection';
import tinycolor from 'tinycolor2';

/**
 * Converts a hexadecimal color to RGBA format.
 * @param {string} hex - The hexadecimal color code.
 * @param {number} alpha - The alpha value.
 * @returns {string} The RGBA color string.
 */
export function hexToRgba(hex: string, alpha: number): string {
    let r = 0,
        g = 0,
        b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    }
    return `rgba(${r},${g},${b},${alpha})`;
}

export function getUtxoKey(utxo: UTXO): string {
    return `${utxo.txid}:${utxo.vout}`;
}

export function hexToRgb(hex: string): {
    r: number;
    g: number;
    b: number;
} {
    hex = hex.replace(/^#/, '');
    let bigint = parseInt(hex, 16);
    let r, g, b;

    if (hex.length === 6) {
        r = (bigint >> 16) & 255;
        g = (bigint >> 8) & 255;
        b = bigint & 255;
    } else if (hex.length === 3) {
        r = ((bigint >> 8) & 0xf) * 17;
        g = ((bigint >> 4) & 0xf) * 17;
        b = (bigint & 0xf) * 17;
    } else {
        return { r: 0, g: 0, b: 0 };
    }

    return { r, g, b };
}

/**
 * Formats a Bitcoin address for display.
 * @param {string} address - The Bitcoin address.
 * @returns {string} The formatted address.
 */
export function formatAddress(address: string): string {
    if (!address || address.length < 8 || address === 'Unknown') {
        return 'Invalid address';
    }
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

/**
 * Formats a Unix timestamp into a human-readable date and/or time.
 * @param {number} timestamp - The Unix timestamp.
 * @param {'date' | 'time' | 'both'} [format='both'] - Specifies whether to show only the date, only the time, or both.
 * @returns {string} The formatted date/time string.
 */
export function formatDate(
    timestamp: number,
    format: 'date' | 'time' | 'both' = 'both',
): string {
    const date = new Date(timestamp);

    if (format === 'date') {
        return date.toLocaleDateString();
    }

    if (format === 'time') {
        return date.toLocaleTimeString();
    }

    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

export function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp * 1000);

    const year = date.getFullYear();

    const month = ('0' + (date.getMonth() + 1)).slice(-2);

    const day = ('0' + date.getDate()).slice(-2);

    const hours = ('0' + date.getHours()).slice(-2);

    const minutes = ('0' + date.getMinutes()).slice(-2);

    const seconds = ('0' + date.getSeconds()).slice(-2);

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Calculates the transaction fee from the inputs and outputs.
 * @param {TxInput[]} inputs - The transaction inputs.
 * @param {TxOutput[]} outputs - The transaction outputs.
 * @returns {number} The transaction fee in satoshis.
 */
export function calculateTransactionFee(
    inputs: TxInput[],
    outputs: TxOutput[],
): number {
    const totalInputValue = inputs.reduce(
        (sum, input) => sum + (input.value ?? 0),
        0,
    );
    const totalOutputValue = outputs.reduce(
        (sum, output) => sum + output.value,
        0,
    );

    return totalInputValue - totalOutputValue;
}

/**
 * Copies a text to the clipboard.
 * @param {string} text - The text to copy.
 * @returns {Promise<void>} A promise that resolves when the text is copied.
 */
export function copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard
        .writeText(text)
        .then(() => {
            console.log('Text copied to clipboard');
        })
        .catch((err) => {
            console.error('Failed to copy text: ', err);
        });
}

/**
 * Generates an avatar image URI based on a name.
 * @param {string} name - The name used as the seed for generating the avatar.
 * @returns {string} The data URI of the generated avatar.
 */
export function generateAvatar(name: string): string {
    const seed = `${name}`;
    const avatar = createAvatar(shapes, {
        seed,
        size: 64,
    });
    return avatar.toDataUri();
}

export function adjustColorOpacity(hexColor: string, alpha: number) {
    return tinycolor(hexColor).setAlpha(alpha).toRgbString();
}

export function generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9);
}


export function throttle(func: (...args: any[]) => void, delay: number) {
    let lastCall = 0;
    return function (...args: any[]) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            func(...args);
        }
    };
}
