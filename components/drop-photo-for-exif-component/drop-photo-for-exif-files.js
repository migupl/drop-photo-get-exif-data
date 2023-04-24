import { exifData } from "./drop-photo-for-exif-data.js";

class DropPhotoForExifFiles {

    collectFiles = items => {
        let files = this.#getFiles(items);
        return this.#groupByTypes(files);
    }

    #isADirectory = file => 'directory' === file.type
    #isAGeoJsonFile = file => 'application/geo+json' === file.type
    #isAnImage = file => file.type.startsWith('image/')

    #filterDirectories = files => files.filter(this.#isADirectory)
    #filterGeoJson = files => files.filter(this.#isAGeoJsonFile)
    #filterImages = files => files.filter(this.#isAnImage)

    #getDirectoryEntries = dirEntry => {
        const files = [];
        dirEntry.createReader()
            .readEntries((entries) => {
                entries.filter((entry) => entry.isFile)
                    .forEach(entryFile =>
                        entryFile.file((file) => {
                            const fileWithType = file.type ? file : new File([file], file.name, { type: this.#mimetype(file.name) })
                            files.push(fileWithType)
                        })
                    )
            });

        return files;
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

    #groupByTypes = files => {
        return {
            geojsons: this.#filterGeoJson(files),
            images: this.#filterImages(files),
            directories: this.#filterDirectories(files)
        }
    }

    #mimetype = filename => {
        const ext = filename.split('.').pop();

        if ('geojson' == ext) return 'application/geo+json';
        return exifData.getAllowedMimetype(ext);
    }

    #supportsFileSystemAccessAPI = 'getAsFileSystemHandle' in DataTransferItem.prototype;
    #supportsWebkitGetAsEntry = 'webkitGetAsEntry' in DataTransferItem.prototype;
}

const dropFiles = new DropPhotoForExifFiles();
export { dropFiles }