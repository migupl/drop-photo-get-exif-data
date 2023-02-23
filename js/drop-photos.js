class DropFiles {

    addImages = images => {
        const container = document.getElementById('images-dragged');
        const template = document.querySelector('#photo-item');

        images.forEach(image => {
            const clone = template.content.cloneNode(true);

            const img = clone.querySelector('img');
            img.src = URL.createObjectURL(image);
            img.alt = image.name;

            const exif = clone.querySelector('code');
            this._extractExif(image)
                .then((exifData) => {
                    const summary = {
                        Camera: exifData.Model.description,
                        Date: exifData.DateTime.description,
                        Location: `${exifData.GPSLatitude.description} ${exifData.GPSLatitudeRef.value[0]}, ${exifData.GPSLongitude.description} ${exifData.GPSLongitudeRef.value[0]}`
                    }
                    exif.innerHTML = [
                        hljs
                            .highlight(JSON.stringify(summary, null, 2), { language: 'json' })
                            .value,
                        "Full Metadata",
                        hljs
                            .highlight(JSON.stringify(exifData, null, 2), { language: 'json' })
                            .value
                    ].join('\n');
                })
                .catch((error) => console.log(error));

            container.appendChild(clone);
        });
    }

    collectFiles = event => {
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

    collectImages = files => files.filter(file => file.type.startsWith('image/'));

    async _extractExif(file) {
        let exif = await ExifReader.load(file);
        return exif;
    }
}

window.dropHandler = function (ev) {
    ev.preventDefault();

    const dropFiles = new DropFiles();
    const files = dropFiles.collectFiles(ev);
    const images = dropFiles.collectImages(files);

    dropFiles.addImages(images);
}

window.dragOverHandler = function (ev) {
    ev.preventDefault();
}