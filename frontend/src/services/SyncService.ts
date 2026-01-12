import { db } from '../db/db';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const SyncService = {
    async syncOrders() {
        try {
            const unsyncedOrders = await db.orders.filter(order => !order.synced).toArray();

            console.log(`[SyncService] Found ${unsyncedOrders.length} unsynced orders`);
            if (unsyncedOrders.length === 0) return;

            console.log(`Syncing ${unsyncedOrders.length} orders...`, unsyncedOrders);

            // Adapt local order to backend schema if needed
            // Backend expects: id (str), items, total_amount, etc.
            // Local has: id (number), backendId (string), ...
            // We need to generate a UUID for the backend if we only have a local ID? 
            // Or assume backend generates it?
            // The backend `sync.py` honors the ID sent. 
            // We should ideally have a UUID for offline creation.
            // For now, let's just send what we have and let the backend handle it or
            // if we need to map fields:
            const payload = unsyncedOrders.map(o => ({
                id: o.backendId || `temp_${o.id}`, // Fallback if no UUID
                items: o.items, // Backend expects dicts, strictly needs matching keys
                total_amount: o.totalAmount,
                total_tax: o.totalTax,
                status: o.status,
                payment_method: o.paymentMethod,
                created_at: o.createdAt
            }));

            const response = await fetch(`${API_URL}/sync/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // Mark as synced
                const ids = unsyncedOrders.map(o => o.id!);
                if (ids.length > 0) {
                    await db.orders.where('id').anyOf(ids).modify({ synced: true });
                }
                console.log('Sync successful');
            } else {
                console.error('Sync failed', await response.text());
            }
        } catch (error) {
            console.error('Sync error (network likely down)', error);
        }
    },

    async syncProducts() {
        try {
            const response = await fetch(`${API_URL}/sync/products`);
            if (response.ok) {
                const products = await response.json();
                // products from backend: {id, name, price, category, tax_group}
                // local DB: {id, name, price, category, taxGroup}

                const mappedProducts = products.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    category: p.category,
                    taxGroup: p.tax_group // Map snake_case to camelCase
                }));

                // Clear existing products and replace with backend data (source of truth)
                await db.products.clear();
                await db.products.bulkAdd(mappedProducts);
                console.log(`Synced ${mappedProducts.length} products (replaced local data)`);
            }
        } catch (error) {
            console.error('Product sync failed', error);
        }
    },

    async startBackgroundSync(intervalMs: number = 60000) {
        // Run immediately
        await this.syncProducts(); // Pull config/products first
        await this.syncOrders();

        // Then interval
        setInterval(async () => {
            await this.syncOrders();
            await this.syncProducts();
        }, intervalMs);
    }
};
