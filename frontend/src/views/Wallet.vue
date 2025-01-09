<template>
    <v-container fluid>
        <v-navigation-drawer permanent location="right" class="right-drawer" width="300"
            transition="slide-x-transition">

            <div v-if="selectedUtxos.length === 0" class="h-100 d-flex flex-column">
                <v-card class="w-100 pa-4">
                    <div class="d-flex flex-column ga-2">
                        <v-btn color="primary" transition="fade" class="block-chip text-caption mb-2"
                            @click="utxosStore.selectAllUtxos" variant="tonal">
                            {{ settingsStore.formatSats(totalValue) }} - {{ totalUtxos }} UTXOs
                        </v-btn>
                        <v-tooltip v-if="totalLockedCount > 0" :disabled="!tooltipsEnabled"
                            :text="`Select ${settingsStore.formatSats(totalLockedValue)}`" location="top">
                            <template v-slot:activator="{ props }">
                                <v-btn v-bind="props" @click="utxosStore.selectAllLockedUtxos()" transition="fade"
                                    class="block-chip text-caption mb-2" variant="tonal">
                                    {{ totalLockedCount }} UTXOs Locked
                                </v-btn>
                            </template>
                        </v-tooltip>
                    </div>
                </v-card>
                <BalanceChart class="mt-auto" :compact="true" height="100px" />
            </div>

            <div v-else-if="selectedUtxos.length > 0">
                <v-card class="w-100 pa-4">
                    <v-card-text class="text-center">
                        <h3 v-if="selectedUtxos.length === 1">UTXO Details</h3>
                        <h3 v-else>{{ selectedUtxos.length }} UTXOs Selected</h3>

                        <p v-if="selectedUtxos.length > 1">Total Value: {{ settingsStore.formatSats(totalSelectedValue)
                            }}</p>
                    </v-card-text>
                </v-card>

                <v-list v-if="selectedUtxos.length === 1">
                    <!-- Value -->
                    <v-list-item density="compact" lines="two" title="Value"
                        :subtitle="settingsStore.formatSats(selectedUtxos[0].value || 0)" />

                    <!-- Address -->
                    <v-list-item density="compact" lines="two" title="Address"
                        :subtitle="selectedUtxos[0].address || '-'" />

                    <!-- Transaction Output -->
                    <v-list-item density="compact" lines="three" title="Transaction Output">
                        <template #subtitle>
                            <router-link :to="{ name: 'TransactionDetails', params: { txid: selectedUtxos[0].txid } }"
                                title="View transaction details" class="text-decoration-none">
                                {{ selectedUtxos[0].txid }}:{{ selectedUtxos[0].vout }}
                            </router-link>
                        </template>
                    </v-list-item>

                    <!-- Height -->
                    <v-list-item density="compact" lines="two" title="Height"
                        :subtitle="selectedUtxos[0].height || '-'" />

                    <!-- Locked -->
                    <v-list-item title="Locked">
                        <template #append>
                            <span class="emoji">{{ selectedUtxos[0].locked ? "Yes 🔒" : "No 🔓" }}</span>
                        </template>
                    </v-list-item>

                    <!-- Collection -->
                    <v-list-item density="compact" lines="two" title="Collection">
                        <template #append>
                            <v-avatar v-if="selectedUtxos[0].collection" :image="selectedUtxos[0].collectionAvatar"
                                size="24" />
                        </template>

                        <template #subtitle>
                            {{ selectedUtxos[0].collection ? selectedUtxos[0].collection.name : 'Unassigned' }}
                        </template>
                    </v-list-item>

                    <!-- Label -->
                    <v-list-item density="compact" lines="two" title="Label">
                        <template #append>
                            <span class="emoji" v-if="selectedUtxos[0].hasLabel">🏷️</span>
                        </template>

                        <template #subtitle>
                            {{ selectedUtxos[0].hasLabel ? selectedUtxos[0].labelText : 'No label' }}
                        </template>
                    </v-list-item>
                </v-list>


                <v-card-text>

                    <div class="d-flex justify-space-between">

                        <v-tooltip :text="lockTooltip" location="top">
                            <template v-slot:activator="{ props }">
                                <v-btn v-bind="props" variant="tonal" :disabled="lockButtonDisabled" :size="48"
                                    :color="lockButtonColor" :icon="lockIcon" @click="handleLockButtonClick" />
                            </template>
                        </v-tooltip>

                        <v-btn v-tooltip="getTooltipConfig(labelButtonTooltipMessage, 'top')" @click="openLabelDialog"
                            :size="48" title="Manage UTXO label" variant="tonal" icon="tag"
                            :color="hasSelectedUtxoWithLabel ? 'primary' : ''" :disabled="isLabelButtonDisabled">
                        </v-btn>

                        <v-menu :width="300">
                            <template v-slot:activator="{ props }">
                                <v-avatar v-if="selectedUtxos.length === 1 && hasSelectedUtxoWithCollection"
                                    v-bind="props" v-tooltip="getTooltipConfig(collectionButtonTooltipMessage, 'top')"
                                    class="cursor-pointer" :image="selectedUtxos[0].collectionAvatar" :size="48" />
                                <v-btn v-else v-tooltip="getTooltipConfig(collectionButtonTooltipMessage, 'top')"
                                    v-bind="props" variant="tonal" icon="category" size="48"
                                    :color="selectedUtxos.length === 1 && hasSelectedUtxoWithCollection ? 'primary' : ''"
                                    :disabled="selectedUtxos.length !== 1" />
                            </template>

                            <v-list v-if="selectedUtxos.length === 1" v-model="selectedCollectionId"
                                active-class="selected">
                                <v-list-subheader>
                                    Assign collection to {{ formatAddress(selectedUtxos[0].address) }}
                                </v-list-subheader>

                                <v-list-item v-for="(collection, index) in collectionOptions" :key="index"
                                    @click="toggleCollectionSelection(collection)">
                                    <template v-slot:prepend>
                                        <v-avatar v-if="collection.avatar" :size="24" :image="collection.avatar" />
                                        <v-avatar v-else :size="24" icon="block" />
                                    </template>
                                    <v-list-item-title>{{ collection.label }}</v-list-item-title>
                                    <template v-slot:append>
                                        <v-icon v-if="selectedCollectionId === collection.value" color="primary"
                                            icon="check" />
                                    </template>
                                </v-list-item>

                                <v-divider />
                                <v-list-item to="/collections"
                                    :title="`Manage ${collectionOptions.length - 1} collections`">
                                    <template v-slot:append>
                                        <v-icon icon="chevron_right" />
                                    </template>
                                </v-list-item>
                            </v-list>
                        </v-menu>

                        <v-btn v-tooltip="getTooltipConfig('View Selected UTXOs (Enter)', 'top')" to="/selected-utxos"
                            size="48" icon="visibility" :disabled="selectedUtxos.length === 0" />
                        <v-btn variant="tonal" v-tooltip="getTooltipConfig('Cancel selection (Esc)', 'top')" size="48"
                            @click="deselectAllUtxos" icon="close" color="error" />
                    </div>
                </v-card-text>
            </div>
        </v-navigation-drawer>

        <Header>
            <template v-slot:headerTitle>
                <v-app-bar-title>Wallet</v-app-bar-title>
            </template>
        </Header>
        <TopWalletControls v-if="hasUtxos" />
        <div
            :class="[isScanning ? 'is-scanning' : '', 'wallet-wrapper', 'h-100', 'd-flex', 'flex-column', 'ga-3', 'pt-4']">
            <div class="utxo-container">
                <div v-for="(utxo, index) in displayedUtxos" :key="getUtxoKey(utxo)" :class="[
                    'utxo pa-3 rounded-lg',
                    {
                        animated: animateUtxos,
                        locked: utxo.locked,
                        selected: utxosStore.selectedUtxos.includes(utxo),
                    },
                ]" :style="getStyleWithAnimation(utxo, index)" @mouseover="utxosStore.setHoveredUtxo(utxo)"
                    @mouseleave="utxosStore.setHoveredUtxo(null)" @click="handleUtxoClick(utxo)">
                    <v-sheet class="w-100 h-100 bg-transparent">
                        <div class="d-flex flex-column justify-space-between h-100 w-100 text-center">
                            <!-- <div class="d-flex align-center justify-center text-caption">
                                <span :title="utxo.address">{{ formatAddress(utxo.address) }}</span>
                            </div> -->
                            <div class="d-flex align-center justify-center">
                                <span class="text-caption font-weight-bold">
                                    {{ settingsStore.formatSats(utxo.value) }}
                                </span>
                            </div>
                            <div class="d-flex flex-column ga-3">
                                <div class="d-flex align-center justify-center ga-3">
                                    <v-tooltip text="Locked" location="top" :disabled="!tooltipsEnabled">
                                        <template v-slot:activator="{ props }">
                                            <v-btn density="compact" rounded variant="tonal" :size="20"
                                                :disabled="!utxo.locked">
                                                <span class="emoji" v-bind="props" v-if="utxo.locked">🔒</span>
                                            </v-btn>
                                        </template>
                                    </v-tooltip>
                                    <v-tooltip :text="`Label: ${utxo.labelText}`" location="top"
                                        :disabled="!tooltipsEnabled">
                                        <template v-slot:activator="{ props }">
                                            <v-btn density="compact" rounded variant="tonal" :size="20"
                                                :disabled="!utxo.hasLabel">
                                                <span class="emoji" v-bind="props" v-if="utxo.hasLabel">🏷️</span>
                                            </v-btn>
                                        </template>
                                    </v-tooltip>
                                    <v-tooltip :text="`Collection: ${utxo.collection?.name}`" location="top"
                                        :disabled="!tooltipsEnabled">
                                        <template v-slot:activator="{ props }">
                                            <v-btn density="compact" rounded variant="tonal" :size="20"
                                                :disabled="!utxo.collection">
                                                <v-avatar v-if="utxo.collection" v-bind="props"
                                                    :image="utxo.collectionAvatar" :size="20" />
                                            </v-btn>
                                        </template>
                                    </v-tooltip>
                                </div>
                                <div class="d-flex align-center justify-center ga-3">
                                    <v-tooltip text="Toxic change" location="top" :disabled="!tooltipsEnabled">
                                        <template v-slot:activator="{ props }">
                                            <v-btn density="compact" rounded variant="tonal" :size="20"
                                                :color="utxo.isUtxoChange ? 'error' : ''"
                                                :disabled="!utxo.isUtxoChange">
                                                <span class="emoji" v-bind="props" v-if="utxo.isUtxoChange">☢️</span>
                                            </v-btn>
                                        </template>
                                    </v-tooltip>
                                    <v-tooltip text="Reused address" location="top" :disabled="!tooltipsEnabled">
                                        <template v-slot:activator="{ props }">
                                            <v-btn density="compact" rounded variant="tonal" :size="20"
                                                :disabled="!utxo.isReused">
                                                <span class="emoji" v-bind="props" v-if="utxo.isReused">⚠️</span>
                                            </v-btn>
                                        </template>
                                    </v-tooltip>
                                </div>
                            </div>
                            <div class="d-flex align-center justify-center">
                                <span class="text-body-2" style="font-size: 0.6rem!important">
                                    {{ formatTimestamp(utxo.timestamp) }}
                                </span>
                            </div>
                        </div>
                    </v-sheet>
                </div>
            </div>
        </div>
    </v-container>

    <div v-if="hasUtxos"
        :class="['bottom-wallet-controls d-flex align-center justify-space-between bg-surface', { 'with-rail': rail }]"
        :style="walletControlsStyle">
        <div class="d-flex align-center ga-4">
            <v-menu v-model="isSortingMenuOpen" :width="300" :close-on-content-click="false">
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" icon="sort" v-tooltip="getTooltipConfig(sortTooltip, 'top')" />
                </template>
                <v-chip-group v-model="selectedSortOption" selected-class="text-primary" column>
                    <v-chip v-for="option in sortOptions" :key="option.value" :value="option.value"
                        @click="updateUtxoSorting(option.value)" size="small">
                        {{ option.text }}
                    </v-chip>
                </v-chip-group>
            </v-menu>
            <v-menu :width="400" :close-on-content-click="false">
                <template v-slot:activator="{ props }">
                    <v-btn v-tooltip="getTooltipConfig('Utxo slider selector', 'top')" v-bind="props" icon="layers" />
                </template>
                <v-card>
                    <v-card-text class="d-flex flex-column ga-3">
                        <div class="w-100 d-flex justify-space-between align-center">
                            <span class="text-body-2">{{ selectedUtxos.length }} UTXOs selected</span>
                            <v-chip color="primary" :width="64">{{ sliderValue }} / {{ maxUtxosCount }} UTXOs</v-chip>
                        </div>
                        <div class="d-flex justify-space-between align-center">
                            <v-btn variant="plain" icon="remove" @click="decrementSlider"
                                v-tooltip="getTooltipConfig(`Remove 1 (🡣)`, 'top')" />
                            <v-slider v-model="sliderValue" :max="maxUtxosCount" :min="0" :step="1" color="primary"
                                hide-details @update:model-value="onSliderChange" :disabled="maxUtxosCount === 0" />
                            <v-btn variant="plain" icon="add" @click="incrementSlider"
                                v-tooltip="getTooltipConfig(`Add 1 (🡡)`, 'top')" />
                        </div>
                        <div class="d-flex align-center ga-2">
                            <v-select v-model="selectedSelectionPreference" :items="selectionPreferences"
                                @change="onSelectionPreferenceChange" density="compact" item-title="text"
                                item-value="value" hide-details title="Selection mode" />
                        </div>
                        <div>
                            <div class="d-flex flex-column ga-1 w-100 mb-2">
                                <span class=text-caption>Privacy checks</span>
                                <v-divider />
                            </div>
                            <v-chip-group column :show-arrows="false" v-model="avoidOptions" multiple
                                selected-class="text-primary">
                                <v-chip size="small" value="avoidSelectChange">
                                    Avoid select change
                                </v-chip>
                                <v-chip size="small" value="avoidReusedAddresses">
                                    Avoid reused addresses
                                </v-chip>
                                <v-chip size="small" value="avoidLockedUtxos">
                                    Avoid locked UTXOs
                                </v-chip>
                                <!-- <v-chip size="small" value="avoidMixingScriptTypes">
                                    Avoid mixing script types
                                </v-chip> -->
                            </v-chip-group>
                        </div>
                    </v-card-text>
                </v-card>
            </v-menu>
            <v-btn v-tooltip="getTooltipConfig(multiSelectTooltip, 'top')"
                :color="settingsStore.multiSelect ? 'secondary' : ''" @click="toggleMultiSelect"
                :icon="settingsStore.multiSelect ? 'done_all' : 'select_all'" />
            <v-menu :width="300" :close-on-content-click="false">
                <template v-slot:activator="{ props }">
                    <v-btn v-tooltip="getTooltipConfig('Adjust intensity', 'top')" v-bind="props"
                        icon="brightness_medium" :color="computedBrightnessColor" />
                </template>
                <v-card>
                    <v-card-text>
                        <div class="w-100 d-flex justify-space-between align-center">
                            <span class="text-body-2">Intensity</span>
                            <v-chip :color="computedBrightnessColor" :width="64" :text="`${intensityValue}`" />
                        </div>
                        <v-slider v-model="intensityValue" :max="1" :min="0.1" :step="0.05" color="primary" hide-details
                            prepend-icon="remove" append-icon="add" @click:prepend="decrementIntensity"
                            @click:append="incrementIntensity" />
                    </v-card-text>
                </v-card>
            </v-menu>
        </div>
    </div>

    <v-dialog v-model="labelDialog" persistent max-width="600px">
        <v-card>
            <v-card-title>{{ labelDialogTitle }}</v-card-title>
            <v-card-text>
                <v-text-field v-model="label.label" label="Label" :rules="rules" required />
                <v-switch v-model="label.spendable" label="Spendable" @change="handleSpendableChange" inset />
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="closeLabelDialog">Cancel</v-btn>
                <v-btn v-if="isEditingLabel" variant="text" color="error" @click="deleteLabel">
                    Delete
                </v-btn>
                <v-btn variant="text" color="primary" @click="saveLabel">
                    {{ isEditingLabel ? 'Save' : 'Add' }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import colors from 'vuetify/util/colors';

import {
    UTXO,
    BIP329Label,
    Collection,
    SnackbarType,
    SelectionPreference
} from '../types/types.d';

import {
    hexToRgb,
    hexToRgba,
    getUtxoKey,
    generateAvatar,
    formatAddress,
    formatTimestamp,
    throttle
} from '@utils/utils';

import Header from '@components/Header.vue';
import TopWalletControls from '@components/TopWalletControls.vue';
import { useSettingsStore } from '@stores/settingsStore';
import { useWalletStore } from '@stores/walletStore';
import { useUtxoStore } from '@stores/utxoStore';
import { useSelectionStore } from '@stores/selectionStore';
import { useConnectionStore } from '@stores/connectionStore';
import { useUIStore } from '@stores/uiStore';
import { useCollectionStore } from '@stores/collectionStore';
import { useLabelsStore } from '@stores/labelsStore';
import BalanceChart from '@components/BalanceChart.vue';

// Store, Router, and Theme Setup
const router = useRouter();
const theme = useTheme();
const settingsStore = useSettingsStore();
const walletStore = useWalletStore();
const utxosStore = useUtxoStore();
const labelsStore = useLabelsStore();
const collectionStore = useCollectionStore();
const uiStore = useUIStore();
const selectionStore = useSelectionStore();
const connectionStore = useConnectionStore();

// Reactive State Variables
const intensityValue = ref(settingsStore.utxoBackgroundIntensity);
const selectedSortOption = ref(settingsStore.sortBy);
const selectedSelectionPreference = ref<SelectionPreference>('smallest_first');
const labelDialog = ref(false);
const isEditingLabel = ref(false);
const label = ref<BIP329Label>({ type: 'addr', ref: '', label: '', spendable: true });
const avoidOptions = ref<string[]>([
    'avoidSelectChange',
    'avoidReusedAddresses',
    'avoidLockedUtxos',
]);
const sliderValue = ref<number>(0);
const isSortingMenuOpen = ref(false);

// Constants
const selectionPreferences: { value: SelectionPreference; text: string }[] = [
    { value: 'oldest_first', text: 'From oldest to newest' },
    { value: 'newest_first', text: 'From newest to oldest' },
    { value: 'smallest_first', text: 'From smallest to largest' },
    { value: 'largest_first', text: 'From largest to smallest' },
];

const sortOptions = [
    { value: 'value_desc', text: 'Largest to smallest' },
    { value: 'value_asc', text: 'Smallest to largest' },
    { value: 'date_desc', text: 'Newest to oldest' },
    { value: 'date_asc', text: 'Oldest to newest' },
    { value: 'locked_first', text: 'Locked first' },
    { value: 'change_first', text: 'Change first' },
    { value: 'label_asc', text: 'By label (A-Z)' },
    { value: 'collection_first', text: 'Collections first' },
];

const rules = [(v: string) => !!v || 'This field is required'];
const keyDelay = 100;

// Computed Properties
const tooltipsEnabled = computed(() => settingsStore.tooltipsEnabled);
const animateUtxos = computed(() => settingsStore.animateUtxos);
const multiSelect = computed(() => settingsStore.multiSelect);
const displayedUtxos = computed(() => collectionStore.enhancedUtxosForSelectedCollection);
const isScanning = computed(() => connectionStore.isScanning);
const hasUtxos = computed(() => walletStore.selectedWallet ? walletStore.selectedWallet.utxos.size > 0 : false);
const selectedUtxos = computed(() => utxosStore.selectedUtxos);
const totalSelectedValue = computed(() => selectionStore.totalSelectedValue);
const rail = computed(() => settingsStore.rail);
const maxUtxosCount = computed(() => filteredUtxosForSelection.value.length);
const hoveredUtxo = computed(() => utxosStore.hoveredUtxo);

const totalValue = computed(() => collectionStore.totalValue);
const totalUtxos = computed(() => utxosStore.utxos.size);
const totalLockedValue = computed(() => settingsStore.totalLockedValue);
const totalLockedCount = computed(() => settingsStore.totalLockedCount);

const labelDialogTitle = computed(() =>
    isEditingLabel.value ? 'Edit Label' : 'Assign Label to UTXO'
);

const maxUtxoValue = computed(() => {
    const values = displayedUtxos.value.map((u: UTXO) => u.value);
    return values.length ? Math.max(...values) : 0;
});

const minUtxoValue = computed(() => {
    const values = displayedUtxos.value.map((u: UTXO) => u.value);
    return values.length ? Math.min(...values) : 0;
});

const isLabelButtonDisabled = computed(() => selectedUtxos.value.length !== 1);

const hasSelectedUtxoWithLabel = computed(() => {
    const labels = walletStore.selectedWallet ? walletStore.selectedWallet.labels : [];
    return selectedUtxos.value.some((utxo: UTXO) =>
        labels.some((label: BIP329Label) => label.ref === utxo.address)
    );
});

const hasSelectedUtxoWithCollection = computed(() => {
    if (!walletStore.selectedWallet) return false;

    const collections = walletStore.selectedWallet.collections || [];
    return selectedUtxos.value.some((utxo: UTXO) => {
        const utxoKey = getUtxoKey(utxo);
        return collections.some((collection) =>
            collection.utxoKeys.includes(utxoKey)
        );
    });
});

const labelButtonTooltipMessage = computed(() => {
    if (selectedUtxos.value.length === 0) return 'Select a UTXO to label';
    if (selectedUtxos.value.length === 1) return 'Label UTXO';
    return 'Only one UTXO can be labeled at a time';
});

const collectionButtonTooltipMessage = computed(() => {
    if (selectedUtxos.value.length === 1 && hasSelectedUtxoWithCollection.value) {
        return `Collection: ${getCollectionName(selectedUtxos.value[0].scriptPubKey)}`;
    } else {
        return 'Assign to a collection';
    }
});

const selectedCollectionId = computed(() => {
    if (selectedUtxos.value.length === 0) return null;

    const firstUtxo = selectedUtxos.value[0];
    const utxoKey = getUtxoKey(firstUtxo);
    const collection = getCollectionByUtxo(utxoKey);

    return collection ? collection.id : null;
});

const collectionOptions = computed(() => {
    const collections = walletStore.selectedWallet ? walletStore.selectedWallet.collections : [];
    return [
        ...collections.map((collection: Collection) => ({
            label: collection.name,
            value: collection.id,
            avatar: generateAvatar(collection.name),
        })),
        { label: 'None', value: null, avatar: '' },
    ];
});

const sortTooltip = computed(() => {
    const selectedOption = sortOptions.find((option) => option.value === selectedSortOption.value);
    return selectedOption ? `Sorting by: ${selectedOption.text}` : 'Sorting by';
});

const walletControlsStyle = computed(() => ({
    width: rail.value ? 'calc(100% - 56px)' : 'calc(100% - 256px)',
    left: rail.value ? '56px' : '256px',
}));

const areUtxosLocked = computed(() =>
    selectedUtxos.value.every((utxo: UTXO) => utxo.locked)
);

const lockIcon = computed(() =>
    selectedUtxos.value.length === 0 ? 'lock_open' : areUtxosLocked.value ? 'lock' : 'lock_open'
);

const lockButtonColor = computed(() =>
    selectedUtxos.value.length === 0 ? '' : areUtxosLocked.value ? 'primary' : ''
);

const lockTooltip = computed(() => {
    if (selectedUtxos.value.length === 0) {
        return 'No UTXOs selected to lock or unlock';
    }

    const plural = selectedUtxos.value.length > 1 ? 'UTXOs' : 'UTXO';

    const hasLocked = selectedUtxos.value.some((utxo) => utxo.locked);
    const hasUnlocked = selectedUtxos.value.some((utxo) => !utxo.locked);

    if (hasLocked && hasUnlocked) {
        return `Selection contains both locked and unlocked ${plural}`;
    }

    return areUtxosLocked.value
        ? `Unlock ${selectedUtxos.value.length} ${plural}`
        : `Lock ${selectedUtxos.value.length} ${plural}`;
});

const handleLockButtonClick = (event: Event) => {
    if (lockButtonDisabled.value) {
        event.preventDefault();
        return;
    }
    toggleLockUtxos();
};

const lockButtonDisabled = computed(() => {
    const hasLocked = selectedUtxos.value.some((utxo) => utxo.locked);
    const hasUnlocked = selectedUtxos.value.some((utxo) => !utxo.locked);

    return hasLocked && hasUnlocked;
});

const multiSelectTooltip = computed(() =>
    settingsStore.multiSelect ? 'Multiselect enabled (m)' : 'Multiselect disabled (m)'
);

// Utility Functions
function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return Math.abs(hash);
}

