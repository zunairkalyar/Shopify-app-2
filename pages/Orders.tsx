
import React, { useState, useEffect } from 'react';
import { getOrders } from '../services/apiService';
import { Order } from '../types';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toString().includes(searchTerm) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerPhone.includes(searchTerm)
  );
    
  const getFinancialStatusBadgeColor = (status: Order['financialStatus']) => {
    switch(status) {
        case 'paid': return 'green';
        case 'cod': return 'yellow';
        case 'refunded': return 'red';
        default: return 'gray';
    }
  }

  const getFulfillmentStatusBadgeColor = (status: Order['fulfillmentStatus']) => {
    switch(status) {
        case 'fulfilled': return 'green';
        case 'unfulfilled': return 'yellow';
        case 'partial': return 'blue';
        default: return 'gray';
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Orders</h2>
        <div className="w-full max-w-xs">
          <Input 
            type="text" 
            placeholder="Search by order #, name, or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Order #</th>
              <th scope="col" className="px-6 py-3">Customer</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Total</th>
              <th scope="col" className="px-6 py-3">Payment</th>
              <th scope="col" className="px-6 py-3">Fulfillment</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8">Loading orders...</td></tr>
            ) : filteredOrders.map(order => (
              <tr key={order.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">#{order.orderNumber}</td>
                <td className="px-6 py-4">
                    <div>{order.customerName}</div>
                    <div className="text-xs text-gray-500">{order.customerPhone}</div>
                </td>
                <td className="px-6 py-4">{new Date(order.createdAt).toLocaleString()}</td>
                <td className="px-6 py-4">{order.currency} {order.total.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <Badge color={getFinancialStatusBadgeColor(order.financialStatus)}>
                    {order.financialStatus}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge color={getFulfillmentStatusBadgeColor(order.fulfillmentStatus)}>
                    {order.fulfillmentStatus}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
