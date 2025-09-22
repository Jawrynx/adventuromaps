import React, { useState } from 'react';
import './css/CreateItemForm.css';

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

function CreateItemForm({ onComplete, onCancel, saveItem, initialData, isEditing }) {
    const [formData, setFormData] = useState(initialData ? {
        ...initialData,
        categories: Array.isArray(initialData.categories) ? initialData.categories.join(', ') : initialData.categories || '',
        keyLocations: Array.isArray(initialData.keyLocations) ? initialData.keyLocations.join(', ') : initialData.keyLocations || ''
    } : initialFormState);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleTypeChange = (e) => {
        setFormData(prevData => ({
            ...prevData,
            type: e.target.value,
            difficulty: ''
        }));
    };

    const handleSubmit = async (e, shouldLoad = false) => {
        e.preventDefault();

        if (isSaving) {
            return;
        }

        setIsSaving(true);

        const dataToSubmit = {
            ...formData,
            categories: formData.categories.split(',').map(c => c.trim()).filter(c => c),
            keyLocations: formData.keyLocations.split(',').map(loc => loc.trim()).filter(loc => loc)
        };

        try {
            if (isEditing) {
                onComplete(dataToSubmit, shouldLoad);
            } else {
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
                    Image URL:
                    <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} />
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