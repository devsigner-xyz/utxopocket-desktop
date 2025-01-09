<template>
    <div class="d-flex flex-column ga-4">
        <v-form ref="connectionForm" v-model="isValidConnectionForm" @submit.prevent="connectNode">
            <div class="ui-grid__settings">
                <v-card>
                    <v-card-title class="bg-surface-1 py-4">
                        <p class="text-body-1 font-weight-bold mb-1">1. Connect to Electrum</p>
                        <p class="text-body-2">Select network and add your Electrum server or use presets.</p>
                    </v-card-title>
                    <v-card-item class="py-5">
                        <v-row>
                            <v-col>
                                <v-select v-model="connectionStore.selectedNetwork" :items="['testnet', 'mainnet']"
                                    label="Select network" hide-details />
                            </v-col>
                        </v-row>
                        <v-row v-for="(preset, index) in serverList" :key="index" class="align-center">
                            <v-col cols="auto" class="d-flex justify-center">
                                <v-btn v-if="isCustomServer(preset)" variant="tonal" rounded="circle" :size="48"
                                    @click="deleteCustomServer(preset)">
                                    <v-icon icon="delete" color="error" />
                                </v-btn>

                                <v-btn v-else disabled variant="tonal" rounded="circle" :size="48">
                                    <v-icon icon="delete" color="error" />
                                </v-btn>
                            </v-col>

                            <v-col cols="5">
                                <v-text-field v-model="preset.host" label="Host" disabled hide-details
                                    variant="filled" />
                            </v-col>
                            <v-col cols="2">
                                <v-text-field v-model="preset.port" label="Port" disabled hide-details variant="filled"
                                    type="number" />
                            </v-col>
                            <v-col cols="auto">
                                <v-switch inset hide-details v-model="preset.ssl" :label="preset.ssl ? 'SSL' : 'TCP'"
                                    disabled />
                            </v-col>
                            <v-spacer />
                            <v-col cols="auto">
                                <v-btn :color="isConnected && isCurrentServer(preset) ? 'error' : 'primary'"
                                    :loading="isConnecting && isCurrentServer(preset)" :disabled="isConnecting"
                                    variant="tonal" @click="toggleConnection(preset)">
                                    <template v-if="isConnecting && isCurrentServer(preset)">
                                        Connecting
                                    </template>
                                    <template v-else>
                                        {{ isConnected && isCurrentServer(preset) ? 'Disconnect' : 'Connect' }}
                                    </template>
                                </v-btn>
                            </v-col>
                        </v-row>
                        <v-row class="justify-center py-4">
                            <v-col cols="auto">
                                <v-btn @click="showCustomServerDialog = true" prepend-icon="add_circle_outlined"
                                    variant="tonal" size="large" color="primary">
                                    Add {{ connectionStore.selectedNetwork }} server
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-card-item>
                </v-card>
            </div>
        </v-form>

        <v-form ref="scanForm" v-model="isValidScanForm" @submit.prevent="loadWallet">
            <div class="ui-grid__settings" v-if="isConnected">
                <v-card>
                    <v-card-title class="bg-surface-1 py-4">
                        <p class="text-body-1 font-weight-bold mb-1">2. Add wallet</p>
                        <p class="text-body-2">
                            After connecting your node, provide a Bitcoin descriptor to enable address derivation and
                            transaction fetching.
                        </p>
                    </v-card-title>
                    <v-card-item class="py-5">
                        <v-row>
                            <v-col cols="12">
                                <v-text-field v-model="walletName" label="Wallet Name" required persistent-hint
                                    hint="Enter a name for your wallet." :rules="[rules.required]"
                                    :disabled="isScanning" clearable variant="filled" />
                            </v-col>
                            <v-col cols="12">
                                <v-textarea label="Bitcoin descriptor" v-model="descriptor" :rules="[rules.descriptor]"
                                    persistent-hint required :disabled="isScanning" clearable auto-grow :rows="2"
                                    variant="filled"
                                    :hint="`Supported descriptors: ${supportedDescriptorTypes.join(', ')}`" />
                                <!-- <div v-if="descriptorTypeMessage">
                                    <v-alert
                                        :type="descriptorTypeMessage.startsWith('Descriptor type detected') ? 'success' : 'error'">
                                        {{ descriptorTypeMessage }}
                                    </v-alert>
                                </div> -->
                            </v-col>
                        </v-row>
                    </v-card-item>
                    <v-card-actions>
                        <v-btn text="Add wallet" :disabled="!isValidScanForm || isScanning" variant="tonal"
                            color="primary" @click="loadWallet" />
                    </v-card-actions>
                </v-card>
            </div>
        </v-form>

        <div class="ui-grid__settings" v-if="walletStore.wallets.length > 0">
            <v-card class="mt-4">
                <v-card-title>
                    <p class="text-body-1 font-weight-bold mb-1">3. Wallets</p>
                    <p class="text-body-2">Below is the list of wallets you have added.</p>
                </v-card-title>
                <v-card-item>
                    <v-row v-for="(wallet, index) in walletStore.wallets" :key="wallet.id" class="align-center py-2">
                        <v-col cols="4">
                            <p class="text-body-2 font-weight-medium">{{ wallet.name }}</p>
                        </v-col>
                        <v-col cols="6">
                            <p class="text-caption">{{ wallet.descriptor }}</p>
                        </v-col>
                        <v-col cols="auto">
                            <v-row justify="end">
                                <v-col cols="auto">
                                    <v-btn variant="tonal" color="error" icon="delete" @click="deleteWallet(wallet.id)"
                                        aria-label="Remove wallet" title="Remove wallet" />
                                </v-col>
                                <v-col cols="auto">
                                    <v-btn variant="tonal" color="primary" icon="content_copy"
                                        @click="copyToClipboard(wallet.descriptor)" aria-label="Copy descriptor"
                                        title="Copy descriptor" />
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-card-item>
            </v-card>
        </div>

        <div class="ui-grid__settings" v-if="descriptor.length !== 0 && !isScanning">
            <v-card variant="tonal" color="error">
                <v-card-item>
                    <p class="text-body-1 font-weight-bold mb-1">☠️ Danger zone</p>
                    <p class="text-body-2">
                        Click "Reset app" button to remove wallets from UtxoPocket.
                    </p>
                </v-card-item>
                <v-card-actions>
                    <v-btn text="Reset data" variant="tonal" color="error" @click="resetApp" />
                </v-card-actions>
            </v-card>
        </div>

        <v-dialog v-model="showCustomServerDialog" max-width="500px">
            <v-card>
                <v-card-title class="bg-surface-light">
                    <p class="text-body-1 font-weight-bold">Add {{ connectionStore.selectedNetwork }} server</p>
                </v-card-title>
                <v-card-item>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="customServer.host" label="Server Host" hide-details
                                :rules="[rules.required, rules.host]" clearable variant="filled" />
                        </v-col>
                        <v-col cols="12">
                            <v-text-field v-model="customServer.port" label="Server Port" hide-details
                                :rules="[rules.required, rules.port]" clearable variant="filled" />
                        </v-col>
                        <v-col cols="12">
                            <v-switch v-model="customServer.ssl" label="Use SSL" color="primary" hide-details />
                        </v-col>
                    </v-row>
                </v-card-item>
                <v-card-actions>
                    <v-btn color="error" prepend-icon="delete" variant="tonal"
                        @click="showCustomServerDialog = false">Cancel</v-btn>
                    <v-btn color="primary" prepend-icon="add_circle_outlined" variant="tonal"
                        @click="addCustomServer">Add
                        Server</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { VForm } from 'vuetify/lib/components/index.mjs';
