import { svgCss } from "./drop-photo-for-exif-dom.js";

class DropPhotoForExif extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.#extractExifDataOnDrop();
        this.#stopBehaviorOnDragOver();
    }

    connectedCallback() {
        const css = document.createElement('style');
        css.innerHTML = svgCss;
        this.shadowRoot.appendChild(css);

        const div = document.createElement('div');
        div.className = 'svg-container';
        this.shadowRoot.appendChild(div);

        const svg = document.createElement('object');
        svg.setAttribute('class', 'svg-object');
        svg.setAttribute('type', 'image/svg+xml');
        svg.setAttribute('data', './components/drop-photo-for-exif-component/drop-photo.svg');
        div.appendChild(svg);
    }

    #extractExifDataOnDrop = () => this.addEventListener('drop', (event) => {
        event.preventDefault();
    });

    #stopBehaviorOnDragOver = () => this.addEventListener('dragover', (event) => {
        event.preventDefault()
    });
}

customElements.define('drop-photo-for-exif', DropPhotoForExif);