const getCollectionName = (scriptPubKey: string): string | undefined => {
    const collection = collectionStore.getCollectionByUtxo(scriptPubKey);
    return collection ? collection.name : 'Unassigned';
};

const getStyle = (utxo: UTXO, index: number) => {
    const max = maxUtxoValue.value;
    const min = minUtxoValue.value;

    if (max === min) {
        return {};
    }

    let normalizedValue = Math.log(utxo.value - min + 1) / Math.log(max - min + 1);
    const minNormalizedValue = 0.2;

    if (normalizedValue === 0) {
        normalizedValue = minNormalizedValue;
    }

    const intensity = normalizedValue * intensityValue.value;
    let colorHex: string;
    let opacity: number;
    let borderOpacity: number;

    if (utxo.selected) {
        colorHex = theme.global.current.value.colors.secondary;
        opacity = 0.25;
        borderOpacity = 1;
    } else if (multiSelect.value && index === uiStore.highlightedIndex) {
        colorHex = theme.global.current.value.colors.secondary;
        opacity = 0.1;
        borderOpacity = intensity * 1.2;
    } else if (utxo.locked) {
        colorHex = colors.grey.lighten4;
        opacity = intensity * 0.25;
        borderOpacity = intensity * 1.2;
    } else if (utxo.isUtxoChange) {
        colorHex = theme.global.current.value.colors.error;
        opacity = intensity * 0.25;
        borderOpacity = intensity * 1.2;
    } else {
        colorHex = theme.global.current.value.colors.primary;
        opacity = intensity * 0.25;
        borderOpacity = intensity * 1.2;
    }

    const rgb = hexToRgb(colorHex);

    return {
        '--utxo-bg-color': `${rgb.r}, ${rgb.g}, ${rgb.b}`,
        '--utxo-bg-opacity': opacity,
        '--utxo-border-color': `${rgb.r}, ${rgb.g}, ${rgb.b}`,
        '--utxo-border-opacity': borderOpacity,
    };
};