import { ServerPreset, SnackbarType, Wallet } from '../types/types.d';
import { generateUniqueId, copyToClipboard } from '@utils/utils';
import { useConnectionStore } from '@stores/connectionStore';
import { useWalletStore } from '@stores/walletStore';
import { useUIStore } from '@stores/uiStore';
import { useSettingsStore } from '@stores/settingsStore';

const connectionStore = useConnectionStore();
const settingsStore = useSettingsStore();
const uiStore = useUIStore();
const walletStore = useWalletStore();
const connectionForm = ref<InstanceType<typeof VForm> | null>(null);
const scanForm = ref<InstanceType<typeof VForm> | null>(null);

const isValidConnectionForm = ref(false);
const isValidScanForm = ref(false);

const host = ref<string>(connectionStore.host);
const port = ref<number>(connectionStore.port);
const ssl = ref<boolean>(connectionStore.ssl);
const descriptor = ref<string>('wpkh(tpubDDgQXbX4Q3WVcn3gMQAXP5w5NutmdgMKLukSLyDfD88PNpZr4MbgewQP1oDCMhWaVpbPAHF1RHusPBKuzo1TV2aUbTdhhTs5PmrEzSAUV9e)');
const walletName = ref<string>('P2WPKH - Native SegWit Test Wallet');

const showCustomServerDialog = ref(false);
const customServer = ref({ host: '', port: 0, ssl: false });

const isConnecting = computed(() => connectionStore.isConnecting);
const isConnected = computed(() => connectionStore.isConnected);
const isScanning = computed(() => connectionStore.isScanning);

const serverList = computed(() => connectionStore.selectedNetwork === 'testnet'
    ? [...connectionStore.testnetPresets, ...connectionStore.customTestnetServers]
    : [...connectionStore.mainnetPresets, ...connectionStore.customMainnetServers]
);

const supportedDescriptorTypes = ref<string[]>([]);

