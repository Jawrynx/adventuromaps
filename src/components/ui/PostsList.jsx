import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Post from './Post';
import './css/PostsList.css';

/**
 * PostsList Component
 * 
 * Fetches and displays a list of posts filtered by category with smooth
 * transition animations. Supports post selection to view full content
 * and provides a back navigation to return to the list view.
 * 
 * Features:
 * - Category-based post filtering from Firestore
 * - Loading states during data fetch
 * - Post list with title and excerpt display
 * - Smooth transition animations between list and detail views
 * - Full post content display with Post component
 * - Back navigation functionality
 * - Error handling for database operations
 * 
 * @param {Object} props - Component props
 * @param {string} props.category - Category to filter posts by
 * @returns {JSX.Element} Posts list with transition animations
 */
function PostsList({ category }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null);

    /**
     * Fetch posts by category from Firestore
     * 
     * Queries posts collection for guides and safety posts in the selected
     * category, ordered by creation date (newest first).
     */
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const q = query(
                    collection(db, 'posts'),
                    where('category', '==', category),
                    where('type', 'in', ['Guide', 'Safety']),
                    orderBy('created_at', 'desc')
                );
                
                const querySnapshot = await getDocs(q);
                const fetchedPosts = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                setPosts(fetchedPosts);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };

        if (category) {
            fetchPosts();
        }
    }, [category]);

    /**
     * Reset selected post when category changes
     * 
     * Ensures that when a user switches categories, any previously
     * selected post is cleared and the list view is restored.
     */
    useEffect(() => {
        setSelectedPost(null);
        setShowPostContent(false);
        setIsTransitioning(false);
    }, [category]);

    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showPostContent, setShowPostContent] = useState(false);

    /**
     * Handle post selection with smooth transition
     * 
     * Initiates transition animation before displaying selected post content.
     * Uses timeout to coordinate animation timing for smooth user experience.
     * 
     * @param {Object} post - Selected post object to display
     */
    const handlePostSelect = (post) => {
        setIsTransitioning(true);
        setSelectedPost(post);
        // Delay content display for smooth transition animation
        setTimeout(() => {
            setShowPostContent(true);
        }, 300);
    };

    const handleBack = () => {
        setShowPostContent(false);
        setTimeout(() => {
            setSelectedPost(null);
            setIsTransitioning(false);
        }, 300);
    };

    if (loading) {
        return (
            <div className="posts-loading">
                <div className="loading-animation">
                    <div className="loading-bar"></div>
                    <div className="loading-bar"></div>
                    <div className="loading-bar"></div>
                </div>
                <p>Loading posts...</p>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="no-posts">
                <h3>No posts available for {category}</h3>
                <p>Be the first to create a guide in this category!</p>
            </div>
        );
    }

    return (
        <div className="posts-container">
            <div className={`posts-list ${(selectedPost && isTransitioning) ? 'exit' : ''}`}>
                {!selectedPost && posts.map((post, index) => (
                    <div 
                        key={post.id} 
                        className="post-item fade-slide-in"
                        onClick={() => handlePostSelect(post)}
                        role="button"
                        tabIndex={0}
                        style={{ 
                            animationDelay: `${index * 0.1}s`,
                            opacity: 0,
                            transform: 'translateY(20px)'
                        }}
                    >
                        <h3>{post.title}</h3>
                        <div className="post-meta">
                            <span>By {post.author}</span>
                            <span>•</span>
                            <span>{new Date(post.created_at.toDate()).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
            
            {selectedPost && (
                <div className={`post-wrapper ${showPostContent ? 'enter' : ''}`}>
                    <button 
                        className="back-button adm-button red"
                        onClick={handleBack}
                    >
                        Back to List
                    </button>
                    <Post post={selectedPost} />
                </div>
            )}
        </div>
    );
}

PostsList.propTypes = {
    category: PropTypes.string.isRequired
};

export default PostsList;