const getStyleWithAnimation = (utxo: UTXO, index: number) => {
    const style = getStyle(utxo, index);
    const hash = hashCode(utxo.scriptPubKey);
    const delay = (hash % 2000) / 1000;

    return {
        ...style,
        animationDelay: `${delay}s`,
    };
};

// UTXO Selection Functions
const handleUtxoClick = (utxo: UTXO) => {
    if (multiSelect.value) {
        toggleUtxoSelection(utxo);
    } else {
        utxosStore.deselectAllUtxos();
        utxosStore.selectUtxo(utxo);
    }
    utxosStore.updateUtxoInStore(utxo);
};

const toggleUtxoSelection = (utxo: UTXO) => {
    const alreadySelected = utxosStore.selectedUtxos.some(
        (selected) => selected.txid === utxo.txid && selected.vout === utxo.vout
    );

    if (alreadySelected) {
        utxosStore.deselectUtxo(utxo);
    } else {
        utxo.selected = true;
        utxosStore.selectedUtxos.push(utxo);
    }
    utxosStore.updateUtxoInStore(utxo);
};


const selectUtxo = (utxo: UTXO) => {
    utxo.selected = true;
    utxosStore.selectedUtxos = [utxo];
};

const toggleSelection = (utxo: UTXO) => {
    const alreadySelected = utxosStore.selectedUtxos.some(
        (selectedUtxo: UTXO) => selectedUtxo.txid === utxo.txid && selectedUtxo.vout === utxo.vout
    );

    if (alreadySelected) {
        utxosStore.deselectUtxo(utxo);
    } else {
        utxosStore.selectedUtxos.push(utxo);
        utxo.selected = true;
        utxosStore.updateUtxoInStore(utxo);
    }
};

