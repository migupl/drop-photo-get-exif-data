import { exifData } from "./drop-photo-for-exif-data.js";

class DropPhotoForExifFiles {

    addImages = images => {
        const container = document.getElementById('images-dragged');
        const template = document.querySelector('#photo-item');

        const data = new Array();

        images.forEach(image => {
            const imageData = {
                name: image.name,
                image: image,
                exif: {
                    summary: null,
                    details: null
                }
            };

            const clone = template.content.cloneNode(true);

            const img = clone.querySelector('img');
            img.src = URL.createObjectURL(imageData.image);
            img.alt = imageData.name;

            const summary = clone.getElementById('summary');
            const details = clone.getElementById('details');
            exifData.extractExif(imageData.image)
                .then((exif) => {
                    imageData.exif = exif;
                    summary.innerHTML = this.#highlight(imageData.exif.summary);
                    details.innerHTML = this.#highlight(imageData.exif.details);
                })
                .catch((error) => console.log(error));

            container.appendChild(clone);

            data.push(imageData);
        });
    }

    collectImages = event => {
        const files = this.#collectFiles(event);
        const images = this.#filterImages(files);
        return images;
    }

    #collectFiles = event => {
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

    #filterImages = files => files.filter(file => file.type.startsWith('image/'));

    #highlight(json, language = 'json') {
        const withSpaces = JSON.stringify(json, null, 2)
        return hljs
            .highlight(withSpaces, { language: language })
            .value
    }
}

const dropFiles = new DropPhotoForExifFiles();
export { dropFiles }