onMounted(async () => {
    try {
        const response = await fetch('/api/descriptor/types');
        const data = await response.json();
        supportedDescriptorTypes.value = data.supportedTypes || [];
    } catch (error) {
        console.error('Failed to fetch descriptor types:', error);
    }
});

const isCustomServer = (preset: ServerPreset): boolean => {
    if (connectionStore.selectedNetwork === 'testnet') {
        return connectionStore.customTestnetServers.some(custom =>
            custom.host === preset.host &&
            custom.port === preset.port &&
            custom.ssl === preset.ssl
        );
    } else {
        return connectionStore.customMainnetServers.some(custom =>
            custom.host === preset.host &&
            custom.port === preset.port &&
            custom.ssl === preset.ssl
        );
    }
};

const deleteWallet = (walletId: string) => {
    const walletIndex = walletStore.wallets.findIndex((wallet) => wallet.id === walletId);
    if (walletIndex !== -1) {
        walletStore.wallets.splice(walletIndex, 1);

        if (walletStore.selectedWalletId === walletId) {
            walletStore.selectedWalletId = null;
        }

        uiStore.setSnackbar('Wallet successfully deleted.', SnackbarType.Success);
    } else {
        uiStore.setSnackbar('Wallet not found.', SnackbarType.Error);
    }
};


const deleteCustomServer = (preset: ServerPreset) => {
    connectionStore.removeCustomServer(preset, connectionStore.selectedNetwork);
};

const addCustomServer = () => {
    if (customServer.value.host && customServer.value.port) {
        connectionStore.addCustomServer({ ...customServer.value }, connectionStore.selectedNetwork);
        showCustomServerDialog.value = false;
        customServer.value = { host: '', port: 0, ssl: false };
    }
};

const toggleConnection = async (serverPreset: ServerPreset) => {
    const isCurrentConnection = isConnected.value && isCurrentServer(serverPreset);

    if (isCurrentConnection) {
        await disconnectFromElectrum();
    } else {
        if (isConnected.value) {
            await disconnectFromElectrum();
        }
        host.value = serverPreset.host;
        port.value = serverPreset.port;
        ssl.value = serverPreset.ssl;
        await connectNode();
    }
};

const isCurrentServer = (preset: ServerPreset) => {
    return host.value === preset.host && port.value === preset.port && ssl.value === preset.ssl;
};

const rules = {
    required: (value: string | number) => !!value || 'Required.',
    host: (value: string) => /^[a-zA-Z0-9.-]+$/.test(value) || 'Invalid host name.',
    port: (value: string | number) => {
        const portNum = Number(value);
        return Number.isInteger(portNum) && portNum > 0 && portNum < 65536 || 'Port must be a valid number between 1 and 65535.';
    },
    positiveInteger: (value: string | number) => /^[1-9]\d*$/.test(String(value)) || 'Must be a positive integer.',
    gapLimitRange: (value: number) => (value >= 20 && value <= 50) || 'Gap limit must be between 20 and 50.',
    descriptor: async (value: string) => {
        if (!value) return 'Descriptor is required.';
        try {
            const resp = await fetch('/api/descriptor/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ descriptor: value }),
            });
            const data = await resp.json();
            if (data.isValid) {
                return true;
            } else {
                return data.error || 'Invalid descriptor.';
            }
        } catch (error) {
            return 'Validation failed. Please try again.';
        }
    },
};

const connectNode = async () => {
    if (await connectionForm.value?.validate()) {
        try {
            await connectionStore.connectNode({
                host: host.value,
                port: port.value,
                ssl: ssl.value,
                network: connectionStore.selectedNetwork,
            });
        } catch (error) {
            console.error('Error connecting:', error);
        }
    }
};

const disconnectFromElectrum = async () => {
    try {
        await connectionStore.disconnectFromElectrum();
    } catch (error) {
        console.error(`Failed disconnecting from ${connectionStore.host}`, error);
    }
};

const loadWallet = async () => {
    if (await scanForm.value?.validate()) {
        try {
            connectionStore.connectionState = 'scanning';
            const newWallet: Wallet = {
                id: generateUniqueId(),
                name: walletName.value || `Wallet ${walletStore.wallets.length + 1}`,
                descriptor: descriptor.value,
                utxos: new Map(),
                labels: [],
                collections: [],
                transactions: [],
                externalAddresses: [],
                internalAddresses: [],
                selectedUtxos: [],
            };

            walletStore.wallets.push(newWallet);
            walletStore.selectedWalletId = newWallet.id;
            await walletStore.loadWallet(newWallet);

            connectionStore.connectionState = 'connected';
        } catch (error) {
            console.error('Error adding wallet:', error);
            connectionStore.connectionState = 'connected';
            uiStore.setSnackbar('Failed to add wallet.', SnackbarType.Error);
        }
    }
};

const resetApp = () => {
    settingsStore.resetStore();
};
</script>

<style scoped>
.transaction-graph {
    height: 350px;
    width: 100%;
}
</style>