// Collection Management Functions
const toggleCollectionSelection = (collection: { label: string; value: number | null }) => {
    if (utxosStore.selectedUtxos.length !== 1) {
        return;
    }

    const collections = walletStore.selectedWallet ? walletStore.selectedWallet.collections : [];
    utxosStore.selectedUtxos.forEach((utxo: UTXO) => {
        const utxoKey = getUtxoKey(utxo);
        const currentCollection = getCollectionByUtxo(utxoKey);
        if (currentCollection) {
            currentCollection.utxoKeys = currentCollection.utxoKeys.filter(
                (key: string) => key !== utxoKey
            );
            collectionStore.updateCollection(currentCollection);
        }
    });

    if (collection.value !== null) {
        collectionStore.assignUtxosToCollection(collection.value, utxosStore.selectedUtxos);

        const updatedCollection = collections.find((c: Collection) => c.id === collection.value);
        if (updatedCollection) {
            collectionStore.updateCollection(updatedCollection);
        }
    }
    collectionStore.updateCollections();
};

// Label Management Functions
const openLabelDialog = () => {
    if (selectedUtxos.value.length === 1) {
        const selectedUtxo = selectedUtxos.value[0];
        const labels = walletStore.selectedWallet ? walletStore.selectedWallet.labels : [];
        const existingLabel = labels.find(
            (l: BIP329Label) => l.ref === selectedUtxo.address && l.type === 'addr'
        );

        label.value.ref = selectedUtxo.address;
        label.value.type = 'addr';
        label.value.spendable = !selectedUtxo.locked;
        label.value.label = existingLabel ? existingLabel.label : '';
        isEditingLabel.value = !!existingLabel;
        labelDialog.value = true;
    }
};

