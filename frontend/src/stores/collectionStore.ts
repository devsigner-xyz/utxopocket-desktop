import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UTXO, Collection, BIP329Label } from '../types/types';
import { getUtxoKey, generateAvatar } from '@utils/utils';
import { useWalletStore } from './walletStore';
import { useSettingsStore } from './settingsStore';
import { useUtxoStore } from './utxoStore';

export const useCollectionStore = defineStore('collections', () => {
    const selectedCollectionId = ref<number | string>('allUtxosTab');
    const walletStore = useWalletStore();
    const settingsStore = useSettingsStore();
    const utxoStore = useUtxoStore();

    const selectedWallet = computed(() => walletStore.selectedWallet);

    const totalValue = computed(() => {
        if (selectedWallet.value) {
            return Array.from(selectedWallet.value.utxos.values()).reduce(
                (sum: number, utxo: UTXO) => sum + utxo.value,
                0,
            );
        }
        return 0;
    });

    const utxosByCollection = (collectionId: number | string): UTXO[] => {
        if (!selectedWallet.value) return [];
        if (collectionId === 'allUtxosTab' || collectionId === null) {
            return Array.from(selectedWallet.value.utxos.values());
        } else {
            const collection = selectedWallet.value.collections.find(
                (col: Collection) => col.id === collectionId,
            );
            return collection
                ? collection.utxoKeys
                      .map((key) => selectedWallet.value?.utxos.get(key))
                      .filter((utxo): utxo is UTXO => utxo !== undefined)
                : [];
        }
    };

    const getCollectionByUtxo = (utxoKey: string): Collection | undefined => {
        if (!selectedWallet.value) return undefined;
        return selectedWallet.value.collections.find((collection: Collection) =>
            collection.utxoKeys.includes(utxoKey),
        );
    };

    const addCollection = (collection: Collection): void => {
        if (selectedWallet.value) {
            selectedWallet.value.collections.push(collection);
        }
    };

    const updateCollection = (updatedCollection: Collection): void => {
        if (selectedWallet.value) {
            const index = selectedWallet.value.collections.findIndex(
                (c: Collection) => c.id === updatedCollection.id,
            );
            if (index !== -1) {
                selectedWallet.value.collections.splice(
                    index,
                    1,
                    updatedCollection,
                );
            }
        }
    };

    const removeCollection = (id: number): void => {
        if (selectedWallet.value) {
            selectedWallet.value.collections =
                selectedWallet.value.collections.filter(
                    (c: Collection) => c.id !== id,
                );
        }
    };

    const assignUtxosToCollection = (
        collectionId: number,
        utxosToAssign: UTXO[],
    ): void => {
        if (!selectedWallet.value) return;
        const collection = selectedWallet.value.collections.find(
            (c: Collection) => c.id === collectionId,
        );

        if (collection) {
            utxosToAssign.forEach((utxo) => {
                const key = getUtxoKey(utxo);
                const currentCollection = getCollectionByUtxo(key);
                if (currentCollection) {
                    currentCollection.utxoKeys =
                        currentCollection.utxoKeys.filter((uk) => uk !== key);
                }
            });

            const selectedUtxoKeys = utxosToAssign.map(getUtxoKey);
            collection.utxoKeys.push(...selectedUtxoKeys);
            collection.utxoKeys = [...new Set(collection.utxoKeys)];
        }
    };

    const updateCollections = (): void => {
        if (selectedWallet.value) {
            selectedWallet.value.collections =
                selectedWallet.value.collections.map((collection) => {
                    collection.utxoKeys = [...new Set(collection.utxoKeys)];
                    return collection;
                });
        }
    };

    const collectionsWithUtxos = computed(() => {
        if (!selectedWallet.value) return [];
        return selectedWallet.value.collections.map(
            (collection: Collection) => {
                const utxosInCollection = collection.utxoKeys
                    .map((key) => selectedWallet.value?.utxos.get(key))
                    .filter((utxo): utxo is UTXO => utxo !== undefined);
                return {
                    ...collection,
                    utxos: utxosInCollection,
                    utxoCount: utxosInCollection.length,
                };
            },
        );
    });

    const collectionDetails = computed(() => {
        if (!selectedWallet.value) return [];

        const total = totalValue.value;

        const utxoKeysAssigned = new Set(
            selectedWallet.value.collections.flatMap(
                (collection: Collection) => collection.utxoKeys,
            ),
        );

        const utxosArray = Array.from(selectedWallet.value.utxos.values());
        const unassignedUtxos = utxosArray.filter(
            (utxo: UTXO) => !utxoKeysAssigned.has(getUtxoKey(utxo)),
        );
        const unassignedValue = unassignedUtxos.reduce(
            (sum: number, utxo: UTXO) => sum + utxo.value,
            0,
        );

        const collectionData = selectedWallet.value.collections.map(
            (collection: Collection) => {
                const utxosInCollection = collection.utxoKeys
                    .map((key) => selectedWallet.value?.utxos.get(key))
                    .filter((utxo): utxo is UTXO => utxo !== undefined);
                const collectionValue = utxosInCollection.reduce(
                    (sum: number, utxo: UTXO) => sum + utxo.value,
                    0,
                );
                return {
                    ...collection,
                    utxoCount: utxosInCollection.length,
                    totalUtxoValue: collectionValue,
                    percentage: total > 0 ? (collectionValue / total) * 100 : 0,
                };
            },
        );

        if (unassignedUtxos.length > 0) {
            collectionData.push({
                id: -1,
                name: 'Unassigned',
                utxoCount: unassignedUtxos.length,
                totalUtxoValue: unassignedValue,
                percentage: total > 0 ? (unassignedValue / total) * 100 : 0,
                utxoKeys: unassignedUtxos.map(getUtxoKey),
                avatar: '',
            });
        }

        return collectionData;
    });

    const enhancedUtxosForSelectedCollection = computed(() => {
        if (!selectedWallet.value) return [];

        const sortBy = settingsStore.sortBy;
        const sortUtxos = utxoStore.sortUtxos;

        let utxosInCollection = utxosByCollection(selectedCollectionId.value);
        utxosInCollection = sortUtxos(utxosInCollection, sortBy);

        const labelsMap = new Map<string, BIP329Label>();
        selectedWallet.value.labels.forEach((label: BIP329Label) => {
            if (label.type === 'addr') {
                labelsMap.set(label.ref, label);
            }
        });

        return utxosInCollection.map((utxo: UTXO) => {
            const label = labelsMap.get(utxo.address);
            const key = getUtxoKey(utxo);
            const collection = getCollectionByUtxo(key);

            utxo.hasLabel = !!label;
            utxo.labelText = label ? label.label : '';
            utxo.collection = collection;
            utxo.collectionAvatar = collection
                ? generateAvatar(collection.name)
                : '';

            return utxo;
        });
    });

    return {
        utxosByCollection,
        getCollectionByUtxo,
        addCollection,
        updateCollection,
        removeCollection,
        assignUtxosToCollection,
        updateCollections,
        selectedCollectionId,
        totalValue,
        collectionsWithUtxos,
        collectionDetails,
        enhancedUtxosForSelectedCollection,
    };
});
