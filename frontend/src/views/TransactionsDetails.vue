<template>
  <v-container fluid>
    <Header>
      <template v-slot:headerTitle>
        <v-app-bar-title>Transaction details</v-app-bar-title>
      </template>
    </Header>
    <v-card :class="[loading ? 'h-100' : '']">
      <v-card-text v-if="loading">
        <div class="d-flex flex-column justify-center align-center ga-4">
          <v-progress-circular indeterminate color="primary" size="48" />
          <span class="text-body-1">Loading transaction details</span>
        </div>
      </v-card-text>
      <v-card-text v-else>
        <div v-if="selectedTransaction">
          <v-row dense>
            <v-col cols="12">
              <v-card class="transaction-detail__card" color="primary" variant="outlined"
                :title="selectedTransaction.timestamp ? formatTimestamp(selectedTransaction.timestamp) : 'Pending confirmation...'"
                elevation="0" :subtitle="selectedTransaction.txId">
                <template v-slot:append>
                  <v-btn variant="text" icon="content_copy"
                    @click="copyToClipboard(selectedTransaction.txId, 'Transaction ID copied.')" />
                </template>
                <v-divider class="my-2" />
                <v-card-item class="py-5">
                  <v-row>
                    <v-col cols="3" v-for="(stat, index) in transactionStats" :key="index">
                      <div class="text-caption">
                        <p class="mb-1">{{ stat.label }}</p>
                        <p class="font-weight-bold">{{ stat.value }}</p>
                      </div>
                    </v-col>
                    <v-col cols="12">
                      <v-chart class="transaction-graph w-100 bg-surface-1 rounded-lg" :option="graphOption"
                        autoresize />
                    </v-col>
                  </v-row>
                </v-card-item>
              </v-card>
            </v-col>
            <!-- <v-col cols="12">
              <v-card class="transaction-detail__card" color="surface-2" variant="tonal">
                <v-chart class="transaction-graph w-100" :option="graphOption" autoresize />
              </v-card>
            </v-col> -->
          </v-row>
          <v-row>
            <v-col cols="6">
              <h5 class="text-body-1 font-weight-bold">Inputs ({{ selectedTransaction.inputs.length }})</h5>
              <v-expansion-panels ripple variant="accordion">
                <v-expansion-panel v-for="(input, index) in selectedTransaction.inputs" :key="'input-' + index">
                  <v-expansion-panel-title>
                    <div class="d-flex align-center justify-space-between w-100 text-caption">
                      <div>{{ formatAddress(input.txid) }}:{{ index }}</div>
                      <div>{{ settingsStore.formatSats(input.value) }}</div>
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text class="text-caption">
                    <v-list lines="two" density="compact">
                      <v-list-item title="TxID" :subtitle="input.txid"></v-list-item>
                      <v-list-item title="Index" :subtitle="input.index"></v-list-item>
                      <v-list-item title="Value" :subtitle="settingsStore.formatSats(input.value)"></v-list-item>
                      <v-list-item v-if="input.script" title="Script" :subtitle="input.script"></v-list-item>
                    </v-list>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
            <v-col cols="6">
              <h5 class="text-body-1 font-weight-bold">Outputs ({{ selectedTransaction.outputs.length }})</h5>
              <v-expansion-panels ripple variant="accordion">
                <v-expansion-panel v-for="(output, index) in selectedTransaction.outputs" :key="'output-' + index">
                  <v-expansion-panel-title>
                    <div :style="getOutputStyle(output)"
                      class="d-flex align-center justify-space-between w-100 text-caption">
                      <div v-if="output.nextTxid">{{ formatAddress(output.nextTxid) }}:{{ index }}</div>
                      <div v-else>{{ output.address }} {{ getOutputEmoji(output) }}</div>
                      <div>{{ settingsStore.formatSats(output.value) }}</div>
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text class="text-caption">
                    <v-list lines="two" density="compact">
                      <v-list-item title="Address">
                        <template v-slot:subtitle>
                          {{ output.address ? output.address : '' }}
                        </template>
                      </v-list-item>
                      <v-list-item title="Value" :subtitle="settingsStore.formatSats(output.value)"></v-list-item>
                      <v-list-item title="ScriptPubKey" :subtitle="output.scriptPubKey"></v-list-item>
                      <v-list-item v-if="output.nextTxid" title="Next TxID" :subtitle="output.nextTxid"></v-list-item>
                    </v-list>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-card class="transaction-detail__card" color="primary" variant="outlined" title="Raw transaction"
                :subtitle="selectedTransaction.hex">
                <template v-slot:append>
                  <v-btn variant="text" icon="content_copy"
                    @click="copyToClipboard(selectedTransaction.hex, 'Raw transaction copied')" />
                </template>
              </v-card>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <h5 class="text-body-1 font-weight-bold">Transaction breakdown</h5>
              <v-data-table density="compact" :headers="transactionPartsHeaders" :items="transactionParts"
                class="elevation-1" dense>
                <template v-slot:item.name="{ item }">
                  <span class="text-caption text-no-wrap">{{ item.name }}</span>
                </template>

                <template v-slot:item.value="{ item }">
                  <div v-if="item.txid">
                    <p class="text-caption">TxID: {{ item.txid }}</p><br />
                    <p class="text-caption">Vout: {{ item.vout }}</p><br />
                    <p class="text-caption">ScriptSig: {{ item.scriptSig }}</p><br />
                    <p class="text-caption">Sequence: {{ item.sequence }}</p>
                  </div>
                  <div v-else-if="item.scriptPubKey">
                    <p class="text-caption">Value: {{ item.value }}</p><br />
                    <p class="text-caption">ScriptPubKey: {{ item.scriptPubKey }}</p>
                  </div>
                  <div v-else-if="item.witness">
                    <p class="text-caption">Witness: {{ item.witness }}</p>
                  </div>
                  <div v-else>
                    <p class="text-caption">{{ item.value }}</p>
                  </div>
                </template>

                <template v-slot:item.bytes="{ item }">
                  <p class="text-caption">{{ item.bytes }}</p>
                </template>
              </v-data-table>
            </v-col>
          </v-row>
        </div>
        <div v-else>
          <p>No selected transaction or incomplete data</p>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { SnackbarType, TxInput, TxOutput } from '../types/types.d';
