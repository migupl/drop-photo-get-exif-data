import { exifData } from "./drop-photo-for-exif-data.js";

class DropPhotoForExifFiles {

    collectFiles = event => {
        const { items } = event.dataTransfer;
        let files = this.#getFiles(items);

        const images = this.#filterImages(files);
        const geojsons = this.#filterGeoJson(files);
        const directories = this.#filterDirectories(files);
        return {
            geojsons: geojsons,
            images: images,
            directories: directories
        };
    }

    #filterDirectories = files => files.filter(file => 'directory' === file.type)
    #filterGeoJson = files => files.filter(file => 'application/geo+json' === file.type)
    #filterImages = files => files.filter(file => file.type.startsWith('image/'))

    #getDirectoryEntries = dirEntry => {
        const files = [];
        dirEntry.createReader()
            .readEntries((entries) => {
                entries.filter((entry) => entry.isFile)
                    .forEach(entryFile =>
                        this.#getFile(entryFile)
                            .then(file => files.push(file))
                    )
            });

        return files;
    }

    #getFile = entryFile => {
        try {
            return new Promise((resolve, reject) => entryFile.file(resolve, reject))
        } catch (err) {
            console.log(err);
        }
    }

    #getFiles = items => {
        const files = [];
        for (let item of items) {
            if (!(this.#supportsFileSystemAccessAPI || this.#supportsWebkitGetAsEntry)) {
                files.push(item.getAsFile());
            }

            const entry = this.#supportsFileSystemAccessAPI
                ? item.getAsFileSystemHandle()
                : item.webkitGetAsEntry();

            if (entry.isFile) {
                files.push(item.getAsFile());
            }
            else if (entry.isDirectory) {
                const directory = {
                    name: entry.name,
                    files: this.#getDirectoryEntries(entry),
                    type: 'directory'
                }
                files.push(directory);
            }
        }

        return files;
    }

    #supportsFileSystemAccessAPI = 'getAsFileSystemHandle' in DataTransferItem.prototype;
    #supportsWebkitGetAsEntry = 'webkitGetAsEntry' in DataTransferItem.prototype;
}

const dropFiles = new DropPhotoForExifFiles();
export { dropFiles }