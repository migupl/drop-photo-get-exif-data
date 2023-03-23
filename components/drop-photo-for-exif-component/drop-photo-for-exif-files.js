import { exifData } from "./drop-photo-for-exif-data.js";

class DropPhotoForExifFiles {

    collectFiles = event => {
        const files = [...event.dataTransfer.files];

        const images = this.#filterImages(files);
        const geojsons = this.#filterGeoJson(files);
        return {
            geojsons: geojsons,
            images: images
        };
    }

    #filterGeoJson = files => files.filter(file => 'application/geo+json' === file.type)
    #filterImages = files => files.filter(file => file.type.startsWith('image/'))
}

const dropFiles = new DropPhotoForExifFiles();
export { dropFiles }