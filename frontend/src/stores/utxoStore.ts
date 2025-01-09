import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UTXO } from '../types/types.d';
import { getUtxoKey } from '@utils/utils';
import { useWalletStore } from './walletStore';
import { useCollectionStore } from './collectionStore';

export const useUtxoStore = defineStore('utxo', () => {
    const utxos = ref<Map<string, UTXO>>(new Map());
    const selectedUtxo = ref<UTXO | null>(null);
    const selectedUtxos = ref<UTXO[]>([]);
    const hoveredUtxo = ref<UTXO | null>(null);
    const sortBy = ref('value_desc');
    const allUtxos = computed(() => Array.from(utxos.value.values()));
    const walletStore = useWalletStore();

    const sortUtxos = (utxosArray: UTXO[], criterion: string): UTXO[] => {
        const w = walletStore.selectedWallet;
        const collectionsStore = useCollectionStore();

        if (!w) return utxosArray;
        return [...utxosArray].sort((a, b) => {
            switch (criterion) {
                case 'date_desc':
                    return b.height - a.height;
                case 'date_asc':
                    return a.height - b.height;
                case 'value_asc':
                    return a.value - b.value;
                case 'value_desc':
                    return b.value - a.value;
                case 'label_asc':
                    const labelsA =
                        w.labels.find((label) => label.ref === a.address)
                            ?.label || '';
                    const labelsB =
                        w.labels.find((label) => label.ref === b.address)
                            ?.label || '';
                    return labelsA.localeCompare(labelsB);
                case 'locked_first':
                    return (b.locked ? 1 : 0) - (a.locked ? 1 : 0);
                case 'change_first':
                    return (b.isUtxoChange ? 1 : 0) - (a.isUtxoChange ? 1 : 0);
                case 'collection_first':
                    const keyA = getUtxoKey(a);
                    const keyB = getUtxoKey(b);

                    const collectionA =
                        collectionsStore.getCollectionByUtxo(keyA)?.name || '';
                    const collectionB =
                        collectionsStore.getCollectionByUtxo(keyB)?.name || '';

                    return collectionA.localeCompare(collectionB);

                default:
                    return 0;
            }
        });
    };

    const setUtxos = (newUtxos: Map<string, UTXO>) => {
        utxos.value = newUtxos;
    };

    const setHoveredUtxo = (u: UTXO | null) => {
        hoveredUtxo.value = u;
    };

    const updateUtxoInStore = (utxo: UTXO): void => {
        const key = getUtxoKey(utxo);
        utxos.value.set(key, utxo);
        utxos.value = new Map(utxos.value);
    };

    const selectUtxo = (utxo: UTXO) => {
        deselectAllUtxos();
        utxo.selected = true;
        selectedUtxos.value.push(utxo);
        selectedUtxo.value = utxo;
        updateUtxoInStore(utxo);
    };

    const deselectAllUtxos = (): void => {
        selectedUtxos.value.forEach((utxo: UTXO) => {
            utxo.selected = false;
            updateUtxoInStore(utxo);
        });

        selectedUtxos.value = [];
        selectedUtxo.value = null;
    };

    const deselectUtxo = (utxo: UTXO) => {
        const index = selectedUtxos.value.findIndex(
            (selected) =>
                selected.txid === utxo.txid && selected.vout === utxo.vout,
        );
        if (index !== -1) {
            selectedUtxos.value.splice(index, 1);
            utxo.selected = false;
            updateUtxoInStore(utxo);
        }
    };

    const selectAllUtxos = (): void => {
        deselectAllUtxos();
        const collectionsStore = useCollectionStore();
        const collectionId = collectionsStore.selectedCollectionId;
        const utxosInCollection =
            collectionsStore.utxosByCollection(collectionId);
        utxosInCollection.forEach((utxo: UTXO) => {
            utxo.selected = true;
            selectedUtxos.value.push(utxo);
            updateUtxoInStore(utxo);
        });
    };

    const selectAllUnlockedUtxos = (preference: string = 'auto'): void => {
        deselectAllUtxos();
        const collectionsStore = useCollectionStore();
        const collectionId = collectionsStore.selectedCollectionId;
        const utxosInCollection = collectionsStore
            .utxosByCollection(collectionId)
            .filter((utxo: UTXO) => !utxo.locked);

        const sorted = sortUtxosForSelection(utxosInCollection, preference);
        sorted.forEach((utxo: UTXO) => {
            utxo.selected = true;
            selectedUtxos.value.push(utxo);
            updateUtxoInStore(utxo);
        });
    };

    const selectAllLockedUtxos = (): void => {
        deselectAllUtxos();
        const collectionsStore = useCollectionStore();
        const collectionId = collectionsStore.selectedCollectionId;
        const collectionUtxos =
            collectionsStore.utxosByCollection(collectionId);
        collectionUtxos.forEach((utxo: UTXO) => {
            if (utxo.locked) {
                utxo.selected = true;
                selectedUtxos.value.push(utxo);
            }
        });
    };

    const sortUtxosForSelection = (
        utxosArray: UTXO[],
        criterion: string,
    ): UTXO[] => {
        return [...utxosArray].sort((a, b) => {
            switch (criterion) {
                case 'oldest_first':
                    return a.height - b.height;
                case 'newest_first':
                    return b.height - a.height;
                case 'smallest_first':
                    return a.value - b.value;
                case 'largest_first':
                    return b.value - a.value;
                default:
                    return 0;
            }
        });
    };

    const selectUtxosByAmount = (
        amount: number,
        preference: string = 'auto',
        deselectExisting: boolean = true,
    ): void => {
        if (deselectExisting) {
            deselectAllUtxos();
        }
        const collectionsStore = useCollectionStore();
        const collectionId = collectionsStore.selectedCollectionId;
        const utxosInCollection = collectionsStore
            .utxosByCollection(collectionId)
            .filter((utxo: UTXO) => !utxo.selected && !utxo.locked);

        const sortedUtxos = sortUtxosForSelection(
            utxosInCollection,
            preference,
        );

        let selectedAmount = 0;
        const selected: UTXO[] = [];
        for (const utxo of sortedUtxos) {
            if (selectedAmount >= amount) break;
            selected.push(utxo);
            selectedAmount += utxo.value;
        }

        if (selectedAmount >= amount) {
            selected.forEach((utxo: UTXO) => {
                selectedUtxos.value.push(utxo);
                utxo.selected = true;
                updateUtxoInStore(utxo);
            });
        } else {
            console.error(
                'No hay suficientes UTXOs para cubrir la cantidad solicitada.',
            );
        }
    };

    const toggleLockUtxos = (): void => {
        const areAllLocked = selectedUtxos.value.every(
            (utxo: UTXO) => utxo.locked,
        );
        selectedUtxos.value.forEach((utxo: UTXO) => {
            utxo.locked = !areAllLocked;
            updateUtxoInStore(utxo);
        });
    };

    const updateAllUtxosWithChangeInfo = () => {
        utxos.value = new Map(utxos.value);
    };

    return {
        utxos,
        selectedUtxo,
        selectedUtxos,
        hoveredUtxo,
        sortBy,
        allUtxos,

        setUtxos,
        setHoveredUtxo,
        updateUtxoInStore,
        selectUtxo,
        deselectAllUtxos,
        deselectUtxo,
        selectAllUtxos,
        selectAllUnlockedUtxos,
        selectAllLockedUtxos,
        selectUtxosByAmount,
        toggleLockUtxos,
        updateAllUtxosWithChangeInfo,
        sortUtxos,
        sortUtxosForSelection,
    };
});
