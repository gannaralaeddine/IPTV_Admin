import React, { useState, useEffect } from 'react';
import { SeriesAPI } from '../services/api';

const SeriesStreams = () => {
    const [streams, setStreams] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        stream_icon: '',
        added: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStreams();
    }, []);

    const fetchStreams = async () => {
        try {
            const res = await SeriesAPI.get('/series-streams');
            setStreams(res.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Error fetching streams');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                category_id: formData.category_id,
                stream_icon: formData.stream_icon || '',
                added: formData.added || new Date().toISOString()
            };

            if (editingId) {
                await SeriesAPI.put(`/update-series-stream/${editingId}`, payload);
            } else {
                await SeriesAPI.post('/create-series-stream', payload);
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
            stream_icon: stream.stream_icon || '',
            added: stream.added ? new Date(stream.added).toISOString().slice(0, 16) : ''
        });
        setEditingId(stream._id);
        setError('');
    };

    const handleDelete = async (id) => {
        try {
            await SeriesAPI.delete(`/delete-series-stream/${id}`);
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
            stream_icon: '',
            added: ''
        });
        setEditingId(null);
        setError('');
    };

    return (
        <div>
            <h2>Manage Series</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="mb-3">
                <input
                    type="text"
                    placeholder="Series Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-control mb-2"
                    required />
                <input
                    type="number"
                    placeholder="Category ID"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="form-control mb-2"
                    required />
                
                <input
                    type="text"
                    placeholder="Series Icon URL (optional)"
                    value={formData.stream_icon}
                    onChange={(e) => setFormData({ ...formData, stream_icon: e.target.value })}
                    className="form-control mb-2" />

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
                    <th>Series ID</th>
                    <th>Name</th>
                    <th>Category ID</th>
                    
                    <th>Icon</th>
                    <th>Added</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {streams.map((stream) => (
                    <tr key={stream._id}>
                        <td>{stream.series_id}</td>
                        <td>{stream.name}</td>
                        <td>{stream.category_id}</td>
                        
                        <td>{stream.stream_icon || '-'}</td>
                        <td>{stream.added ? new Date(stream.added).toLocaleString() : '-'}</td>
                        <td>
                            <button onClick={() => handleEdit(stream)} className="btn btn-sm btn-warning me-2" > Edit </button>
                            <button onClick={() => handleDelete(stream.series_id)} className="btn btn-sm btn-danger" > Delete </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default SeriesStreams;