const closeLabelDialog = () => {
    labelDialog.value = false;
    label.value = { type: 'addr', ref: '', label: '', spendable: true };
    isEditingLabel.value = false;
};

const saveLabel = () => {
    if (label.value.ref.trim() === '' || label.value.label.trim() === '') return;

    labelsStore.addLabel({ ...label.value });

    const utxosArray = walletStore.selectedWallet ? Array.from(walletStore.selectedWallet.utxos.values()) : [];
    const utxo = utxosArray.find(
        (utxo: UTXO) => utxo.address === label.value.ref
    );

    if (utxo) {
        utxo.locked = !label.value.spendable;
        utxosStore.updateUtxoInStore(utxo);
    }

    closeLabelDialog();
};

const deleteLabel = () => {
    if (label.value.ref) {
        labelsStore.removeLabel(label.value.ref, 'addr');

        const utxosArray = walletStore.selectedWallet ? Array.from(walletStore.selectedWallet.utxos.values()) : [];
        const utxo = utxosArray.find(
            (utxo: UTXO) => utxo.address === label.value.ref
        );

        uiStore.setSnackbar('Label deleted successfully!', SnackbarType.Success);
    }
    closeLabelDialog();
};

const handleSpendableChange = () => {
    const selectedUtxo = selectedUtxos.value[0];
    if (selectedUtxo) {
        selectedUtxo.locked = !label.value.spendable;
        utxosStore.updateUtxoInStore(selectedUtxo);
    }
};

