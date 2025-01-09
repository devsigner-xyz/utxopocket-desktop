<template>
    <v-card>
        <v-card-text>
            <v-row class="justify-space-between" dense>
                <v-col cols="6">
                    <h3 class="mb-0">{{ selectedYear }} utxo heatmap</h3>
                </v-col>
                <v-col cols="auto">
                    <v-select v-model="selectedYear" :items="availableYears" label="Select Year" density="compact"
                        :width="150" :disabled="availableYears.length === 0" />
                </v-col>
                <v-col cols="12">
                    <v-chart class="utxo-heatmap" :option="heatmapOption" autoresize />
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import VChart from 'vue-echarts';
import * as echarts from 'echarts';
import { useTheme } from 'vuetify';
import tinycolor from 'tinycolor2';
import { useUtxoStore } from '@stores/utxoStore';

const utxosStore = useUtxoStore();
const theme = useTheme();
const selectedYear = ref(new Date().getFullYear());
const availableYears = ref([]);
const primaryColor = theme.global.current.value.colors.primary;

const getMaxUtxoValueForYear = (year) => {
    return Math.max(0, ...Array.from(utxosStore.utxos.values())
        .filter(utxo => new Date(utxo.timestamp * 1000).getFullYear() === year)
        .map(utxo => utxo.value));
};

const getUtxoDataForYear = (year) => {
    return Array.from(utxosStore.utxos.values())
        .filter(utxo => new Date(utxo.timestamp * 1000).getFullYear() === year)
        .map(utxo => [echarts.time.format(utxo.timestamp * 1000, '{yyyy}-{MM}-{dd}', false), utxo.value]);
};

const adjustColorOpacity = (hexColor, alpha) => {
    return tinycolor(hexColor).setAlpha(alpha).toRgbString();
}

const heatmapOption = ref({
    tooltip: {
        formatter: params => `Date: ${params.data[0]}<br/>Value: ${params.data[1]} sats`,
        textStyle: { color: '#fff' },
        backgroundColor: theme.global.current.value.colors.surface,
        borderColor: 'transparent'
    },
    visualMap: {
        min: 0,
        max: 10000,
        bottom: -24,
        type: 'continuous',
        orient: 'horizontal',
        left: 'center',
        inRange: {
            color: [adjustColorOpacity(primaryColor, 0.1), primaryColor],
        },
        textStyle: { color: '#fff' },
    },
    calendar: {
        dayLabel: { firstDay: 1, color: primaryColor },
        monthLabel: { color: primaryColor },
        cellSize: 16,
        left: 24,
        right: 24,
        top: 20,
        bottom: 20,
        range: [`${selectedYear.value}-01-01`, `${selectedYear.value}-12-31`],
        itemStyle: {
            color: adjustColorOpacity(primaryColor, 0),
            borderColor: adjustColorOpacity(primaryColor, 0.1),
            borderWidth: 1,
            shadowColor: 'rgba(0, 0, 0, 0)',
            shadowBlur: 2,
        },
        yearLabel: { show: false },
        splitLine: {
            show: false,
            // lineStyle: {
            //     color: theme.global.current.value.colors.primary,
            //     width: 1,
            //     type: 'solid',
            // },
        },
    },
    series: [
        {
            type: 'heatmap',
            coordinateSystem: 'calendar',
            data: getUtxoDataForYear(selectedYear.value),
            itemStyle: {
                borderRadius: 2,
            },
        },
    ],
});

const updateChart = () => {
    const maxUtxoValue = getMaxUtxoValueForYear(selectedYear.value);
    heatmapOption.value = {
        ...heatmapOption.value,
        series: [
            { ...heatmapOption.value.series[0], data: getUtxoDataForYear(selectedYear.value) },
        ],
        visualMap: { ...heatmapOption.value.visualMap, max: maxUtxoValue },
        calendar: {
            ...heatmapOption.value.calendar,
            range: [`${selectedYear.value}-01-01`, `${selectedYear.value}-12-31`],
        },
    };
};

onMounted(() => {
    const years = Array.from(utxosStore.utxos.values())
        .filter(utxo => typeof utxo.timestamp === 'number' && !isNaN(utxo.timestamp))
        .map(utxo => new Date(utxo.timestamp * 1000).getFullYear());
    availableYears.value = [...new Set(years)].sort((a, b) => b - a);
    if (availableYears.value.length > 0) {
        selectedYear.value = availableYears.value.includes(new Date().getFullYear())
            ? new Date().getFullYear()
            : availableYears.value[0];
    }
    updateChart();
});

watch(() => utxosStore.utxos, (newUtxos) => {
    const utxosArray = Array.from(newUtxos.values());
    const years = utxosArray
        .filter(utxo => typeof utxo.timestamp === 'number' && !isNaN(utxo.timestamp))
        .map(utxo => new Date(utxo.timestamp * 1000).getFullYear());
    availableYears.value = [...new Set(years)].sort((a, b) => b - a);
    if (!availableYears.value.includes(selectedYear.value)) {
        selectedYear.value = availableYears.value[0];
    }
    updateChart();
}, { immediate: true });

watch(selectedYear, () => {
    updateChart();
});
</script>

<style scoped>
.utxo-heatmap {
    /*width: 100%;*/
    height: 200px;
    padding: 0;
    margin: 0;
}
</style>
