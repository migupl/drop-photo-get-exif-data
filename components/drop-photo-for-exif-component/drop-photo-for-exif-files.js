class DropPhotoForExifFiles {

    static ALLOWED_MIMETYPES = {
        geojson: 'application/geo+json',
        jfif: 'image/jpeg',
        jpeg: 'image/jpeg',
        jpg: 'image/jpeg',
        pjpeg: 'image/jpeg',
        pjp: 'image/jpeg',
        png: 'image/png',
        tiff: 'image/tiff',
        tif: 'image/tiff',
        webp: 'image/webp'
    };

    #onFileReady;

    #unproccessedItems = 0;

    process = (items
        , afterImageReady = (image, exif) => console.log('Do something after image is ready')
        , afterFileReady = file => console.log('Do something after file is ready')
        , afterCompletion = () => console.log('Do something on complete')) => {

        const supportsWebkitGetAsEntry = 'webkitGetAsEntry' in DataTransferItem.prototype;

        const exploreDirectoryContent = directory => {
            directory
                .createReader()
                .readEntries(processDirectoryContent);
        }

        const getExifMetadata = file => ExifReader
            .load(file)
            .then(exif => {
                let data = {
                    details: exif
                };

                if (exif.GPSLatitude && exif.GPSLatitudeRef && exif.GPSLongitude && exif.GPSLongitudeRef) {
                    data.location = {
                        latitude: `${exif.GPSLatitude.description} ${exif.GPSLatitudeRef.value[0]}`,
                        longitude: `${exif.GPSLongitude.description} ${exif.GPSLongitudeRef.value[0]}`
                    }

                    if (exif.GPSAltitude) {
                        const [value, divisor] = exif.GPSAltitude.value;
                        data.location.altitude = value / divisor;
                    }
                }

                return data
            })

        const getMimetype = filename => {
            const ext = filename.split('.').pop();
            return DropPhotoForExifFiles.ALLOWED_MIMETYPES[ext] || ''
        }

        const processDirectoryContent = entries => {
            const files = entries.filter(entry => entry.isFile)

            files.forEach(entryFile =>
                entryFile.file(processFile)
            )
        }

        const processFile = async file => {
            ++this.#unproccessedItems

            const type = file.type || getMimetype(file.name);
            const exifMetadata = type.startsWith('image/') && await getExifMetadata(file);

            this.#onFileReady(file, exifMetadata)
        }

        this.#onFileReady = (file, exif) => {
            exif ? afterImageReady(file, exif) : afterFileReady(file);

            --this.#unproccessedItems;
            if (!this.#unproccessedItems) afterCompletion();
        };

        for (let item of items) {
            if (item.name) {
                processFile(item)
            } else if (supportsWebkitGetAsEntry && item.webkitGetAsEntry().isDirectory) {
                exploreDirectoryContent(item.webkitGetAsEntry())
            } else {
                processFile(item.getAsFile())
            }
        }
    }
}

const dropFiles = new DropPhotoForExifFiles();
export { dropFiles }