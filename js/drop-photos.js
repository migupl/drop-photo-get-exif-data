window.onload = (event) => {
    const highlight = json => {
        let html = '';
        if (json) {
            const withSpaces = JSON.stringify(json, null, 2)
            html = hljs
                .highlight(withSpaces, { language: 'json' })
                .value
        }

        return html;
    }

    [
        'drop-photo-for-exif:image',
        'drop-photo-for-exif:file',
        'drop-photo-for-exif:completed-batch'
    ].forEach((name) =>
        document.addEventListener(
            name,
            (e) => {
                e.preventDefault();
                e.stopPropagation();
            })
    )

    document.addEventListener('drop-photo-for-exif:image', (event) => {
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

    document.addEventListener('drop-photo-for-exif:file', (event) => {
        const template = document.getElementById('geojson-item');
        const container = document.getElementById('items-dragged');

        const file = event.detail;
        const clone = template.content.cloneNode(true);

        const filename = clone.getElementById('filename');
        filename.textContent = file.name;

        if ('application/geo+json' === file.type) {
            const geojson = clone.getElementById('geojson');

            const reader = new FileReader();
            reader.addEventListener('loadend', () => {
                const json = JSON.parse(reader.result);

                geojson.innerHTML = highlight(json);
                container.appendChild(clone);
            });

            reader.readAsText(file);
        }
        else {
            container.appendChild(clone);
        }
    });

    document.addEventListener('drop-photo-for-exif:completed-batch', (event) => {
        console.log('All files processed!!!')
    });
}