import Header from '@components/Header.vue';
import VChart from 'vue-echarts';
import { useTheme } from 'vuetify/lib/framework.mjs';

import { use } from 'echarts/core';
import { GraphChart } from 'echarts/charts';
import { TooltipComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { formatAddress, formatTimestamp } from '@utils/utils';
import { useTransactionStore } from '@stores/transactionStore';
import { useConnectionStore } from '@stores/connectionStore';
import { useSettingsStore } from '@stores/settingsStore';
import { useUIStore } from '@stores/uiStore';
use([GraphChart, TooltipComponent, TitleComponent, CanvasRenderer]);

const transactionStore = useTransactionStore();
const connnectionStore = useConnectionStore();
const settingsStore = useSettingsStore();
const uiStore = useUIStore();
const route = useRoute();
const txId = route.params.txid as string;
const theme = useTheme();

const loading = ref(true);
const selectedTransaction = computed(() => transactionStore.selectedTransaction);

const currentBlockHeight = computed(() => {
  return connnectionStore.blockHeader?.blockHeight ?? 0;
});

const transactionPartsHeaders = [
  { text: 'Nombre', value: 'name' },
  { text: 'Valor', value: 'value' },
  { text: 'Bytes', value: 'bytes' },
];

const transactionParts = computed(() => {
  return selectedTransaction.value?.parts || [];
});

const txConfirmations = computed(() => {
  if (
    currentBlockHeight.value !== undefined &&
    selectedTransaction.value &&
    typeof selectedTransaction.value.blockHeight === 'number'
  ) {
    return currentBlockHeight.value - selectedTransaction.value.blockHeight + 1;
  }
  return 0;
});

const transactionStats = computed(() => {
  if (!selectedTransaction.value) return [];
  return [
    // { label: 'Timestamp', value: formatTimestamp(selectedTransaction.value.timestamp) },
    { label: 'Net value', value: `${settingsStore.formatSats(selectedTransaction.value.timestamp)}` },
    { label: 'Fee', value: settingsStore.formatSats(selectedTransaction.value.fee) },
    { label: 'Virtual size', value: `${selectedTransaction.value.size || 'N/A'} vBytes` },
    { label: 'Weight', value: `${selectedTransaction.value.weight || 'N/A'} bytes` },
    { label: 'Version', value: selectedTransaction.value.version ?? 'N/A' },
    { label: 'Block height', value: selectedTransaction.value.blockHeight ?? 'Pending transaction' },
    { label: 'Locktime', value: selectedTransaction.value.locktime ?? 'N/A' },
    { label: 'Confirmations', value: txConfirmations },
    { label: 'Inputs', value: selectedTransaction.value.inputs.length },
    { label: 'Outputs', value: selectedTransaction.value.outputs.length },
  ];
});

const graphOption = computed(() => {
  if (
    !selectedTransaction.value ||
    !Array.isArray(selectedTransaction.value.inputs) ||
    !Array.isArray(selectedTransaction.value.outputs)
  ) {
    return {};
  }

  const nodes = [];
  const links = [];
  const totalTransactionValue = selectedTransaction.value.outputs.reduce(
    (sum: number, output: TxOutput) => sum + (output.value || 0),
    0
  );

  nodes.push({
    id: selectedTransaction.value.txId,
    name: `<b>ID Tx:</b><br/> ${selectedTransaction.value.txId}`,
    symbolSize: 20,
    value: totalTransactionValue,
    itemStyle: {
      color: theme.global.current.value.colors['primary'],
    },
    symbolOffset: [0, 0],
  });

  selectedTransaction.value.inputs.forEach((input: TxInput, index: number) => {
    const nodeId = `Input${index}`;
    nodes.push({
      id: nodeId,
      name: `<b>Input ${index + 1}:</b><br/> ${input.txid}[${input.index}]`,
      symbolSize: 30,
      value: input.value || 0,
      itemStyle: {
        color: theme.global.current.value.colors.secondary,
        borderWidth: 2,
      },
      symbolOffset: [0, 0],
    });

    links.push({
      source: nodeId,
      target: selectedTransaction.value?.txId,
      value: input.value || 0,
      lineStyle: {
        width: 2,
        color: theme.global.current.value.colors.secondary,
      },
      symbol: ['none', 'arrow'],
      symbolSize: [0, 8],
      symbolOffset: [0, '50%'],
    });
  });

  selectedTransaction.value.outputs.forEach((output: TxOutput, index: number) => {
    const nodeId = `Output${index}`;
    const isChange = output.isUtxoChange;
    const isMyUtxo = output.isMyUtxo;

    nodes.push({
      id: nodeId,
      name: `<b>Output ${index + 1} ${isMyUtxo ? '(UTXO)' : ''}</b></br> ${output.address}`,
      symbolSize: 20,
      symbol: isMyUtxo ? 'rect' : 'circle',
      symbolRotate: isMyUtxo ? 45 : 0,
      value: output.value || 0,
      label: {
        show: isMyUtxo || isChange,
        formatter: isChange
          ? '☢️'
          : isMyUtxo
            ? '💎'
            : '',
        position: 'outside',
        fontSize: 20,
        color: isChange
          ? '#FFFFFF'
          : isMyUtxo
            ? theme.global.current.value.colors.surface
            : '#FFFFFF',
      },
      itemStyle: {
        color:
          isMyUtxo
            ? theme.global.current.value.colors.primary
            : theme.global.current.value.colors['surface-2'],
        borderColor:
          isMyUtxo
            ? theme.global.current.value.colors.primary
            : theme.global.current.value.colors['surface-2'],
        borderWidth: 2,
      },
    });

    links.push({
      source: selectedTransaction.value?.txId,
      target: nodeId,
      value: output.value || 0,
      lineStyle: {
        color:
          isMyUtxo
            ? theme.global.current.value.colors.primary
            : theme.global.current.value.colors['surface-2'],
        width: 2,
      },
      symbol: ['none', 'arrow'],
      symbolSize: [0, 8],
    });
  });

  const fee = settingsStore.formatSats(selectedTransaction.value.fee);

  nodes.push({
    id: 'Fee',
    name: `<b>Fee</b>`,
    symbolSize: 20,
    value: fee,
    itemStyle: {
      color: theme.global.current.value.colors['surface-2'],
    },
    label: {
      show: true,
      formatter: 'Fee',
      position: 'outside',
      fontSize: 14,
      color: '#FFFFFF',
      backgroundColor: theme.global.current.value.colors['surface-2'],
      padding: [4, 6],
      borderRadius: 4,
    },
    symbolOffset: [0, 0],
  });

  links.push({
    source: selectedTransaction.value.txId,
    target: 'Fee',
    value: fee,
    lineStyle: {
      color: theme.global.current.value.colors['surface-2'],
      width: 2,
    },
    symbol: ['none', 'arrow'],
    symbolSize: [0, 8],
  });

  return {
    tooltip: {
      confine: true,
      trigger: 'item',
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          return `<div class="text-caption"><b>Value</b><br/> ${settingsStore.formatSats(
            params.data.value
          )}<br/>${params.data.name}</div>`;
        } else if (params.dataType === 'edge') {
          return `Transferido: ${settingsStore.formatSats(params.data.value)}`;
        }
      },
      textStyle: { color: '#fff' },
      backgroundColor: theme.global.current.value.colors.surface,
      borderColor: 'transparent',
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        draggable: true,
        data: nodes,
        links: links,
        roam: false,
        label: false,
        lineStyle: {
          curveness: 0.15,
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 10,
          },
        },
        force: {
          repulsion: 500,
          edgeLength: [50, 75],
          gravity: 0.2
        },
        zoom: 1,
        symbolSize: 50,
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [0, 10],
      },
    ],
  };
});

