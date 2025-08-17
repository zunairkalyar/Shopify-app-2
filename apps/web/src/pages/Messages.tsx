
import React, { useState, useEffect } from 'react';
import { getMessages, resendMessage } from '../services/apiService';
import { Message, MessageStatus } from '../types';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { RefreshCwIcon } from '../components/icons/IconComponents';

const MessageDetailModal: React.FC<{ message: Message | null; onClose: () => void; onResend: (id: string) => void }> = ({ message, onClose, onResend }) => {
    if (!message) return null;

    const [isResending, setIsResending] = useState(false);

    const handleResend = async () => {
        setIsResending(true);
        await onResend(message.id);
        setIsResending(false);
        onClose();
    };

    const timelineEvents = [
        { status: 'Queued', time: message.createdAt },
        { status: 'Sent', time: message.sentAt },
        { status: 'Delivered', time: message.deliveredAt },
        { status: 'Read', time: message.readAt },
    ].filter(event => event.time);
    
    return (
        <Modal isOpen={!!message} onClose={onClose} title={`Message to ${message.toPhone}`}>
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold">Content</h4>
                    <p className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md mt-2 whitespace-pre-wrap">{message.bodyText}</p>
                </div>
                 <div>
                    <h4 className="font-semibold">Timeline</h4>
                    <ol className="relative border-l border-gray-200 dark:border-gray-700 mt-2 ml-2">
                        {timelineEvents.map((event, index) => (
                             <li key={index} className="mb-6 ml-4">
                                <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                                <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{new Date(event.time!).toLocaleString()}</time>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{event.status}</h3>
                            </li>
                        ))}
                    </ol>
                </div>
                {message.status === MessageStatus.Failed && (
                     <div>
                        <h4 className="font-semibold text-red-500">Error</h4>
                        <p className="p-2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md mt-2">{message.error}</p>
                    </div>
                )}
            </div>
            {message.status === MessageStatus.Failed && (
                 <div className="mt-6 text-right">
                    <Button onClick={handleResend} isLoading={isResending} className="flex items-center">
                        <RefreshCwIcon className="w-4 h-4 mr-2"/>
                        Resend
                    </Button>
                </div>
            )}
        </Modal>
    );
};


const Messages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await getMessages();
        setMessages(data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const handleResend = async (messageId: string) => {
    await resendMessage(messageId);
    // Here you would typically refetch or update the message status
    alert(`Message ${messageId} queued for resending!`);
  };
    
  const getStatusBadgeColor = (status: MessageStatus) => {
    switch(status) {
        case MessageStatus.Read:
        case MessageStatus.Delivered: return 'green';
        case MessageStatus.Sent: return 'blue';
        case MessageStatus.Queued: return 'yellow';
        case MessageStatus.Failed: return 'red';
        default: return 'gray';
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Messages</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">To</th>
                <th scope="col" className="px-6 py-3">Template</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Timestamp</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">Details</span></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Loading messages...</td></tr>
              ) : messages.map(msg => (
                <tr key={msg.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{msg.toPhone}</td>
                  <td className="px-6 py-4">{msg.templateKey}</td>
                  <td className="px-6 py-4">
                    <Badge color={getStatusBadgeColor(msg.status)}>{msg.status}</Badge>
                  </td>
                  <td className="px-6 py-4">{new Date(msg.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="secondary" size="sm" onClick={() => setSelectedMessage(msg)}>View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <MessageDetailModal message={selectedMessage} onClose={() => setSelectedMessage(null)} onResend={handleResend} />
    </>
  );
};

export default Messages;
