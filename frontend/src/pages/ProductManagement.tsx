import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Product } from '../db/db';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ProductManagement: React.FC = () => {
    const products = useLiveQuery(() => db.products.toArray(), []) || [];
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'Main',
        taxGroup: 'VAT_standard' as 'VAT_standard' | 'VAT_exempt',
        stockQuantity: '0',
        lowStockThreshold: '10',
        unit: 'item'
    });

    const resetForm = () => {
        setFormData({
            name: '',
            price: '',
            category: 'Main',
            taxGroup: 'VAT_standard',
            stockQuantity: '0',
            lowStockThreshold: '10',
            unit: 'item'
        });
        setEditingProduct(null);
        setIsAddModalOpen(false);
    };

    // Refresh local IndexedDB from backend
    const refreshLocalProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/sync/products`);
            if (response.ok) {
                const backendProducts = await response.json();
                const mappedProducts = backendProducts.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    category: p.category,
                    taxGroup: p.tax_group,
                    stockQuantity: p.stock_quantity,
                    lowStockThreshold: p.low_stock_threshold,
                    unit: p.unit
                }));
                await db.products.clear();
                await db.products.bulkAdd(mappedProducts);
            }

        } catch (error) {
            console.error('Failed to refresh products:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        // Backend expects snake_case
        const backendPayload = {
            name: formData.name,
            price: parseFloat(formData.price),
            category: formData.category,
            tax_group: formData.taxGroup,
            stock_quantity: parseInt(formData.stockQuantity),
            low_stock_threshold: parseInt(formData.lowStockThreshold),
            unit: formData.unit
        };

        try {
            let response;
            if (editingProduct) {
                // UPDATE existing product
                response = await fetch(`${API_URL}/products/${editingProduct.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(backendPayload)
                });
            } else {
                // CREATE new product
                response = await fetch(`${API_URL}/products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(backendPayload)
                });
            }

            if (response.ok) {
                // Refresh local IndexedDB from backend to stay in sync
                await refreshLocalProducts();
                resetForm();
            } else {
                const errorText = await response.text();
                console.error('Failed to save product:', errorText);
                alert('Failed to save product to server');
            }
        } catch (error) {
            console.error('Failed to save product:', error);
            alert('Failed to save product - server may be offline');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (product: Product) => {
        setFormData({
            name: product.name,
            price: product.price.toString(),
            category: product.category,
            taxGroup: product.taxGroup,
            stockQuantity: (product.stockQuantity || 0).toString(),
            lowStockThreshold: (product.lowStockThreshold || 10).toString(),
            unit: product.unit || 'item'
        });
        setEditingProduct(product);
        setIsAddModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await fetch(`${API_URL}/products/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    await refreshLocalProducts();
                } else {
                    alert('Failed to delete product from server');
                }
            } catch (error) {
                console.error('Failed to delete product:', error);
                alert('Failed to delete product - server may be offline');
            }
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                    <FaPlus /> <span>Add Product</span>
                </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax Group</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 text-xs bg-gray-100 rounded-full">{product.category}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-primary font-semibold">₵{product.price.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs rounded-full ${(product.stockQuantity || 0) <= (product.lowStockThreshold || 10)
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-green-100 text-green-800'
                                        }`}>
                                        {product.stockQuantity || 0} {product.unit || 'item'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.taxGroup}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="text-blue-600 hover:text-blue-900 p-2"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id!)}
                                        className="text-red-600 hover:text-red-900 p-2"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                                    No products yet. Add your first product!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="e.g., Jollof Rice"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₵)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="45.00"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="Main">Main</option>
                                    <option value="Side">Side</option>
                                    <option value="Drinks">Drinks</option>
                                    <option value="Dessert">Dessert</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Group</label>
                                <select
                                    value={formData.taxGroup}
                                    onChange={(e) => setFormData({ ...formData, taxGroup: e.target.value as 'VAT_standard' | 'VAT_exempt' })}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="VAT_standard">VAT Standard</option>
                                    <option value="VAT_exempt">VAT Exempt</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                                    <input
                                        type="number"
                                        value={formData.stockQuantity}
                                        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="0"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert</label>
                                    <input
                                        type="number"
                                        value={formData.lowStockThreshold}
                                        onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="10"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full flex items-center justify-center space-x-2 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaSave /> <span>{isSaving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;
