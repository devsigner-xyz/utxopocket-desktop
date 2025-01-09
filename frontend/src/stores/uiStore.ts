import { defineStore } from 'pinia';
import { ref } from 'vue';
import { SnackbarType } from '../types/types.d';

export const useUIStore = defineStore('ui', () => {
    const snackbar = ref<{ message: string; type: SnackbarType }>({
        message: '',
        type: SnackbarType.None,
    });
    const theme = ref('customDarkTheme');
    const tooltipsEnabled = ref(true);
    const rightDrawerOpen = ref(false);
    const highlightedIndex = ref(-1);
    const isLoading = ref(false);
    const errorMessage = ref('');

    const setSnackbar = (message: string, type: SnackbarType): void => {
        snackbar.value.message = message;
        snackbar.value.type = type;
    };

    const clearSnackbar = (): void => {
        snackbar.value = { message: '', type: SnackbarType.None };
    };

    const toggleRightDrawer = (value: boolean) => {
        rightDrawerOpen.value = value;
    };

    return {
        snackbar,
        theme,
        tooltipsEnabled,
        rightDrawerOpen,
        highlightedIndex,
        isLoading,
        errorMessage,

        setSnackbar,
        clearSnackbar,
        toggleRightDrawer,
    };
});
