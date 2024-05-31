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

    #onFileReady; #onImageReady;

    #supportsWebkitGetAsEntry = 'webkitGetAsEntry' in DataTransferItem.prototype;
    #unproccessedItems = 0;

    process = (items
        , afterImageReady = (image, exif) => console.log('Do something after image is ready')
        , afterFileReady = file => console.log('Do something after file is ready')
        , afterCompletion = () => console.log('Do something on complete')) => {

        this.#unproccessedItems += items.length

        this.#setAfterActions(afterImageReady, afterFileReady, afterCompletion);
        this.#process(items);
    }

    #process = items => {
        for (let item of items) {
            if (typeof item.name === 'string') {
                this.#processFile(item);
            }
            else if (!this.#supportsWebkitGetAsEntry) {
                this.#processFile(item.getAsFile());
            }
            else {
                const entry = item.webkitGetAsEntry();
                if (entry.isFile) {
                    this.#processFile(item.getAsFile());
                }
                else if (entry.isDirectory) {
                    this.#exploreDirectoryContent(entry);
                }
            }
        }
    }

    #processImage = file => ExifReader
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

    #isAnImage = file => file.type.startsWith('image/')

    #exploreDirectoryContent = dirEntry => {
        dirEntry.createReader()
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

    #processFile = file => {
        const fileWithType = new File([file], file.name, { type: this.#getMimetype(file.name) })
        if (this.#isAnImage(fileWithType)) {
            this.#processImage(fileWithType)
                .then((exif) =>
                    this.#onImageReady(fileWithType, exif)
                );
        }
        else {
            this.#onFileReady(fileWithType);
        }
    }

    #setAfterActions = (afterImageReady, afterFileReady, afterCompletion) => {
        const onCompletion = () => {
            --this.#unproccessedItems;
            if (!this.#unproccessedItems) afterCompletion();
        }

        this.#onImageReady = (image, exif) => {
            afterImageReady(image, exif);
            onCompletion();
        };

        this.#onFileReady = file => {
            afterFileReady(file);
            onCompletion();
        };
    }
}

const dropFiles = new DropPhotoForExifFiles();
export { dropFiles }