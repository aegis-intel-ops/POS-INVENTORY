import React from 'react';
import { type Product } from '../db/db';

interface ProductGridProps {
    products: Product[];
    onAddToCart: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
            {products.map((product) => (
                <button
                    key={product.id}
                    onClick={() => onAddToCart(product)}
                    className="bg-white border text-left p-4 rounded-xl shadow-sm hover:shadow-md hover:border-primary transition-all active:scale-95 flex flex-col justify-between h-40"
                >
                    <div>
                        <h3 className="font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mt-2 inline-block">
                            {product.category}
                        </span>
                    </div>
                    <div className="font-bold text-primary text-lg">
                        ₵{product.price.toFixed(2)}
                    </div>
                </button>
            ))}

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
