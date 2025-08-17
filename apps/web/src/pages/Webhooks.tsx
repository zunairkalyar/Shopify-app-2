
import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { Webhook, WebhookStats, WebhookConfig } from '../types';
import { getWebhooks, getWebhookStats, getWebhookConfig, saveWebhookConfig } from '../services/apiService';
import { TrendingUpIcon, AlertCircleIcon, ZapIcon, CheckCircleIcon } from '../components/icons/IconComponents';

type WebhookPageTab = 'dashboard' | 'configuration' | 'analytics';

// Dashboard Components
const WebhookStatsCards: React.FC<{ stats: WebhookStats | null }> = ({ stats }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Webhooks Processed (Today)" value={stats?.processedToday ?? 0} icon={<CheckCircleIcon className="w-6 h-6"/>} />
        <Card title="Success Rate" value={`${stats?.successRate ?? 0}%`} icon={<TrendingUpIcon className="w-6 h-6"/>} />
        <Card title="Failures (Today)" value={stats?.failedToday ?? 0} icon={<AlertCircleIcon className="w-6 h-6"/>} />
        <Card title="Avg. Processing Time" value={`${stats?.avgProcessingTime ?? 0}ms`} icon={<ZapIcon className="w-6 h-6"/>} />
    </div>
);

const WebhookHistoryTable: React.FC<{ webhooks: Webhook[]; loading: boolean }> = ({ webhooks, loading }) => {
    const getStatusBadgeColor = (status: Webhook['status']) => {
        return status === 'processed' ? 'green' : 'red';
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Webhook History</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-4 py-3">Event</th>
                            <th scope="col" className="px-4 py-3">Order ID</th>
                            <th scope="col" className="px-4 py-3">Customer</th>
                            <th scope="col" className="px-4 py-3">Status</th>
                            <th scope="col" className="px-4 py-3">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-8">Loading webhooks...</td></tr>
                        ) : webhooks.map(wh => (
                            <tr key={wh.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">{wh.eventType}</td>
                                <td className="px-4 py-4">{wh.orderId}</td>
                                <td className="px-4 py-4">{wh.customer.name}</td>
                                <td className="px-4 py-4"><Badge color={getStatusBadgeColor(wh.status)}>{wh.status}</Badge></td>
                                <td className="px-4 py-4">{new Date(wh.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Configuration Component
const WebhookConfiguration: React.FC = () => {
    const [config, setConfig] = useState<WebhookConfig | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        getWebhookConfig().then(setConfig);
    }, []);

    const handleSave = async () => {
        if (!config) return;
        setIsSaving(true);
        await saveWebhookConfig(config);
        setIsSaving(false);
        alert("Configuration saved!");
    };
    
    if (!config) return <p>Loading configuration...</p>;

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Shopify Webhooks</h3>
                <div className="space-y-4">
                    <Input 
                        label="Shopify Store URL" 
                        value={config.webhookUrls.shopifyStoreUrl}
                        onChange={(e) => setConfig({...config, webhookUrls: {...config.webhookUrls, shopifyStoreUrl: e.target.value}})}
                    />
                     <div className="space-y-2 pt-2">
                        <label className="block text-sm font-medium">Enabled Events</label>
                        {Object.keys(config.webhookUrls.endpoints).map((key) => {
                            const eventKey = key as keyof typeof config.webhookUrls.endpoints;
                            return (
                                <div key={eventKey} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <span className="font-mono text-sm">{eventKey}</span>
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={config.webhookUrls.endpoints[eventKey] === 'enabled'}
                                            onChange={(e) => {
                                                const isEnabled = e.target.checked;
                                                setConfig({...config, webhookUrls: {...config.webhookUrls, endpoints: {...config.webhookUrls.endpoints, [eventKey]: isEnabled ? 'enabled' : 'disabled'}}});
                                            }}
                                            className="sr-only peer" 
                                        />
                                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Message Settings</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                        label="Business Name"
                        value={config.messageSettings.businessName}
                        onChange={(e) => setConfig({...config, messageSettings: {...config.messageSettings, businessName: e.target.value}})}
                    />
                     <Input 
                        label="Support Phone (+92 format)"
                        value={config.messageSettings.supportPhone}
                        onChange={(e) => setConfig({...config, messageSettings: {...config.messageSettings, supportPhone: e.target.value}})}
                    />
                 </div>
            </div>
             <div className="flex justify-end pt-4">
                <Button onClick={handleSave} isLoading={isSaving}>Save Configuration</Button>
            </div>
        </div>
    );
};

// Analytics Component
const WebhookAnalytics: React.FC<{ stats: WebhookStats | null }> = ({ stats }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Webhook Performance</h3>
        <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
                <BarChart data={stats?.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.3)" />
                    <XAxis dataKey="name" tick={{ fill: '#6b7280' }} axisLine={{ stroke: '#4b5563' }} tickLine={false} className="text-xs" />
                    <YAxis tick={{ fill: '#6b7280' }} axisLine={{ stroke: '#4b5563' }} tickLine={false} className="text-xs"/>
                    <Tooltip
                        contentStyle={{
                        backgroundColor: 'rgba(31, 41, 55, 0.8)',
                        borderColor: '#4b5563',
                        borderRadius: '0.75rem',
                        color: '#ffffff'
                        }}
                        cursor={{ fill: 'rgba(14, 165, 233, 0.1)' }}
                    />
                    <Legend wrapperStyle={{fontSize: '0.875rem'}}/>
                    <Bar dataKey="processed" fill="#0ea5e9" name="Processed" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="failed" fill="#ef4444" name="Failed" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);


const Webhooks: React.FC = () => {
    const [activeTab, setActiveTab] = useState<WebhookPageTab>('dashboard');
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [stats, setStats] = useState<WebhookStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [webhooksData, statsData] = await Promise.all([getWebhooks(), getWebhookStats()]);
            setWebhooks(webhooksData);
            setStats(statsData);
        } catch (error) {
            console.error("Failed to fetch webhook data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll for new webhooks every 5 seconds
        return () => clearInterval(interval);
    }, [fetchData]);

    const TabButton: React.FC<{ tabName: WebhookPageTab, label: string }> = ({ tabName, label }) => (
        <button
          onClick={() => setActiveTab(tabName)}
          className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition-colors ${
            activeTab === tabName
              ? 'bg-primary-600 text-white shadow'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {label}
        </button>
      );
    
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center p-1 space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <TabButton tabName="dashboard" label="Dashboard" />
                    <TabButton tabName="configuration" label="Configuration" />
                    <TabButton tabName="analytics" label="Analytics" />
                </div>
            </div>

            {activeTab === 'dashboard' && (
                <div className="space-y-8">
                    <WebhookStatsCards stats={stats} />
                    <WebhookHistoryTable webhooks={webhooks} loading={loading} />
                </div>
            )}

            {activeTab === 'configuration' && (
                <WebhookConfiguration />
            )}
            
            {activeTab === 'analytics' && (
                 <div className="space-y-8">
                    <WebhookAnalytics stats={stats} />
                    {/* Error Logs table could be added here */}
                </div>
            )}
        </div>
    );
};

export default Webhooks;
