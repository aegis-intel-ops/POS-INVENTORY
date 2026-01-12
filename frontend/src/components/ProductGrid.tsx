import React from 'react';
import { type Product } from '../db/db';

interface ProductGridProps {
    products: Product[];
    onAddToCart: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
            {products.map((product) => {
                const stock = product.stockQuantity ?? 0;
                const threshold = product.lowStockThreshold ?? 10;
                const isOutOfStock = stock <= 0;
                const isLowStock = !isOutOfStock && stock <= threshold;

                return (
                    <button
                        key={product.id}
                        onClick={() => !isOutOfStock && onAddToCart(product)}
                        disabled={isOutOfStock}
                        className={`border text-left p-4 rounded-xl shadow-sm transition-all flex flex-col justify-between h-40 relative overflow-hidden
                            ${isOutOfStock
                                ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
                                : 'bg-white hover:shadow-md hover:border-primary active:scale-95'
                            }
                        `}
                    >
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-gray-800 line-clamp-2 pr-2">{product.name}</h3>
                                {isLowStock && (
                                    <span className="flex-shrink-0 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
                                        Low: {stock}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mt-2 inline-block">
                                {product.category}
                            </span>
                        </div>

                        <div className="flex justify-between items-end">
                            <div className="font-bold text-primary text-lg">
                                ₵{product.price.toFixed(2)}
                            </div>
                            {isOutOfStock && (
                                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                                    OUT OF STOCK
                                </span>
                            )}
                        </div>
                    </button>
                );
            })}

            {/* Empty State Mockup */}
            {products.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center h-64 text-gray-400">
                    <p>No products found.</p>
                </div>
            )}
        </div>
    );
};

export default ProductGrid;
