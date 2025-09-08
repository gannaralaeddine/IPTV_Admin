import React, { useState, useEffect } from 'react';
import { SeriesAPI, SeasonAPI, EpisodeAPI } from '../services/api';

const Episodes = () => {
    const [episodes, setEpisodes] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [series, setSeries] = useState([]);
    const [formData, setFormData] = useState({
        series_id: '',
        season_id: '',
        season_number: '',
        episode_number: '',
        name: '',
        file: null,
        description: '',
        duration: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchEpisodes();
        fetchSeasons();
        fetchSeries();
    }, []);

    const fetchEpisodes = async () => {
        try {
            const res = await EpisodeAPI.get('/episodes');
            setEpisodes(res.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Error fetching episodes');
        }
    };

    const fetchSeasons = async () => {
        try {
            const res = await SeasonAPI.get('/seasons');
            setSeasons(res.data);
        } catch (err) {
            console.error('Error fetching seasons:', err);
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
            const data = new FormData();
            data.append('series_id', formData.series_id);
            data.append('season_id', formData.season_id);
            data.append('season_number', formData.season_number);
            data.append('episode_number', formData.episode_number);
            data.append('name', formData.name);
            data.append('description', formData.description || '');
            data.append('duration', formData.duration || '');
            
            if (formData.file) {
                data.append('file', formData.file);
            } else if (!editingId) {
                throw new Error('File is required for new episodes');
            }

            if (editingId) {
                await EpisodeAPI.put(`/update-episode/${editingId}`, data);
            } else {
                await EpisodeAPI.post('/create-episode', data);
            }
            await fetchEpisodes();
            resetForm();
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Error saving episode');
        }
    };

    const handleEdit = (episode) => {
        setFormData({
            series_id: episode.series_id,
            season_id: episode.season_id,
            season_number: episode.season_number,
            episode_number: episode.episode_number,
            name: episode.name,
            file: null, // File input should be re-selected
            description: episode.description || '',
            duration: episode.duration || ''
        });
        setEditingId(episode._id);
        setError('');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this episode?')) {
            try {
                await EpisodeAPI.delete(`/delete-episode/${id}`);
                await fetchEpisodes();
                setError('');
            } catch (err) {
                setError(err.response?.data?.error || 'Error deleting episode');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            series_id: '',
            season_id: '',
            season_number: '',
            episode_number: '',
            name: '',
            file: null,
            description: '',
            duration: ''
        });
        setEditingId(null);
        setError('');
    };

    const getSeriesName = (seriesId) => {
        const seriesItem = series.find(s => s.series_id === seriesId);
        return seriesItem ? seriesItem.name : `Series ID: ${seriesId}`;
    };

    const getSeasonName = (seasonId) => {
        const seasonItem = seasons.find(s => s.season_id === seasonId);
        return seasonItem ? seasonItem.name : `Season ID: ${seasonId}`;
    };

    const handleSeriesChange = (seriesId) => {
        setFormData({ ...formData, series_id: seriesId, season_id: '', season_number: '' });
    };

    const handleSeasonChange = (seasonId) => {
        const season = seasons.find(s => s.season_id === parseInt(seasonId));
        setFormData({ 
            ...formData, 
            season_id: seasonId, 
            season_number: season ? season.season_number : '' 
        });
    };

    return (
        <div>
            <h2>Manage Episodes</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="mb-3" encType="multipart/form-data">
                <select
                    value={formData.series_id}
                    onChange={(e) => handleSeriesChange(e.target.value)}
                    className="form-control mb-2"
                    required>
                    <option value="">Select Series</option>
                    {series.map((s) => (
                        <option key={s._id} value={s.series_id}>
                            {s.name} (ID: {s.series_id})
                        </option>
                    ))}
                </select>
                <select
                    value={formData.season_id}
                    onChange={(e) => handleSeasonChange(e.target.value)}
                    className="form-control mb-2"
                    required
                    disabled={!formData.series_id}>
                    <option value="">Select Season</option>
                    {seasons
                        .filter(s => s.series_id === parseInt(formData.series_id))
                        .map((s) => (
                            <option key={s._id} value={s.season_id}>
                                {s.name} (Season {s.season_number})
                            </option>
                        ))}
                </select>
                <input
                    type="number"
                    placeholder="Episode Number"
                    value={formData.episode_number}
                    onChange={(e) => setFormData({ ...formData, episode_number: e.target.value })}
                    className="form-control mb-2"
                    required />
                <input
                    type="text"
                    placeholder="Episode Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-control mb-2"
                    required />
                <input
                    type="file"
                    accept=".ts,.m3u8,.mp4"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                    className="form-control mb-2"
                    required={!editingId} />
                <textarea
                    placeholder="Description (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-control mb-2"
                    rows="3" />
                <input
                    type="text"
                    placeholder="Duration (optional, e.g., 45:00)"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
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
                        <th>Episode ID</th>
                        <th>Series</th>
                        <th>Season</th>
                        <th>Episode #</th>
                        <th>Name</th>
                        <th>File</th>
                        <th>Duration</th>
                        <th>Added</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {episodes.map((episode) => (
                        <tr key={episode._id}>
                            <td>{episode.episode_id}</td>
                            <td>{getSeriesName(episode.series_id)}</td>
                            <td>{getSeasonName(episode.season_id)}</td>
                            <td>{episode.episode_number}</td>
                            <td>{episode.name}</td>
                            <td>{episode.file}</td>
                            <td>{episode.duration || '-'}</td>
                            <td>{episode.added ? new Date(episode.added).toLocaleString() : '-'}</td>
                            <td>
                                <button onClick={() => handleEdit(episode)} className="btn btn-sm btn-warning me-2">
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(episode.episode_id)} className="btn btn-sm btn-danger">
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

export default Episodes;
