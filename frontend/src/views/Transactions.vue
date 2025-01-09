<template>
  <v-container fluid>
    <Header>
      <template v-slot:headerTitle>
        <v-app-bar-title>Transactions</v-app-bar-title>
      </template>
    </Header>
    <v-card>
      <template v-slot:text>
        <v-row v-if="transactions.length === 0" justify="center">
          <v-col class="text-center">
            <p>No transactions found.</p>
          </v-col>
        </v-row>
        <v-row v-else class="align-center">
          <v-col>
            {{ transactions.length }} transactions
            <span v-if="transactionRange">
              between {{ formatDate(transactions[0].timestamp, 'date') }} and
              {{ formatDate(transactions[transactions.length - 1].timestamp, 'date') }}
            </span>
          </v-col>
          <v-col cols="auto">
            <v-text-field :width="400" v-if="transactions.length" v-model="searchTransaction" label="Search"
              prepend-inner-icon="search" variant="filled" hide-details single-line density="compact" />
          </v-col>
        </v-row>
      </template>
      <v-data-table :headers="headers" :items="filteredTransactions" :items-per-page="25" :search="searchTransaction"
        :sort-by.sync="sortBy">
        <template v-slot:header.label="{ column }">
          <v-tooltip>
            <template v-slot:activator="{ props }">
              <th v-bind="props" class="d-flex align-center">
                {{ column.title }}
                <v-icon size="16" class="ml-1" icon="info" />
              </th>
            </template>
            <span>
              BIP-329 labels. More info on
              <a href="https://github.com/bitcoin/bips/blob/master/bip-0329.mediawiki" target="_blank"
                rel="noopener noreferrer">
                Bitcoin BIPs on GitHub
              </a>.
            </span>
          </v-tooltip>
        </template>
        <template v-slot:item="{ item }">
          <tr @click="goToTransactionDetails(item)" style="cursor: pointer;" class="text-caption">
            <td>{{ formatTimestamp(item.timestamp) }}</td>
            <td :title="item.txId">
              {{ item.txId ? truncateTxid(item.txId) : 'N/A' }}
            </td>
            <td>
              <span v-if="item.blockHeight !== null">
                {{ item.blockHeight }}
              </span>
              <span v-else>
                <v-chip size="small" color="primary">
                  Pending
                </v-chip>
              </span>
            </td>
            <td>
              <div v-if="item.label">
                <v-chip size="small" color="primary" @click.stop="openLabelDialog(item, true)">
                  {{ item.label }}
                </v-chip>
              </div>
              <v-btn v-else text="Add label" class="px-0" variant="plain" size="small"
                @click.stop="openLabelDialog(item)" />
            </td>
            <td class="w-auto">
              <v-chip size="small" :color="getTransactionColor(item.netReceived)">
                {{ settingsStore.formatSats(item.netReceived) }}
              </v-chip>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
    <v-dialog v-model="labelDialog" persistent max-width="400px">
      <v-card>
        <v-card-title>{{ labelDialogTitle }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="newLabel" label="Label" :rules="rules" required />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeLabelDialog">Cancel</v-btn>
          <v-btn v-if="isEditingLabel" variant="text" color="error" @click="deleteLabel">
            Delete
          </v-btn>
          <v-btn variant="text" color="primary" @click="saveLabel">
            {{ isEditingLabel ? 'Save' : 'Add' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { SnackbarType, Transaction, BIP329Label } from '../types/types.d';
import { useTheme } from 'vuetify/lib/framework.mjs';
import { formatDate, formatTimestamp } from '@utils/utils';
import { VTooltip, VIcon } from 'vuetify/components';
import Header from '@components/Header.vue';
import { useSettingsStore } from '@stores/settingsStore';
import { useWalletStore } from '@stores/walletStore';
import { useTransactionStore } from '@stores/transactionStore';
import { useUIStore } from '@stores/uiStore';
import { useLabelsStore } from '@stores/labelsStore';

interface SortItem {
  key: string;
  order?: boolean | 'asc' | 'desc';
}

const router = useRouter();
const theme = useTheme();
const searchTransaction = ref('');
const labelDialog = ref(false);
const newLabel = ref<string>('');
const isEditingLabel = ref(false);
const rules = [(v: string) => !!v || 'This field is required'];
const selectedTransaction = computed(() => transactionsStore.selectedTransaction);
const settingsStore = useSettingsStore();
const uiStore = useUIStore();
const labelsStore = useLabelsStore();
const walletStore = useWalletStore();
const transactionsStore = useTransactionStore();
const transactions = computed(() => {
  return walletStore.selectedWallet
    ? walletStore.selectedWallet.transactions.slice().sort((a, b) => b.timestamp - a.timestamp)
    : [];
});

const headers = [
  { title: 'Datetime', key: 'timestamp', sortable: true },
  { title: 'Transaction ID', key: 'txId', sortable: false },
  { title: 'Block height', key: 'blockHeight', sortable: false },
  { title: 'Label', key: 'label', sortable: true },
  { title: 'Value', key: 'netReceived', sortable: true },
];

const sortBy = ref<SortItem[]>([
  { key: 'timestamp', order: 'desc' },
]);

const filteredTransactions = computed(() => {
  return transactions.value.map((tx) => ({
    ...tx,
    label: transactionLabels.value[tx.txId] || '',
    blockHeight: tx.blockHeight || null,
    netReceived: tx.netReceived || 0,
  }));
});

const goToTransactionDetails = (transaction: Transaction) => {
  transactionsStore.setSelectedTxId(transaction.txId);
  router.push({
    name: 'TransactionDetails',
    params: { txid: transaction.txId },
  });
};

const labelDialogTitle = computed(() =>
  isEditingLabel.value ? 'Edit Label' : 'Add Label to Transaction',
);

const openLabelDialog = (transaction: Transaction, isEditing: boolean = false) => {
  transactionsStore.setSelectedTxId(transaction.txId);
  isEditingLabel.value = isEditing;

  if (isEditing) {
    const existingLabel = walletStore.selectedWallet?.labels.find(
      (l: BIP329Label) => l.ref === transaction.txId && l.type === 'tx',
    );
    newLabel.value = existingLabel ? existingLabel.label : '';
  } else {
    newLabel.value = '';
  }

  labelDialog.value = true;
};

const closeLabelDialog = () => {
  labelDialog.value = false;
  newLabel.value = '';
  isEditingLabel.value = false;
};

const saveLabel = () => {
  if (selectedTransaction.value && newLabel.value.trim() !== '') {
    const label: BIP329Label = {
      ref: selectedTransaction.value.txId,
      label: newLabel.value.trim(),
      type: 'tx',
    };
    labelsStore.addLabel(label);
    uiStore.setSnackbar('Label saved successfully!', SnackbarType.Success);
  }
  labelDialog.value = false;
  newLabel.value = '';
  isEditingLabel.value = false;
};

const deleteLabel = () => {
  if (selectedTransaction.value) {
    labelsStore.removeLabel(selectedTransaction.value.txId, 'tx');
    uiStore.setSnackbar('Label deleted successfully!', SnackbarType.Success);
  }
  labelDialog.value = false;
  newLabel.value = '';
  isEditingLabel.value = false;
};

const transactionRange = computed(() => {
  if (transactions.value.length === 0) return null;
  const first = formatDate(transactions.value[0].timestamp, 'date');
  const last = formatDate(transactions.value[transactions.value.length - 1].timestamp, 'date');
  return { first, last };
});

const transactionLabels = computed(() => {
  const labels = walletStore.selectedWallet?.labels || [];
  return labels.reduce((acc, label) => {
    if (label.type === 'tx') acc[label.ref] = label.label;
    return acc;
  }, {} as Record<string, string>);
});

const getTransactionColor = (value: number) => {
  return value >= 0 ? theme.current.value.colors.success : theme.current.value.colors.error;
};

const truncateTxid = (txid: string | undefined): string => {
  if (!txid) return 'N/A';
  if (txid.length <= 10) return txid;
  return `${txid.substring(0, 6)}...${txid.substring(txid.length - 4)}`;
};
</script>
