
import React, { useState, useEffect } from 'react';
import { getTemplates, saveTemplate, getTemplatePreview } from '../services/apiService';
import { Template } from '../types';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { MessageSquareIcon, MailIcon, SmartphoneIcon } from '../components/icons/IconComponents';

const TemplateEditor: React.FC<{ template: Template | null; onClose: () => void; onSave: (template: Template) => void }> = ({ template, onClose, onSave }) => {
    const [editedTemplate, setEditedTemplate] = useState<Template | null>(template);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'whatsapp' | 'email' | 'sms'>('whatsapp');
    const [preview, setPreview] = useState<string>('');
    const [isPreviewing, setIsPreviewing] = useState(false);

    useEffect(() => {
        setEditedTemplate(template);
        setPreview(''); // Reset preview when template changes
    }, [template]);

    if (!editedTemplate) return null;

    const handleSave = async () => {
        setIsLoading(true);
        await onSave(editedTemplate);
        setIsLoading(false);
        onClose();
    };
    
    const handlePreview = async () => {
        setIsPreviewing(true);
        const previewText = await getTemplatePreview(editedTemplate.body, activeTab);
        setPreview(previewText);
        setIsPreviewing(false);
    };

    const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditedTemplate({ ...editedTemplate, body: e.target.value });
        setPreview(''); // Reset preview on body change
    };
    
    const TabButton: React.FC<{ type: 'whatsapp' | 'email' | 'sms', icon: React.ReactNode, text: string }> = ({ type, icon, text }) => (
        <button
            onClick={() => setActiveTab(type)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 focus:outline-none ${
                activeTab === type 
                ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
            {icon}
            <span>{text}</span>
        </button>
    );

    return (
        <Modal isOpen={!!template} onClose={onClose} title={editedTemplate.isDefault ? `View Template: ${editedTemplate.key}`: `Edit Template: ${editedTemplate.key}`}>
            <div className="space-y-4">
                <Input label="Key" value={editedTemplate.key} disabled />
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Variables</label>
                    <div className="flex flex-wrap gap-2">
                        {editedTemplate.variables.map(v => <span key={v} className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-sm rounded-md font-mono">{`{{${v}}}`}</span>)}
                    </div>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <TabButton type="whatsapp" icon={<MessageSquareIcon className="w-5 h-5" />} text="WhatsApp" />
                        <TabButton type="email" icon={<MailIcon className="w-5 h-5" />} text="Email" />
                        <TabButton type="sms" icon={<SmartphoneIcon className="w-5 h-5" />} text="SMS" />
                    </nav>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div>
                        <h3 className="font-semibold mb-2">Editor ({activeTab})</h3>
                         <textarea
                            value={editedTemplate.body}
                            onChange={handleBodyChange}
                            disabled={editedTemplate.isDefault}
                            rows={8}
                            className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:opacity-70 font-mono"
                            aria-label="Template body"
                         />
                         {activeTab === 'sms' && (
                             <p className="text-xs text-right text-gray-500 mt-1">{editedTemplate.body.length} / 160 characters</p>
                         )}
                    </div>
                    <div>
                         <h3 className="font-semibold mb-2">Live Preview</h3>
                         <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-md h-[215px] overflow-y-auto">
                            {preview ? (
                                <div className="bg-green-100 dark:bg-green-800/50 p-3 rounded-lg shadow-inner max-w-sm">
                                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{preview}</p>
                                </div>
                             ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-sm text-gray-500">Click "Preview" to see the result.</p>
                                </div>
                             )}
                         </div>
                    </div>
                </div>
            </div>
             <div className="mt-6 flex justify-between items-center">
                <Button variant="secondary" onClick={handlePreview} isLoading={isPreviewing}>Preview</Button>
                {!editedTemplate.isDefault && (
                    <div className="flex justify-end space-x-3">
                        <Button variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSave} isLoading={isLoading}>Save Changes</Button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

const Templates: React.FC = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const data = await getTemplates();
            setTemplates(data);
        } catch (error) {
            console.error("Failed to fetch templates:", error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSave = async (template: Template) => {
        await saveTemplate(template);
        await fetchTemplates(); // Refresh list after saving
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Message Templates</h2>
                </div>
                {loading ? <p>Loading templates...</p> : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {templates.map(template => (
                            <li key={template.key} className="py-4 flex items-center justify-between">
                               <div>
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">{template.key}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">{template.body}</p>
                               </div>
                                <div className="flex items-center space-x-4">
                                     <label className="inline-flex items-center cursor-not-allowed" aria-label={`Template ${template.key} is ${template.active ? 'active' : 'inactive'}`}>
                                        <input type="checkbox" checked={template.active} className="sr-only peer" disabled/>
                                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                    </label>
                                    <Button variant="secondary" size="sm" onClick={() => setSelectedTemplate(template)}>
                                        {template.isDefault ? 'View' : 'Edit'}
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <TemplateEditor template={selectedTemplate} onClose={() => setSelectedTemplate(null)} onSave={handleSave} />
        </>
    );
};

export default Templates;
