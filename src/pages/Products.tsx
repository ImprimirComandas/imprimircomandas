import React from 'react';
import { Button } from "../components/ui/button";

const Products = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      <div className="flex justify-end mb-4">
        <Button variant="outline">Add Product</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Product cards would go here */}
        <div className="border p-4 rounded-lg">
          <h3 className="font-medium">Product 1</h3>
          <p className="text-sm text-gray-500">Description</p>
        </div>
      </div>
    </div>
  );
};

export default Products;