// Selection and Sorting Functions
const onSliderChange = (value: number) => {
    selectUtxosByCount(value);
};

const selectUtxosByCount = (count: number) => {
    utxosStore.deselectAllUtxos();

    const utxosInCollection = filteredUtxosForSelection.value;

    const sortedUtxos = utxosStore.sortUtxosForSelection(
        utxosInCollection,
        selectedSelectionPreference.value
    );

    const selected = sortedUtxos.slice(0, count);
    selected.forEach((utxo: UTXO) => {
        utxo.selected = true;
        utxosStore.selectedUtxos.push(utxo);
        utxosStore.updateUtxoInStore(utxo);
    });
};

const updateUtxoSorting = (value: string) => {
    settingsStore.updateSortBy(value);
    selectedSortOption.value = value;
};

const onSelectionPreferenceChange = (newPreference: SelectionPreference) => {
    if (sliderValue.value > 0) {
        selectUtxosByCount(sliderValue.value);
    }
};

const incrementSlider = () => {
    if (sliderValue.value < maxUtxosCount.value) {
        sliderValue.value += 1;
        onSliderChange(sliderValue.value);
    }
};

const decrementSlider = () => {
    if (sliderValue.value > 0) {
        sliderValue.value -= 1;
        onSliderChange(sliderValue.value);
    }
};

