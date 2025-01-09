import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { SnackbarType, type Transaction } from '../types/types.d';
import { useUIStore } from './uiStore';


export const useTransactionStore = defineStore('transaction', () => {
    const uiStore = useUIStore();
    const transactionDetailsMap = ref<Map<string, Transaction>>(new Map());
    const selectedTxId = ref<string | null>(null);

    const selectedTransaction = computed(() => {
        return selectedTxId.value
            ? transactionDetailsMap.value.get(selectedTxId.value) || null
            : null;
    });

    const fetchTransactionDetails = async (
        txid: string,
    ): Promise<Transaction> => {
        if (transactionDetailsMap.value.has(txid)) {
            const cachedTransaction = transactionDetailsMap.value.get(
                txid,
            ) as Transaction;

            if (cachedTransaction && cachedTransaction.size !== undefined) {
                return cachedTransaction;
            }
            console.warn(
                `Transaction ${txid} in cache is incomplete. Fetching from backend.`,
            );
        }

        try {
            const response = await axios.post(
                `/api/transaction/transaction-details`,
                { txid },
            );
            const transaction = response.data as Transaction;
            transactionDetailsMap.value.set(txid, transaction);
            return transaction;
        } catch (error) {
            uiStore.setSnackbar('Error fetching transaction details', SnackbarType.Error);
            throw error;
        }
    };

    const addTransactionDetails = (txId: string, details: Transaction) => {
        transactionDetailsMap.value.set(txId, details);
    };

    const setSelectedTxId = (txId: string | null) => {
        selectedTxId.value = txId;
    };

    return {
        transactionDetailsMap,
        selectedTxId,
        selectedTransaction,

        fetchTransactionDetails,
        addTransactionDetails,
        setSelectedTxId,
    };
});
