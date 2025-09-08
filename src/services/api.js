import axios from 'axios';

const HOST = "localhost"

const LiveAPI = axios.create({
    baseURL: `http://${HOST}:8080/admin`, // Or 'http://localhost:8080/admin' for dev
    params: { username: 'test', password: 'test' } // Basic auth via query params
});

const VodAPI = axios.create({
    baseURL: `http://${HOST}:8080/admin-vod`, // Or 'http://localhost:8080/admin' for dev
    params: { username: 'test', password: 'test' } // Basic auth via query params
});

const SeriesAPI = axios.create({
    baseURL: `http://${HOST}:8080/admin-series`, // Or 'http://localhost:8080/admin' for dev
    params: { username: 'test', password: 'test' } // Basic auth via query params
});

const SeasonAPI = axios.create({
    baseURL: `http://${HOST}:8080/admin-seasons`, // Or 'http://localhost:8080/admin' for dev
    params: { username: 'test', password: 'test' } // Basic auth via query params
});

const EpisodeAPI = axios.create({
    baseURL: `http://${HOST}:8080/admin-episodes`, // Or 'http://localhost:8080/admin' for dev
    params: { username: 'test', password: 'test' } // Basic auth via query params
});

export { LiveAPI, VodAPI, SeriesAPI, SeasonAPI, EpisodeAPI };
