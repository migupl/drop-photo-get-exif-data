function dropHandler(ev) {
    ev.preventDefault();

    const { items } = ev.dataTransfer;
    const files = _collectFiles(ev);
    const images = _collectImages(files);

    images.forEach((image) => {
        console.log(`… image.name = ${image.name}`);
    });
}

function dragOverHandler(ev) {
    ev.preventDefault();
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