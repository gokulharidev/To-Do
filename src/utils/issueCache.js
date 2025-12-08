// Simple in-memory cache for YouTrack project data (work item types and attributes)
// Keyed by project ID
const projectCache = new Map();

export function getProjectCache(projectId) {
    return projectCache.get(projectId);
}

export function setProjectCache(projectId, data) {
    projectCache.set(projectId, data);
}
