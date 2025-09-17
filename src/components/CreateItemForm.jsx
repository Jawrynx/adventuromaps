import React, { useState } from 'react';
import './css/CreateItemForm.css';

const initialFormState = {
    type: 'exploration',
    name: '',
    description: '',
    subDescription: '',
    image_url: '',
    categories: '',
    difficulty: ''
};

function CreateItemForm({ onComplete, onCancel, saveItem }) {
    const [formData, setFormData] = useState(initialFormState);
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSaving) {
            return;
        }

        setIsSaving(true);

        const dataToSubmit = {
            ...formData,
            categories: formData.categories.split(',').map(c => c.trim()).filter(c => c)
        };

        try {
            const docId = await saveItem(dataToSubmit);
            onComplete({ ...dataToSubmit, id: docId });
        } catch (error) {
            console.error("Failed to save item:", error);
            alert("An error occurred while saving the item. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="create-item-form">
            <h2>Create a New Item</h2>
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
                    Description:
                    <textarea name="description" value={formData.description} onChange={handleChange} required />
                </label>
            </div>
            <div className="form-group">
                <label>
                    Sub-Description:
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
                    {isSaving ? 'Saving...' : 'Start Creating Route'}
                </button>
                <button type="button" onClick={onCancel} className="adm-button red" disabled={isSaving}>
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default CreateItemForm;