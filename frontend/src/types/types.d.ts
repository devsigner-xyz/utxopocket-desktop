import 'vue-router';

declare module 'vue-router' {
    interface RouteMeta {
        showBottomControls?: boolean;
    }
}

export interface Wallet {
    id: string;
    name: string;
    descriptor: string;
    utxos: Map<string, UTXO>;
    labels: BIP329Label[];
    collections: Collection[];
    transactions: Transaction[];
    externalAddresses: string[];
    internalAddresses: string[];
    selectedUtxos: UTXO[];
    balance?: number;
}

export interface UTXO {
    // Backend computed proporetis
    txid: string;
    value: number;
    scriptPubKey: string;
    vout: number;
    address: string;
    height: number;
    timestamp: number;
    locked: boolean;
    isReused: boolean;
    isUtxoChange: boolean;

    // Frontend properties
    label?: string;
    hasLabel?: boolean;
    selected: boolean;
    labelText?: string;
    collection?: Collection;
    collectionAvatar?: string;
}

// export interface UTXO {
// 	txid: string;
// 	vout: number;
// 	address: string;
// 	scriptPubKey: string;
// 	amount: number;
// 	time: number;
// 	blocktime: number;
// 	selected: boolean;
// 	locked: boolean;
// 	tags?: string[];
// }

export interface BIP329Label {
    type: string;
    // type: 'tx' | 'addr' | 'pubkey' | 'input' | 'output' | 'xpub';
    ref: string;
    label: string;
    spendable?: boolean;
}

interface Collection {
    id: number;
    name: string;
    utxoKeys: string[];
    avatar: string;
}

export interface ServerPreset {
    host: string;
    port: number;
    ssl: boolean;
}

export interface TxInput {
    txid: string;
    index: number;
    script: string;
    sequence: number;
    value: number;
    address?: string;
    // value?: number;
}

export enum SnackbarType {
    Success = 'success',
    Error = 'error',
    Info = 'info',
    Warning = 'warning',
    None = '',
}

export interface Snackbar {
    message: string;
    type: SnackbarType;
}

export interface BlockHeader {
    blockHeight: number | null;
    blockTime: number;
    blockHash: string;
}

export interface TxOutput {
    value: number;
    scriptPubKey: string;
    address: string | null;
    isUtxoChange: boolean;
    isMyUtxo: boolean;
    nextTxid?: string | null;
}

export interface TransactionPart {
    name: string;
    value?: string | number;
    bytes: string;
    txid?: string;
    vout?: number;
    scriptSig?: string;
    sequence?: number;
    scriptPubKey?: string;
    witness?: string;
}

export interface Transaction {
    txId: string;
    version: number;
    locktime: number;
    size: number;
    weight: number;
    netReceived: number;
    inputs: TxInput[];
    outputs: TxOutput[];
    blockHeight: number | null;
    timestamp: number;
    label?: string;
    fee: number;
    hex: string;
    parts: TransactionPart[];
}

export type SelectionPreference =
    | 'oldest_first'
    | 'newest_first'
    | 'smallest_first'
    | 'largest_first';

export type NetworkType = 'testnet' | 'mainnet';

export interface ConnectNodePayload {
    host: string;
    port: number;
    ssl: boolean;
    network: NetworkType;
}