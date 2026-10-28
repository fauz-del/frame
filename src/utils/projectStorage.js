"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSavedProject = exports.saveProject = exports.getSavedProjects = void 0;
var STORAGE_KEY = 'frame-saved-projects';
function getSavedProjects() {
    try {
        var stored = localStorage.getItem(STORAGE_KEY);
        if (!stored)
            return [];
        var projects = JSON.parse(stored);
        return Array.isArray(projects) ? projects : [];
    }
    catch (_a) {
        return [];
    }
}
exports.getSavedProjects = getSavedProjects;
function saveProject(project) {
    var projects = getSavedProjects();
    var existingIndex = projects.findIndex(function (item) { return item.id === project.id; });
    var updatedProjects = existingIndex >= 0
        ? projects.map(function (item) {
            return item.id === project.id ? project : item;
        })
        : __spreadArray([project], projects, true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
}
exports.saveProject = saveProject;
function deleteSavedProject(id) {
    var projects = getSavedProjects().filter(function (project) { return project.id !== id; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}
exports.deleteSavedProject = deleteSavedProject;
