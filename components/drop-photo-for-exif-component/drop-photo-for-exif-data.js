class DropPhotoForExifData {

    async extractExif(file) {
        let exif = await ExifReader.load(file);
        return {
            summary: {
                Camera: exif.Model.description,
                Date: exif.DateTime.description,
                Location: `${exif.GPSLatitude.description} ${exif.GPSLatitudeRef.value[0]}, ${exif.GPSLongitude.description} ${exif.GPSLongitudeRef.value[0]}`
            },
            details: exif
        };
    }
}

const exifData = new DropPhotoForExifData();
export { exifData }