<template>
    <v-row>
        <v-col>
            <v-chart :option="lineChartOptions" autoresize ref="lineChartRef" :style="{ height: '400px' }" />
        </v-col>
    </v-row>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { use } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import VChart from 'vue-echarts';
import { useTheme } from 'vuetify/lib/framework.mjs';
import { adjustColorOpacity } from '@utils/utils';
import { useTransactionStore } from '@stores/transactionStore';

use([LineChart, GridComponent, TooltipComponent, TitleComponent, LegendComponent, CanvasRenderer]);

const lineChartRef = ref(null);
const transactionsStore = useTransactionStore();
const theme = useTheme();

const transactionsData = computed(() => {
    return transactionsStore.transactions
        .filter(tx => tx.fee)
        .sort((a, b) => a.height - b.height)
        .map(tx => {
            return {
                blockHeight: tx.height,
                fee: tx.fee,
                date: new Date(tx.timestamp).toLocaleDateString(),
            };
        });
});

const lineChartOptions = computed(() => {
    return {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
            },
            formatter: params => `Block: ${params[0].data.blockHeight}<br/>Fee: ${params[0].data.fee} sats`,
            textStyle: { color: '#fff' },
            backgroundColor: theme.global.current.value.colors.surface,
            borderColor: 'transparent'
        },
        xAxis: {
            type: 'category',
            data: transactionsData.value.map(item => `Block ${item.blockHeight}`),
            axisLabel: {
                show: true,
            },
        },
        yAxis: {
            type: 'value',
            name: 'Fee (sats)',
            splitLine: {
                show: true,
                lineStyle: {
                    color: adjustColorOpacity(theme.global.current.value.colors.primary, 0.2),
                    width: 1,
                    type: 'dashed',
                },
            },
            axisLine: {
                show: false,
            },
        },
        series: [
            {
                name: 'Transaction Fees',
                type: 'line',
                data: transactionsData.value.map(item => item.fee),
                smooth: false,
                lineStyle: {
                    color: adjustColorOpacity(theme.global.current.value.colors.primary, 0.7),
                    width: 2,
                },
                itemStyle: {
                    color: adjustColorOpacity(theme.global.current.value.colors.primary, 0.7),
                    borderColor: adjustColorOpacity(theme.global.current.value.colors.primary, 0.7),
                    borderWidth: 2,
                },
            },
        ],
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
        },
    };
});
</script>

<style scoped>
.line-chart {
    width: 100%;
}
</style>
