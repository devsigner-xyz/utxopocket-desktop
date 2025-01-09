<template>
  <v-container fluid>
    <Header>
      <template v-slot:headerTitle>
        <v-app-bar-title>Selected UTXOs</v-app-bar-title>
      </template>
    </Header>
    <div v-if="!selectedUtxos.length"
      class="empty-state d-flex flex-column align-center justify-center text-center ga-5">
      <v-icon icon="wallet" size="64"></v-icon>
      <div>
        <p class="text-h6 mb-2 font-weight-bold">No UTXOs selected</p>
        <p class="text-body-2">Select UTXOs in the wallet and see details here</p>
      </div>
      <v-btn color="primary" to="/">Go to wallet</v-btn>
    </div>
    <v-card v-else class="mb-4">
      <v-card-title>Comparison of UTXO Values</v-card-title>
      <v-card-text>
        <v-chart class="bar-chart" :option="barChartOptions" autoresize ref="chartRef" :style="{ height: '350px' }" />
      </v-card-text>
    </v-card>
    <v-card v-if="selectedUtxos.length" class="mb-4">
      <v-card-text>
        <v-data-table :items="selectedUtxos" :items-per-page="20" disable-pagination density="comfortable"
          class="utxo-comparision-table">
          <template v-slot:headers>
            <tr>
              <th>Address</th>
              <th>Tx ID</th>
              <th>Vout</th>
              <th>Value</th>
              <th>Script Pub Key</th>
              <th>Label</th>
              <th>Change?</th>
              <th>Locked?</th>
              <th>Reused?</th>
              <th>Collection</th>
            </tr>
          </template>
          <template v-slot:item="{ item }">
            <tr>
              <td :title="item.address"><strong>{{ formatAddress(item.address) }}</strong></td>
              <td :title="item.txid">{{ formatAddress(item.txid) }}</td>
              <td>{{ item.vout }}</td>
              <td>{{ settingsStore.formatSats(item.value) }}</td>
              <td :title="item.scriptPubKey">{{ formatAddress(item.scriptPubKey) }}</td>
              <td>{{ getLabel(item.address) }}</td>
              <td>{{ item.isUtxoChange ? 'Yes ☢️' : 'No' }}</td>
              <td>{{ item.locked ? 'Yes 🔒' : 'No' }}</td>
              <td>{{ item.isReused ? 'Yes ⚠️' : 'No' }}</td>
              <td class="d-flex align-center">
                <v-avatar v-if="getCollectionByUtxo(getUtxoKey(item))?.avatar"
                  :image="getCollectionByUtxo(getUtxoKey(item))?.avatar" size="16" class="mr-2" />
                <span>{{ getCollectionByUtxo(getUtxoKey(item))?.name || '-' }}</span>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { formatAddress, getUtxoKey } from '@utils/utils';
import { use } from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TooltipComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { UTXO } from '../types/types.d';
import { useTheme } from 'vuetify/lib/framework.mjs';
import { adjustColorOpacity, hexToRgba } from '@utils/utils';
import Header from '@components/Header.vue';
import VChart from 'vue-echarts';
import { useUtxoStore } from '@stores/utxoStore';
import { useSettingsStore } from '@stores/settingsStore';
import { useWalletStore } from '@stores/walletStore';
import { useCollectionStore } from '@stores/collectionStore';

use([BarChart, TooltipComponent, GridComponent, CanvasRenderer]);

const settingsStore = useSettingsStore();
const walletStore = useWalletStore();
const collectionsStore = useCollectionStore();
const utxoStore = useUtxoStore();
const selectedUtxos = computed<UTXO[]>(() => utxoStore.selectedUtxos);
const theme = useTheme();
const primaryColor = theme.global.current.value.colors.primary;

const getLabel = (address: string): string => {
  const label = walletStore.labels.find((label) => label.ref === address);
  return label ? label.label : 'No label';
};

const getCollectionByUtxo = (utxoKey: string): { name: string, avatar: string } | undefined => {
  return collectionsStore.getCollectionByUtxo(utxoKey);
};

const getBarStyle = (utxo: UTXO, intensity: number): string => {
  const baseColor = hexToRgba(theme.global.current.value.colors.primary, intensity);
  return baseColor;
};

const barChartOptions = computed(() => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'none',
      },
      backgroundColor: theme.global.current.value.colors.surface,
      borderColor: 'transparent',
      textStyle: { color: '#fff' },
    },
    xAxis: {
      type: 'category',
      data: selectedUtxos.value.map((utxo) => formatAddress(utxo.address)),
      axisLabel: {
        rotate: 0,
        color: adjustColorOpacity(primaryColor, 0.8),
        formatter: (value: string, index: number) => {
          const utxo = selectedUtxos.value[index];
          let iconHtml = '';

          if (utxo.isUtxoChange) {
            iconHtml += `☢️ `;
          }

          if (utxo.locked) {
            iconHtml += `🔒 `;
          }

          if (utxo.isReused) {
            iconHtml += `⚠️ `;
          }

          return `${iconHtml}`;
        },
        rich: {
          icon: {
            align: 'center',
            padding: [2, 2, 0, 2],
            color: primaryColor,
          },
        },
      },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: adjustColorOpacity(primaryColor, 0.2),
          width: 1,
          type: 'dashed',
        },
      },
      axisLine: {
        show: false,
      },
      axisLabel: {
        color: adjustColorOpacity(primaryColor, 0.8),
      },
    },
    series: [
      {
        data: selectedUtxos.value.map((utxo) => utxo.value),
        type: 'bar',
        barMaxWidth: 64,
        animationEasing: 'quadraticInOut',
        itemStyle: {
          color: (params: any) =>
            getBarStyle(selectedUtxos.value[params.dataIndex], 0.75),
          borderRadius: [8, 8, 0, 0],
        },
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
  };
});
</script>

<style scoped>
.empty-state {
  margin-top: 50px;
}

.table-container {
  overflow-x: auto;
}

.utxo-comparision-table td {
  font-size: 12px;
}
</style>