// Theme and Style Functions
const computedBrightnessColor = computed(() => {
    let intensity = intensityValue.value;
    const color = hexToRgba(theme.global.current.value.colors.primary, intensity * 1.2);

    return color;
});

// Keyboard Handling Functions
const throttledHandleShortcut = throttle(
    (key: string) => {
        handleShortcut(key);
    },
    keyDelay
);


const handleKeyDown = (event: KeyboardEvent) => {
    const lowerKey = event.key.toLowerCase();

    throttledHandleShortcut(lowerKey);
};

const handleShortcut = (key: string) => {
    const keyActions: { [key: string]: () => void } = {
        escape: () => {
            if (utxosStore.selectedUtxos.length > 0) utxosStore.deselectAllUtxos();
        },
        m: toggleMultiSelect,
        l: toggleLockUtxos,
        s: () => {
            isSortingMenuOpen.value = true;
        },
        enter: () => {
            if (selectedUtxos.value.length > 0) router.push('/selected-utxos');
        },
    };

    if (keyActions[key]) {
        keyActions[key]();
    }
};

const toggleMultiSelect = () => {
    settingsStore.multiSelect = !settingsStore.multiSelect;
};

const toggleLockUtxos = () => utxosStore.toggleLockUtxos();

// Collection Helper Functions
const getCollectionByUtxo = (utxoKey: string): Collection | undefined => {
    const collections = walletStore.selectedWallet ? walletStore.selectedWallet.collections : [];
    return collections.find((collection: Collection) =>
        collection.utxoKeys.includes(utxoKey)
    );
};

