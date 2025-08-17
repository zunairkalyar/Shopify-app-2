
import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { getDashboardStats, getRecentMessages, getTopTemplates, getWaStatus } from '../services/apiService';
import { DashboardStats, Message, TopTemplate, WaStatus, MessageStatus } from '../types';
import { 
    MessageSquareIcon, DollarSignIcon, AlertCircleIcon, ArchiveIcon, 
    WifiIcon, WifiOffIcon, QrCodeIcon
} from '../components/icons/IconComponents';

// New sub-component for WA Status
const WaStatusCard: React.FC = () => {
    const [status, setStatus] = useState<WaStatus | null>(null);

    const checkStatus = useCallback(async () => {
        try {
            const { status: newStatus } = await getWaStatus();
            setStatus(newStatus);
        } catch (error) {
            console.error("Failed to get WA status:", error);
            setStatus('down');
        }
    }, []);

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, [checkStatus]);

    const getStatusInfo = () => {
        switch (status) {
            case 'ready': return { badgeColor: 'green', bgColor: 'bg-green-100 dark:bg-green-900/50', textColor: 'text-green-600 dark:text-green-300', text: 'Connected', icon: <WifiIcon className="w-5 h-5" /> } as const;
            case 'pairing': return { badgeColor: 'yellow', bgColor: 'bg-yellow-100 dark:bg-yellow-900/50', textColor: 'text-yellow-600 dark:text-yellow-300', text: 'Pairing', icon: <QrCodeIcon className="w-5 h-5" /> } as const;
            case 'down': return { badgeColor: 'red', bgColor: 'bg-red-100 dark:bg-red-900/50', textColor: 'text-red-600 dark:text-red-300', text: 'Disconnected', icon: <WifiOffIcon className="w-5 h-5" /> } as const;
            default: return { badgeColor: 'gray', bgColor: 'bg-gray-100 dark:bg-gray-700', textColor: 'text-gray-600 dark:text-gray-400', text: 'Checking...', icon: <div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div> } as const;
        }
    };
    
    const { badgeColor, bgColor, textColor, text, icon } = getStatusInfo();

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg h-full">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">WhatsApp Status</h3>
            <div className="flex items-center justify-center flex-col space-y-4 pt-4">
                <div className={`p-4 rounded-full ${bgColor} ${textColor}`}>{icon}</div>
                <Badge color={badgeColor}>{text}</Badge>
            </div>
        </div>
    );
};

// New sub-component for Recent Messages
const RecentMessagesCard: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    
    useEffect(() => {
        getRecentMessages().then(setMessages);
    }, []);
    
    const getStatusBadgeColor = (status: MessageStatus) => {
        switch(status) {
            case MessageStatus.Read:
            case MessageStatus.Delivered: return 'green';
            case MessageStatus.Sent: return 'blue';
            case MessageStatus.Queued: return 'yellow';
            case MessageStatus.Failed: return 'red';
            default: return 'gray';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Messages</h3>
            <ul className="space-y-3">
                {messages.length > 0 ? messages.map(msg => (
                    <li key={msg.id} className="flex items-center justify-between text-sm">
                        <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{msg.toPhone}</p>
                            <p className="text-xs text-gray-500">{msg.templateKey}</p>
                        </div>
                        <Badge color={getStatusBadgeColor(msg.status)}>{msg.status}</Badge>
                    </li>
                )) : <p className="text-sm text-gray-500">No recent messages.</p>}
            </ul>
        </div>
    );
};

// New sub-component for Top Templates
const TopTemplatesCard: React.FC = () => {
    const [templates, setTemplates] = useState<TopTemplate[]>([]);
    
    useEffect(() => {
        getTopTemplates().then(setTemplates);
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Top Templates</h3>
            <ul className="space-y-3">
                {templates.length > 0 ? templates.map(t => (
                    <li key={t.key} className="flex items-center justify-between text-sm">
                        <p className="font-medium text-gray-800 dark:text-gray-200">{t.key}</p>
                        <p className="font-bold text-primary-500">{t.count} <span className="font-normal text-gray-500">sends</span></p>
                    </li>
                )) : <p className="text-sm text-gray-500">Not enough data.</p>}
            </ul>
        </div>
    );
};

// Main Dashboard component
const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
        <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Messages Sent (Today)" value={stats?.messagesSentToday ?? 0} icon={<MessageSquareIcon className="w-6 h-6"/>} />
        <Card title="Revenue Generated" value={`PKR ${stats?.revenueGenerated.toLocaleString() ?? 0}`} icon={<DollarSignIcon className="w-6 h-6"/>} />
        <Card title="Failures" value={stats?.failures ?? 0} icon={<AlertCircleIcon className="w-6 h-6"/>} />
        <Card title="Queue Depth" value={stats?.queueDepth ?? 0} icon={<ArchiveIcon className="w-6 h-6"/>} />
      </div>

      {/* Main Grid: Chart and new cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Weekly Message Volume</h3>
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
                        <Bar dataKey="sent" fill="#0ea5e9" name="Sent" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="failed" fill="#ef4444" name="Failed" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Right Column: New Info Cards */}
        <div className="space-y-8">
            <WaStatusCard />
            <RecentMessagesCard />
            <TopTemplatesCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
