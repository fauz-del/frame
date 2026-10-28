"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeviceLabel = exports.getDeviceWidth = exports.getDeviceHeight = exports.initialDevices = exports.backgrounds = void 0;
exports.backgrounds = [
    { name: 'Studio', value: '#24262B', color: '#24262B' },
    { name: 'Soft light', value: '#E9E8E2', color: '#E9E8E2' },
    { name: 'Warm', value: '#E9D5C8', color: '#E9D5C8' },
    { name: 'Sage', value: '#BFCDBB', color: '#BFCDBB' },
    { name: 'Lavender', value: '#D5CDE6', color: '#D5CDE6' },
    { name: 'Ocean', value: '#AFCBD7', color: '#AFCBD7' },
];
exports.initialDevices = [
    { id: 1, type: 'phone', width: 220, x: 330, y: 90 },
];
function getDeviceHeight(type) {
    if (type === 'phone')
        return 430;
    if (type === 'tablet')
        return 300;
    return 350;
}
exports.getDeviceHeight = getDeviceHeight;
function getDeviceWidth(type) {
    if (type === 'phone')
        return 220;
    if (type === 'tablet')
        return 420;
    return 600;
}
exports.getDeviceWidth = getDeviceWidth;
function getDeviceLabel(type) {
    if (type === 'phone')
        return 'iPhone';
    if (type === 'tablet')
        return 'Tablet';
    return 'Desktop';
}
exports.getDeviceLabel = getDeviceLabel;
