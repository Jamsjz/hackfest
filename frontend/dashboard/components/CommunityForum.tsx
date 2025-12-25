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
            className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-agri-100 flex items-center justify-center text-agri-700 font-bold text-xs">
                        {question.user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-gray-800">{question.user.username}</span>
                            {question.user.is_expert && (
                                <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 uppercase tracking-tighter">
                                    <Shield className="w-2.5 h-2.5" /> Expert
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] text-gray-400">{new Date(question.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleQuestionVote(question.id); }}
                        className="flex items-center gap-1 text-gray-400 hover:text-agri-600 transition-colors"
                    >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-xs font-bold">{question.upvotes}</span>
                    </button>
                    <div className="flex items-center gap-1 text-gray-400">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs font-bold">{question.answers_count}</span>
                    </div>
                </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-agri-700 transition-colors line-clamp-2">
                {question.title}
            </h3>
            <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                {question.content}
            </p>
        </motion.div>
    );

    return (
        <div className="max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col gap-6">
            {/* Header Content */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6 px-1">
                <div>
                    <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Kisan Sangha</h2>
                    <p className="text-sm text-gray-500 mt-1">Nepali Community Farming Forum • Exchange Knowledge</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            className="w-full bg-white/50 border border-gray-200 rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-agri-500/20 outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setIsAsking(true)}
                        className="bg-agri-600 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-agri-600/20 hover:scale-105 transition-all flex items-center gap-2 flex-shrink-0"
                    >
                        <Plus className="w-4 h-4" /> Ask Question
                    </button>
                </div>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* Sidebar Filters */}
                <div className="hidden lg:flex flex-col w-64 gap-6 shrink-0 h-full overflow-y-auto pr-2 custom-scrollbar">
                    <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Feed Filters</h4>
                        <div className="space-y-2">
                            {[
                                { id: 'all', label: 'All Questions', icon: MessageSquare },
                                { id: 'unanswered', label: 'Unanswered', icon: RefreshCw },
                                { id: 'expert', label: 'Expert Reviewed', icon: Shield },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setFilter(item.id as any)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${filter === item.id
                                        ? 'bg-agri-100 text-agri-800 shadow-sm'
                                        : 'text-gray-500 hover:bg-white/50'
                                        }`}
                                >
                                    <item.icon className={`w-4 h-4 ${filter === item.id ? 'text-agri-600' : 'text-gray-400'}`} />
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
                            { id: 'expert', label: 'Expert' },
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => setFilter(item.id as any)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${filter === item.id
                                    ? 'bg-agri-600 text-white border-agri-600'
                                    : 'bg-white/60 text-gray-500 border-white/20'
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
                            className={`text-[10px] uppercase font-black tracking-widest pb-1 border-b-2 transition-all ${sortBy === 'newest' ? 'border-agri-600 text-agri-800' : 'border-transparent text-gray-400'}`}
                        >
                            Newest
                        </button>
                        <button
                            onClick={() => setSortBy('upvotes')}
                            className={`text-[10px] uppercase font-black tracking-widest pb-1 border-b-2 transition-all ${sortBy === 'upvotes' ? 'border-agri-600 text-agri-800' : 'border-transparent text-gray-400'}`}
                        >
                            Trending
                        </button>
                    </div>

                    {loading && !selectedQuestion ? (
                        <div className="flex justify-center py-20">
                            <RefreshCw className="w-10 h-10 text-agri-600 animate-spin opacity-20" />
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center">
                            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                            <p className="text-red-700 font-bold">{error}</p>
                            <button onClick={fetchQuestions} className="text-red-500 text-sm mt-3 underline font-bold">Try again</button>
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="text-center py-20 bg-white/40 rounded-3xl border border-white/20 border-dashed">
                            <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <h4 className="text-xl font-bold text-gray-400">No questions found</h4>
                            <p className="text-gray-400 text-sm mt-1">Be the first to start a conversation!</p>
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
                        className="fixed inset-0 z-[1100] bg-black/40 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setSelectedQuestion(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedQuestion(null)}
                                className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>

                            <div className="flex flex-col h-full overflow-hidden">
                                <div className="p-8 border-b border-gray-100 flex-shrink-0">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 rounded-full bg-agri-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-agri-600/20">
                                            {selectedQuestion.user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-gray-800 text-lg">{selectedQuestion.user.username}</h4>
                                                {selectedQuestion.user.is_expert && (
                                                    <span className="bg-amber-100 text-amber-700 text-xs font-black px-2 py-0.5 rounded uppercase">Expert</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400">{new Date(selectedQuestion.created_at).toLocaleString()}</p>
                                        </div>
                                        <div className="ml-auto flex items-center gap-2">
                                            <button
                                                onClick={() => handleQuestionVote(selectedQuestion.id)}
                                                className="bg-agri-50 text-agri-700 px-4 py-2 rounded-xl border border-agri-100 font-bold text-sm flex items-center gap-2 hover:bg-agri-100 transition-all"
                                            >
                                                <ThumbsUp className="w-5 h-5" />
                                                Support ({selectedQuestion.upvotes})
                                            </button>
                                        </div>
                                    </div>

                                    <h2 className="text-2xl font-black text-gray-900 leading-tight mb-4">{selectedQuestion.title}</h2>
                                    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                                        <ReactMarkdown>{selectedQuestion.content}</ReactMarkdown>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/50">
                                    {selectedQuestion.image_path && (
                                        <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 mb-8 group">
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
                                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                                <MessageSquare className="w-6 h-6 text-agri-600" />
                                                Solutions ({selectedQuestion.answers.length})
                                            </h3>
                                        </div>

                                        <form onSubmit={handlePostAnswer} className="relative group sticky top-0 z-10">
                                            <textarea
                                                placeholder="Know the solution? Help out a fellow farmer..."
                                                value={answerContent}
                                                onChange={e => setAnswerContent(e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-2xl p-5 text-sm shadow-sm focus:ring-4 focus:ring-agri-500/10 outline-none transition-all min-h-[100px]"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!answerContent}
                                                className="absolute bottom-4 right-4 bg-agri-600 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-md hover:scale-105 transition-all disabled:opacity-50"
                                            >
                                                Post Answer
                                            </button>
                                        </form>

                                        <div className="space-y-6 pt-4">
                                            {selectedQuestion.answers.length === 0 ? (
                                                <div className="text-center py-10 text-gray-400 italic text-sm">
                                                    No answers yet. Share your expertise!
                                                </div>
                                            ) : (
                                                selectedQuestion.answers.map(ans => (
                                                    <div key={ans.id} className="group">
                                                        <div className="flex gap-4 p-6 rounded-2xl bg-white border border-gray-100 group-hover:border-agri-100 shadow-sm transition-all">
                                                            <div className="flex flex-col items-center gap-3 py-1">
                                                                <button
                                                                    onClick={() => handleAnswerVote(ans.id, 1)}
                                                                    className="text-gray-400 hover:text-agri-600 transition-colors"
                                                                >
                                                                    <ThumbsUp className="w-5 h-5" />
                                                                </button>
                                                                <span className="font-black text-sm text-gray-700">{ans.upvotes - ans.downvotes}</span>
                                                                <button
                                                                    onClick={() => handleAnswerVote(ans.id, -1)}
                                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                                >
                                                                    <ThumbsDown className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <span className="font-bold text-gray-800 text-sm">{ans.user.username}</span>
                                                                    {ans.user.is_expert && (
                                                                        <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 uppercase tracking-tighter">
                                                                            <Shield className="w-2.5 h-2.5" /> Expert
                                                                        </span>
                                                                    )}
                                                                    <span className="text-[10px] text-gray-400 ml-auto">{new Date(ans.created_at).toLocaleDateString()}</span>
                                                                </div>
                                                                <div className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none">
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
                        className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setIsAsking(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="bg-gradient-to-r from-agri-700 to-agri-600 p-8 text-white relative">
                                <h3 className="text-2xl font-black uppercase tracking-tight">Ask the Community</h3>
                                <p className="text-agri-100 text-sm mt-1">Share your problems, get group solutions.</p>
                                <button
                                    onClick={() => setIsAsking(false)}
                                    className="absolute top-6 right-8 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleAskQuestion} className="p-8 space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">The problem in short (Title)</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g., My rice leaves are turning yellow in lower belt..."
                                        value={newTitle}
                                        onChange={e => setNewTitle(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:ring-4 focus:ring-agri-500/10 focus:bg-white outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Description & Details</label>
                                    <textarea
                                        required
                                        placeholder="Explain the soil condition, crop variety, and when the problem started..."
                                        value={newContent}
                                        onChange={e => setNewContent(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:ring-4 focus:ring-agri-500/10 focus:bg-white outline-none transition-all min-h-[150px]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Upload Photo (Optional)</label>
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="flex-1 border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-agri-300 hover:bg-agri-50 transition-all cursor-pointer relative"
                                            onClick={() => document.getElementById('forum-img-upload')?.click()}
                                        >
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="w-full h-32 object-contain rounded-lg" />
                                            ) : (
                                                <>
                                                    <Plus className="w-8 h-8 text-gray-300" />
                                                    <span className="text-xs text-gray-500">Add an image for better help</span>
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
                                                className="text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
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
                                        className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !newTitle || !newContent}
                                        className="flex-1 py-4 bg-agri-600 text-white font-bold rounded-2xl shadow-xl shadow-agri-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
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
