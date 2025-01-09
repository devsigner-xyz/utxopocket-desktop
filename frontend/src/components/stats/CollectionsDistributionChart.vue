<template>
    <v-chart class="doughnut-chart" :option="chartOptions" autoresize ref="chartRef" :style="{ height: '400px' }" />
</template>

<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue';
import { use } from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import VChart from 'vue-echarts';
import { useCollectionStore } from '../../stores/collectionStore';
import { useTheme } from 'vuetify';
import tinycolor from 'tinycolor2';

use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

const chartRef = ref(null);
const collectionsStore = useCollectionStore();
const theme = useTheme();

const collectionDistribution = computed(() => {
    const distribution = collectionsStore.collectionDetails.map((detail, index) => {
        let baseColor;
        if (detail.name === 'Unassigned') {
            baseColor = tinycolor('#808080');
        } else {
            baseColor = tinycolor(theme.global.current.value.colors.primary).spin(index * 30);
        }
        const colorWithAlpha = baseColor.setAlpha(0.1).toRgbString();

        return {
            name: detail.name,
            value: detail.percentage,
            itemStyle: {
                borderColor: baseColor.toHexString(),
                borderWidth: 1,
                color: colorWithAlpha,
            },
        };
    });

    return distribution;
});

const chartOptions = computed(() => {
    return {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {d}%',
            textStyle: { color: '#fff' },
            backgroundColor: theme.global.current.value.colors.surface,
            borderColor: 'transparent'
        },
        series: [
            {
                name: 'UTXOs by Collection',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    show: false,
                    position: 'center',
                },

                labelLine: {
                    show: false,
                },
                data: collectionDistribution.value,
            },
        ],
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
.doughnut-chart {
    width: 100%;
}
</style>
