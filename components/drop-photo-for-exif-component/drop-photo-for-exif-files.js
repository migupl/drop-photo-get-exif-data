import { exifData } from "./drop-photo-for-exif-data.js";

class DropPhotoForExifFiles {

    collectImages = event => {
        const files = this.#collectFiles(event);
        const images = this.#filterImages(files);
        return images;
    }

    #collectFiles = event => {
        return [...event.dataTransfer.files];
    }

    #filterImages = files => files.filter(file => file.type.startsWith('image/'));
}

const dropFiles = new DropPhotoForExifFiles();
export { dropFiles }