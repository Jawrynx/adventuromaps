/**
 * Community.jsx - Community hub page for user posts and discussions
 * 
 * This component displays the community posts from Firestore, allowing users
 * to browse, search, and filter community content. It also provides the ability
 * to create new posts for authenticated users.
 * 
 * Features:
 * - Display community posts in a grid layout
 * - Search posts by title or content
 * - Filter by category
 * - Sort by date, popularity
 * - Create new posts (authenticated users)
 * - Navigate to individual post view
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSearch, faPlus, faHeart, faComment, faShare, 
    faStar, faUsers, faImage, faTimes, faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { 
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
import { uploadFile } from '../../services/uploadService';
import './css/Community.css';

/**
 * Community Component
 * 
 * Main community hub interface that displays posts and provides
 * search, filter, and creation functionality.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - Current authenticated user
 * @param {Object} props.userDocument - Full user document from Firestore
 * @returns {JSX.Element} Community hub interface
 */
function Community({ user, userDocument }) {
    const navigate = useNavigate();
    
    // ========== STATE ==========
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Create post form state
    const [newPost, setNewPost] = useState({
        title: '',
        content: '',
        category: 'general',
        tags: ''
    });
    const [postImage, setPostImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // ========== CONSTANTS ==========
    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'general', label: 'General' },
        { value: 'feedback', label: 'Feedback' },
        { value: 'suggestions', label: 'Suggestions' },
        { value: 'tips', label: 'Tips & Tricks' },
        { value: 'showcase', label: 'Showcase' },
        { value: 'help', label: 'Help & Support' },
        { value: 'announcements', label: 'Announcements' }
    ];

    // ========== DATA FETCHING ==========
    
    /**
     * Fetch community posts from Firestore
     */
    const fetchPosts = useCallback(async () => {
        setIsLoading(true);
        try {
            let postsQuery = query(
                collection(db, 'community_posts'),
                where('status', '==', 'published'),
                where('visibility', '==', 'public'),
                orderBy('createdAt', 'desc'),
                limit(50)
            );

            const snapshot = await getDocs(postsQuery);
            const postsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            setPosts(postsData);
        } catch (error) {
            console.error('Error fetching community posts:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // ========== FILTERING & SORTING ==========
    
    /**
     * Filter and sort posts based on current selections
     */
    const filteredPosts = useMemo(() => {
        let result = [...posts];

        // Filter by search term
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            result = result.filter(post => 
                post.title?.toLowerCase().includes(search) ||
                post.content?.toLowerCase().includes(search) ||
                post.author?.toLowerCase().includes(search) ||
                post.tags?.some(tag => tag.toLowerCase().includes(search))
            );
        }

        // Filter by category
        if (selectedCategory !== 'all') {
            result = result.filter(post => post.category === selectedCategory);
        }

        // Sort posts
        switch (sortBy) {
            case 'oldest':
                result.sort((a, b) => {
                    const dateA = a.createdAt?.toDate?.() || new Date(0);
                    const dateB = b.createdAt?.toDate?.() || new Date(0);
                    return dateA - dateB;
                });
                break;
            case 'popular':
                result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
                break;
            case 'mostReplies':
                result.sort((a, b) => (b.replies || 0) - (a.replies || 0));
                break;
            case 'newest':
            default:
                result.sort((a, b) => {
                    const dateA = a.createdAt?.toDate?.() || new Date(0);
                    const dateB = b.createdAt?.toDate?.() || new Date(0);
                    return dateB - dateA;
                });
                break;
        }

        // Featured posts first
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

        return result;
    }, [posts, searchTerm, selectedCategory, sortBy]);

    // ========== EVENT HANDLERS ==========

    /**
     * Handle clicking on a post card
     */
    const handlePostClick = (postId) => {
        navigate(`/community/${postId}`);
    };

    /**
     * Handle image selection for new post
     */
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size must be less than 5MB');
                return;
            }
            setPostImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    /**
     * Handle creating a new post
     */
    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Please log in to create a post');
            return;
        }

        if (!newPost.title.trim() || !newPost.content.trim()) {
            alert('Please fill in the title and content');
            return;
        }

        setIsSubmitting(true);

        try {
            let imageUrls = [];
            
            // Upload image if selected
            if (postImage) {
                const imagePath = `post-images/${user.uid}/${Date.now()}_${postImage.name}`;
                const imageUrl = await uploadFile(postImage, imagePath);
                imageUrls.push(imageUrl);
            }

            // Parse tags
            const tags = newPost.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            // Create post document
            const postData = {
                title: newPost.title.trim(),
                content: newPost.content.trim(),
                category: newPost.category,
                tags: tags,
                author: userDocument?.displayName || user.displayName || 'Anonymous',
                authorId: user.uid,
                authorAvatar: userDocument?.displayName?.substring(0, 2).toUpperCase() || 'AN',
                authorPhotoURL: userDocument?.photoURL || user.photoURL || null,
                image_urls: imageUrls,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                likes: 0,
                likedBy: [],
                replies: 0,
                shares: 0,
                status: 'published',
                visibility: 'public',
                featured: false,
                reportCount: 0,
                moderatorNotes: '',
                location: null
            };

            await addDoc(collection(db, 'community_posts'), postData);

            // Reset form and close modal
            setNewPost({ title: '', content: '', category: 'general', tags: '' });
            setPostImage(null);
            setImagePreview(null);
            setShowCreateModal(false);
            
            // Refresh posts
            fetchPosts();
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Format date for display
     */
    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            if (diffHours === 0) {
                const diffMins = Math.floor(diffMs / (1000 * 60));
                return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
            }
            return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
    };

    /**
     * Get excerpt from content
     */
    const getExcerpt = (content, maxLength = 150) => {
        if (!content) return '';
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength).trim() + '...';
    };

    // ========== RENDER ==========
    return (
        <div id="community">
            {/* Geometric Grid Background */}
            <div className="geometric-grid">
                <div className="grid-pattern"></div>
            </div>

            {/* Header Section */}
            <header className="community-header">
                <div className="community-title-section">
                    <div>
                        <h1>Community Hub</h1>
                        <p className="community-subtitle">Connect, share, and explore with fellow adventurers</p>
                    </div>
                    {user && (
                        <button 
                            className="new-post-btn"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            New Post
                        </button>
                    )}
                </div>

                {/* Search and Filter Controls */}
                <div className="community-controls">
                    <div className="search-container">
                        <FontAwesomeIcon icon={faSearch} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search posts, topics, or users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-container">
                        <select
                            className="filter-select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                        <select
                            className="filter-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="popular">Most Popular</option>
                            <option value="mostReplies">Most Discussed</option>
                        </select>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="community-content">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading community posts...</p>
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="empty-state">
                        <FontAwesomeIcon icon={faUsers} className="empty-state-icon" />
                        <h3>No Posts Found</h3>
                        <p>
                            {searchTerm || selectedCategory !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Be the first to start a conversation!'}
                        </p>
                    </div>
                ) : (
                    <div className="posts-grid">
                        {filteredPosts.map(post => (
                            <article 
                                key={post.id}
                                className={`post-card ${post.featured ? 'featured' : ''}`}
                                onClick={() => handlePostClick(post.id)}
                            >
                                {/* Post Image */}
                                {post.image_urls && post.image_urls.length > 0 && (
                                    <div className="post-card-image">
                                        <img src={post.image_urls[0]} alt={post.title} />
                                        {post.featured && (
                                            <span className="featured-badge">
                                                <FontAwesomeIcon icon={faStar} />
                                                Featured
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Post Content */}
                                <div className="post-card-content">
                                    <div className="post-card-header">
                                        <span className="post-category-badge">{post.category}</span>
                                        {!post.image_urls?.length && post.featured && (
                                            <span className="featured-badge">
                                                <FontAwesomeIcon icon={faStar} />
                                                Featured
                                            </span>
                                        )}
                                    </div>
                                    
                                    <h3 className="post-card-title">{post.title}</h3>
                                    <p className="post-card-excerpt">{getExcerpt(post.content)}</p>

                                    {/* Tags */}
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="post-tags">
                                            {post.tags.slice(0, 3).map((tag, index) => (
                                                <span key={index} className="post-tag">
                                                    #{tag}
                                                </span>
                                            ))}
                                            {post.tags.length > 3 && (
                                                <span className="post-tag">+{post.tags.length - 3}</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="post-card-footer">
                                        <div className="post-author">
                                            <div className="author-avatar">
                                                {post.authorPhotoURL ? (
                                                    <img src={post.authorPhotoURL} alt={post.author} />
                                                ) : (
                                                    post.authorAvatar || post.author?.substring(0, 2).toUpperCase()
                                                )}
                                            </div>
                                            <div className="author-info">
                                                <span className="author-name">{post.author}</span>
                                                <span className="post-date">{formatDate(post.createdAt)}</span>
                                            </div>
                                        </div>
                                        <div className="post-stats">
                                            <span className="stat-item">
                                                <FontAwesomeIcon icon={faHeart} />
                                                {post.likes || 0}
                                            </span>
                                            <span className="stat-item">
                                                <FontAwesomeIcon icon={faComment} />
                                                {post.replies || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            {/* Create Post Modal */}
            {showCreateModal && (
                <div className="create-post-modal" onClick={() => setShowCreateModal(false)}>
                    <div className="create-post-content" onClick={(e) => e.stopPropagation()}>
                        <div className="create-post-header">
                            <h2>Create New Post</h2>
                            <button 
                                className="close-modal-btn"
                                onClick={() => setShowCreateModal(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <form className="create-post-form" onSubmit={handleCreatePost}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter a descriptive title..."
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={newPost.category}
                                    onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                                >
                                    {categories.filter(c => c.value !== 'all').map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Content</label>
                                <textarea
                                    placeholder="Share your thoughts, ideas, or questions..."
                                    value={newPost.content}
                                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Tags (comma separated)</label>
                                <input
                                    type="text"
                                    placeholder="e.g., tips, adventure, nature"
                                    value={newPost.tags}
                                    onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Image (optional)</label>
                                <div 
                                    className={`image-upload-area ${imagePreview ? 'has-image' : ''}`}
                                    onClick={() => document.getElementById('post-image-input').click()}
                                >
                                    <input
                                        id="post-image-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                    />
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="image-preview" />
                                    ) : (
                                        <div className="upload-placeholder">
                                            <FontAwesomeIcon icon={faImage} />
                                            <p>Click to upload an image</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    className="btn-cancel"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <FontAwesomeIcon icon={faSpinner} spin />
                                            Publishing...
                                        </>
                                    ) : (
                                        'Publish Post'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Community;
