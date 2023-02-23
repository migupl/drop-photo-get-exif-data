import { exifData } from "./exif-data.js";

class DropFiles {

    addImages = images => {
        const container = document.getElementById('images-dragged');
        const template = document.querySelector('#photo-item');

        images.forEach(image => {
            const clone = template.content.cloneNode(true);

            const img = clone.querySelector('img');
            img.src = URL.createObjectURL(image);
            img.alt = image.name;

            const summary = clone.getElementById('summary');
            const details = clone.getElementById('details');
            exifData.extractExif(image)
                .then((exif) => {
                    summary.innerHTML = this.#highlight(exif.summary);
                    details.innerHTML = this.#highlight(exif.details);
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

    #highlight(json, language = 'json') {
        const withSpaces = JSON.stringify(json, null, 2)
        return hljs
            .highlight(withSpaces, { language: language })
            .value
    }
}

const dropFiles = new DropFiles();
export { dropFiles }