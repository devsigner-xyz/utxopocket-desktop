<template>
    <v-container fluid class="d-flex flex-column fill-height pa-4">
        <v-card class="flex-grow-1 d-flex flex-column">
            <v-toolbar flat>
                <v-toolbar-title>Terminal</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn color="error" @click="dialog = true">Clear Logs</v-btn>
            </v-toolbar>
            <v-divider></v-divider>
            <div class="flex-grow-1 overflow-auto terminal-box pa-2">
                <div ref="terminalContainer" style="height: 100%; width: 100%;"></div>
            </div>
            <v-divider />
            <v-card-subtitle class="d-flex justify-space-between align-center">
                <span>Logs count: {{ logsStore.logs.length }}</span>
                <span>Disk usage: {{ formatSize(logsStore.logSize) }}</span>
            </v-card-subtitle>
        </v-card>
        <v-dialog v-model="dialog" max-width="500px">
            <v-card>
                <v-card-title>Confirm</v-card-title>
                <v-card-text>
                    Are you sure you want to clear all logs?
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
                    <v-btn color="error" variant="text" @click="clearLogsConfirmed">Clear</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, onActivated, ref, watch } from 'vue';
import { Terminal } from '@xterm/xterm';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { FitAddon } from '@xterm/addon-fit';
import { useLogsStore } from '@stores/logsStore';

/**
 * Formats bytes into a human-readable string.
 * @param bytes The number of bytes
 * @returns A formatted string, e.g. "512 B", "1.00 KB", "1.00 MB"
 */
function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(2) + ' KB';
    const mb = kb / 1024;
    return mb.toFixed(2) + ' MB';
}

/**
 * Clears the logs after user confirmation.
 */
function clearLogsConfirmed(): void {
    logsStore.clearLogs();
    dialog.value = false;
}

const logsStore = useLogsStore();
const dialog = ref(false);
const terminalContainer = ref<HTMLElement | null>(null);
let terminal: Terminal;

/**
 * Initializes the terminal instance and starts the logs stream.
 */
onMounted(() => {
    terminal = new Terminal({
        convertEol: true,
        cursorBlink: true
    });

    const webLinksAddon = new WebLinksAddon();
    terminal.loadAddon(webLinksAddon);

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    if (terminalContainer.value) {
        terminal.open(terminalContainer.value);
        fitAddon.fit();
    }

    for (const entry of logsStore.logs) {
        terminal.write(entry + '\r\n');
    }
});


onActivated(() => {
    if (terminal) {
        terminal.clear();
        for (const entry of logsStore.logs) {
            terminal.write(entry + '\r\n');
        }
    }
});

/**
 * Stops the logs stream and disposes the terminal instance.
 */
onBeforeUnmount(() => {
    logsStore.stopLogsStream();
    terminal.dispose();
});

/**
 * Watches for new logs and writes them to the terminal.
 */
watch(
    () => logsStore.logs,
    (newLogs, oldLogs) => {
        const newEntries = newLogs.slice(oldLogs.length);
        for (const entry of newEntries) {
            terminal.write(entry + '\r\n');
        }
    }
);
</script>

<style scoped>
.terminal-box {
    background: #1e1e1e;
    color: #d4d4d4;
    font-family: monospace;
    font-size: 14px;
    white-space: pre-wrap;
    word-break: break-word;
}
</style>
