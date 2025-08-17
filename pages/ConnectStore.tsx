
import React, { useState, useEffect, useCallback } from 'react';
import { getStoreConnection, connectStore, disconnectStore, getStoreLogs } from '../services/apiService';
import { StoreConnection, StoreLog } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { StoreIcon, CheckCircleIcon, ClipboardCopyIcon, TerminalIcon } from '../components/icons/IconComponents';

const WEBHOOK_BASE_URL = 'https://api.orderalert.app/webhooks'; // Example base URL
const WEBHOOK_TOPICS = [
    'orders/create',
    'orders/updated',
    'orders/cancelled',
    'fulfillments/create'
];

// Webhook Configuration Component
const WebhookConfigurationCard: React.FC = () => {
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url).then(() => {
            setCopiedUrl(url);
            setTimeout(() => setCopiedUrl(null), 2000); // Reset after 2 seconds
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Webhook Configuration</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Add the following webhook URLs to your Shopify store settings under "Notifications" to enable order syncing.
            </p>
            <ul className="space-y-3">
                {WEBHOOK_TOPICS.map(topic => {
                    const url = `${WEBHOOK_BASE_URL}/${topic}`;
                    return (
                        <li key={topic} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{topic}</p>
                                <p className="text-xs text-gray-500 font-mono">{url}</p>
                            </div>
                            <Button variant="secondary" size="sm" onClick={() => handleCopy(url)} className="w-24">
                                <ClipboardCopyIcon className="w-4 h-4 mr-2" />
                                {copiedUrl === url ? 'Copied!' : 'Copy'}
                            </Button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

// Connection Logs Component
const ConnectionLogsCard: React.FC = () => {
    const [logs, setLogs] = useState<StoreLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const data = await getStoreLogs();
                setLogs(data);
            } catch (error) {
                console.error("Failed to fetch logs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const getLogLevelColor = (level: StoreLog['level']) => {
        switch (level) {
            case 'info': return 'text-green-500';
            case 'warn': return 'text-yellow-500';
            case 'error': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <div className="flex items-center mb-4">
                <TerminalIcon className="w-6 h-6 mr-3 text-primary-500"/>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Connection Logs</h3>
            </div>
            <div className="h-96 overflow-y-auto bg-gray-900 text-white font-mono p-4 rounded-lg text-xs space-y-2">
                {loading ? (
                    <p>Loading logs...</p>
                ) : logs.length > 0 ? (
                    logs.map(log => (
                        <div key={log.id} className="flex">
                            <span className="text-gray-500 mr-3">{new Date(log.createdAt).toLocaleTimeString()}</span>
                            <span className={`font-bold mr-3 ${getLogLevelColor(log.level)}`}>[{log.level.toUpperCase()}]</span>
                            <p>{log.message}</p>
                        </div>
                    ))
                ) : (
                    <p>No logs available.</p>
                )}
            </div>
        </div>
    );
};


// Main ConnectStore Page Component
const ConnectStore: React.FC = () => {
    const [connection, setConnection] = useState<StoreConnection | null>(null);
    const [domain, setDomain] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchConnection = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getStoreConnection();
            setConnection(data);
            if (data.status === 'connected') {
                setDomain(data.domain);
            }
        } catch (err) {
            setError('Failed to fetch store connection status.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConnection();
    }, [fetchConnection]);

    const handleConnect = async () => {
        setError(null);
        setIsConnecting(true);
        try {
            const newConnection = await connectStore(domain);
            setConnection(newConnection);
        } catch (err: any) {
            setError(err.message || 'Failed to connect store.');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        setIsConnecting(true);
        try {
            const newConnection = await disconnectStore();
            setConnection(newConnection);
            setDomain('');
        } catch (err) {
            setError('Failed to disconnect store.');
        } finally {
            setIsConnecting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    const isConnected = connection?.status === 'connected';
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Column: Connection Card */}
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center mx-auto lg:mx-0">
                {isConnected ? (
                    <div className="space-y-4">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Store Connected</h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            Your store <span className="font-semibold text-primary-500">{connection.domain}</span> is successfully connected.
                        </p>
                        <p className="text-sm text-gray-500">
                            We'll now sync your orders and send notifications accordingly.
                        </p>
                        <Button variant="danger" onClick={handleDisconnect} isLoading={isConnecting}>
                            Disconnect
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <StoreIcon className="w-12 h-12 text-primary-500 mx-auto" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Connect Your Shopify Store</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Enter your <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded-md text-sm">.myshopify.com</code> domain to sync orders.
                        </p>
                        <div className="text-left">
                            <Input 
                                id="domain"
                                label="Shopify Domain"
                                type="text"
                                placeholder="your-store.myshopify.com"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                disabled={isConnecting}
                            />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button onClick={handleConnect} isLoading={isConnecting} className="w-full">
                            Connect
                        </Button>
                    </div>
                )}
            </div>
            
            {/* Right Column: Webhooks and Logs */}
            <div className="space-y-8">
                <WebhookConfigurationCard />
                <ConnectionLogsCard />
            </div>
        </div>
    );
};

export default ConnectStore;
