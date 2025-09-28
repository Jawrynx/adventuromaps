import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { uploadFile } from '../../services/uploadService';
import './css/GuideForm.css';

function GuideForm({ existingGuide, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        type: existingGuide?.type || 'Guide',
        category: existingGuide?.category || 'Getting Started',
        title: existingGuide?.title || '',
        author: existingGuide?.author || '',
        content: existingGuide?.content || '',
        image_url: existingGuide?.image_url || ''
    });
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(existingGuide?.image_url || null);
    const [isUploading, setIsUploading] = useState(false);

    const categories = [
        'Getting Started',
        'Using the Map & Routes',
        'Offline Maps & Sharing',
        'Personalizing Your Experience',
        'Trip Planning & Preparation',
        'Emergency & First Aid',
        'Navigation & Wayfinding',
        'Environmental Safety & Etiquette',
        'Activity-Specific Guides'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const removeImage = () => {
        setSelectedFile(null);
        setImagePreview(null);
        setFormData(prev => ({
            ...prev,
            image_url: ''
        }));
        const fileInput = document.getElementById('image');
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        
        try {
            let imageUrl = formData.image_url;
            
            if (selectedFile) {
                const fileName = `guides/${Date.now()}_${selectedFile.name}`;
                imageUrl = await uploadFile(selectedFile, fileName);
            }
            
            const dataToSave = {
                ...formData,
                image_url: imageUrl
            };
            
            if (existingGuide) {
                const guideRef = doc(db, 'posts', existingGuide.id);
                await updateDoc(guideRef, {
                    ...dataToSave,
                    updated_at: serverTimestamp()
                });
            } else {
                await addDoc(collection(db, 'posts'), {
                    ...dataToSave,
                    created_at: serverTimestamp()
                });
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving guide:', error);
            alert('Error saving guide. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form className="guide-form animate-in" onSubmit={handleSubmit}>
            <h2>{existingGuide ? 'Edit Guide' : 'Create New Guide'}</h2>
            
            <div className="form-group">
                <label htmlFor="type">Type:</label>
                <select 
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                >
                    <option value="Guide">Guide</option>
                    <option value="Safety">Safety</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="category">Category:</label>
                <select 
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                >
                    {categories.map(category => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="title">Title:</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter guide title"
                />
            </div>

            <div className="form-group">
                <label htmlFor="author">Author:</label>
                <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    required
                    placeholder="Enter author name"
                />
            </div>

            <div className="form-group">
                <label htmlFor="image">Guide Image:</label>
                <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                />
                
                {imagePreview && (
                    <div className="image-preview">
                        <img src={imagePreview} alt="Preview" className="preview-image" />
                        <button 
                            type="button" 
                            className="remove-image-btn"
                            onClick={removeImage}
                        >
                            Remove Image
                        </button>
                    </div>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="content">Content (Markdown):</label>
                <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    placeholder="Write your guide content in Markdown format"
                    rows={15}
                />
            </div>

            <div className="form-actions">
                <button type="button" className="adm-button red" onClick={onClose}>
                    Cancel
                </button>
                <button type="submit" className="adm-button green" disabled={isUploading}>
                    {isUploading ? 'Uploading...' : (existingGuide ? 'Update Guide' : 'Publish Guide')}
                </button>
            </div>
        </form>
    );
}

GuideForm.propTypes = {
    existingGuide: PropTypes.shape({
        id: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        author: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        image_url: PropTypes.string
    }),
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired
};

export default GuideForm;