const copyToClipboard = async (content: string, message: string) => {
  await navigator.clipboard.writeText(content);
  uiStore.setSnackbar(message, SnackbarType.Success);
};

const getOutputEmoji = (output: TxOutput): string => {
  if (output.isUtxoChange) {
    return '☢️';
  } else if (output.isMyUtxo) {
    return '💎';
  } else {
    return '';
  }
};

const getOutputStyle = (output: TxOutput) => {
  return {
    color:
      output.isMyUtxo
        ? theme.current.value.colors.primary
        : '#FFFFFF',
  };
};

onMounted(async () => {
  try {
    const details = await transactionStore.fetchTransactionDetails(txId);

    transactionStore.addTransactionDetails(txId, {
      txId,
      size: details.size,
      weight: details.weight,
      version: details.version,
      locktime: details.locktime,
      blockHeight: details.blockHeight,
      inputs: details.inputs,
      outputs: details.outputs.map((output: TxOutput) => ({
        ...output,
        nextTxid: output.nextTxid || null,
      })),
      fee: details.fee,
      netReceived: details.netReceived,
      timestamp: details.timestamp,
      hex: details.hex,
      parts: details.parts,
    });
    transactionStore.setSelectedTxId(txId);
  } catch (error) {
    uiStore.setSnackbar('Error loading transaction details.', SnackbarType.Error);
  } finally {
    loading.value = false;
  }
});

// watch(selectedTransaction, (newVal) => {
//   if (newVal) {
//     console.log('Detalles de la transacción seleccionada:', newVal);
//   }
// });

</script>

<style lang="scss">
.transaction-graph {
  height: 350px;
}

.transaction-card__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}

.transaction-detail__card {
  .v-card-subtitle {
    text-overflow: initial;
    white-space: normal !important;
  }
}
</style>