import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import type {
    BlockHeader,
    ServerPreset,
    ConnectNodePayload,
} from '../types/types.d';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'scanning';

export const useConnectionStore = defineStore('connection', () => {
    const host = ref('testnet.aranguren.org');
    const port = ref(51002);
    const ssl = ref(true);
    const connectionState = ref<ConnectionState>('disconnected');
    const blockHeader = ref<BlockHeader | null>(null);
    const serverBanner = ref('');
    const selectedNetwork = ref<'testnet' | 'mainnet'>('testnet');

    const testnetPresets = ref([
        { host: 'testnet.aranguren.org', port: 51002, ssl: true },
        { host: 'testnet.qtornado.com', port: 51002, ssl: true },
    ] as ServerPreset[]);

    const mainnetPresets = ref([
        { host: 'bolt.schulzemic.net', port: 50002, ssl: true },
        { host: 'electrum.blockstream.info', port: 50002, ssl: true },
        { host: 'electrum.emzy.de', port: 50002, ssl: true },
    ] as ServerPreset[]);

    const customTestnetServers = ref<ServerPreset[]>([]);
    const customMainnetServers = ref<ServerPreset[]>([]);

    const isConnected = computed(() =>
        ['connected', 'scanning'].includes(connectionState.value),
    );
    const isConnecting = computed(() => connectionState.value === 'connecting');
    const isScanning = computed(() => connectionState.value === 'scanning');

    const connectNode = async (payload: ConnectNodePayload): Promise<void> => {
        connectionState.value = 'connecting';
        try {
            const response = await axios.post('/api/node/connect', payload);
            if (response.status === 200 || response.status === 201) {
                connectionState.value = 'connected';
                blockHeader.value = response.data.blockHeader;
                serverBanner.value = response.data.serverBanner;
                host.value = payload.host;
                port.value = payload.port;
                ssl.value = payload.ssl;
                subscribeToNewBlocks();
            } else {
                throw new Error('Failed to connect to the Electrum server.');
            }
        } catch (error) {
            connectionState.value = 'disconnected';
            console.error('Error connecting to Electrum server:', error);
            throw error;
        }
    };

    const disconnectFromElectrum = async (): Promise<void> => {
        try {
            await axios.post('/api/node/disconnect');
            connectionState.value = 'disconnected';
            blockHeader.value = null;
            serverBanner.value = '';
        } catch (error) {
            console.error('Error disconnecting from Electrum server:', error);
        }
    };

    const subscribeToNewBlocks = (): void => {
        const eventSource = new EventSource(`/api/block/block-updates`);
        eventSource.onmessage = (event) => {
            const newBlockStatus = JSON.parse(event.data);
            blockHeader.value = newBlockStatus;
        };

        eventSource.onerror = (error) => {
            console.error('Error during block polling:', error);
            eventSource.close();
        };
    };

    const addCustomServer = (
        server: ServerPreset,
        network: 'testnet' | 'mainnet',
    ) => {
        if (network === 'testnet') {
            customTestnetServers.value.push(server);
        } else {
            customMainnetServers.value.push(server);
        }
    };

    const removeCustomServer = (
        preset: ServerPreset,
        network: 'testnet' | 'mainnet',
    ) => {
        if (network === 'testnet') {
            customTestnetServers.value = customTestnetServers.value.filter(
                (server) =>
                    !(
                        server.host === preset.host &&
                        server.port === preset.port &&
                        server.ssl === preset.ssl
                    ),
            );
        } else {
            customMainnetServers.value = customMainnetServers.value.filter(
                (server) =>
                    !(
                        server.host === preset.host &&
                        server.port === preset.port &&
                        server.ssl === preset.ssl
                    ),
            );
        }
    };

    return {
        host,
        port,
        ssl,
        connectionState,
        blockHeader,
        serverBanner,
        selectedNetwork,
        testnetPresets,
        mainnetPresets,
        customTestnetServers,
        customMainnetServers,

        isConnected,
        isConnecting,
        isScanning,

        connectNode,
        disconnectFromElectrum,
        subscribeToNewBlocks,
        addCustomServer,
        removeCustomServer,
    };
});
