<template>
    <div class="wallet-top-controls">
        <div class="tabs-section">
            <v-tabs density="compact" show-arrows v-model="activeTab" @update:modelValue="handleTabChange">
                <v-tab density="compact" v-for="(tab, index) in tabs" :key="index">
                    <v-avatar v-if="tab.avatar" :image="tab.avatar" :size="20" class="mr-2" />
                    <span class="text-caption font-weight-semibold">{{ tab.name }} ({{ tab.utxoCount }})</span>
                </v-tab>
            </v-tabs>
        </div>
        <!-- <div class="sort-section"> -->
            <!-- TODO: SORTING! -->
            <!-- <v-select v-model="selectedSort" :items="sortOptions" item-title="label" item-value="value" label="Sort by"
                @change="updateSort" dense outlined hide-details class="sort-select"></v-select> -->
        <!-- </div> -->
    </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { generateAvatar } from '@utils/utils';
import { useUtxoStore } from '@stores/utxoStore';
import { useCollectionStore } from '@stores/collectionStore';
import { useSettingsStore } from '@stores/settingsStore';

const utxoStore = useUtxoStore();
const collectionsStore = useCollectionStore();
const settingsStore = useSettingsStore();
const activeTab = ref(0);

const tabs = computed(() => {
    const allUtxosTab = {
        id: null,
        name: 'All',
        utxos: utxoStore.utxos,
        utxoCount: utxoStore.utxos.size,
        avatar: null,
    };

    const collectionTabs = collectionsStore.collectionsWithUtxos.map((collection) => ({
        id: collection.id,
        name: collection.name,
        utxos: collection.utxos,
        utxoCount: collection.utxos.length,
        avatar: generateAvatar(collection.name),
    }));

    return [allUtxosTab, ...collectionTabs];
});

const handleTabChange = (v: unknown) => {
    const newTabIndex = v as number;
    utxoStore.deselectAllUtxos();
    const selectedTab = tabs.value[newTabIndex];
    collectionsStore.selectedCollectionId = selectedTab.id || 'allUtxosTab'; 
};


const updateSort = (value: string) => {
    settingsStore.updateSortBy(value);
};
</script>

<style scoped>
.wallet-top-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
}

.tabs-section {
    flex: 1;
}

.sort-section {
    display: flex;
    align-items: center;
}

.sort-select {
    width: 150px;
}
</style>
