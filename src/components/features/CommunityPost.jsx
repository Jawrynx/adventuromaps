/**
 * CommunityPost.jsx - Individual community post view
 * 
 * This component displays a single community post with full content,
 * comments/replies, and interaction features (like, share, reply).
 * 
 * Features:
 * - Full post content display
 * - Image gallery for multiple images
 * - Comments/replies section
 * - Like and share functionality
 * - Author profile display
 * - Related posts suggestions
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faArrowLeft, faHeart, faComment, faShare, faBookmark,
    faPaperPlane, faEllipsisV, faFlag, faClock, faSpinner,
    faChevronLeft, faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartOutline, faBookmark as faBookmarkOutline } from '@fortawesome/free-solid-svg-icons';
import { 
    doc, 
    getDoc, 
    updateDoc, 
    arrayUnion, 
    arrayRemove,
    increment,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    addDoc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import './css/CommunityPost.css';
import AdvancedLoadingScreen from '../ui/AdvancedLoadingScreen';

/**
 * CommunityPost Component
 * 
 * Displays a full community post with all details and interaction capabilities.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - Current authenticated user
 * @param {Object} props.userDocument - Full user document from Firestore
 * @returns {JSX.Element} Full post view interface
 */
function CommunityPost({ user, userDocument }) {
    const { postId } = useParams();
    const navigate = useNavigate();
    
    // ========== STATE ==========
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [likes, setLikes] = useState(0);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [relatedPosts, setRelatedPosts] = useState([]);

    // ========== DATA FETCHING ==========
    
    /**
     * Fetch post data from Firestore
     */
    const fetchPost = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const postRef = doc(db, 'community_posts', postId);
            const postSnap = await getDoc(postRef);
            
            if (postSnap.exists()) {
                const postData = { id: postSnap.id, ...postSnap.data() };
                setPost(postData);
                setLikes(postData.likes || 0);
                setIsLiked(postData.likedBy?.includes(user?.uid) || false);
                
                // Fetch comments
                await fetchComments();
                
                // Fetch related posts
                await fetchRelatedPosts(postData.category, postData.id);
            } else {
                setError('Post not found');
            }
        } catch (err) {
            console.error('Error fetching post:', err);
            setError('Failed to load post');
        } finally {
            setIsLoading(false);
        }
    }, [postId, user?.uid]);

    /**
     * Fetch comments for the post
     */
    const fetchComments = useCallback(async () => {
        try {
            const commentsQuery = query(
                collection(db, 'community_posts', postId, 'comments'),
                orderBy('createdAt', 'asc'),
                limit(50)
            );
            const snapshot = await getDocs(commentsQuery);
            const commentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setComments(commentsData);
        } catch (err) {
            console.error('Error fetching comments:', err);
        }
    }, [postId]);

    /**
     * Fetch related posts based on category
     */
    const fetchRelatedPosts = useCallback(async (category, currentPostId) => {
        try {
            const relatedQuery = query(
                collection(db, 'community_posts'),
                where('category', '==', category),
                where('status', '==', 'published'),
                orderBy('createdAt', 'desc'),
                limit(4)
            );
            const snapshot = await getDocs(relatedQuery);
            const relatedData = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(p => p.id !== currentPostId)
                .slice(0, 3);
            setRelatedPosts(relatedData);
        } catch (err) {
            console.error('Error fetching related posts:', err);
        }
    }, []);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    // ========== EVENT HANDLERS ==========

    /**
     * Handle liking/unliking a post
     */
    const handleLike = async () => {
        if (!user) {
            alert('Please log in to like posts');
            return;
        }

        try {
            const postRef = doc(db, 'community_posts', postId);
            
            if (isLiked) {
                await updateDoc(postRef, {
                    likes: increment(-1),
                    likedBy: arrayRemove(user.uid)
                });
                setLikes(prev => prev - 1);
                setIsLiked(false);
            } else {
                await updateDoc(postRef, {
                    likes: increment(1),
                    likedBy: arrayUnion(user.uid)
                });
                setLikes(prev => prev + 1);
                setIsLiked(true);
            }
        } catch (err) {
            console.error('Error updating like:', err);
        }
    };

    /**
     * Handle submitting a new comment
     */
    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Please log in to comment');
            return;
        }

        if (!newComment.trim()) return;

        setIsSubmittingComment(true);

        try {
            const commentData = {
                content: newComment.trim(),
                author: userDocument?.displayName || user.displayName || 'Anonymous',
                authorId: user.uid,
                authorAvatar: userDocument?.displayName?.substring(0, 2).toUpperCase() || 'AN',
                authorPhotoURL: userDocument?.photoURL || user.photoURL || null,
                createdAt: serverTimestamp(),
                likes: 0,
                likedBy: []
            };

            await addDoc(collection(db, 'community_posts', postId, 'comments'), commentData);

            // Update reply count on post
            const postRef = doc(db, 'community_posts', postId);
            await updateDoc(postRef, {
                replies: increment(1)
            });

            setNewComment('');
            await fetchComments();
        } catch (err) {
            console.error('Error adding comment:', err);
            alert('Failed to add comment. Please try again.');
        } finally {
            setIsSubmittingComment(false);
        }
    };

    /**
     * Handle sharing the post
     */
    const handleShare = async () => {
        const shareUrl = window.location.href;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: post?.title,
                    text: post?.content?.substring(0, 100) + '...',
                    url: shareUrl
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error sharing:', err);
                }
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(shareUrl);
                alert('Link copied to clipboard!');
            } catch (err) {
                console.error('Error copying to clipboard:', err);
            }
        }
    };

    /**
     * Format date for display
     */
    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    /**
     * Format relative time for comments
     */
    const formatRelativeTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // ========== RENDER ==========
    
    if (isLoading) {
        return (
            <AdvancedLoadingScreen message="Loading post..." />
        );
    }

    if (error) {
        return (
            <div id="community-post">
                <div className="geometric-grid">
                    <div className="grid-pattern"></div>
                </div>
                <div className="error-state">
                    <h2>Oops!</h2>
                    <p>{error}</p>
                    <button className="back-btn" onClick={() => navigate('/community')}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Back to Community
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div id="community-post">
            {/* Geometric Grid Background */}
            <div className="geometric-grid">
                <div className="grid-pattern"></div>
            </div>

            {/* Post Header/Navigation */}
            <header className="post-view-header">
                <button className="back-btn" onClick={() => navigate('/community')}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Back to Community
                </button>
            </header>

            {/* Main Content */}
            <main className="post-view-content">
                <article className="post-full">
                    {/* Post Header */}
                    <div className="post-full-header">
                        <span className="post-category-badge">{post?.category}</span>
                        <h1 className="post-full-title">{post?.title}</h1>
                        
                        {/* Author Info */}
                        <div className="post-author-section">
                            <div className="author-avatar large">
                                {post?.authorPhotoURL ? (
                                    <img src={post.authorPhotoURL} alt={post.author} />
                                ) : (
                                    post?.authorAvatar || post?.author?.substring(0, 2).toUpperCase()
                                )}
                            </div>
                            <div className="author-details">
                                <span className="author-name">{post?.author}</span>
                                <span className="post-timestamp">
                                    <FontAwesomeIcon icon={faClock} />
                                    {formatDate(post?.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Post Images */}
                    {post?.image_urls && post.image_urls.length > 0 && (
                        <div className="post-images-gallery">
                            <div className="gallery-main-image">
                                <img 
                                    src={post.image_urls[currentImageIndex]} 
                                    alt={`${post.title} - Image ${currentImageIndex + 1}`}
                                />
                                {post.image_urls.length > 1 && (
                                    <>
                                        <button 
                                            className="gallery-nav prev"
                                            onClick={() => setCurrentImageIndex(prev => 
                                                prev === 0 ? post.image_urls.length - 1 : prev - 1
                                            )}
                                        >
                                            <FontAwesomeIcon icon={faChevronLeft} />
                                        </button>
                                        <button 
                                            className="gallery-nav next"
                                            onClick={() => setCurrentImageIndex(prev => 
                                                prev === post.image_urls.length - 1 ? 0 : prev + 1
                                            )}
                                        >
                                            <FontAwesomeIcon icon={faChevronRight} />
                                        </button>
                                        <div className="gallery-indicators">
                                            {post.image_urls.map((_, index) => (
                                                <span 
                                                    key={index}
                                                    className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {post?.tags && post.tags.length > 0 && (
                        <div className="post-tags-full">
                            {post.tags.map((tag, index) => (
                                <span key={index} className="post-tag">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Post Content */}
                    <div className="post-full-content">
                        {post?.content?.split('\n').map((paragraph, index) => (
                            paragraph.trim() && <p key={index}>{paragraph}</p>
                        ))}
                    </div>

                    {/* Post Actions */}
                    <div className="post-actions">
                        <button 
                            className={`action-btn ${isLiked ? 'active' : ''}`}
                            onClick={handleLike}
                        >
                            <FontAwesomeIcon icon={isLiked ? faHeart : faHeartOutline} />
                            <span>{likes}</span>
                        </button>
                        <button className="action-btn">
                            <FontAwesomeIcon icon={faComment} />
                            <span>{comments.length}</span>
                        </button>
                        <button className="action-btn" onClick={handleShare}>
                            <FontAwesomeIcon icon={faShare} />
                            <span>Share</span>
                        </button>
                        <button 
                            className={`action-btn ${isBookmarked ? 'active' : ''}`}
                            onClick={() => setIsBookmarked(!isBookmarked)}
                        >
                            <FontAwesomeIcon icon={isBookmarked ? faBookmark : faBookmarkOutline} />
                        </button>
                    </div>

                    {/* Comments Section */}
                    <section className="comments-section">
                        <h3>Comments ({comments.length})</h3>
                        
                        {/* New Comment Form */}
                        {user ? (
                            <form className="new-comment-form" onSubmit={handleSubmitComment}>
                                <div className="comment-input-wrapper">
                                    <div className="author-avatar small">
                                        {userDocument?.photoURL || user.photoURL ? (
                                            <img src={userDocument?.photoURL || user.photoURL} alt="You" />
                                        ) : (
                                            (userDocument?.displayName || user.displayName || 'A').substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Write a comment..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />
                                    <button 
                                        type="submit" 
                                        className="submit-comment-btn"
                                        disabled={isSubmittingComment || !newComment.trim()}
                                    >
                                        {isSubmittingComment ? (
                                            <FontAwesomeIcon icon={faSpinner} spin />
                                        ) : (
                                            <FontAwesomeIcon icon={faPaperPlane} />
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="login-prompt">
                                <p>Please log in to leave a comment</p>
                            </div>
                        )}

                        {/* Comments List */}
                        <div className="comments-list">
                            {comments.length === 0 ? (
                                <div className="no-comments">
                                    <p>No comments yet. Be the first to share your thoughts!</p>
                                </div>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className="comment-item">
                                        <div className="author-avatar small">
                                            {comment.authorPhotoURL ? (
                                                <img src={comment.authorPhotoURL} alt={comment.author} />
                                            ) : (
                                                comment.authorAvatar || comment.author?.substring(0, 2).toUpperCase()
                                            )}
                                        </div>
                                        <div className="comment-content">
                                            <div className="comment-header">
                                                <span className="comment-author">{comment.author}</span>
                                                <span className="comment-time">
                                                    {formatRelativeTime(comment.createdAt)}
                                                </span>
                                            </div>
                                            <p className="comment-text">{comment.content}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </article>

                {/* Related Posts Sidebar */}
                {relatedPosts.length > 0 && (
                    <aside className="related-posts">
                        <h3>Related Posts</h3>
                        <div className="related-posts-list">
                            {relatedPosts.map(relPost => (
                                <div 
                                    key={relPost.id}
                                    className="related-post-card"
                                    onClick={() => navigate(`/community/${relPost.id}`)}
                                >
                                    {relPost.image_urls && relPost.image_urls.length > 0 && (
                                        <div className="related-post-image">
                                            <img src={relPost.image_urls[0]} alt={relPost.title} />
                                        </div>
                                    )}
                                    <div className="related-post-info">
                                        <h4>{relPost.title}</h4>
                                        <span className="related-post-author">{relPost.author}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside>
                )}
            </main>
        </div>
    );
}

export default CommunityPost;
