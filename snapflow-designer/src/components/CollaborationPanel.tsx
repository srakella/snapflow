import React, { useState, useEffect, useRef } from 'react';
import { Send, AtSign, Check, X, MessageCircle, Bell } from 'lucide-react';

export interface CollaborationMessage {
    id: string;
    contextType: 'workflow' | 'form' | 'rule' | 'node';
    contextId: string;
    nodeId?: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
    };
    content: string;
    mentions: string[]; // User IDs
    parentId?: string;
    status: 'open' | 'resolved';
    createdAt: string;
    acknowledgedBy: string[];
}

interface CollaborationPanelProps {
    contextType: 'workflow' | 'form' | 'rule';
    contextId: string;
    nodeId?: string;
    currentUserId: string;
    onClose?: () => void;
}

export function CollaborationPanel({
    contextType,
    contextId,
    nodeId,
    currentUserId,
    onClose
}: CollaborationPanelProps) {
    const [messages, setMessages] = useState<CollaborationMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [showMentions, setShowMentions] = useState(false);
    const [mentionSearch, setMentionSearch] = useState('');
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Fetch messages for this context
    useEffect(() => {
        fetchMessages();
        fetchUsers();

        // Poll for new messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [contextType, contextId, nodeId]);

    const fetchMessages = async () => {
        try {
            const params = new URLSearchParams({
                contextType,
                contextId,
                ...(nodeId && { nodeId })
            });
            const response = await fetch(`http://localhost:8081/api/collaboration/messages?${params}`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/users');
            if (response.ok) {
                const data = await response.json();
                setAvailableUsers(data);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setNewMessage(value);

        // Detect @ mentions
        const lastAtIndex = value.lastIndexOf('@');
        if (lastAtIndex !== -1) {
            const afterAt = value.substring(lastAtIndex + 1);
            const hasSpace = afterAt.includes(' ');

            if (!hasSpace) {
                setMentionSearch(afterAt);
                setShowMentions(true);
            } else {
                setShowMentions(false);
            }
        } else {
            setShowMentions(false);
        }
    };

    const insertMention = (user: any) => {
        const lastAtIndex = newMessage.lastIndexOf('@');
        const beforeAt = newMessage.substring(0, lastAtIndex);
        const afterMention = newMessage.substring(lastAtIndex + 1 + mentionSearch.length);

        setNewMessage(`${beforeAt}@${user.name} ${afterMention}`);
        setShowMentions(false);
        inputRef.current?.focus();
    };

    const extractMentions = (text: string): string[] => {
        const mentionRegex = /@(\w+)/g;
        const matches = text.matchAll(mentionRegex);
        const mentionedUserIds: string[] = [];

        for (const match of matches) {
            const userName = match[1];
            const user = availableUsers.find(u => u.name.toLowerCase() === userName.toLowerCase());
            if (user) {
                mentionedUserIds.push(user.id);
            }
        }

        return mentionedUserIds;
    };

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        const mentions = extractMentions(newMessage);

        try {
            const response = await fetch('http://localhost:8081/api/collaboration/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contextType,
                    contextId,
                    nodeId,
                    content: newMessage,
                    mentions,
                    parentId: replyingTo,
                    authorId: currentUserId
                })
            });

            if (response.ok) {
                setNewMessage('');
                setReplyingTo(null);
                await fetchMessages();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleAcknowledge = async (messageId: string) => {
        try {
            await fetch(`http://localhost:8081/api/collaboration/messages/${messageId}/acknowledge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId })
            });
            await fetchMessages();
        } catch (error) {
            console.error('Failed to acknowledge:', error);
        }
    };

    const handleResolve = async (messageId: string) => {
        try {
            await fetch(`http://localhost:8081/api/collaboration/messages/${messageId}/resolve`, {
                method: 'PATCH'
            });
            await fetchMessages();
        } catch (error) {
            console.error('Failed to resolve:', error);
        }
    };

    const filteredUsers = availableUsers.filter(user =>
        user.name.toLowerCase().includes(mentionSearch.toLowerCase()) &&
        user.id !== currentUserId
    );

    const threadedMessages = messages.filter(m => !m.parentId);
    const getReplies = (parentId: string) => messages.filter(m => m.parentId === parentId);

    return (
        <div className="flex flex-col h-full bg-white border-l border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-2">
                    <MessageCircle size={20} className="text-blue-600" />
                    <h3 className="font-bold text-gray-800">Collaboration</h3>
                    {messages.filter(m => m.status === 'open').length > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {messages.filter(m => m.status === 'open').length}
                        </span>
                    )}
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {threadedMessages.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                        <MessageCircle size={48} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No comments yet. Start a conversation!</p>
                    </div>
                ) : (
                    threadedMessages.map(message => (
                        <div key={message.id} className={`border rounded-lg p-3 ${message.status === 'resolved' ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
                            {/* Message Header */}
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                        {message.author.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-800">{message.author.name}</p>
                                        <p className="text-xs text-gray-500">{new Date(message.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                {message.status === 'open' && (
                                    <button
                                        onClick={() => handleResolve(message.id)}
                                        className="text-xs text-green-600 hover:text-green-700 font-bold flex items-center gap-1"
                                    >
                                        <Check size={14} /> Resolve
                                    </button>
                                )}
                            </div>

                            {/* Message Content */}
                            <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">
                                {message.content.split(/(@\w+)/g).map((part, i) =>
                                    part.startsWith('@') ? (
                                        <span key={i} className="text-blue-600 font-bold bg-blue-50 px-1 rounded">{part}</span>
                                    ) : part
                                )}
                            </p>

                            {/* Actions */}
                            <div className="flex items-center gap-2 text-xs">
                                <button
                                    onClick={() => setReplyingTo(message.id)}
                                    className="text-blue-600 hover:text-blue-700 font-bold"
                                >
                                    Reply
                                </button>
                                {message.mentions.includes(currentUserId) && !message.acknowledgedBy.includes(currentUserId) && (
                                    <button
                                        onClick={() => handleAcknowledge(message.id)}
                                        className="text-purple-600 hover:text-purple-700 font-bold"
                                    >
                                        Acknowledge
                                    </button>
                                )}
                                {message.acknowledgedBy.length > 0 && (
                                    <span className="text-gray-500">✓ {message.acknowledgedBy.length} acknowledged</span>
                                )}
                            </div>

                            {/* Replies */}
                            {getReplies(message.id).map(reply => (
                                <div key={reply.id} className="ml-6 mt-3 border-l-2 border-blue-200 pl-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                                            {reply.author.name.charAt(0).toUpperCase()}
                                        </div>
                                        <p className="font-bold text-xs text-gray-700">{reply.author.name}</p>
                                        <p className="text-xs text-gray-400">{new Date(reply.createdAt).toLocaleString()}</p>
                                    </div>
                                    <p className="text-sm text-gray-600">{reply.content}</p>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
                {replyingTo && (
                    <div className="flex items-center justify-between mb-2 text-xs bg-blue-50 p-2 rounded">
                        <span className="text-blue-700">Replying to message...</span>
                        <button onClick={() => setReplyingTo(null)} className="text-blue-600 hover:text-blue-800">
                            <X size={14} />
                        </button>
                    </div>
                )}

                <div className="relative">
                    <textarea
                        ref={inputRef}
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                handleSend();
                            }
                        }}
                        placeholder="Type @ to mention someone..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                    />

                    {/* Mention Dropdown */}
                    {showMentions && filteredUsers.length > 0 && (
                        <div className="absolute bottom-full left-0 mb-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                            {filteredUsers.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => insertMention(user)}
                                    className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center gap-2 text-sm"
                                >
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium">{user.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                        <AtSign size={12} className="inline" /> Use @ to mention • Cmd+Enter to send
                    </p>
                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={14} /> Send
                    </button>
                </div>
            </div>
        </div>
    );
}
