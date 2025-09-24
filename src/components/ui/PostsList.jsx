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

    if (selectedPost) {
        return (
            <div className="posts-container">
                <button 
                    className="back-button adm-button red"
                    onClick={() => setSelectedPost(null)}
                >
                    Back to List
                </button>
                <Post post={selectedPost} />
            </div>
        );
    }

    return (
        <div className="posts-list">
            {posts.map(post => (
                <div 
                    key={post.id} 
                    className="post-item"
                    onClick={() => setSelectedPost(post)}
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
    );
}

PostsList.propTypes = {
    category: PropTypes.string.isRequired
};

export default PostsList;