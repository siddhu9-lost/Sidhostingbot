// --- 1. SESSION SECURITY (Check this first!) ---
const currentUser = JSON.parse(localStorage.getItem('ecocycle_session'));
if (!currentUser) {
    window.location.href = 'auth.html'; // Redirect if no session found
}

// Logout Functionality
function logout() {
    localStorage.removeItem('ecocycle_session');
    window.location.href = 'auth.html';
}

// --- 2. STATE MANAGEMENT ---
let data = JSON.parse(localStorage.getItem('ecocycle_v4')) || { items: [], points: 0 };
let selectedCoords = [19.076, 72.877];
let capturedImage = "";
let previousPoints = data.points; // For the counting animation

// --- 3. MAP INITIALIZATION ---
const map = L.map('map', { 
    zoomControl: false, 
    attributionControl: false 
}).setView(selectedCoords, 15);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { 
    maxZoom: 19 
}).addTo(map);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', { 
    pane: 'shadowPane' 
}).addTo(map);

let marker = L.marker(selectedCoords, {
    draggable: true,
    icon: L.divIcon({
        className: 'custom-div-icon',
        html: "<div style='background-color:var(--primary); width:15px; height:15px; border-radius:50%; border:2px solid white; box-shadow:0 0 15px var(--primary);'></div>",
        iconSize: [15, 15],
        iconAnchor: [7, 7]
    })
}).addTo(map);

// --- 4. LOCATION FUNCTIONS ---
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
    const statusBox = document.getElementById('loc-status');
    if (statusBox) {
        statusBox.innerHTML = `<i class="fas fa-check-circle"></i> Target Locked: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
}

map.on('click', (e) => updateLocation(e.latlng.lat, e.latlng.lng));

// --- 5. DATA & UI UTILITIES ---
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "ecocycle_report.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function shareRecovery(name, pts) {
    const text = `I just recycled ${name} and earned ${pts} points on EcoCycle! 🌍`;
    if (navigator.share) {
        navigator.share({ title: 'EcoCycle', text: text, url: window.location.href });
    } else {
        alert("Sharing not supported on this browser, but great job!");
    }
}

// --- 6. CORE APP LOGIC ---
function addEntry() {
    const nameInput = document.getElementById('item-name');
    const catInput = document.getElementById('item-cat');
    
    const name = nameInput ? nameInput.value : "";
    const pts = catInput ? parseInt(catInput.value) : 0;

    if (!name || !capturedImage) {
        showNotification("Missing Photo or Name", "error");
        return;
    }

    const entry = {
        id: Date.now(),
        name, 
        points: pts, 
        image: capturedImage, 
        coords: selectedCoords, 
        date: new Date().toLocaleDateString()
    };

    data.items.unshift(entry);
    previousPoints = data.points;
    data.points += pts;
    localStorage.setItem('ecocycle_v4', JSON.stringify(data));
    
    updateUI();
    // Assuming resetForm() exists to clear inputs
    if (typeof resetForm === "function") resetForm(); 
}

function updateUI() {
    animateValue("total-points", previousPoints, data.points, 1000);
    const list = document.getElementById('activity-list');
    if (!list) return;
    
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

function showNotification(msg, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.cssText = "position:fixed; bottom:20px; left:50%; transform:translateX(-50%); padding:10px 20px; border-radius:8px; background:#333; color:#fff; z-index:10000;";
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Initialize UI on load
window.onload = updateUI;
