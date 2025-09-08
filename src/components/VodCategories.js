import React, { useState, useEffect } from 'react';
import { VodAPI } from '../services/api';

const VodCategories = () => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({ category_name: '', parent_id: 0 });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await VodAPI.get('/vod-categories');
            setCategories(res.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Error fetching categories');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                parent_id: parseInt(formData.parent_id)
            };
            if (editingId) {
                await VodAPI.put(`/update-vod-category/${editingId}`, data);
            } else {
                await VodAPI.post('/create-vod-category', data);
            }
            await fetchCategories();
            resetForm();
        } catch (err) {
            setError(err.response?.data?.error || 'Error saving category');
        }
    };

    const handleEdit = (category) => {
        setFormData({
            category_name: category.category_name,
            parent_id: category.parent_id || 0
        });
        setEditingId(category._id);
        setError('');
    };

    const handleDelete = async (id) => {
        try {
            await VodAPI.delete(`/delete-vod-category/${id}`);
            await fetchCategories();
        } catch (err) {
            setError(err.response?.data?.error || 'Error deleting category');
        }
    };

    const resetForm = () => {
        setFormData({ category_name: '', parent_id: 0 });
        setEditingId(null);
        setError('');
    };

    return (
        <div>
            <h2>Manage VOD Categories</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="mb-3">
                <input
                    type="text"
                    placeholder="Category Name"
                    value={formData.category_name}
                    onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                    className="form-control mb-2"
                    required />
                <input
                    type="number"
                    placeholder="Parent ID"
                    value={formData.parent_id}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    className="form-control mb-2" />
                <button type="submit" className="btn btn-primary">
                    {editingId ? 'Update' : 'Add'}
                </button>
                {editingId && (
                    <button type="button" onClick={resetForm} className="btn btn-secondary ms-2">
                        Cancel
                    </button>
                )}
            </form>
            <table className="table">
                <thead>
                <tr>
                    <th>Category ID</th>
                    <th>Name</th>
                    <th>Parent ID</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                    {categories.map((cat) => (
                        <tr key={cat._id}>
                            <td>{cat.category_id}</td>
                            <td>{cat.category_name}</td>
                            <td>{cat.parent_id || 0}</td>
                            <td>
                                <button
                                    onClick={() => handleEdit(cat)}
                                    className="btn btn-sm btn-warning me-2" > Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(cat.category_id)}
                                    className="btn btn-sm btn-danger" > Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default VodCategories;
