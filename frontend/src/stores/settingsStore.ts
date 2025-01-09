import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
    const animateUtxos = ref(true);
    const displaySatsAmountFormat = ref<'sat' | 'btc'>('sat');
    const gapLimit = ref(20);
    const numberFormat = ref('default');
    const rail = ref(false);
    const sortBy = ref('value_desc');
    const ssl = ref(true);
    const tooltipsEnabled = ref(true);
    const totalLockedCount = ref(0);
    const totalLockedValue = ref(0);
    const useTor = ref(false);
    const feeHistogram = ref<any[]>([]);
    const estimatedNextBlocks = ref<any[]>([]);
    const lastConfirmedBlocks = ref<any[]>([]);
    const hasAcceptedWarning = ref(false);
    const multiSelect = ref(false);
    const theme = ref('customDarkTheme');
    const utxoBackgroundIntensity = ref(0.5);
    const hideBalances = ref(false);

    const formatSats = (sats: number): string => {
        if (hideBalances.value) {
            return '******';
        }

        const mode = displaySatsAmountFormat.value;
        if (mode === 'sat') {
            return (
                new Intl.NumberFormat('en-US', {
                    useGrouping: true,
                }).format(sats) + ' sats'
            );
        } else if (mode === 'btc') {
            const btc = sats / 100000000;
            return (
                new Intl.NumberFormat('en-US', {
                    useGrouping: true,
                    minimumFractionDigits: 8,
                    maximumFractionDigits: 8,
                }).format(btc) + ' btc'
            );
        }
        return sats.toString() + ' sats';
    };

    const updateSortBy = (value: string): void => {
        sortBy.value = value;
    };

    const resetStore = (): void => {
        animateUtxos.value = true;
        displaySatsAmountFormat.value = 'sat';
        gapLimit.value = 20;
        numberFormat.value = 'default';
        rail.value = false;
        sortBy.value = 'date_desc';
        ssl.value = false;
        tooltipsEnabled.value = true;
        totalLockedCount.value = 0;
        totalLockedValue.value = 0;
        useTor.value = false;
        feeHistogram.value = [];
        estimatedNextBlocks.value = [];
        lastConfirmedBlocks.value = [];
        hasAcceptedWarning.value = false;
        multiSelect.value = false;
        theme.value = 'customDarkTheme';
        utxoBackgroundIntensity.value = 0.5;
        hideBalances.value = false;
        localStorage.clear();
    };

    return {
        animateUtxos,
        displaySatsAmountFormat,
        gapLimit,
        numberFormat,
        rail,
        sortBy,
        ssl,
        tooltipsEnabled,
        totalLockedCount,
        totalLockedValue,
        useTor,
        feeHistogram,
        estimatedNextBlocks,
        lastConfirmedBlocks,
        hasAcceptedWarning,
        multiSelect,
        theme,
        utxoBackgroundIntensity,
        hideBalances,

        formatSats,
        updateSortBy,
        resetStore,
    };
});
