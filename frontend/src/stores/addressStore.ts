import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAddressStore = defineStore('address', () => {
    const externalAddresses = ref<string[]>([]);
    const internalAddresses = ref<string[]>([]);

    const setExternalAddresses = (addrs: string[]) => {
        externalAddresses.value = addrs;
    };

    const setInternalAddresses = (addrs: string[]) => {
        internalAddresses.value = addrs;
    };

    return {
        externalAddresses,
        internalAddresses,
        setExternalAddresses,
        setInternalAddresses,
    };
});
