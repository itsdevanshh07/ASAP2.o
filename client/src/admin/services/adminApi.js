import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const getHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` }
});

export const getAdminUsers = async (token, params) => {
    const { data } = await axios.get(`${backendUrl}/api/admin/users`, {
        ...getHeaders(token),
        params
    });
    return data;
};

export const blockUser = async (token, userId) => {
    const { data } = await axios.patch(`${backendUrl}/api/admin/users/${userId}/block`, {}, getHeaders(token));
    return data;
};

export const updateUserRole = async (token, userId, role) => {
    const { data } = await axios.patch(`${backendUrl}/api/admin/users/${userId}/role`, { role }, getHeaders(token));
    return data;
};

export const getAdminRecruiters = async (token) => {
    const { data } = await axios.get(`${backendUrl}/api/admin/recruiters`, getHeaders(token));
    return data;
};

export const verifyRecruiter = async (token, recruiterId) => {
    const { data } = await axios.patch(`${backendUrl}/api/admin/recruiters/${recruiterId}/verify`, {}, getHeaders(token));
    return data;
};

export const getAdminJobs = async (token) => {
    const { data } = await axios.get(`${backendUrl}/api/admin/jobs`, getHeaders(token));
    return data;
};

export const updateJobStatus = async (token, jobId, status) => {
    const { data } = await axios.patch(`${backendUrl}/api/admin/jobs/${jobId}/status`, { status }, getHeaders(token));
    return data;
};

export const getAdminApplications = async (token) => {
    const { data } = await axios.get(`${backendUrl}/api/admin/applications`, getHeaders(token));
    return data;
};

export const getAdminAnalytics = async (token) => {
    const { data } = await axios.get(`${backendUrl}/api/admin/analytics`, getHeaders(token));
    return data;
};
