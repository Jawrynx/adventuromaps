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
        setTimeout(() => {
            setShowPostContent(true);
        }, 100);
    };

    const handleBack = () => {
        setShowPostContent(false);
        setTimeout(() => {
            setSelectedPost(null);
            setIsTransitioning(false);
        }, 100);
    };

    if (loading) {
        return <div className="posts-loading">Loading posts...</div>;
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
                {!selectedPost && posts.map(post => (
                    <div 
                        key={post.id} 
                        className="post-item"
                        onClick={() => handlePostSelect(post)}
                        role="button"
                        tabIndex={0}
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