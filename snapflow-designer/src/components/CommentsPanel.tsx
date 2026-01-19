import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MoreVertical, CheckCircle, MessageSquare, User as UserIcon, CornerDownRight } from 'lucide-react';
import { commentService, Comment } from '@/services/commentService';

interface CommentsPanelProps {
    workflowId: string;
    selectedNodeId: string | null;
    onClose: () => void;
}

import { useAuth, User } from '@/components/AuthContext';

// ...

export default function CommentsPanel({ workflowId, selectedNodeId, onClose }: CommentsPanelProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'node'>('all');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Mentions State
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [cursorPosition, setCursorPosition] = useState(0);

    useEffect(() => {
        loadComments();
        fetchUsers();
    }, [workflowId]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:8081/api/identity/users');
            if (res.ok) setAvailableUsers(await res.json());
        } catch (e) { console.error("Failed to fetch users for mentions", e); }
    };

    useEffect(() => {
        // Auto-switch filter when node is selected
        if (selectedNodeId) {
            setFilter('node');
        } else {
            setFilter('all');
        }
    }, [selectedNodeId]);

    const loadComments = async () => {
        try {
            const data = await commentService.getComments(workflowId);
            setComments(data);
        } catch (error) {
            console.error("Failed to load comments", error);
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        const selStart = e.target.selectionStart;
        setInput(val);
        setCursorPosition(selStart);

        // Simple mention detection: Look for @ followed by characters until space or end
        const lastAt = val.lastIndexOf('@', selStart - 1);
        if (lastAt !== -1) {
            const potentialQuery = val.substring(lastAt + 1, selStart);
            if (!potentialQuery.includes(' ')) {
                setMentionQuery(potentialQuery);
                setShowMentions(true);
                return;
            }
        }
        setShowMentions(false);
    };

    const handleSelectMention = (mentionedUser: User) => {
        const lastAt = input.lastIndexOf('@', cursorPosition - 1);
        const before = input.substring(0, lastAt);
        const after = input.substring(cursorPosition);
        const newValue = `${before}@${mentionedUser.fullName} ${after}`;
        setInput(newValue);
        setShowMentions(false);
        // Focus back? Ideally yes.
    };

    const handleSend = async () => {
        if (!input.trim() || !user) return;
        setIsLoading(true);

        // simple extraction of mentions (could be robustified)
        const mentions: string[] = [];
        availableUsers.forEach(u => {
            if (input.includes(`@${u.fullName}`)) {
                mentions.push(u.id);
            }
        });

        try {
            const newComment = await commentService.createComment({
                workflowId,
                nodeId: filter === 'node' ? selectedNodeId : null,
                text: input,
                author: { id: user.id, name: user.fullName, avatarUrl: user.avatarUrl },
                mentions: mentions,
                resolved: false
            });
            setComments([...comments, newComment]);
            setInput('');
            // Scroll to bottom
            setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 100);
        } catch (error) {
            console.error("Failed to send comment", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResolve = async (commentId: string) => {
        try {
            const updated = await commentService.resolveComment(commentId, user?.id || 'unknown');
            setComments(comments.map(c => c.id === commentId ? updated : c));
        } catch (error) {
            console.error("Failed to resolve", error);
        }
    };

    // Filter comments based on view mode
    const filteredComments = comments.filter(c => {
        if (filter === 'node') return c.nodeId === selectedNodeId;
        return true; // Show all in 'all' mode, or distinct logic if 'all' means 'global only'
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-full bg-white border-l border-slate-200 shadow-xl w-80 fixed right-0 top-[60px] bottom-0 z-40 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <MessageSquare size={18} className="text-[#D41C2C]" />
                        Comments
                    </h3>
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${filter === 'all' ? 'bg-[#D41C2C] text-white' : 'text-slate-500 hover:bg-slate-200'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('node')}
                            disabled={!selectedNodeId}
                            className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${filter === 'node' ? 'bg-[#D41C2C] text-white' : 'text-slate-500 hover:bg-slate-200 disabled:opacity-50'}`}
                        >
                            {selectedNodeId ? 'Current Node' : 'Select Node'}
                        </button>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                </button>
            </div>

            {/* Comments List */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {filteredComments.length === 0 ? (
                    <div className="text-center text-slate-400 mt-10 text-sm">
                        <MessageSquare size={32} className="mx-auto mb-2 opacity-20" />
                        <p>No comments yet.</p>
                        {filter === 'node' && <p className="text-xs">Start the discussion on this node!</p>}
                    </div>
                ) : (
                    filteredComments.map(comment => (
                        <div key={comment.id} className={`bg-white p-3 rounded-lg border shadow-sm ${comment.resolved ? 'opacity-60 border-green-200 bg-green-50' : 'border-slate-200'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                                        {comment.author.name.charAt(0)}
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">{comment.author.name}</span>
                                </div>
                                <span className="text-[10px] text-slate-400">{formatDate(comment.createdAt)}</span>
                            </div>

                            <p className="text-sm text-slate-800 break-words mb-2">{comment.text}</p>

                            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                <div className="text-[10px] text-slate-400 font-mono">
                                    {comment.nodeId ? `Node: ${comment.nodeId.substring(0, 8)}...` : 'Global'}
                                </div>
                                {!comment.resolved && (
                                    <button
                                        onClick={() => handleResolve(comment.id)}
                                        className="flex items-center gap-1 text-[10px] font-bold text-green-600 hover:bg-green-50 px-1.5 py-0.5 rounded transition-colors"
                                    >
                                        <CheckCircle size={12} /> Resolve
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-slate-200 bg-white">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={handleInput}
                        placeholder={filter === 'node' && selectedNodeId ? "Comment on this node..." : "Add a general comment..."}
                        className="w-full pl-3 pr-10 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-[#D41C2C] focus:outline-none resize-none min-h-[80px]"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="absolute bottom-2 right-2 p-1.5 bg-[#D41C2C] text-white rounded-md hover:bg-[#B81926] disabled:opacity-50 transition-all"
                    >
                        <Send size={16} />
                    </button>

                    {/* Mentions Popup */}
                    {showMentions && (
                        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50">
                            {availableUsers
                                .filter(u => u.fullName.toLowerCase().includes(mentionQuery.toLowerCase()))
                                .map(u => (
                                    <button
                                        key={u.id}
                                        onClick={() => handleSelectMention(u)}
                                        className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-sm text-slate-700"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-[#D41C2C] text-white flex items-center justify-center text-xs font-bold">
                                            {u.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold">{u.fullName}</div>
                                            <div className="text-[10px] text-slate-400">@{u.username}</div>
                                        </div>
                                    </button>
                                ))}
                        </div>
                    )}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                    <span>Markdown supported</span>
                    <span>Press Enter to send</span>
                </div>
            </div>
        </div>
    );
}
