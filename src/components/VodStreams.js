import React, { useState, useEffect } from 'react';
import { VodAPI } from '../services/api';

const VodStreams = () => {
    const [streams, setStreams] = useState([]);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        file: null,
        stream_icon: '',
        added: '',
        releasedate: '',
        director: '',
        plot: '',
        genre: '',
        casts: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStreams();
        fetchCategories();
    }, []);

    const fetchStreams = async () => {
        try {
            const res = await VodAPI.get('/vod-streams');
            setStreams(res.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Error fetching streams');
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await VodAPI.get('/vod-categories');
            setCategories(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Error fetching categories');
        }
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.category_id === categoryId);
        return category ? category.category_name : `Category ${categoryId}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('category_id', formData.category_id);
            if (formData.file) {
                data.append('file', formData.file);
            } else if (!editingId) {
                throw new Error('File is required for new streams');
            }
            data.append('stream_icon', formData.stream_icon || '');
            data.append('added', formData.added || new Date().toISOString());
            data.append('releasedate', formData.releasedate || '');
            data.append('director', formData.director || '');
            data.append('plot', formData.plot || '');
            data.append('genre', formData.genre || '');
            data.append('casts', formData.casts || '');

            if (editingId) {
                await VodAPI.put(`/update-vod-stream/${editingId}`, data);
            } else {
                await VodAPI.post('/create-vod-stream', data);
            }
            await fetchStreams();
            resetForm();
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Error saving stream');
        }
    };

    const handleEdit = (stream) => {
        setFormData({
            name: stream.name,
            category_id: stream.category_id,
            file: null, // File input should be re-selected
            stream_icon: stream.stream_icon || '',
            added: stream.added ? new Date(stream.added).toISOString().slice(0, 16) : '',
            releasedate: stream.releasedate ? new Date(stream.releasedate).toISOString().slice(0, 10) : '',
            director: stream.director || '',
            plot: stream.plot || '',
            genre: stream.genre || '',
            casts: stream.casts || ''
        });
        setEditingId(stream._id);
        setError('');
    };

    const handleDelete = async (id) => {
        try {
            await VodAPI.delete(`/delete-vod-stream/${id}`);
            await fetchStreams();
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Error deleting stream');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category_id: '',
            file: null,
            stream_icon: '',
            added: '',
            releasedate: '',
            director: '',
            plot: '',
            genre: '',
            casts: ''
        });
        setEditingId(null);
        setError('');
    };

    return (
        <div>
            <h2>Manage VOD Streams</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="mb-3" encType="multipart/form-data">
                
                <h6 > VOD Name </h6>
                <input
                    type="text"
                    placeholder="Stream Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-control mb-2"
                    required />

                <h6> Vod Category </h6>
                <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="form-control mb-2"
                    required>
                    <option value="">Select a Category</option>
                    {categories.length > 0 ? (
                        categories.map((category) => (
                            <option key={category._id} value={category.category_id}>
                                {category.category_name}
                            </option>
                        ))
                    ) : (
                        <option value="" disabled>Loading categories...</option>
                    )}
                </select>

                <h6> Stream File </h6>
                <input
                    type="file"
                    accept=".ts,.m3u8,.mp4"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                    className="form-control mb-2"
                    required={!editingId} />

                <h6> Icon URL </h6>
                <input
                    type="text"
                    placeholder="Stream Icon URL (optional)"
                    value={formData.stream_icon}
                    onChange={(e) => setFormData({ ...formData, stream_icon: e.target.value })}
                    className="form-control mb-2" />

                <h6> Release Date </h6>
                <input
                    type="date"
                    placeholder="Release Date (optional)"
                    value={formData.releasedate}
                    onChange={(e) => setFormData({ ...formData, releasedate: e.target.value })}
                    className="form-control mb-2" />

                <h6> Director </h6>
                <input
                    type="text"
                    placeholder="Director (optional)"
                    value={formData.director}
                    onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                    className="form-control mb-2" />

                <h6> Genre </h6>
                <input
                    type="text"
                    placeholder="Genre (optional)"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="form-control mb-2" />

                <h6> Cast </h6>
                <input
                    type="text"
                    placeholder="Cast (optional)"
                    value={formData.casts}
                    onChange={(e) => setFormData({ ...formData, casts: e.target.value })}
                    className="form-control mb-2" />

                <h6> Description </h6>
                <textarea
                    placeholder="Description (optional)"
                    value={formData.plot}
                    onChange={(e) => setFormData({ ...formData, plot: e.target.value })}
                    className="form-control mb-2"
                    rows="3" />

                <button type="submit" className="btn btn-primary">
                    {editingId ? 'Update' : 'Add'}
                </button>
                {editingId && (
                    <button type="button" onClick={resetForm} className="btn btn-secondary ms-2"> Cancel </button>
                )}
            </form>
            <table className="table">
                <thead>
                <tr>
                    <th>VOD ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Director</th>
                    <th>Genre</th>
                    <th>Release Date</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {streams.map((stream) => (
                    <tr key={stream._id}>
                        <td>{stream.vod_id}</td>
                        <td>{stream.name}</td>
                        <td>{getCategoryName(stream.category_id)}</td>
                        <td>{stream.director || '-'}</td>
                        <td>{stream.genre || '-'}</td>
                        <td>{stream.releasedate ? new Date(stream.releasedate).toLocaleDateString() : '-'}</td>
                        <td>
                            <button onClick={() => handleEdit(stream)} className="btn btn-sm btn-warning me-2" > Edit </button>
                            <button onClick={() => handleDelete(stream.vod_id)} className="btn btn-sm btn-danger" > Delete </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default VodStreams;
