import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useLogsStore = defineStore('logs', () => {
    let eventSource: EventSource | null = null;
    const logs = ref<string[]>([]);

    const addLog = (message: string) => {
        logs.value.push(message);
    };

    const clearLogs = () => {
        logs.value = [];
    };

    const logSize = computed(() => {
        return logs.value.reduce((acc, log) => acc + log.length, 0);
    });

    const startLogsStream = () => {
        if (eventSource) {
            eventSource.close();
        }
        eventSource = new EventSource('/api/logs/stream');
        eventSource.onmessage = (event) => {
            const logMessage = event.data;
            addLog(logMessage);
        };
        eventSource.onerror = () => {
            console.error('Error in logs SSE');
        };
    };

    const stopLogsStream = () => {
        if (eventSource) {
            eventSource.close();
            eventSource = null;
        }
    };

    return {
        logs,
        logSize,
        addLog,
        clearLogs,
        startLogsStream,
        stopLogsStream,
    };
});
