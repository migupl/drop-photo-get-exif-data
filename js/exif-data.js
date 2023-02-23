class ExifData {

    async extractExif(file) {
        let exif = await ExifReader.load(file);
        return exif;
    }
}

const exifData = new ExifData();
export { exifData }