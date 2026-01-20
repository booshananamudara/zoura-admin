'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2, MessageSquare, User, Calendar, Image as ImageIcon } from 'lucide-react';

interface Post {
    id: string;
    content: string;
    image_url?: string;
    created_at: string;
    user: {
        name: string;
        email: string;
    };
}

export default function SocialModerationPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPendingPosts();
    }, []);

    const fetchPendingPosts = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('admin_token');
            
            if (!token) {
                router.push('/admin/login');
                return;
            }

            const response = await fetch('http://localhost:8080/admin/social/pending', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch pending posts');
            }

            const data = await response.json();
            setPosts(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        try {
            const token = localStorage.getItem('admin_token');
            
            const response = await fetch(`http://localhost:8080/admin/social/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: 'APPROVED' }),
            });

            if (!response.ok) {
                throw new Error('Failed to approve post');
            }

            // Optimistic update - remove from list
            setPosts(posts.filter((post) => post.id !== id));
        } catch (err: any) {
            alert('Failed to approve post: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: string) => {
        setActionLoading(id);
        try {
            const token = localStorage.getItem('admin_token');
            
            const response = await fetch(`http://localhost:8080/admin/social/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: 'REJECTED' }),
            });

            if (!response.ok) {
                throw new Error('Failed to reject post');
            }

            // Optimistic update - remove from list
            setPosts(posts.filter((post) => post.id !== id));
        } catch (err: any) {
            alert('Failed to reject post: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(date);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                    onClick={fetchPendingPosts}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-purple-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Social Moderation Queue</h1>
                </div>
                <p className="text-gray-400 ml-13">Review and moderate pending social media posts</p>
            </div>

            {/* Empty State */}
            {posts.length === 0 ? (
                <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-12">
                    <div className="text-center">
                        <MessageSquare className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No pending posts</h3>
                        <p className="text-gray-400">All posts have been reviewed!</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Stats Badge */}
                    <div className="mb-6">
                        <span className="px-4 py-2 bg-amber-500/20 text-amber-400 text-sm font-medium rounded-full">
                            {posts.length} {posts.length === 1 ? 'post' : 'posts'} pending review
                        </span>
                    </div>

                    {/* Posts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden hover:border-purple-500/30 transition-colors"
                            >
                                {/* Card Header - User Info */}
                                <div className="px-6 py-4 border-b border-gray-700 bg-gray-900/50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                            <User className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">{post.user.name}</p>
                                            <p className="text-xs text-gray-400">{post.user.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-6">
                                    {/* Image */}
                                    {post.image_url && (
                                        <div className="mb-4 rounded-lg overflow-hidden bg-gray-900">
                                            <img
                                                src={post.image_url}
                                                alt="Post content"
                                                className="w-full h-48 object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="mb-4">
                                        <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">
                                            {post.content}
                                        </p>
                                    </div>

                                    {/* Timestamp */}
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                        <Calendar className="h-3 w-3" />
                                        <span>{formatDate(post.created_at)}</span>
                                    </div>
                                </div>

                                {/* Card Footer - Actions */}
                                <div className="px-6 py-4 bg-gray-900/30 border-t border-gray-700">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleApprove(post.id)}
                                            disabled={actionLoading === post.id}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                        >
                                            {actionLoading === post.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Check className="w-4 h-4" />
                                            )}
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(post.id)}
                                            disabled={actionLoading === post.id}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                        >
                                            {actionLoading === post.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <X className="w-4 h-4" />
                                            )}
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
