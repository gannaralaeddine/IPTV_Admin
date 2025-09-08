import React, { useState, useEffect } from 'react';
import { SeriesAPI } from '../services/api';

const SeriesStreams = () => {
    const [streams, setStreams] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        file: null,
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

            if (editingId) {
                await SeriesAPI.put(`/update-series-stream/${editingId}`, data);
            } else {
                await SeriesAPI.post('/create-series-stream', data);
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
            file: null,
            stream_icon: '',
            added: ''
        });
        setEditingId(null);
        setError('');
    };

    return (
        <div>
            <h2>Manage Series Streams</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="mb-3" encType="multipart/form-data">
                <input
                    type="text"
                    placeholder="Stream Name"
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
                    type="file"
                    accept=".ts,.m3u8,.mp4"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                    className="form-control mb-2"
                    required={!editingId} />
                <input
                    type="text"
                    placeholder="Stream Icon URL (optional)"
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
                    <th>File</th>
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
                        <td>{stream.file}</td>
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
