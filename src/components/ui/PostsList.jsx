import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Post from './Post';
import './css/PostsList.css';

function PostsList({ category }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null);

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

    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showPostContent, setShowPostContent] = useState(false);

    const handlePostSelect = (post) => {
        setIsTransitioning(true);
        setSelectedPost(post);
        // Slightly longer animation for smoother transition
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