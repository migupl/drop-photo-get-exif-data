class ExifData {

    async extractExif(file) {
        let exif = await ExifReader.load(file);
        return {
            location: {
                latitude: `${exif.GPSLatitude.description} ${exif.GPSLatitudeRef.value[0]}`,
                longitude: `${exif.GPSLongitude.description} ${exif.GPSLongitudeRef.value[0]}`
            },
            details: exif
        };
    }
}

const exifData = new ExifData();
export { exifData }