<template>
    <v-app-bar :elevation="0" class="px-4 position-fixed top-0">
        <slot name="headerTitle">
            <v-app-bar-title>UtxoPocket</v-app-bar-title>
        </slot>
        <v-spacer />
        <ReceiveButton v-if="walletStore.selectedWallet?.externalAddresses" />
        <v-btn v-if="isConnected" :color="blockColor" transition="fade" class="block-chip text-caption mr-2"
            variant="tonal">
            Block #{{ blockHeader?.blockHeight }}
        </v-btn>
        <v-tooltip :disabled="!tooltipsEnabled"
            :text="isConnected ? `Connected to ${connectionStore.host}` : 'Not connected'" location="bottom">
            <template v-slot:activator="{ props }">
                <v-btn class="text-caption text-capitalize" variant="tonal" v-bind="props"
                    :to="{ name: 'Settings', query: { tab: 'connection' } }">
                    <template v-if="isConnecting" v-slot:prepend>
                        <v-progress-circular indeterminate :size="20" color="primary" />
                    </template>
                    <template v-else v-slot:prepend>
                        <v-badge dot :color="isConnected ? 'success' : 'error'">
                            <v-icon :icon="isConnected ? 'wifi' : 'wifi_off'" :size="20" />
                        </v-badge>
                    </template>
                    {{ connectionStore.selectedNetwork }}
                </v-btn>
            </template>
        </v-tooltip>
        <slot name="headerActions">
        </slot>
    </v-app-bar>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import ReceiveButton from './ReceiveButton.vue';
import { useConnectionStore } from '@stores/connectionStore';
import { useUIStore } from '@stores/uiStore';
import { useWalletStore } from '@stores/walletStore';

const connectionStore = useConnectionStore();
const uiStore = useUIStore();
const walletStore = useWalletStore();
const isConnecting = computed(() => connectionStore.isConnecting);
const isConnected = computed(() => connectionStore.isConnected);
const tooltipsEnabled = computed(() => uiStore.tooltipsEnabled);
const blockHeader = computed(() => connectionStore.blockHeader);
const blockColor = ref('primary');

watch(blockHeader, (newBlock) => {
    if (newBlock) {
        blockColor.value = 'secondary';
        setTimeout(() => {
            blockColor.value = 'primary';
        }, 200);
    }
});
</script>

<style scoped lang="scss">
.block-chip {
    transition: 0.2s ease-in-out;
}
</style>
