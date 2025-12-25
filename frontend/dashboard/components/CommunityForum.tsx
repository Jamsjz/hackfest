"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, ThumbsUp, ThumbsDown, User, Plus, X, Search,
    Shield, CheckCircle, RefreshCw, AlertCircle
} from './ui/Icons';
import * as api from '../../lib/api-service';
import { ForumQuestion, ForumQuestionDetail, ForumAnswer } from '../../lib/api-service';
import ReactMarkdown from 'react-markdown';

const CommunityForum = () => {
    const [questions, setQuestions] = useState<ForumQuestion[]>([]);
    const [selectedQuestion, setSelectedQuestion] = useState<ForumQuestionDetail | null>(null);
    const [filter, setFilter] = useState<'all' | 'unanswered' | 'expert'>('all');
    const [sortBy, setSortBy] = useState<'newest' | 'upvotes'>('newest');
    const [isAsking, setIsAsking] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newImage, setNewImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Answer state
    const [answerContent, setAnswerContent] = useState("");

    useEffect(() => {
        fetchQuestions();
    }, [filter, sortBy]);

    const fetchQuestions = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getForumQuestions(filter, sortBy);
            setQuestions(data);
        } catch (err: any) {
            setError(err.message || "Failed to load questions");
        } finally {
            setLoading(false);
        }
    };

    const fetchQuestionDetail = async (id: number) => {
        setLoading(true);
        try {
            const data = await api.getForumQuestionDetail(id);
            setSelectedQuestion(data);
        } catch (err: any) {
            setError(err.message || "Failed to load question details");
        } finally {
            setLoading(false);
        }
    };

    const handleAskQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle || !newContent) return;

        setIsSubmitting(true);
        try {
            await api.createForumQuestion(newTitle, newContent, newImage || undefined);
            setIsAsking(false);
            setNewTitle("");
            setNewContent("");
            setNewImage(null);
            setImagePreview(null);
            fetchQuestions();
        } catch (err: any) {
            alert(err.message || "Failed to post question");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePostAnswer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!answerContent || !selectedQuestion) return;

        try {
            const newAns = await api.postAnswer(selectedQuestion.id, answerContent);
            setSelectedQuestion({
                ...selectedQuestion,
                answers: [newAns, ...selectedQuestion.answers],
                answers_count: selectedQuestion.answers_count + 1
            });
            setAnswerContent("");
            // Update the question in the list too
            setQuestions(prev => prev.map(q => q.id === selectedQuestion.id ? { ...q, answers_count: q.answers_count + 1 } : q));
        } catch (err: any) {
            alert(err.message || "Failed to post answer");
        }
    };

    const handleQuestionVote = async (id: number) => {
        try {
            await api.voteQuestion(id);
            // Optimization: Update UI locally
            setQuestions(prev => prev.map(q => q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q));
            if (selectedQuestion && selectedQuestion.id === id) {
                setSelectedQuestion({ ...selectedQuestion, upvotes: selectedQuestion.upvotes + 1 });
            }
        } catch (err: any) {
            console.error(err);
        }
    };

    const handleAnswerVote = async (ansId: number, type: number) => {
        try {
            await api.voteAnswer(ansId, type);
            if (selectedQuestion) {
                const updatedAnswers = selectedQuestion.answers.map(ans => {
                    if (ans.id === ansId) {
                        return {
                            ...ans,
                            upvotes: type === 1 ? ans.upvotes + 1 : ans.upvotes,
                            downvotes: type === -1 ? ans.downvotes + 1 : ans.downvotes
                        };
                    }
                    return ans;
                });
                setSelectedQuestion({ ...selectedQuestion, answers: updatedAnswers });
            }
        } catch (err: any) {
            console.error(err);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const ForumCard = ({ question }: { question: ForumQuestion }) => (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => fetchQuestionDetail(question.id)}
            className="glass-card-dark p-5 cursor-pointer group"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-xs">
                        {question.user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-white">{question.user.username}</span>
                            {question.user.is_expert && (
                                <span className="badge-warning-dark text-[10px] flex items-center gap-0.5">
                                    <Shield className="w-2.5 h-2.5" /> Expert
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] text-zinc-600">{new Date(question.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleQuestionVote(question.id); }}
                        className="flex items-center gap-1 text-zinc-600 hover:text-amber-400 transition-colors"
                    >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-xs font-bold">{question.upvotes}</span>
                    </button>
                    <div className="flex items-center gap-1 text-zinc-600">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs font-bold">{question.answers_count}</span>
                    </div>
                </div>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                {question.title}
            </h3>
            <p className="text-sm text-zinc-500 mt-2 line-clamp-2 leading-relaxed">
                {question.content}
            </p>
        </motion.div>
    );

    return (
        <div className="max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col gap-6">
            {/* Header Content */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 px-1">
                <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">Kisan Sangha</h2>
                    <p className="text-sm text-zinc-500 mt-1">Nepali Community Farming Forum • Exchange Knowledge</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            className="w-full input-dark rounded-full pl-10 pr-4 py-2.5 text-sm"
                        />
                    </div>
                    <button
                        onClick={() => setIsAsking(true)}
                        className="btn-accent-dark px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 flex-shrink-0"
                    >
                        <Plus className="w-4 h-4" /> Ask Question
                    </button>
                </div>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* Sidebar Filters */}
                <div className="hidden lg:flex flex-col w-64 gap-6 shrink-0 h-full overflow-y-auto pr-2 custom-scrollbar">
                    <div className="glass-card-dark p-4">
                        <h4 className="text-xs font-black text-zinc-600 uppercase tracking-widest mb-4">Feed Filters</h4>
                        <div className="space-y-2">
                            {[
                                { id: 'all', label: 'All Questions', icon: MessageSquare },
                                { id: 'unanswered', label: 'Unanswered', icon: RefreshCw },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setFilter(item.id as any)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${filter === item.id
                                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                        : 'text-zinc-500 hover:bg-white/5 border border-transparent'
                                        }`}
                                >
                                    <item.icon className={`w-4 h-4 ${filter === item.id ? 'text-amber-400' : 'text-zinc-600'}`} />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Feed Area */}
                <div className="flex-1 overflow-y-auto pb-10 space-y-4 custom-scrollbar pr-2">
                    {/* Mobile Filters */}
                    <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'unanswered', label: 'Unanswered' },
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => setFilter(item.id as any)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filter === item.id
                                    ? 'bg-amber-500 text-black'
                                    : 'glass-card-dark text-zinc-500'
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Sorting Toggle */}
                    <div className="flex justify-end gap-3 px-1">
                        <button
                            onClick={() => setSortBy('newest')}
                            className={`text-[10px] uppercase font-black tracking-widest pb-1 border-b-2 transition-all ${sortBy === 'newest' ? 'border-amber-500 text-amber-400' : 'border-transparent text-zinc-600'}`}
                        >
                            Newest
                        </button>
                        <button
                            onClick={() => setSortBy('upvotes')}
                            className={`text-[10px] uppercase font-black tracking-widest pb-1 border-b-2 transition-all ${sortBy === 'upvotes' ? 'border-amber-500 text-amber-400' : 'border-transparent text-zinc-600'}`}
                        >
                            Trending
                        </button>
                    </div>

                    {loading && !selectedQuestion ? (
                        <div className="flex justify-center py-20">
                            <RefreshCw className="w-10 h-10 text-amber-500 animate-spin opacity-40" />
                        </div>
                    ) : error ? (
                        <div className="glass-card-dark p-6 text-center border-red-500/20">
                            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                            <p className="text-red-400 font-bold">{error}</p>
                            <button onClick={fetchQuestions} className="text-red-400 text-sm mt-3 underline font-bold">Try again</button>
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="text-center py-20 glass-card-dark border-dashed">
                            <MessageSquare className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                            <h4 className="text-xl font-bold text-zinc-500">No questions found</h4>
                            <p className="text-zinc-600 text-sm mt-1">Be the first to start a conversation!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {questions.map(q => (
                                <ForumCard key={q.id} question={q} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Question Detail Overlay */}
            <AnimatePresence>
                {selectedQuestion && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1100] bg-black/70 backdrop-blur-xl flex items-center justify-center p-4"
                        onClick={() => setSelectedQuestion(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="glass-card-dark w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedQuestion(null)}
                                className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"
                            >
                                <X className="w-5 h-5 text-zinc-500" />
                            </button>

                            <div className="flex flex-col h-full overflow-hidden">
                                <div className="p-8 border-b border-white/5 flex-shrink-0">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-amber-500/20">
                                            {selectedQuestion.user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-white text-lg">{selectedQuestion.user.username}</h4>
                                                {selectedQuestion.user.is_expert && (
                                                    <span className="badge-warning-dark text-xs">Expert</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-zinc-600">{new Date(selectedQuestion.created_at).toLocaleString()}</p>
                                        </div>
                                        <div className="ml-auto flex items-center gap-2">
                                            <button
                                                onClick={() => handleQuestionVote(selectedQuestion.id)}
                                                className="btn-ghost-dark px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2"
                                            >
                                                <ThumbsUp className="w-5 h-5" />
                                                Support ({selectedQuestion.upvotes})
                                            </button>
                                        </div>
                                    </div>

                                    <h2 className="text-2xl font-black text-white leading-tight mb-4">{selectedQuestion.title}</h2>
                                    <div className="prose prose-sm prose-invert max-w-none text-zinc-400 leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                                        <ReactMarkdown>{selectedQuestion.content}</ReactMarkdown>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#0d0d0f]/50">
                                    {selectedQuestion.image_path && (
                                        <div className="relative w-full rounded-2xl overflow-hidden border border-white/5 mb-8 group">
                                            <img
                                                src={`${api.API_BASE_URL}${selectedQuestion.image_path}`}
                                                alt="Forum"
                                                className="w-full h-auto max-h-[400px] object-contain bg-black"
                                            />
                                        </div>
                                    )}

                                    {/* Answers Section */}
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                <MessageSquare className="w-6 h-6 text-amber-400" />
                                                Solutions ({selectedQuestion.answers.length})
                                            </h3>
                                        </div>

                                        <form onSubmit={handlePostAnswer} className="relative group sticky top-0 z-10">
                                            <textarea
                                                placeholder="Know the solution? Help out a fellow farmer..."
                                                value={answerContent}
                                                onChange={e => setAnswerContent(e.target.value)}
                                                className="w-full input-dark rounded-2xl p-5 text-sm min-h-[100px]"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!answerContent}
                                                className="absolute bottom-4 right-4 btn-accent-dark px-5 py-2 rounded-xl font-bold text-sm disabled:opacity-50"
                                            >
                                                Post Answer
                                            </button>
                                        </form>

                                        <div className="space-y-6 pt-4">
                                            {selectedQuestion.answers.length === 0 ? (
                                                <div className="text-center py-10 text-zinc-600 italic text-sm">
                                                    No answers yet. Share your expertise!
                                                </div>
                                            ) : (
                                                selectedQuestion.answers.map(ans => (
                                                    <div key={ans.id} className="group">
                                                        <div className="flex gap-4 p-6 glass-card-dark">
                                                            <div className="flex flex-col items-center gap-3 py-1">
                                                                <button
                                                                    onClick={() => handleAnswerVote(ans.id, 1)}
                                                                    className="text-zinc-600 hover:text-amber-400 transition-colors"
                                                                >
                                                                    <ThumbsUp className="w-5 h-5" />
                                                                </button>
                                                                <span className="font-black text-sm text-white">{ans.upvotes - ans.downvotes}</span>
                                                                <button
                                                                    onClick={() => handleAnswerVote(ans.id, -1)}
                                                                    className="text-zinc-600 hover:text-red-400 transition-colors"
                                                                >
                                                                    <ThumbsDown className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <span className="font-bold text-white text-sm">{ans.user.username}</span>
                                                                    {ans.user.is_expert && (
                                                                        <span className="badge-warning-dark text-[10px] flex items-center gap-0.5">
                                                                            <Shield className="w-2.5 h-2.5" /> Expert
                                                                        </span>
                                                                    )}
                                                                    <span className="text-[10px] text-zinc-600 ml-auto">{new Date(ans.created_at).toLocaleDateString()}</span>
                                                                </div>
                                                                <div className="text-sm text-zinc-400 leading-relaxed prose prose-sm prose-invert max-w-none">
                                                                    <ReactMarkdown>{ans.content}</ReactMarkdown>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ask Question Modal */}
            <AnimatePresence>
                {isAsking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1200] bg-black/70 backdrop-blur-xl flex items-center justify-center p-4"
                        onClick={() => setIsAsking(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="glass-card-dark w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="bg-gradient-to-r from-amber-600 to-orange-500 p-8 relative">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Ask the Community</h3>
                                <p className="text-amber-100/80 text-sm mt-1">Share your problems, get group solutions.</p>
                                <button
                                    onClick={() => setIsAsking(false)}
                                    className="absolute top-6 right-8 p-1.5 hover:bg-black/20 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-white" />
                                </button>
                            </div>

                            <form onSubmit={handleAskQuestion} className="p-8 space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-zinc-600 uppercase tracking-widest mb-2">The problem in short (Title)</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g., My rice leaves are turning yellow in lower belt..."
                                        value={newTitle}
                                        onChange={e => setNewTitle(e.target.value)}
                                        className="w-full input-dark rounded-xl p-4 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-zinc-600 uppercase tracking-widest mb-2">Description & Details</label>
                                    <textarea
                                        required
                                        placeholder="Explain the soil condition, crop variety, and when the problem started..."
                                        value={newContent}
                                        onChange={e => setNewContent(e.target.value)}
                                        className="w-full input-dark rounded-xl p-4 text-sm min-h-[150px]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-zinc-600 uppercase tracking-widest mb-2">Upload Photo (Optional)</label>
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="flex-1 glass-card-dark p-4 flex flex-col items-center justify-center gap-2 hover:border-amber-500/30 transition-all cursor-pointer relative"
                                            onClick={() => document.getElementById('forum-img-upload')?.click()}
                                        >
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="w-full h-32 object-contain rounded-lg" />
                                            ) : (
                                                <>
                                                    <Plus className="w-8 h-8 text-zinc-700" />
                                                    <span className="text-xs text-zinc-600">Add an image for better help</span>
                                                </>
                                            )}
                                            <input
                                                id="forum-img-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageChange}
                                            />
                                        </div>
                                        {imagePreview && (
                                            <button
                                                type="button"
                                                onClick={() => { setNewImage(null); setImagePreview(null); }}
                                                className="text-red-400 p-2 hover:bg-red-500/10 rounded-full transition-colors"
                                            >
                                                <X className="w-6 h-6" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsAsking(false)}
                                        className="flex-1 py-4 btn-ghost-dark rounded-2xl font-bold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !newTitle || !newContent}
                                        className="flex-1 py-4 btn-accent-dark rounded-2xl font-bold disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Posting..." : "Post to Community"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CommunityForum;
