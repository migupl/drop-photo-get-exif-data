class DropPhotoForExifFiles {

    process = (items
        , afterImageReady = (image, exif) => console.log('Do something after image is ready')
        , afterFileReady = file => console.log('Do something after file is ready')
        , afterCompletion = () => console.log('Do something on complete')) => {

        const supportsWebkitGetAsEntry = 'webkitGetAsEntry' in DataTransferItem.prototype;
        let unproccessedItems = 0;

        const ALLOWED_MIMETYPES = {
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
            return ALLOWED_MIMETYPES[ext] || ''
        }

        const onFileReady = (file, exif) => {
            exif ? afterImageReady(file, exif) : afterFileReady(file);

            --unproccessedItems;
            if (!unproccessedItems) afterCompletion();
        };

        const processDirectoryContent = entries => {
            const files = entries.filter(entry => entry.isFile)

            files.forEach(entryFile =>
                entryFile.file(processFile)
            )
        }

        const processFile = async file => {
            ++unproccessedItems

            const typedFile = file.type ? file : new File([file], file.name, { type: getMimetype(file.name) })
            const exifMetadata = typedFile.type.startsWith('image/') && await getExifMetadata(typedFile);

            onFileReady(typedFile, exifMetadata)
        }

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