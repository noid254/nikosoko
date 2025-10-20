import React, { useState } from 'react';
import type { InboxMessage } from '../types';
import { MOCK_INBOX_MESSAGES } from '../constants';

const InboxMessageRow: React.FC<{ message: InboxMessage, onSelect: () => void, isSelected: boolean }> = ({ message, onSelect, isSelected }) => {
    const isRead = message.isRead || isSelected;
    return (
        <button onClick={onSelect} className="w-full text-left p-4 border-b border-gray-200 hover:bg-gray-50">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {!isRead && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>}
                    <p className={`font-semibold ${isRead ? 'text-gray-700' : 'text-gray-900'}`}>{message.from}</p>
                </div>
                <p className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleDateString()}</p>
            </div>
            <p className={`mt-1 ${isRead ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>{message.subject}</p>
            {isSelected && (
                 <p className="mt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{message.body}</p>
            )}
        </button>
    )
}

const InboxView: React.FC = () => {
    const [messages, setMessages] = useState<InboxMessage[]>(MOCK_INBOX_MESSAGES);
    const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
    
    const handleSelectMessage = (id: number) => {
        setSelectedMessageId(prev => prev === id ? null : id);
        setMessages(msgs => msgs.map(msg => msg.id === id ? {...msg, isRead: true} : msg));
    };

    return (
        <div className="bg-white min-h-full">
            <h1 className="text-xl font-bold text-gray-800 p-4 border-b border-gray-200">Inbox</h1>
            {messages.length > 0 ? (
                <div>
                    {messages.map(msg => (
                        <InboxMessageRow 
                            key={msg.id} 
                            message={msg}
                            isSelected={selectedMessageId === msg.id}
                            onSelect={() => handleSelectMessage(msg.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
                    <p className="mt-1 text-sm text-gray-500">Your messages from the Soko Team will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default InboxView;