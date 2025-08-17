
import React, { useState, useEffect, useCallback } from 'react';
import { getSettings, saveSettings, getWaStatus, getWaQrCode } from '../services/apiService';
import { Settings as SettingsType, WaStatus } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { RefreshCwIcon } from '../components/icons/IconComponents';

const WaStatusIndicator: React.FC = () => {
    const [status, setStatus] = useState<WaStatus | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const checkStatus = useCallback(async () => {
        setLoading(true);
        try {
            const { status: newStatus } = await getWaStatus();
            setStatus(newStatus);
            if (newStatus === 'pairing') {
                const { qr } = await getWaQrCode();
                setQrCode(qr);
            } else {
                setQrCode(null);
            }
        } catch (error) {
            console.error("Failed to get WA status:", error);
            setStatus('down');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkStatus();
    }, [checkStatus]);

    const getStatusInfo = () => {
        switch (status) {
            case 'ready': return { color: 'green', text: 'Connected', description: 'WhatsApp is connected and ready to send messages.' };
            case 'pairing': return { color: 'yellow', text: 'Pairing Required', description: 'Scan the QR code with WhatsApp on your phone to connect.' };
            case 'down': return { color: 'red', text: 'Disconnected', description: 'The connection to WhatsApp is down. Please try again.' };
            default: return { color: 'gray', text: 'Loading...', description: 'Checking WhatsApp connection status...' };
        }
    };

    const { color, text, description } = getStatusInfo() as {color: 'green'|'yellow'|'red'|'gray', text: string, description: string};

    return (
        <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-2xl">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold">WhatsApp Connection</h3>
                    <div className="flex items-center space-x-2 mt-2">
                        <Badge color={color}>{text}</Badge>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                    </div>
                </div>
                <Button variant="secondary" size="sm" onClick={checkStatus} disabled={loading} className="flex items-center">
                    <RefreshCwIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>
            {status === 'pairing' && (
                <div className="mt-4 flex flex-col items-center">
                    {qrCode ? (
                        <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64 rounded-lg shadow-md" />
                    ) : (
                        <div className="w-64 h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <p>Loading QR Code...</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const Settings: React.FC = () => {
    const [settings, setSettings] = useState<SettingsType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
      const fetchSettings = async () => {
        setIsLoading(true);
        try {
          const data = await getSettings();
          setSettings(data);
        } catch (error) {
          console.error("Failed to fetch settings:", error);
        }
        setIsLoading(false);
      };
      fetchSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;
        setIsSaving(true);
        try {
            await saveSettings(settings);
            alert('Settings saved successfully!');
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert('Failed to save settings.');
        }
        setIsSaving(false);
    };

    if (isLoading || !settings) {
        return <p>Loading settings...</p>;
    }
    
    const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const keywords = e.target.value.split(',').map(k => k.trim());
        setSettings({ ...settings, optOutKeywords: keywords });
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                <WaStatusIndicator />
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                         <h3 className="text-lg font-semibold mb-2">Message Timing</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Business Hours Start" type="time" value={settings.businessHours.start} onChange={e => setSettings({...settings, businessHours: {...settings.businessHours, start: e.target.value}})} />
                            <Input label="Business Hours End" type="time" value={settings.businessHours.end} onChange={e => setSettings({...settings, businessHours: {...settings.businessHours, end: e.target.value}})} />
                            <Input label="COD Confirmation Delay (minutes)" type="number" value={settings.confirmDelayMin} onChange={e => setSettings({...settings, confirmDelayMin: parseInt(e.target.value, 10)})} />
                            <Input label="Abandoned Cart Delay (minutes)" type="number" value={settings.abandonedDelayMin} onChange={e => setSettings({...settings, abandonedDelayMin: parseInt(e.target.value, 10)})} />
                         </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Opt-Out</h3>
                        <Input 
                            label="Opt-Out Keywords" 
                            type="text" 
                            value={settings.optOutKeywords.join(', ')} 
                            onChange={handleKeywordsChange} 
                            />
                        <p className="text-xs text-gray-500 mt-1">Comma-separated list of keywords that will trigger opt-out.</p>
                    </div>
                     <div className="flex justify-end pt-4">
                        <Button type="submit" isLoading={isSaving}>Save Settings</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
