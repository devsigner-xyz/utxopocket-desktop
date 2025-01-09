import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import type { Wallet, Transaction, UTXO, BIP329Label } from '../types/types.d';
import { useTransactionStore } from './transactionStore';
import { useUtxoStore } from './utxoStore';
import { useAddressStore } from './addressStore';
import { useSettingsStore } from './settingsStore';

export const useWalletStore = defineStore('wallet', () => {
    const wallets = ref<Wallet[]>([]);
    const selectedWalletId = ref<string | null>(null);

    const selectedWallet = computed<Wallet | null>(() => {
        return (
            wallets.value.find(
                (wallet) => wallet.id === selectedWalletId.value,
            ) || null
        );
    });

    const transactions = computed<Transaction[]>(
        () => selectedWallet.value?.transactions || [],
    );
    const labels = computed<BIP329Label[]>(
        () => selectedWallet.value?.labels || [],
    );

    const addressStore = useAddressStore();
    const transactionStore = useTransactionStore();
    const utxoStore = useUtxoStore();
    const settingsStore = useSettingsStore();

    const calculateBalanceForAddress = (address: string): number => {
        if (!selectedWallet.value) return 0;
        const utxosForAddress = Array.from(
            selectedWallet.value.utxos.values(),
        ).filter((utxo: UTXO) => utxo.address === address);
        return utxosForAddress.reduce(
            (sum: number, utxo: UTXO) => sum + utxo.value,
            0,
        );
    };

    const externalAddressesWithBalance = computed(() => {
        if (!selectedWallet.value) return [];
        return selectedWallet.value.externalAddresses.map((address) => ({
            address,
            balance: calculateBalanceForAddress(address),
        }));
    });

    const internalAddressesWithBalance = computed(() => {
        if (!selectedWallet.value) return [];
        return selectedWallet.value.internalAddresses.map((address) => ({
            address,
            balance: calculateBalanceForAddress(address),
        }));
    });

    const calculateLockedValues = (): void => {
        if (!selectedWallet.value) return;
        const lockedUtxos = Array.from(
            selectedWallet.value.utxos.values(),
        ).filter((utxo: UTXO) => utxo.locked);
        const totalLocked = lockedUtxos.reduce(
            (sum: number, utxo: UTXO) => sum + utxo.value,
            0,
        );

        settingsStore.totalLockedValue = totalLocked;
        settingsStore.totalLockedCount = lockedUtxos.length;
    };

    const loadWallet = async (wallet: Wallet): Promise<void> => {
        try {
            const response = await axios.post('/api/descriptor/load', {
                descriptor: wallet.descriptor,
            });

            if (response.status === 200 || response.status === 201) {
                selectedWalletId.value = wallet.id;
                await loadSelectedWalletInfo();
            } else {
                throw new Error('Failed to load descriptor in backend.');
            }
        } catch (error) {
            console.error('Error scanning descriptor:', error);
            throw error;
        }
    };

    const loadSelectedWalletInfo = async () => {
        if (!selectedWallet.value) return;
        await fetchWalletBalance();
        await fetchWalletUtxos();
        await fetchWalletTransactionHistory();
        await fetchWalletAddresses();
    };

    const fetchWalletBalance = async () => {
        if (!selectedWallet.value) return;
        try {
            const response = await axios.get(`/api/balance/balance`, {
                params: { descriptor: selectedWallet.value.descriptor },
            });
            selectedWallet.value.balance = response.data.balance;
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
        }
    };

    const fetchWalletAddresses = async () => {
        if (!selectedWallet.value) return;
        try {
            const response = await axios.get(`/api/address/addresses`, {
                params: { descriptor: selectedWallet.value.descriptor },
            });
            selectedWallet.value.externalAddresses =
                response.data.externalAddresses;
            selectedWallet.value.internalAddresses =
                response.data.internalAddresses;

            addressStore.setExternalAddresses(response.data.externalAddresses);
            addressStore.setInternalAddresses(response.data.internalAddresses);
        } catch (error) {
            console.error('Error fetching wallet addresses:', error);
        }
    };

    const fetchWalletUtxos = async () => {
        if (!selectedWallet.value) return;
        try {
            const response = await axios.get(`/api/utxo/utxos`, {
                params: { descriptor: selectedWallet.value.descriptor },
            });

            const utxosArray = response.data.utxos as UTXO[];

            selectedWallet.value.utxos = new Map(
                utxosArray.map((utxo: UTXO) => [
                    utxo.txid + ':' + utxo.vout,
                    utxo,
                ]),
            );

            selectedWallet.value.utxos = new Map(selectedWallet.value.utxos);
            utxoStore.setUtxos(selectedWallet.value.utxos);
        } catch (error) {
            console.error('Error fetching wallet UTXOs:', error);
        }
    };

    const fetchWalletTransactionHistory = async () => {
        if (!selectedWallet.value) return;
        try {
            const response = await axios.get(`/api/transaction/history`, {
                params: { descriptor: selectedWallet.value.descriptor },
            });
            selectedWallet.value.transactions = response.data.transactions;
            response.data.transactions.forEach((tx: Transaction) => {
                transactionStore.addTransactionDetails(tx.txId, tx);
            });
        } catch (error) {
            console.error('Error fetching wallet transaction history:', error);
        }
    };

    return {
        wallets,
        selectedWalletId,
        selectedWallet,
        transactions,
        labels,
        externalAddressesWithBalance,
        internalAddressesWithBalance,
        calculateBalanceForAddress,
        calculateLockedValues,

        loadWallet,
        loadSelectedWalletInfo,
        fetchWalletBalance,
        fetchWalletUtxos,
        fetchWalletTransactionHistory,
        fetchWalletAddresses,
    };
});
