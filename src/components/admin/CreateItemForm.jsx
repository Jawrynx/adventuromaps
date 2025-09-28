/**
 * CreateItemForm.jsx - Form component for creating and editing exploration/adventure items
 * 
 * This form handles the creation and editing of exploration and adventure items with:
 * - Dynamic form fields based on item type
 * - Image file upload with preview
 * - Form validation and submission handling
 * - Support for both creation and editing workflows
 */

import React, { useState } from 'react';
import './css/CreateItemForm.css';

// Default form state for new items
const initialFormState = {
    type: 'exploration',
    name: '',
    description: '',
    subDescription: '',
    image_url: '',
    categories: '',
    estimatedTime: '',
    keyLocations: '',
    difficulty: ''
};

/**
 * CreateItemForm Component
 * 
 * A comprehensive form for creating or editing exploration/adventure items.
 * Handles file uploads, form validation, and different submission modes.
 * 
 * @param {Function} onComplete - Callback when form is successfully submitted
 * @param {Function} onCancel - Callback when form is cancelled
 * @param {Function} saveItem - Function to save item to database (for new items)
 * @param {Object} initialData - Pre-populated data for editing existing items
 * @param {boolean} isEditing - Whether this is editing an existing item vs creating new
 * @returns {JSX.Element} The item creation/editing form
 */
function CreateItemForm({ onComplete, onCancel, saveItem, initialData, isEditing }) {
    // Initialize form data - either from provided initial data (editing mode) or default state
    const [formData, setFormData] = useState(initialData ? {
        ...initialData,
        // Convert arrays to comma-separated strings for text inputs
        categories: Array.isArray(initialData.categories) ? initialData.categories.join(', ') : initialData.categories || '',
        keyLocations: Array.isArray(initialData.keyLocations) ? initialData.keyLocations.join(', ') : initialData.keyLocations || ''
    } : initialFormState);
    
    // Track saving state to prevent multiple submissions
    const [isSaving, setIsSaving] = useState(false);

    /**
     * Handles standard form input changes
     * 
     * Updates form data state when user types in text inputs or textareas.
     * 
     * @param {Event} e - The input change event
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    /**
     * Handles item type selection changes
     * 
     * When user changes between 'exploration' and 'adventure',
     * resets difficulty field since it's only used for adventures.
     * 
     * @param {Event} e - The select change event
     */
    const handleTypeChange = (e) => {
        setFormData(prevData => ({
            ...prevData,
            type: e.target.value,
            difficulty: ''  // Reset difficulty when changing types
        }));
    };

    /**
     * Handles form submission for creating or updating items
     * 
     * Processes form data, converts comma-separated strings back to arrays,
     * and either creates a new item or updates an existing one.
     * 
     * @param {Event} e - The form submission event
     * @param {boolean} shouldLoad - Whether to load the item after saving (editing mode)
     */
    const handleSubmit = async (e, shouldLoad = false) => {
        e.preventDefault();

        // Prevent multiple submissions
        if (isSaving) {
            return;
        }

        setIsSaving(true);

        // Process form data: convert comma-separated strings to arrays
        const dataToSubmit = {
            ...formData,
            categories: formData.categories.split(',').map(c => c.trim()).filter(c => c),
            keyLocations: formData.keyLocations.split(',').map(loc => loc.trim()).filter(loc => loc)
        };

        try {
            if (isEditing) {
                // Update existing item
                onComplete(dataToSubmit, shouldLoad);
            } else {
                // Create new item
                const docId = await saveItem(dataToSubmit);
                onComplete({ ...dataToSubmit, id: docId }, shouldLoad);
            }
        } catch (error) {
            console.error(isEditing ? "Failed to update item:" : "Failed to save item:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Handles submission with automatic loading (editing mode)
     * 
     * Convenience function for editing mode that submits and then
     * loads the item for immediate route editing.
     * 
     * @param {Event} e - The form submission event
     */
    const handleSubmitAndLoad = (e) => {
        handleSubmit(e, true);
    };

    return (
        <form onSubmit={handleSubmit} className="create-item-form">
            <h2>{isEditing ? 'Edit Item' : 'Create a New Item'}</h2>
            <div className="form-group">
                <label>
                    Item Type:
                    <select name="type" value={formData.type} onChange={handleTypeChange}>
                        <option value="exploration">Exploration</option>
                        <option value="adventure">Adventure</option>
                    </select>
                </label>
            </div>
            <div className="form-group">
                <label>
                    Name:
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </label>
            </div>
            <div className="form-group">
                <label>
                    Short Description:
                    <textarea name="description" value={formData.description} onChange={handleChange} required />
                </label>
            </div>
            <div className="form-group">
                <label>
                    Long Description:
                    <textarea name="subDescription" value={formData.subDescription} onChange={handleChange} />
                </label>
            </div>
            <div className="form-group">
                <label>
                    Image:
                    {formData.image_url ? (
                        <div className="image-preview">
                            <img src={formData.image_url} alt="Current" style={{ maxWidth: '200px', marginBottom: '10px' }} />
                        </div>
                    ) : null}
                    <input 
                        type="file" 
                        name="image" 
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                setFormData(prevData => ({
                                    ...prevData,
                                    imageFile: file, // Store the file object
                                    image_url: '' // Clear the existing URL
                                }));
                            }
                        }}
                    />
                </label>
            </div>
            <div className="form-group">
                <label>
                    Categories (comma-separated):
                    <input type="text" name="categories" value={formData.categories} onChange={handleChange} />
                </label>
            </div>
            <div className="form-group">
                <label>
                    Estimated Time:
                    <input type="text" name="estimatedTime" value={formData.estimatedTime} onChange={handleChange} />
                </label>
            </div>
            <div className="form-group">
                <label>
                    Key Locations (comma-separated):
                    <input type="text" name="keyLocations" value={formData.keyLocations} onChange={handleChange} />
                </label>
            </div>
            {formData.type === 'adventure' && (
                <div className="form-group">
                    <label>
                        Difficulty:
                        <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
                            <option value="">Select Difficulty</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </label>
                </div>
            )}
            <div className="form-actions">
                <button type="submit" className="adm-button green" disabled={isSaving}>
                    {isSaving ? 'Saving...' : isEditing ? 'Update' : 'Submit'}
                </button>
                {isEditing && (
                    <button type="button" onClick={handleSubmitAndLoad} className="adm-button blue" disabled={isSaving}>
                        Submit & Load
                    </button>
                )}
                <button type="button" onClick={onCancel} className="adm-button red" disabled={isSaving}>
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default CreateItemForm;