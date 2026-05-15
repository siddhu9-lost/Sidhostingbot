<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
    let data = JSON.parse(localStorage.getItem('ecocycle_v4')) || { items: [], points: 0 };
    let selectedCoords = [19.076, 72.877];
    let capturedImage = "";

    // Initialize Map
    const map = L.map('map', { 
        zoomControl: false,
        attributionControl: false 
    }).setView(selectedCoords, 15); // Zoomed in more for better satellite detail

    // SATELLITE LAYER (Esri World Imagery)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
    }).addTo(map);

    // Optional: Add a subtle label layer so you can still see street names over the satellite
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
        pane: 'shadowPane' 
    }).addTo(map);

    // Custom Glowing Marker
    let marker = L.marker(selectedCoords, {
        draggable: true,
        icon: L.divIcon({
            className: 'custom-div-icon',
            html: "<div style='background-color:var(--primary); width:15px; height:15px; border-radius:50%; border:2px solid white; box-shadow:0 0 15px var(--primary);'></div>",
            iconSize: [15, 15],
            iconAnchor: [7, 7]
        })
    }).addTo(map);

    // Map Click Functionality
    map.on('click', function(e) {
        selectedCoords = [e.latlng.lat, e.latlng.lng];
        marker.setLatLng(e.latlng);
        document.getElementById('loc-status').innerHTML = `<i class="fas fa-check-circle"></i> Location Pinned: ${selectedCoords[0].toFixed(4)}, ${selectedCoords[1].toFixed(4)}`;
    });

    // Image Preview
    function previewImage(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function() {
                capturedImage = reader.result;
                const preview = document.getElementById('preview');
                preview.src = capturedImage;
                preview.style.display = 'block';
                preview.style.animation = 'fadeIn 0.5s ease-in';
            }
            reader.readAsDataURL(file);
        }
    }

    function addEntry() {
        const name = document.getElementById('item-name').value;
        const pts = parseInt(document.getElementById('item-cat').value);

        if (!name || !capturedImage) {
            alert("Please upload a photo and enter item name.");
            return;
        }

        const entry = {
            name,
            points: pts,
            image: capturedImage,
            coords: selectedCoords,
            date: new Date().toLocaleDateString()
        };

        data.items.unshift(entry);
        data.points += pts;
        localStorage.setItem('ecocycle_v4', JSON.stringify(data));
        
        updateUI();
        resetForm();
    }

    function resetForm() {
        document.getElementById('item-name').value = "";
        document.getElementById('file-input').value = "";
        document.getElementById('preview').style.display = 'none';
        capturedImage = "";
    }

    function updateUI() {
        document.getElementById('total-points').innerText = data.points;
        const list = document.getElementById('activity-list');
        
        if (data.items.length === 0) {
            list.innerHTML = `<p style="text-align:center; opacity:0.5; padding: 20px;">No entries yet.</p>`;
            return;
        }

        list.innerHTML = data.items.slice(0, 4).map(i => `
            <div class="history-item" style="animation: slideIn 0.3s ease-out">
                <img src="${i.image}" class="thumb">
                <div style="flex:1">
                    <div style="font-weight:700;">${i.name}</div>
                    <div style="font-size:0.7rem; opacity:0.6;">${i.date} • ${i.points} pts</div>
                </div>
                <i class="fas fa-satellite" style="color:var(--primary); font-size: 0.8rem; cursor:help;" title="Lat: ${i.coords[0]}, Lon: ${i.coords[1]}"></i>
            </div>
        `).join('');
    }

    function clearData() {
        if(confirm("Wipe all data? This cannot be undone.")) {
            data = { items: [], points: 0 };
            localStorage.setItem('ecocycle_v4', JSON.stringify(data));
            updateUI();
        }
    }

    updateUI();
</script>
