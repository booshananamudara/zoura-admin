"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, MapPin, Phone, Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";

interface Variant {
    id: string;
    color: string | null;
    size: string | null;
    sku: string;
}

interface OrderItem {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
    total: number;
    variant: Variant | null;
}

interface Customer {
    id: string;
    name: string;
    email: string;
}

interface ShippingAddress {
    street: string;
    city: string;
    postalCode: string;
    phone: string;
}

interface VendorOrder {
    id: string;
    status: string;
    total_amount: number;
    vendor_total: number;
    created_at: string;
    customer: Customer;
    items: OrderItem[];
    shipping_address: ShippingAddress | null;
    payment_method: string;
}

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<VendorOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("access_token");
            if (!token) {
                router.push("/login");
                return;
            }

            const response = await fetch("http://localhost:8080/vendors/orders/my-orders", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch orders");
            }

            const data = await response.json();
            console.log("Orders data:", data);
            setOrders(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, status: string) => {
        try {
            setUpdatingOrderId(orderId);
            const token = localStorage.getItem("access_token");
            if (!token) {
                router.push("/login");
                return;
            }

            const response = await fetch(`http://localhost:8080/vendors/orders/${orderId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                throw new Error("Failed to update order status");
            }

            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status } : order
            ));
        } catch (err: any) {
            alert(err.message);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const toggleOrderExpand = (orderId: string) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                        <Clock className="h-3 w-3" />
                        Pending
                    </span>
                );
            case "SHIPPED":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        <Truck className="h-3 w-3" />
                        Shipped
                    </span>
                );
            case "DELIVERED":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3" />
                        Delivered
                    </span>
                );
            case "CANCELLED":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        <XCircle className="h-3 w-3" />
                        Cancelled
                    </span>
                );
            default:
                return (
                    <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {status}
                    </span>
                );
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatShortAddress = (address: ShippingAddress | null) => {
        if (!address) return null;
        const shortAddress = `${address.street}, ${address.city}`;
        return shortAddress.length > 30 ? shortAddress.substring(0, 30) + "..." : shortAddress;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
                <button
                    onClick={fetchOrders}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                    <p className="text-gray-600">Manage orders for your products</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Refresh
                </button>
            </div>

            {/* Orders */}
            {orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No orders yet</p>
                    <p className="text-gray-400 mt-2">Orders will appear here when customers purchase your products</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Order
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Items
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Delivery To
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <Fragment key={order.id}>
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        {/* Order ID & Date */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleOrderExpand(order.id)}
                                                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                                >
                                                    {expandedOrderId === order.id ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </button>
                                                <div>
                                                    <span className="text-sm font-mono font-medium text-gray-900">
                                                        #{order.id.substring(0, 8)}
                                                    </span>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {formatDate(order.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Customer */}
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-medium text-gray-900">
                                                {order.customer.name}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {order.customer.email}
                                            </div>
                                        </td>

                                        {/* Items with Variant Details */}
                                        <td className="px-6 py-5">
                                            <div className="space-y-2">
                                                {order.items.map((item) => (
                                                    <div key={item.id}>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {item.product_name}
                                                            <span className="font-normal text-gray-500"> × {item.quantity}</span>
                                                        </div>
                                                        {item.variant && (item.variant.color || item.variant.size) && (
                                                            <div className="text-xs text-gray-500 mt-0.5">
                                                                {item.variant.color && (
                                                                    <span>Color: <span className="font-medium">{item.variant.color}</span></span>
                                                                )}
                                                                {item.variant.color && item.variant.size && <span className="mx-1">|</span>}
                                                                {item.variant.size && (
                                                                    <span>Size: <span className="font-medium">{item.variant.size}</span></span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>

                                        {/* Delivery Address */}
                                        <td className="px-6 py-5">
                                            {order.shipping_address ? (
                                                <div className="group relative">
                                                    <div className="flex items-start gap-1.5">
                                                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-sm text-gray-900 max-w-[180px] truncate">
                                                                {order.shipping_address.street}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {order.shipping_address.city}, {order.shipping_address.postalCode}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {/* Tooltip on hover */}
                                                    <div className="absolute left-0 top-full mt-1 z-10 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                                                        <p>{order.shipping_address.street}</p>
                                                        <p>{order.shipping_address.city}, {order.shipping_address.postalCode}</p>
                                                        <p className="flex items-center gap-1 mt-1">
                                                            <Phone className="h-3 w-3" />
                                                            {order.shipping_address.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">No address</span>
                                            )}
                                        </td>

                                        {/* Amount */}
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-semibold text-gray-900">
                                                ₹{order.vendor_total.toFixed(2)}
                                            </span>
                                        </td>

                                        {/* Status Badge */}
                                        <td className="px-6 py-5">
                                            {getStatusBadge(order.status)}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-5">
                                            {order.status === "PENDING" && (
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, "SHIPPED")}
                                                    disabled={updatingOrderId === order.id}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <Truck className="h-4 w-4" />
                                                    {updatingOrderId === order.id ? "..." : "Ship"}
                                                </button>
                                            )}
                                            {order.status === "SHIPPED" && (
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, "DELIVERED")}
                                                    disabled={updatingOrderId === order.id}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    {updatingOrderId === order.id ? "..." : "Deliver"}
                                                </button>
                                            )}
                                            {order.status === "DELIVERED" && (
                                                <span className="text-sm text-green-600 font-medium">✓ Done</span>
                                            )}
                                            {order.status === "CANCELLED" && (
                                                <span className="text-sm text-red-500">Cancelled</span>
                                            )}
                                        </td>
                                    </tr>

                                    {/* Expanded Details Row */}
                                    {expandedOrderId === order.id && (
                                        <tr key={`${order.id}-expanded`} className="bg-gradient-to-r from-gray-50 to-white">
                                            <td colSpan={7} className="px-6 py-5">
                                                <div className="grid grid-cols-3 gap-6">
                                                    {/* Full Shipping Address */}
                                                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                                                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-gray-500" />
                                                            Shipping Address
                                                        </h4>
                                                        {order.shipping_address ? (
                                                            <div className="text-sm text-gray-600 space-y-1">
                                                                <p className="font-medium text-gray-900">{order.customer.name}</p>
                                                                <p>{order.shipping_address.street}</p>
                                                                <p>{order.shipping_address.city}, {order.shipping_address.postalCode}</p>
                                                                <p className="flex items-center gap-1.5 text-gray-500 pt-1">
                                                                    <Phone className="h-3.5 w-3.5" />
                                                                    {order.shipping_address.phone}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-400 italic">No address provided</p>
                                                        )}
                                                    </div>

                                                    {/* Payment Info */}
                                                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                                                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Payment Details</h4>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-500">Method</span>
                                                                <span className="font-medium text-gray-900">
                                                                    {order.payment_method === 'cash_on_delivery' ? '💵 Cash on Delivery' : order.payment_method}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-500">Vendor Share</span>
                                                                <span className="font-semibold text-green-600">₹{order.vendor_total.toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Items Breakdown */}
                                                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                                                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Items Breakdown</h4>
                                                        <div className="space-y-2">
                                                            {order.items.map((item) => (
                                                                <div key={item.id} className="flex justify-between text-sm">
                                                                    <div>
                                                                        <span className="text-gray-900">{item.product_name}</span>
                                                                        {item.variant && (
                                                                            <span className="text-gray-400 text-xs ml-1">
                                                                                ({item.variant.sku})
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-gray-600 font-medium">
                                                                        ₹{item.price} × {item.quantity}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
