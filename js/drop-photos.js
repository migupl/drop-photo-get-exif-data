function dropHandler(ev) {
    ev.preventDefault();

    const { items } = ev.dataTransfer;
    const files = _collectFiles(ev);
    const images = _collectImages(files);

    _addImages(images);
}

function dragOverHandler(ev) {
    ev.preventDefault();
}

_addImages = images => {
    const container = document.getElementById('images-dragged');
    const template = document.querySelector('#photo-item');

    images.forEach(image => {
        const clone = template.content.cloneNode(true);

        const img = clone.querySelector('img');
        img.src = URL.createObjectURL(image);
        img.alt = image.name;

        container.appendChild(clone);
    });
}

_collectFiles = event => {
    const { items } = event.dataTransfer;

    let files;
    if (items) {
        files = [...items]
            .filter(item => item.kind === 'file')
            .map(image => image.getAsFile())
    }
    else {
        files = [...event.dataTransfer.files];
    }

    return files;
}

_collectImages = files => files.filter(file => file.type.startsWith('image/'));