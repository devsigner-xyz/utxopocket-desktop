import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useUtxoStore } from './utxoStore';
import { useCollectionStore } from './collectionStore';

export const useSelectionStore = defineStore('selection', () => {
    const utxoStore = useUtxoStore();
    const collectionsStore = useCollectionStore();

    const totalValue = computed(() => collectionsStore.totalValue);
    const totalSelectedValue = computed(() => {
        return utxoStore.selectedUtxos.reduce(
            (sum: number, utxo) => sum + utxo.value,
            0,
        );
    });

    const remainingBalance = computed(() => {
        return totalValue.value - totalSelectedValue.value;
    });

    const hasLockedSelected = computed(() =>
        utxoStore.selectedUtxos.some((u) => u.locked),
    );

    const hasUnlockedSelected = computed(() =>
        utxoStore.selectedUtxos.some((u) => !u.locked),
    );

    return {
        totalValue,
        totalSelectedValue,
        remainingBalance,
        hasLockedSelected,
        hasUnlockedSelected,
    };
});
