<template>
    <v-container fluid>
        <Header>
            <template v-slot:headerTitle>
                <v-app-bar-title>Wallet Stats</v-app-bar-title>
            </template>
        </Header>
        <v-row v-if="utxosStore.utxos.size">
            <v-col cols="12">
                <h3 class="text-center mb-4">Wallet history</h3>
                <BalanceChart height="400px" />
            </v-col>
            <v-col cols="12">
                <UtxtoHeatmap v-if="utxosStore.utxos.size" />
            </v-col>
            <v-col cols="12">
                <h3 class="text-center mb-4">Collection distribution</h3>
                <CollectionsDistributionChart :distribution="collectionDistribution" />
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Collection } from '../types/types.d';
import Header from '@components/Header.vue';
import CollectionsDistributionChart from '@components/stats/CollectionsDistributionChart.vue';
import UtxtoHeatmap from '@components/stats/UtxoHeatmap.vue';
import BalanceChart from '@components/BalanceChart.vue';
import { useUtxoStore } from '@stores/utxoStore';
import { useCollectionStore } from '@stores/collectionStore';

const utxosStore = useUtxoStore();
const collectionsStore = useCollectionStore();
const collectionDistribution = computed(() => {
    return collectionsStore.collectionDetails.map((detail: Collection & { utxoCount: number; totalUtxoValue: number; percentage: number }) => ({
        description: detail.name,
        percentage: detail.percentage,
    }));
});

</script>
