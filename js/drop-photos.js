import { dropFiles } from "../components/drop-photo-for-exif-component/drop-photo-for-exif-files.js";
import { exifData } from "../components/drop-photo-for-exif-component/drop-photo-for-exif-data.js";

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

window.dropHandler = function (ev) {
    ev.preventDefault();

    const template = document.getElementById('photo-item');
    const container = document.getElementById('images-dragged');

    const images = dropFiles.collectImages(ev);

    images.forEach((image) => {
        const clone = template.content.cloneNode(true);

        const img = clone.querySelector('img');
        img.src = URL.createObjectURL(image);
        img.alt = image.name;

        const location = clone.getElementById('location');
        const details = clone.getElementById('details');

        exifData.extractExif(image)
        .then((exif) => {
            location.innerHTML = highlight(exif.location);
            details.innerHTML = highlight(exif.details);
        });

        container.appendChild(clone);
    });
}

window.dragOverHandler = function (ev) {
    ev.preventDefault();
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
