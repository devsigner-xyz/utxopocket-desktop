<template>
    <v-container fluid>
        <Header>
            <template v-slot:headerTitle>
                <v-app-bar-title>Settings</v-app-bar-title>
            </template>
        </Header>
        <v-tabs v-model="activeTab">
            <v-tab :value="'connection'">Connection</v-tab>
            <v-tab :value="'interface'">Interface</v-tab>
            <v-tab :value="'advanced'">Advanced</v-tab>
        </v-tabs>
        <v-tabs-window class="py-4" v-model="activeTab">
            <v-tabs-window-item :value="'advanced'">
                <v-list>
                    <v-list-item @click="exportLabels" title="Export Labels"
                        subtitle="Export all labels according to BIP 329." ripple>
                        <template v-slot:append>
                            <v-btn variant="tonal" color="primary" :height="32">
                                <template v-slot:append>
                                    <v-icon icon="mdi-download" :size="16" />
                                </template>
                                Export
                            </v-btn>
                        </template>
                    </v-list-item>
                    <v-list-item title="Import Labels" subtitle="Import labels according to BIP 329." ripple
                        :disabled="isScanning" @click="triggerFileImport">
                        <template v-slot:append>
                            <v-btn variant="tonal" color="primary" :height="32">
                                <template v-slot:append>
                                    <v-icon icon="mdi-upload" :size="16" />
                                </template>
                                Import
                            </v-btn>
                            <input type="file" ref="fileInput" accept=".jsonl" style="display: none"
                                @change="handleFileUpload" />
                        </template>
                    </v-list-item>
                </v-list>
            </v-tabs-window-item>
            <v-tabs-window-item :value="'interface'">
                <v-list>
                    <v-list-item @click="toggleDarkMode" title="Dark mode"
                        subtitle="Switch between light and dark mode." ripple>
                        <template v-slot:append>
                            <v-switch v-model="localIsDark" color="primary" hide-details inset />
                        </template>
                    </v-list-item>
                    <v-list-item @click="toggleUtxoAnimation" title="UTXO animation"
                        subtitle="Enable/disable UTXO glow animation." ripple>
                        <template v-slot:append>
                            <v-switch v-model="localAnimateUtxos" color="primary" hide-details inset />
                        </template>
                    </v-list-item>
                    <v-list-item @click="toggleTooltips" title="Tooltips" subtitle="Enable/disable tooltips." ripple>
                        <template v-slot:append>
                            <v-switch v-model="localTooltipsEnabled" color="primary" hide-details inset />
                        </template>
                    </v-list-item>
                    <v-list-item title="Display unit" subtitle="Select display unit between sats or btc." ripple>
                        <template v-slot:append>
                            <v-select v-model="localSatsAmountFormat" variant="filled" density="compact"
                                :items="['sat', 'btc']" hide-details dense />
                        </template>
                    </v-list-item>
                </v-list>
            </v-tabs-window-item>
            <v-tabs-window-item :value="'connection'">
                <v-row>
                    <v-col cols="12">
                        <ConnectionForm />
                    </v-col>
                </v-row>
            </v-tabs-window-item>
        </v-tabs-window>
    </v-container>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ConnectionForm from '@components/ConnectionForm.vue';
import Header from '@components/Header.vue';
import { useTheme } from 'vuetify';
import { saveAs } from 'file-saver';
import { SnackbarType, BIP329Label } from '../types/types.d';
import { useSettingsStore } from '@stores/settingsStore';
import { useConnectionStore } from '@stores/connectionStore';
import { useUIStore } from '@stores/uiStore';
import { useWalletStore } from '@stores/walletStore';
import { useLabelsStore } from '@stores/labelsStore';
import { useUtxoStore } from '@stores/utxoStore';

const route = useRoute();
const uiStore = useUIStore();
const utxosStore = useUtxoStore();
const settingsStore = useSettingsStore();
const connectionStore = useConnectionStore();
const walletStore = useWalletStore();
const labelsStore = useLabelsStore();
const theme = useTheme();
const activeTab = ref<string>(route.query.tab as string || 'connection');
const localIsDark = ref<boolean>(theme.global.name.value !== 'customLightTheme');
const localAnimateUtxos = ref<boolean>(settingsStore.animateUtxos);
const localTooltipsEnabled = ref<boolean>(settingsStore.tooltipsEnabled);
const localSatsAmountFormat = ref<'sat' | 'btc'>(settingsStore.displaySatsAmountFormat);
const fileInput = ref<HTMLInputElement | null>(null);
const isScanning = computed<boolean>(() => connectionStore.isScanning);

