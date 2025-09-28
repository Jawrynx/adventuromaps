import React from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import './css/Post.css';

/**
 * Post Component
 * 
 * Displays individual guide/post content with formatted layout including
 * header metadata, optional image, markdown-rendered content, and footer
 * actions. Supports rich content display with printing functionality.
 * 
 * Features:
 * - Post metadata display (type, category, author, date)
 * - Optional image display above content
 * - Markdown content rendering with ReactMarkdown
 * - Print functionality for offline reference
 * - Responsive layout for various screen sizes
 * - Proper post data validation
 * 
 * @param {Object} props - Component props
 * @param {Object} props.post - Post data object with content and metadata
 * @returns {JSX.Element|null} Formatted post display or null if no post
 */
function Post({ post }) {
    if (!post) return null;

    return (
        <div className="post">
            {/* Post header with metadata */}
            <header className="post-header">
                <div className="post-meta">
                    <span className="post-type">{post.type}</span>
                    <span className="post-category">{post.category}</span>
                </div>
                <h1 className="post-title">{post.title}</h1>
                <div className="post-info">
                    <span className="post-author">By {post.author}</span>
                    <span className="post-date">
                        {post.created_at?.toDate().toLocaleDateString()}
                    </span>
                </div>
            </header>
            
            {/* Optional post image */}
            {post.image_url && (
                <div className="post-image">
                    <img src={post.image_url} alt={post.title} className="guide-image" />
                </div>
            )}
            
            {/* Markdown-rendered content */}
            <div className="post-content">
                <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
            
            <footer className="post-footer">
                <button 
                    className="adm-button blue"
                    onClick={() => window.print()}
                >
                    Print Guide
                </button>
            </footer>
        </div>
    );
}

Post.propTypes = {
    post: PropTypes.shape({
        type: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        author: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        created_at: PropTypes.object.isRequired,
        image_url: PropTypes.string
    }).isRequired
};

export default Post;