// const getCollectionAvatar = (utxoKey: string): string | undefined => {
//     const collection = collectionStore.getCollectionByUtxo(utxoKey);
//     return collection ? generateAvatar(collection.name) : '';
// };

// Intensity Control Functions
const incrementIntensity = () => {
    if (intensityValue.value < 1) {
        intensityValue.value = parseFloat(Math.min(intensityValue.value + 0.05, 1).toFixed(2));
    }
};

const decrementIntensity = () => {
    if (intensityValue.value > 0.1) {
        intensityValue.value = parseFloat(Math.max(intensityValue.value - 0.05, 0.1).toFixed(2));
    }
};

// Tooltip Configuration
const getTooltipConfig = (text: string, location: string) =>
    tooltipsEnabled.value ? { value: true, text, location } : false;

watch(intensityValue, (newValue) => {
    settingsStore.$patch({ utxoBackgroundIntensity: newValue });
});

// Computed UTXO Filters
const filteredUtxosForSelection = computed(() => {
    let utxosInCollection = collectionStore.utxosByCollection(collectionStore.selectedCollectionId);

    if (avoidOptions.value.includes('avoidLockedUtxos')) {
        utxosInCollection = utxosInCollection.filter((utxo: UTXO) => !utxo.locked);
    }

    if (avoidOptions.value.includes('avoidSelectChange')) {
        utxosInCollection = utxosInCollection.filter((utxo: UTXO) => !utxo.isUtxoChange);
    }

    if (avoidOptions.value.includes('avoidReusedAddresses')) {
        utxosInCollection = utxosInCollection.filter(
            (utxo: UTXO) => !utxo.isReused
        );
    }

    return utxosInCollection;
});

// Lifecycle Hooks
onMounted(() => {
    if (!collectionStore.selectedCollectionId || collectionStore.selectedCollectionId === 'allUtxosTab') {
        collectionStore.selectedCollectionId = 'allUtxosTab';
    }

    window.addEventListener('keydown', handleKeyDown);
    walletStore.calculateLockedValues();
    sliderValue.value = utxosStore.selectedUtxos.length;
    selectedSortOption.value = settingsStore.sortBy;
});

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown);
});

// Utility Functions
const deselectAllUtxos = (): void => {
    utxosStore.deselectAllUtxos();
};

</script>


<style lang="scss">
@keyframes pulse {

    0%,
    100% {
        filter: brightness(1);
    }

    50% {
        filter: brightness(0.9);
    }
}

.v-container {
    padding-bottom: 80px;
}

.wallet-wrapper {

    // &.is-scanning{
    //     .utxo{
    //         pointer-events: none;
    //     }
    // }
    // &:not(.is-scanning){
    &:hover {
        .utxo {
            // filter: grayscale(0.75);
            // opacity: 0.5;

            &:hover {
                // filter: grayscale(0);
                // opacity: 1 !important;
                transform: scale(1.13);
                position: relative;
                z-index: 1;
                cursor: pointer;
            }
        }

    }

    // }
    .v-toolbar__content {
        padding-right: 8px;
        padding-left: 8px;
        overflow: visible;
    }
}

.utxo-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(30%, 1fr));
    grid-auto-rows: min-content;
    grid-gap: 4px;
    overflow-x: visible;
    height: 100%;

    @media screen and (min-width: 360px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media screen and (min-width: 480px) {
        grid-template-columns: repeat(4, 1fr);
    }

    @media screen and (min-width: 760px) {
        grid-template-columns: repeat(5, 1fr);
    }

    @media screen and (min-width: 960px) {
        grid-template-columns: repeat(6, 1fr);
    }

}

.utxo {
    position: relative;
    border: 1px solid;
    overflow: hidden;
    aspect-ratio: 1;
    user-select: none;
    transition: 0.2s ease-in-out;
    background-color: rgba(var(--utxo-bg-color), var(--utxo-bg-opacity));
    border-color: rgba(var(--utxo-border-color), var(--utxo-border-opacity));

    &.animated {
        animation: pulse 3s infinite ease-in-out;
    }

    // &:hover {
    //     --utxo-bg-opacity: 0.8;
    //     transform: scale(1.13);
    //     position: relative;
    //     z-index: 1;
    // }
}

.v-card-actions {
    display: flex;
    justify-content: space-between;
    padding: 16px;
}

.emoji {
    font-size: 14px;
    line-height: 1;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: opacity 100ms ease-in-out, transform 100ms ease-in-out;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
    opacity: 1;
    transform: translateY(0);
}

.bottom-wallet-controls,
.floating-menu {
    position: fixed;
}

.bottom-wallet-controls {
    bottom: 0;
    gap: 16px;
    padding: 16px;
    transition: width 0.3s, left 0.3s;
    box-sizing: border-box;
    z-index: 2
}

.v-list-item.selected {
    background-color: rgba(0, 0, 0, 0.1);
}

.floating-menu {
    width: 100%;
    bottom: calc(80px + 32px);
    height: 64px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
}
</style>
