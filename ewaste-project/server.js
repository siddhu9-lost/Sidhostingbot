// --- STATE MANAGEMENT ---
let data = JSON.parse(localStorage.getItem('ecocycle_v4')) || { items: [], points: 0 };
let selectedCoords = [19.076, 72.877];
let capturedImage = "";
let previousPoints = data.points; // For the counting animation
// --- MAP & LIVE TRACKING LOGIC ---
    let map, marker;
    function initMap() {
        // Prevent initialization errors if map already exists
        if (map !== undefined) { map.remove(); }

        // Initialize targeting Sangamner coordinates
        map = L.map('map', { zoomControl: false, attributionControl: false }).setView(selectedCoords, 15);
        
        // FIX 1: Upgraded to ultra-reliable Google Satellite Tiles
        L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { 
            maxZoom: 20 
        }).addTo(map);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', { 
            pane: 'shadowPane' 
        }).addTo(map);

        marker = L.marker(selectedCoords, {
            draggable: true,
            icon: L.divIcon({
                className: 'custom-div-icon',
                html: "<div style='background-color:var(--primary); width:18px; height:18px; border-radius:50%; border:3px solid white; box-shadow:0 0 20px var(--primary); animation: pulse 1.5s infinite;'></div>",
                iconSize: [18, 18],
                iconAnchor: [9, 9]
            })
        }).addTo(map);

        map.on('click', function(e) { 
            if(liveWatchId) toggleLiveLocation(); 
            updateLocation(e.latlng.lat, e.latlng.lng, true); 
        });
        
        marker.on('dragend', function() { 
            if(liveWatchId) toggleLiveLocation(); 
            const pos = marker.getLatLng(); updateLocation(pos.lat, pos.lng, true); 
        });
        
        if(!document.getElementById('pulse-style')) {
            const style = document.createElement('style');
            style.id = 'pulse-style';
            style.innerHTML = `@keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 242, 254, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(0, 242, 254, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 242, 254, 0); } }`;
            document.head.appendChild(style);
        }

        // FIX 2: Force Leaflet to recalculate container dimensions after UI loads
        setTimeout(() => {
            map.invalidateSize();
        }, 400);
    }

// --- NEW: GPS AUTO-LOCATE ---
function useCurrentLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            updateLocation(latitude, longitude);
            map.setZoom(18);
        }, () => alert("Location access denied."));
    }
}

function updateLocation(lat, lng) {
    selectedCoords = [lat, lng];
    marker.setLatLng([lat, lng]);
    map.panTo([lat, lng]);
    document.getElementById('loc-status').innerHTML = 
        `<i class="fas fa-check-circle"></i> Target Locked: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

map.on('click', (e) => updateLocation(e.latlng.lat, e.latlng.lng));

// --- NEW: ANIMATED POINT COUNTER ---
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

// --- NEW: EXPORT DATA AS FILE ---
function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "ecocycle_report.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// --- NEW: SOCIAL SHARE ---
function shareRecovery(name, pts) {
    const text = `I just recycled ${name} and earned ${pts} points on EcoCycle! 🌍`;
    if (navigator.share) {
        navigator.share({ title: 'EcoCycle', text: text, url: window.location.href });
    } else {
        alert("Sharing not supported on this browser, but great job!");
    }
}

// --- CORE FUNCTIONS ---
function addEntry() {
    const name = document.getElementById('item-name').value;
    const pts = parseInt(document.getElementById('item-cat').value);

    if (!name || !capturedImage) {
        showNotification("Missing Photo or Name", "error");
        return;
    }

    const entry = {
        id: Date.now(),
        name, points: pts, image: capturedImage, coords: selectedCoords, date: new Date().toLocaleDateString()
    };

    data.items.unshift(entry);
    previousPoints = data.points;
    data.points += pts;
    localStorage.setItem('ecocycle_v4', JSON.stringify(data));
    
    updateUI();
    resetForm();
}

function updateUI() {
    animateValue("total-points", previousPoints, data.points, 1000);
    const list = document.getElementById('activity-list');
    
    list.innerHTML = data.items.slice(0, 5).map(i => `
        <div class="history-item">
            <img src="${i.image}" class="thumb">
            <div style="flex:1">
                <strong>${i.name}</strong>
                <div style="font-size:0.7rem; opacity:0.6;">${i.date} • ${i.points} pts</div>
            </div>
            <button onclick="shareRecovery('${i.name}', ${i.points})" style="background:none; border:none; color:var(--primary); cursor:pointer;">
                <i class="fas fa-share-alt"></i>
            </button>
        </div>
    `).join('');
}

// Helper for UI Feedback
function showNotification(msg, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`EcoCycle Server running securely on http://localhost:${PORT}`);
});