const toggleDarkMode = () => {
    localIsDark.value = !localIsDark.value;
    const themeMode = localIsDark.value ? 'Dark mode enabled' : 'Dark mode disabled';
    const type = localIsDark.value ? SnackbarType.Success : SnackbarType.Warning
    uiStore.setSnackbar(themeMode, type);
};

const toggleUtxoAnimation = () => {
    localAnimateUtxos.value = !localAnimateUtxos.value;
    const animationStatus = localAnimateUtxos.value ? 'UTXO animation enabled' : 'UTXO animation disabled';
    const type = localAnimateUtxos.value ? SnackbarType.Success : SnackbarType.Warning
    uiStore.setSnackbar(animationStatus, type);
};

const toggleTooltips = () => {
    localTooltipsEnabled.value = !localTooltipsEnabled.value;
    const tooltipStatus = localTooltipsEnabled.value ? 'Tooltips enabled' : 'Tooltips disabled';
    const type = localTooltipsEnabled.value ? SnackbarType.Success : SnackbarType.Warning;
    uiStore.setSnackbar(tooltipStatus, type);
};

const exportLabels = () => {
    if (!walletStore.selectedWallet) {
        uiStore.setSnackbar('No wallet selected.', SnackbarType.Warning);
        return;
    }

    try {
        const labelsToExport = walletStore.labels.map((label) => JSON.stringify({
            type: label.type,
            ref: label.ref,
            label: label.label,
        })).join('\n');

        const blob = new Blob([labelsToExport], { type: 'application/jsonl;charset=utf-8' });

        saveAs(blob, 'bip329_labels.jsonl');

        uiStore.setSnackbar('Labels exported successfully in .jsonl format!', SnackbarType.Success);
    } catch (error) {
        console.error('Error exporting labels:', error);
        uiStore.setSnackbar('Error exporting labels', SnackbarType.Error);
    }
};

const triggerFileImport = () => {
    if (fileInput.value) {
        fileInput.value.click();
    }
};

const handleFileUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        const file = input.files[0];
        importLabels(file);
    }
};

const importLabels = async (file: File): Promise<void> => {
    if (!walletStore.selectedWallet) {
        uiStore.setSnackbar('No wallet selected.', SnackbarType.Warning);
        return;
    }

    try {
        const text = await file.text();
        const lines = text.split('\n').filter((line) => line.trim() !== '');
        let labelCount = 0;

        const importedLabels: BIP329Label[] = lines.map((line) => JSON.parse(line.trim()));

        importedLabels.forEach((importedLabel: BIP329Label) => {
            if (importedLabel.type === 'tx') {
                const matchingTx = walletStore.transactions.find((tx) => tx.txId === importedLabel.ref);
                if (matchingTx) {
                    labelsStore.addLabel(importedLabel);
                    labelCount++;
                }
            } else if (importedLabel.type === 'addr') {
                const matchingUtxo = Array.from(utxosStore.utxos.values()).find(
                    (utxo) => utxo.address === importedLabel.ref,
                );
                if (matchingUtxo) {
                    labelsStore.addLabel(importedLabel);
                    labelCount++;
                }
            }
        });

        if (labelCount > 0) {
            uiStore.setSnackbar(`${labelCount} labels imported successfully.`, SnackbarType.Success);
        } else {
            uiStore.setSnackbar('No matching UTXOs or transactions found for import.', SnackbarType.Warning);
        }
    } catch (error) {
        console.error('Error importing labels:', error);
        uiStore.setSnackbar('Error importing labels.', SnackbarType.Error);
    }
};

watch(localSatsAmountFormat, (newVal: 'sat' | 'btc') => {
    settingsStore.$patch({ displaySatsAmountFormat: newVal });
});

watch(localIsDark, (newVal: boolean) => {
    const newTheme = newVal ? 'customDarkTheme' : 'customLightTheme';
    theme.global.name.value = newTheme;
    settingsStore.$patch({ theme: newTheme });
});

watch(localAnimateUtxos, (newVal: boolean) => {
    settingsStore.$patch({ animateUtxos: newVal });
});

watch(localTooltipsEnabled, (newVal: boolean) => {
    settingsStore.$patch({ tooltipsEnabled: newVal });
});
</script>