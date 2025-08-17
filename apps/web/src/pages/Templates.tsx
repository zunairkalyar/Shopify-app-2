
import React, { useState, useEffect } from 'react';
import { getTemplates, saveTemplate } from '../services/apiService';
import { Template } from '../types';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const TemplateEditor: React.FC<{ template: Template | null; onClose: () => void; onSave: (template: Template) => void }> = ({ template, onClose, onSave }) => {
    const [editedTemplate, setEditedTemplate] = useState<Template | null>(template);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setEditedTemplate(template);
    }, [template]);

    if (!editedTemplate) return null;

    const handleSave = async () => {
        setIsLoading(true);
        await onSave(editedTemplate);
        setIsLoading(false);
        onClose();
    };

    const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditedTemplate({ ...editedTemplate, body: e.target.value });
    };

    const renderPreview = () => {
        let previewText = editedTemplate.body;
        const mockData: {[key: string]: string} = {
            first_name: 'Ayesha',
            order_id: '1027',
            total: '2899.00',
            currency: 'PKR',
            tracking_url: 'https://tracking.example.com/123',
            cart_link: 'https://shop.example.com/cart/abc'
        };
        editedTemplate.variables.forEach(variable => {
            const regex = new RegExp(`{{${variable}}}`, 'g');
            previewText = previewText.replace(regex, mockData[variable] || `[${variable}]`);
        });
        return previewText;
    };
    
    return (
        <Modal isOpen={!!template} onClose={onClose} title={editedTemplate.isDefault ? `View Template: ${editedTemplate.key}`: `Edit Template: ${editedTemplate.key}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold text-lg mb-4">Editor</h3>
                    <div className="space-y-4">
                        <Input label="Key" value={editedTemplate.key} disabled />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body</label>
                            <textarea
                                value={editedTemplate.body}
                                onChange={handleBodyChange}
                                disabled={editedTemplate.isDefault}
                                rows={8}
                                className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:opacity-70"
                                aria-label="Template body"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Variables</label>
                            <div className="flex flex-wrap gap-2">
                                {editedTemplate.variables.map(v => <span key={v} className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-sm rounded-md">{`{{${v}}}`}</span>)}
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                     <h3 className="font-semibold text-lg mb-4">Live Preview</h3>
                     <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-md h-full">
                        <div className="bg-green-100 dark:bg-green-800/50 p-3 rounded-lg shadow-inner max-w-sm">
                            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{renderPreview()}</p>
                        </div>
                     </div>
                </div>
            </div>
            {!editedTemplate.isDefault && (
                <div className="mt-6 flex justify-end space-x-3">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} isLoading={isLoading}>Save Changes</Button>
                </div>
            )}
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
