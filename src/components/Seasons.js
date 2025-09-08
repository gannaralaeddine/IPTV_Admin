import React, { useState, useEffect } from 'react';
import { SeriesAPI, SeasonAPI } from '../services/api';

const Seasons = () => {
    const [seasons, setSeasons] = useState([]);
    const [series, setSeries] = useState([]);
    const [formData, setFormData] = useState({
        series_id: '',
        season_number: '',
        name: '',
        description: '',
        cover: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSeasons();
        fetchSeries();
    }, []);

    const fetchSeasons = async () => {
        try {
            const res = await SeasonAPI.get('/seasons');
            setSeasons(res.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Error fetching seasons');
        }
    };

    const fetchSeries = async () => {
        try {
            const res = await SeriesAPI.get('/series-streams');
            setSeries(res.data);
        } catch (err) {
            console.error('Error fetching series:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await SeasonAPI.put(`/update-season/${editingId}`, formData);
            } else {
                await SeasonAPI.post('/create-season', formData);
            }
            await fetchSeasons();
            resetForm();
        } catch (err) {
            setError(err.response?.data?.error || 'Error saving season');
        }
    };

    const handleEdit = (season) => {
        setFormData({
            series_id: season.series_id,
            season_number: season.season_number,
            name: season.name,
            description: season.description || '',
            cover: season.cover || ''
        });
        setEditingId(season._id);
        setError('');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This will also delete all episodes in this season.')) {
            try {
                await SeasonAPI.delete(`/delete-season/${id}`);
                await fetchSeasons();
                setError('');
            } catch (err) {
                setError(err.response?.data?.error || 'Error deleting season');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            series_id: '',
            season_number: '',
            name: '',
            description: '',
            cover: ''
        });
        setEditingId(null);
        setError('');
    };

    const getSeriesName = (seriesId) => {
        const seriesItem = series.find(s => s.series_id === seriesId);
        return seriesItem ? seriesItem.name : `Series ID: ${seriesId}`;
    };

    return (
        <div>
            <h2>Manage Seasons</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="mb-3">
                <select
                    value={formData.series_id}
                    onChange={(e) => setFormData({ ...formData, series_id: e.target.value })}
                    className="form-control mb-2"
                    required>
                    <option value="">Select Series</option>
                    {series.map((s) => (
                        <option key={s._id} value={s.series_id}>
                            {s.name} (ID: {s.series_id})
                        </option>
                    ))}
                </select>
                <input
                    type="number"
                    placeholder="Season Number"
                    value={formData.season_number}
                    onChange={(e) => setFormData({ ...formData, season_number: e.target.value })}
                    className="form-control mb-2"
                    required />
                <input
                    type="text"
                    placeholder="Season Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-control mb-2"
                    required />
                <textarea
                    placeholder="Description (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-control mb-2"
                    rows="3" />
                <input
                    type="text"
                    placeholder="Cover Image URL (optional)"
                    value={formData.cover}
                    onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
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
                        <th>Season ID</th>
                        <th>Series</th>
                        <th>Season Number</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Cover</th>
                        <th>Added</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {seasons.map((season) => (
                        <tr key={season._id}>
                            <td>{season.season_id}</td>
                            <td>{getSeriesName(season.series_id)}</td>
                            <td>{season.season_number}</td>
                            <td>{season.name}</td>
                            <td>{season.description || '-'}</td>
                            <td>{season.cover ? (
                                <img src={season.cover} alt="Cover" style={{ width: '50px', height: '30px', objectFit: 'cover' }} />
                            ) : '-'}</td>
                            <td>{season.added ? new Date(season.added).toLocaleString() : '-'}</td>
                            <td>
                                <button onClick={() => handleEdit(season)} className="btn btn-sm btn-warning me-2">
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(season.season_id)} className="btn btn-sm btn-danger">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Seasons;
