import Dexie, { type Table } from 'dexie';

export interface Product {
    id?: number;
    name: string;
    price: number;
    category: string;
    taxGroup: 'VAT_standard' | 'VAT_exempt';
    stockQuantity?: number;
    lowStockThreshold?: number;
    unit?: string;
}

export interface OrderItem {
    productId: number;
    name: string;
    price: number;
    quantity: number;
    taxAmount: number;
}

export interface Order {
    id?: number; // Local ID
    backendId?: string; // ID from server once synced
    items: OrderItem[];
    totalAmount: number;
    totalTax: number;
    status: 'pending' | 'completed' | 'void';
    paymentMethod: 'cash' | 'momo';
    amountTendered?: number;
    changeDue?: number;
    referenceNumber?: string;
    createdAt: Date;
    synced: boolean;
}

export interface SyncQueueItem {
    id?: number;
    type: 'order' | 'product_update';
    payload: any;
    status: 'pending' | 'failed';
    retryCount: number;
}

class RestaurantDatabase extends Dexie {
    products!: Table<Product>;
    orders!: Table<Order>;
    syncQueue!: Table<SyncQueueItem>;

    constructor() {
        super('RestaurantDB');
        this.version(1).stores({
            products: '++id, name, category, taxGroup',
            orders: '++id, backendId, status, paymentMethod, createdAt, synced',
            syncQueue: '++id, status'
        });
    }
}

export const db = new RestaurantDatabase();
