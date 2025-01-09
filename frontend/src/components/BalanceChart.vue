<template>
    <v-chart class="balance-chart" :option="stepLineOption" autoresize ref="chartRef" :style="{ height: height }" />
</template>

<script setup>
import { computed, ref, watchEffect, onMounted } from 'vue';
import { use } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import VChart from 'vue-echarts';
import { useTheme } from 'vuetify/lib/framework.mjs';
import { adjustColorOpacity } from '@utils/utils';
import { useUtxoStore } from '@stores/utxoStore';

use([LineChart, GridComponent, TooltipComponent, TitleComponent, LegendComponent, CanvasRenderer]);

const props = defineProps({
    height: {
        type: String,
        default: '400px',
    },
    compact: {
        type: Boolean,
        default: false,
    },
});

const chartRef = ref(null);
const utxoStore = useUtxoStore();
const theme = useTheme();
const primaryColor = theme.global.current.value.colors.primary;

const balanceOverTime = computed(() => {
    let balance = 0;
    const balanceHistory = [];
    const utxosSortedByHeight = Array.from(utxoStore.utxos.values()).sort((a, b) => a.height - b.height);

    utxosSortedByHeight.forEach((utxo) => {
        balance += utxo.value;
        balanceHistory.push({
            height: utxo.height,
            balance,
        });
    });

    return balanceHistory;
});

const stepLineOption = computed(() => {
    return {
        tooltip: {
            trigger: 'item',
            axisPointer: props.compact
                ? { type: 'none' }
                : { type: 'cross' },
            textStyle: { color: '#fff' },
            backgroundColor: theme.global.current.value.colors.surface,
            borderColor: 'transparent',
        },
        xAxis: {
            show: !props.compact,
            type: 'category',
            data: balanceOverTime.value.map(item => `Block ${item.height}`),
            axisLabel: {
                show: !props.compact,
            },
        },
        yAxis: {
            show: !props.compact,
            type: 'value',
            splitLine: !props.compact
                ? {
                    show: true,
                    lineStyle: {
                        color: adjustColorOpacity(primaryColor, 0.2),
                        width: 1,
                        type: 'dashed',
                    },
                }
                : null,
            axisLine: {
                show: false,
            },
        },
        series: [
            {
                name: 'Balance',
                type: 'line',
                step: 'start',
                symbol: props.compact ? 'none' : 'circle',
                data: balanceOverTime.value.map(item => item.balance),
                smooth: false,
                lineStyle: {
                    color: adjustColorOpacity(primaryColor, 0.7),
                    width: 2,
                },
                itemStyle: {
                    color: adjustColorOpacity(primaryColor, 0.7),
                    borderColor: adjustColorOpacity(primaryColor, 0.7),
                    borderWidth: props.compact ? 1 : 2,
                },
                animation: !props.compact,
                animationDuration: props.compact ? 0 : 1000,
                animationEasing: props.compact ? 'linear' : 'cubicOut',
            },
        ],
        grid: props.compact
            ? {
                left: '0%',
                right: '0%',
                top: '0%',
                bottom: '0%',
                containLabel: false,
            }
            : {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true,
            },
    };
});

onMounted(() => {
    watchEffect(() => {
        const chartElement = chartRef.value?.$el;

        if (chartElement && chartElement.clientHeight > 0 && chartElement.clientWidth > 0) {
            chartRef.value?.resize();
        }
    });
});
</script>

<style scoped>
.balance-chart {
    width: 100%;
}
</style>
