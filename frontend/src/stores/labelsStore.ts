import { defineStore } from 'pinia';
import type { BIP329Label } from '../types/types.d';
import { useWalletStore } from './walletStore';

export const useLabelsStore = defineStore('labels', () => {
    const walletStore = useWalletStore();

    const addLabel = (label: BIP329Label): void => {
        if (walletStore.selectedWallet) {
            const existingIndex = walletStore.selectedWallet.labels.findIndex(
                (l) => l.ref === label.ref && l.type === label.type,
            );
            if (existingIndex !== -1) {
                walletStore.selectedWallet.labels.splice(
                    existingIndex,
                    1,
                    label,
                );
            } else {
                walletStore.selectedWallet.labels.push(label);
            }
        }
    };

    const removeLabel = (ref: string, type: string): void => {
        if (walletStore.selectedWallet) {
            walletStore.selectedWallet.labels =
                walletStore.selectedWallet.labels.filter(
                    (label) => !(label.ref === ref && label.type === type),
                );
        }
    };

    const importBip329Label = (label: BIP329Label): void => {
        if (walletStore.selectedWallet) {
            walletStore.selectedWallet.labels.push(label);
        }
    };

    return {
        addLabel,
        removeLabel,
        importBip329Label,
    };
});
