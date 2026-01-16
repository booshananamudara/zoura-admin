'use client';

import { useState, FormEvent, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Upload, X, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface Attribute {
    id: string;
    key: string;
    value: string;
}

interface Variant {
    id: string;
    color: string;
    size: string;
    stock: number;
    priceOverride: string;
    sku: string;
}

interface ImagePreview {
    id: string;
    file: File;
    preview: string;
}

const CATEGORIES = [
    'Fashion',
    'Electronics',
    'Home & Garden',
    'Sports & Outdoors',
    'Beauty & Health',
    'Toys & Games',
    'Food & Beverage',
    'Books & Media',
    'Other',
];

export default function NewProductPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Loading and error states
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');

    // Basic product details
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');

    // Images
    const [images, setImages] = useState<ImagePreview[]>([]);

    // Attributes (key-value pairs)
    const [attributes, setAttributes] = useState<Attribute[]>([]);

    // Variants
    const [variants, setVariants] = useState<Variant[]>([
        { id: crypto.randomUUID(), color: '', size: '', stock: 0, priceOverride: '', sku: '' },
    ]);

    // Generate unique ID
    const generateId = () => crypto.randomUUID();

    // ===== IMAGE HANDLERS =====
    const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newImages: ImagePreview[] = [];
        
        Array.from(files).forEach((file) => {
            // Validate file type
            if (!file.type.startsWith('image/')) return;
            
            // Create preview URL
            const preview = URL.createObjectURL(file);
            newImages.push({
                id: generateId(),
                file,
                preview,
            });
        });

        setImages([...images, ...newImages]);
        
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = (id: string) => {
        const imageToRemove = images.find(img => img.id === id);
        if (imageToRemove) {
            URL.revokeObjectURL(imageToRemove.preview);
        }
        setImages(images.filter(img => img.id !== id));
    };

    // ===== ATTRIBUTE HANDLERS =====
    const addAttribute = () => {
        setAttributes([...attributes, { id: generateId(), key: '', value: '' }]);
    };

    const updateAttribute = (id: string, field: 'key' | 'value', value: string) => {
        setAttributes(attributes.map(attr => 
            attr.id === id ? { ...attr, [field]: value } : attr
        ));
    };

    const removeAttribute = (id: string) => {
        setAttributes(attributes.filter(attr => attr.id !== id));
    };

    // ===== VARIANT HANDLERS =====
    const addVariant = () => {
        setVariants([
            ...variants,
            { id: generateId(), color: '', size: '', stock: 0, priceOverride: '', sku: '' },
        ]);
    };

    const updateVariant = (id: string, field: keyof Variant, value: string | number) => {
        setVariants(variants.map(v => 
            v.id === id ? { ...v, [field]: value } : v
        ));
    };

    const removeVariant = (id: string) => {
        if (variants.length <= 1) {
            setError('You must have at least one variant');
            return;
        }
        setVariants(variants.filter(v => v.id !== id));
    };

    // ===== FORM VALIDATION =====
    const validateForm = (): boolean => {
        if (!name.trim()) {
            setError('Product name is required');
            return false;
        }
        if (!price || parseFloat(price) <= 0) {
            setError('Valid price is required');
            return false;
        }
        if (!category) {
            setError('Please select a category');
            return false;
        }
        if (variants.length === 0) {
            setError('At least one variant is required');
            return false;
        }
        
        // Check if all variants have SKU
        for (const variant of variants) {
            if (!variant.sku.trim()) {
                setError('All variants must have a SKU');
                return false;
            }
            if (variant.stock < 0) {
                setError('Stock cannot be negative');
                return false;
            }
        }

        return true;
    };

    // ===== FORM SUBMISSION =====
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setLoading(true);
        setUploadProgress(0);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/login');
                return;
            }

            // Create FormData for multipart upload
            const formData = new FormData();

            // Append images
            images.forEach((img) => {
                formData.append('images', img.file);
            });

            // Create product data object
            const productData = {
                name: name.trim(),
                description: description.trim(),
                price: parseFloat(price),
                category: category,
                attributes: attributes.reduce((acc, attr) => {
                    if (attr.key.trim() && attr.value.trim()) {
                        acc[attr.key.trim()] = attr.value.trim();
                    }
                    return acc;
                }, {} as Record<string, string>),
                variants: variants.map(v => ({
                    color: v.color.trim() || null,
                    size: v.size.trim() || null,
                    sku: v.sku.trim(),
                    stock: parseInt(v.stock.toString()) || 0,
                    price_override: v.priceOverride ? parseFloat(v.priceOverride) : null,
                })),
            };

            // Append data as JSON string
            formData.append('data', JSON.stringify(productData));

            setUploadProgress(30);

            // Send request
            const response = await fetch('http://localhost:8080/products', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            setUploadProgress(80);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create product');
            }

            setUploadProgress(100);

            // Cleanup image previews
            images.forEach(img => URL.revokeObjectURL(img.preview));

            // Redirect to products list
            router.push('/dashboard/products');
        } catch (err: any) {
            console.error('Failed to create product:', err);
            setError(err.message || 'Failed to create product. Please try again.');
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/dashboard/products"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Products
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
                <p className="text-gray-600 mt-1">Create a new product with variants and images</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* ===== SECTION A: BASIC DETAILS ===== */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">1</span>
                        Basic Details
                    </h2>
                    
                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., Blue Denim Jacket"
                                disabled={loading}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Describe your product..."
                                disabled={loading}
                            />
                        </div>

                        {/* Price and Category */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Base Price (₹) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="999.00"
                                    disabled={loading}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    disabled={loading}
                                    required
                                >
                                    <option value="">Select category</option>
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== SECTION B: IMAGES ===== */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">2</span>
                        Product Images
                    </h2>

                    {/* Upload Area */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">Click to upload images</p>
                        <p className="text-gray-400 text-sm mt-1">PNG, JPG up to 10MB each</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                            disabled={loading}
                        />
                    </div>

                    {/* Image Previews */}
                    {images.length > 0 && (
                        <div className="mt-4 grid grid-cols-4 gap-4">
                            {images.map((img) => (
                                <div key={img.id} className="relative group">
                                    <img
                                        src={img.preview}
                                        alt="Preview"
                                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(img.id)}
                                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ===== SECTION C: ATTRIBUTES ===== */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">3</span>
                            Product Attributes
                        </h2>
                        <button
                            type="button"
                            onClick={addAttribute}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            disabled={loading}
                        >
                            <Plus className="h-4 w-4" />
                            Add Attribute
                        </button>
                    </div>

                    {attributes.length === 0 ? (
                        <p className="text-gray-500 text-sm py-4 text-center">
                            No attributes added. Add details like Material, Brand, Gender, etc.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {attributes.map((attr) => (
                                <div key={attr.id} className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={attr.key}
                                        onChange={(e) => updateAttribute(attr.id, 'key', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Attribute (e.g., Material)"
                                        disabled={loading}
                                    />
                                    <input
                                        type="text"
                                        value={attr.value}
                                        onChange={(e) => updateAttribute(attr.id, 'value', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Value (e.g., Cotton)"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeAttribute(attr.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        disabled={loading}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ===== SECTION D: VARIANTS ===== */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">4</span>
                            Variants (Inventory)
                        </h2>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            disabled={loading}
                        >
                            <Plus className="h-4 w-4" />
                            Add Variant
                        </button>
                    </div>

                    {/* Variants Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left text-sm font-medium text-gray-600 pb-3">SKU *</th>
                                    <th className="text-left text-sm font-medium text-gray-600 pb-3">Color</th>
                                    <th className="text-left text-sm font-medium text-gray-600 pb-3">Size</th>
                                    <th className="text-left text-sm font-medium text-gray-600 pb-3">Stock *</th>
                                    <th className="text-left text-sm font-medium text-gray-600 pb-3">Price Override</th>
                                    <th className="pb-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {variants.map((variant) => (
                                    <tr key={variant.id}>
                                        <td className="py-3 pr-3">
                                            <input
                                                type="text"
                                                value={variant.sku}
                                                onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                placeholder="SKU-001"
                                                disabled={loading}
                                                required
                                            />
                                        </td>
                                        <td className="py-3 pr-3">
                                            <input
                                                type="text"
                                                value={variant.color}
                                                onChange={(e) => updateVariant(variant.id, 'color', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                placeholder="Blue"
                                                disabled={loading}
                                            />
                                        </td>
                                        <td className="py-3 pr-3">
                                            <input
                                                type="text"
                                                value={variant.size}
                                                onChange={(e) => updateVariant(variant.id, 'size', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                placeholder="M"
                                                disabled={loading}
                                            />
                                        </td>
                                        <td className="py-3 pr-3">
                                            <input
                                                type="number"
                                                min="0"
                                                value={variant.stock}
                                                onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value) || 0)}
                                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                placeholder="0"
                                                disabled={loading}
                                                required
                                            />
                                        </td>
                                        <td className="py-3 pr-3">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={variant.priceOverride}
                                                onChange={(e) => updateVariant(variant.id, 'priceOverride', e.target.value)}
                                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                placeholder="+0.00"
                                                disabled={loading}
                                            />
                                        </td>
                                        <td className="py-3">
                                            <button
                                                type="button"
                                                onClick={() => removeVariant(variant.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                disabled={loading || variants.length <= 1}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                        Price Override adds to the base price for this specific variant
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Upload Progress */}
                {loading && uploadProgress > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-700">Uploading...</span>
                            <span className="text-sm text-blue-600">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Submit Buttons */}
                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Creating Product...
                            </span>
                        ) : (
                            'Create Product'
                        )}
                    </button>
                    <Link
                        href="/dashboard/products"
                        className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </Link>
                </div>

                {/* Info */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800">
                        <strong>Note:</strong> Your product will be submitted for approval. It will be visible to customers once approved by the admin.
                    </p>
                </div>
            </form>
        </div>
    );
}
