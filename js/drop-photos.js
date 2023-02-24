import { dropFiles } from "../components/drop-photo-for-exif-component/drop-files.js";

window.dropHandler = function (ev) {
    ev.preventDefault();

    const files = dropFiles.collectFiles(ev);
    const images = dropFiles.collectImages(files);

    dropFiles.addImages(images);
}

window.dragOverHandler = function (ev) {
    ev.preventDefault();
}