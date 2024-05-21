class DropPhotoForExifFiles {

    static ALLOWED_MIMETYPES = new Map([
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

    #afterFileReady; #afterImageReady; #doOnCompletion;

    process = (items
        , afterImageReady = (image, exif) => console.log('Do something after image is ready')
        , afterFileReady = file => console.log('Do something after file is ready')
        , onCompletion = () => console.log('Do something on complete')) => {

        this.#setAfterActions(afterImageReady, afterFileReady, onCompletion);
        this.#filesToProcess(items.length);
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
            .readEntries((entries) => {
                const files = entries.filter((entry) => entry.isFile);
                this.#filesToProcess(files.length - 1);

                files.forEach(entryFile =>
                    entryFile.file(this.#processFile)
                )
            });
    }

    #filesToProcess = n => this._remainToCompleteBatch = (this._remainToCompleteBatch || 0) + n

    #mimetype = filename => {
        const ext = filename.split('.').pop();

        if ('geojson' == ext) return 'application/geo+json';
        return ALLOWED_MIMETYPES.get(ext) || ''
    }

    #onCompletion = () => {
        --this._remainToCompleteBatch;
        if (!this._remainToCompleteBatch) this.#doOnCompletion();
    }

    #processFile = file => {
        const fileWithType = file.type ? file : new File([file], file.name, { type: this.#mimetype(file.name) })
        if (this.#isAnImage(fileWithType)) {
            this.#processImage(fileWithType)
                .then((exif) =>
                    this.#afterImageReady(fileWithType, exif)
                );
        }
        else {
            this.#afterFileReady(fileWithType);
        }
    }

    #setAfterActions = (afterImageReady, afterFileReady, onCompletion) => {
        this.#afterImageReady = (image, exif) => {
            afterImageReady(image, exif);
            this.#onCompletion();
        };

        this.#afterFileReady = file => {
            afterFileReady(file);
            this.#onCompletion();
        };

        this.#doOnCompletion = onCompletion;
    }

    #supportsWebkitGetAsEntry = 'webkitGetAsEntry' in DataTransferItem.prototype;
}

const dropFiles = new DropPhotoForExifFiles();
export { dropFiles }