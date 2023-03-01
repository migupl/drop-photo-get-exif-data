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

document.addEventListener("drop-photo-for-exif:data", (event) => {
    event.preventDefault();

    const template = document.getElementById('photo-item');
    const container = document.getElementById('images-dragged');

    const data = event.detail;
    const clone = template.content.cloneNode(true);

    const img = clone.querySelector('img');
    img.src = URL.createObjectURL(data.image);
    img.alt = data.name;

    const location = clone.getElementById('location');
    location.innerHTML = highlight(data.location);

    const details = clone.getElementById('details');
    details.innerHTML = highlight(data.exif);

    container.appendChild(clone);
});
