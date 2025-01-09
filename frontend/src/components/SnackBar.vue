<template>
	<v-snackbar v-model="snackbarVisible" :timeout="3000" :color="snackbar.type">
		{{ snackbar.message }}
	</v-snackbar>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useUIStore } from '@stores/uiStore';

const uiStore = useUIStore();

const snackbar = computed(() => uiStore.snackbar);
const snackbarVisible = computed({
	get: () => !!snackbar.value.message,
	set: (val: boolean) => {
		if (!val) {
			uiStore.clearSnackbar();
		}
	},
});
</script>
