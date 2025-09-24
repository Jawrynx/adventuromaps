import React from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import './css/Post.css';

function Post({ post }) {
    if (!post) return null;

    return (
        <div className="post">
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
        created_at: PropTypes.object.isRequired
    }).isRequired
};

export default Post;