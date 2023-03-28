function highlight(json, language = 'json') {
    let html = '';
    if (json) {
        const withSpaces = JSON.stringify(json, null, 2)
        html = hljs
            .highlight(withSpaces, { language: language })
            .value
    }

    return html;
}

document.addEventListener('drop-photo-for-exif:data', (event) => {
    event.preventDefault();

    const template = document.getElementById('photo-item');
    const container = document.getElementById('items-dragged');

    const data = event.detail;
    const clone = template.content.cloneNode(true);

    const filename = clone.getElementById('filename');
    filename.textContent = data.name;

    const img = clone.querySelector('img');
    img.src = URL.createObjectURL(data.image);
    img.alt = data.name;

    const location = clone.getElementById('location');
    location.innerHTML = highlight(data.location);

    const details = clone.getElementById('details');
    details.innerHTML = highlight(data.exif);

    container.appendChild(clone);
});

document.addEventListener('drop-photo-for-exif:geojson', (event) => {
    event.preventDefault();

    const template = document.getElementById('geojson-item');
    const container = document.getElementById('items-dragged');

    const geojsonFile = event.detail;
    const clone = template.content.cloneNode(true);

    const filename = clone.getElementById('filename');
    filename.textContent = geojsonFile.name;

    const geojson = clone.getElementById('geojson');

    const reader = new FileReader();
    reader.addEventListener('loadend', () => {
        const json = JSON.parse(reader.result);

        geojson.innerHTML = highlight(json);
        container.appendChild(clone);
    });

    reader.readAsText(geojsonFile);
});
