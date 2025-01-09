<template>
    <v-snackbar v-model="snackbarVisible" :timeout="computedTimeout" bottom color="surface">
        <div class="d-flex justify-space-between align-center ga-4">
            <template v-if="storeSnackbar.message">
                <v-avatar v-if="storeSnackbar.type === 'success'" :size="40" color="surface">
                    <v-icon color="success" :size="32" icon="check" />
                </v-avatar>
                <v-avatar v-else-if="storeSnackbar.type === 'error'" :size="40" color="surface">
                    <v-icon color="error" :size="32" icon="close" />
                </v-avatar>
                <div class="w-100">{{ storeSnackbar.message }}</div>
            </template>

            <template v-else>
                <v-progress-circular v-if="snackbarState === 'connecting' || snackbarState === 'scanning'" indeterminate
                    color="primary" :size="40">
                    <template v-if="snackbarState === 'scanning'">
                        <span class="text-caption">{{ utxoCount }}</span>
                    </template>
                </v-progress-circular>

                <v-avatar v-else-if="snackbarState === 'connected' || snackbarState === 'scanned'" color="surface"
                    :size="40">
                    <v-icon color="success" :size="32" icon="check" />
                </v-avatar>

                <div class="w-100">{{ snackbarMessage }}</div>
            </template>
        </div>
    </v-snackbar>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useUIStore } from '@stores/uiStore';
import { useConnectionStore } from '@stores/connectionStore';
import { useUtxoStore } from '@stores/utxoStore';

const uiStore = useUIStore();
const utxosStore = useUtxoStore();
const connectionStore = useConnectionStore();
const storeSnackbar = computed(() => uiStore.snackbar);
const isConnecting = computed(() => connectionStore.isConnecting);
const isConnected = computed(() => connectionStore.isConnected);
const isScanning = computed(() => connectionStore.isScanning);
const utxoCount = computed(() => utxosStore.utxos.size);

const snackbarMessage = ref('');
const snackbarState = ref('');

const snackbarVisible = ref(false);

const computedTimeout = computed(() => {
    if (storeSnackbar.value.message) {
        return 3000;
    } else if (snackbarState.value === 'connected' || snackbarState.value === 'scanned') {
        return 3000;
    } else {
        return -1;
    }
});

let connectingTimeout: ReturnType<typeof setTimeout> | null = null;
let scanningTimeout: ReturnType<typeof setTimeout> | null = null;

watch([storeSnackbar, snackbarState], ([newStoreSnackbar, newSnackbarState]) => {
    snackbarVisible.value = newStoreSnackbar.message !== '' || newSnackbarState !== '';
});

watch([isConnecting, isConnected, isScanning], ([newConnecting, newConnected, newScanning]) => {
    if (newConnecting) {
        snackbarState.value = 'connecting';
        snackbarMessage.value = `Connecting to Electrum Server at ${connectionStore.host}:${connectionStore.port} using ${connectionStore.ssl ? 'SSL' : 'TCP'}`;
        if (connectingTimeout) {
            clearTimeout(connectingTimeout);
        }
        connectingTimeout = setTimeout(() => {
            snackbarMessage.value = 'The connection is taking longer than expected, please wait a bit more.';
        }, 30000);
    } else {
        if (snackbarState.value === 'connecting') {
            if (newConnected) {
                snackbarState.value = 'connected';
                snackbarMessage.value = `Successfully connected to ${connectionStore.host}.`;
                setTimeout(() => {
                    snackbarState.value = '';
                    snackbarMessage.value = '';
                }, 3000);
            } else {
                snackbarState.value = '';
                snackbarMessage.value = '';
            }
            if (connectingTimeout) {
                clearTimeout(connectingTimeout);
                connectingTimeout = null;
            }
        }
    }

    if (newScanning) {
        snackbarState.value = 'scanning';
        snackbarMessage.value = 'Deriving addresses and looking for transactions and utxos.';
        if (scanningTimeout) {
            clearTimeout(scanningTimeout);
        }
        scanningTimeout = setTimeout(() => {
            snackbarMessage.value = 'Blockchain scan is taking longer than expected, please wait a bit more.';
        }, 30000);
    } else {
        if (snackbarState.value === 'scanning') {
            snackbarState.value = 'scanned';
            if (utxoCount.value > 0) {
                snackbarMessage.value = 'Wallet added successfully.';
            } else {
                snackbarMessage.value = 'No more transactions found.';
            }
            setTimeout(() => {
                snackbarState.value = '';
                snackbarMessage.value = '';
            }, 3000);
            if (scanningTimeout) {
                clearTimeout(scanningTimeout);
                scanningTimeout = null;
            }
        }
    }
});

onBeforeUnmount(() => {
    if (connectingTimeout) {
        clearTimeout(connectingTimeout);
    }
    if (scanningTimeout) {
        clearTimeout(scanningTimeout);
    }
});
</script>