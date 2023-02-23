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

            const code = clone.querySelector('code');
            exifData.extractExif(image)
                .then((exif) => {
                    code.innerHTML = [
                        hljs
                            .highlight(JSON.stringify(exif.summary, null, 2), { language: 'json' })
                            .value,
                        "Full Metadata",
                        hljs
                            .highlight(JSON.stringify(exif.details, null, 2), { language: 'json' })
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
}

const dropFiles = new DropFiles();
export { dropFiles }