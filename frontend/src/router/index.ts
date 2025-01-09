import { createRouter, createWebHistory } from 'vue-router';
import Wallet from '@views/Wallet.vue';
import CollectionManager from '@views/CollectionManager.vue';
import Mempool from '@views/Mempool.vue';
import Settings from '@views/Settings.vue';
import SelectedUtxos from '@views/SelectedUtxos.vue';
import Addresses from '@views/Addresses.vue';
import Stats from '@views/Stats.vue';
import Wiki from '@views/Wiki.vue';
import Transactions from '@views/Transactions.vue';
import About from '@views/About.vue';
import TransactionDetails from '@views/TransactionsDetails.vue';
import Terminal from '@views/Terminal.vue';
import { useWalletStore } from '@stores/walletStore';
import { useConnectionStore } from '@stores/connectionStore';

const routes = [
    {
        path: '/',
        name: 'Wallet',
        component: Wallet,
    },
    {
        path: '/collections',
        name: 'CollectionManager',
        component: CollectionManager,
    },
    {
        path: '/mempool',
        name: 'Mempool',
        component: Mempool,
    },
    {
        path: '/addresses',
        name: 'Addresses',
        component: Addresses,
    },
    {
        path: '/settings',
        name: 'Settings',
        component: Settings,
    },
    {
        path: '/selected-utxos',
        name: 'SelectedUTXOs',
        component: SelectedUtxos,
    },
    {
        path: '/stats',
        name: 'Stats',
        component: Stats,
    },
    {
        path: '/wiki',
        name: 'Wiki',
        component: Wiki,
    },
    {
        path: '/transactions',
        name: 'Transactions',
        component: Transactions,
    },
    {
        path: '/terminal',
        name: 'Terminal',
        component: Terminal,
    },
    {
        path: '/transaction/:txid',
        name: 'TransactionDetails',
        component: TransactionDetails,
    },
    {
        path: '/about',
        name: 'About',
        component: About,
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.VITE_BASE_URL),
    routes,
});

router.beforeEach((to, from, next) => {
    const walletStore = useWalletStore();
    const connectionStore = useConnectionStore();
    const allowWithoutConnection = [
        'Settings',
        'About',
        'Wiki',
        'Console',
        'CollectionManager',
    ];
    const requiresUtxos = ['Wallet', 'Stats'];
    const requiresTransactions = ['Transactions'];
    const requiresAddresses = ['Addresses'];

    const selectedWallet = walletStore.selectedWallet;
    const hasUtxos = selectedWallet && selectedWallet.utxos.size > 0;
    const hasTransactions =
        selectedWallet && selectedWallet.transactions.length > 0;
    const hasAddresses =
        selectedWallet &&
        (selectedWallet.externalAddresses.length > 0 ||
            selectedWallet.internalAddresses.length > 0);

    const routeName = to.name as string;

    if (!connectionStore.isConnected && !allowWithoutConnection.includes(routeName)) {
        next({ name: 'Settings', query: { tab: 'connection' } });
    } else if (requiresUtxos.includes(routeName) && !hasUtxos) {
        next({ name: 'Settings', query: { tab: 'connection' } });
    } else if (requiresTransactions.includes(routeName) && !hasTransactions) {
        next({ name: 'Settings', query: { tab: 'connection' } });
    } else if (requiresAddresses.includes(routeName) && !hasAddresses) {
        next({ name: 'Settings', query: { tab: 'connection' } });
    } else {
        next();
    }
});

export default router;
