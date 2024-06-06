class DropPhotoForExifFiles {

    static ALLOWED_MIMETYPES = new Map([
        ['geojson', 'application/geo+json'],
        ['jpg', 'image/jpeg'],
        ['jpeg', 'image/jpeg'],
        ['jfif', 'image/jpeg'],
        ['pjpeg', 'image/jpeg'],
        ['pjp', 'image/jpeg'],
        ['webp', 'image/webp'],
        ['png', 'image/png'],
        ['tif', 'image/tiff'],
        ['tiff', 'image/tiff']
    ]);

    #onFileReady;

    #supportsWebkitGetAsEntry = 'webkitGetAsEntry' in DataTransferItem.prototype;
    #unproccessedItems = 0;

    process = (items
        , afterImageReady = (image, exif) => console.log('Do something after image is ready')
        , afterFileReady = file => console.log('Do something after file is ready')
        , afterCompletion = () => console.log('Do something on complete')) => {

        this.#unproccessedItems += items.length

        this.#onFileReady = (file, exif) => {
            exif ? afterImageReady(file, exif) : afterFileReady(file);

            --this.#unproccessedItems;
            if (!this.#unproccessedItems) afterCompletion();
        };

        this.#process(items);
    }

    #process = items => {
        for (let item of items) {
            if (item.name) {
                this.#processFile(item)
            } else if (this.#supportsWebkitGetAsEntry && item.webkitGetAsEntry().isDirectory) {
                this.#exploreDirectoryContent(item.webkitGetAsEntry())
            } else {
                this.#processFile(item.getAsFile())
            }
        }
    }

    #getExifMetadata = file => ExifReader
        .load(file)
        .then(exif => {
            let data = {
                details: exif
            };

            if (exif.GPSLatitude && exif.GPSLongitude && exif.GPSLongitudeRef) {
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

    #exploreDirectoryContent = directory => {
        directory
            .createReader()
            .readEntries(this.#processDirectoryContent);
    }

    #getMimetype = filename => {
        const ext = filename.split('.').pop();
        return DropPhotoForExifFiles.ALLOWED_MIMETYPES.get(ext) || ''
    }

    #processDirectoryContent = entries => {
        const files = entries.filter(entry => entry.isFile)

        this.#unproccessedItems = --this.#unproccessedItems + files.length
        files.forEach(entryFile =>
            entryFile.file(this.#processFile)
        )
    }

    #processFile = async file => {
        const type = file.type || this.#getMimetype(file.name);
        const exifMetadata = type.startsWith('image/') && await this.#getExifMetadata(file);

        this.#onFileReady(file, exifMetadata)
    }
}

const dropFiles = new DropPhotoForExifFiles();
export { dropFiles }