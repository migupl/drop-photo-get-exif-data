import { dropFiles } from "../components/drop-photo-for-exif-component/drop-photo-for-exif-files.js";

window.dropHandler = function (ev) {
    ev.preventDefault();

    const files = dropFiles.collectFiles(ev);
    const images = dropFiles.filterImages(files);

    dropFiles.addImages(images);
}

window.dragOverHandler = function (ev) {
    ev.preventDefault();
}