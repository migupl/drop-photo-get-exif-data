; ((exifReaderLib) => {
    class DropPhotoForExif extends HTMLElement {

        #config;

        constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });

            this.#configure(shadow);

            this.#stopPreventDefaultAndBubblingUp();
            this.#config.processFiles();
        }

        connectedCallback() {
            const style = document.createElement('style');
            style.textContent = this.#config.style;

            const icon = document.createElement('div');
            icon.className = 'item';
            icon.innerHTML = this.#config.icon;

            const hidden = document.createElement('input');
            hidden.type = 'file';
            hidden.multiple = "multiple"
            hidden.onchange = _ => {
                const files = Array.from(hidden.files);
                this.#process(files)
            }

            const upload = document.createElement('span');
            upload.role = 'button';
            upload.className = 'upload';
            upload.textContent = this.#config.uploadText;
            upload.onclick = _ => hidden.click()

            const dragText = document.createElement('div');
            dragText.className = 'item';
            dragText.textContent = this.#config.dragText + ' ';
            dragText.appendChild(upload);

            const content = document.createElement('div');
            content.id = 'drag-text-area';

            content.appendChild(icon);
            content.appendChild(dragText);

            const drag = document.createElement('div');
            drag.id = 'drag-area';
            drag.style = 'display: none;';

            const shadow = this.#config.shadow;
            shadow.appendChild(style);
            shadow.appendChild(content);
            shadow.appendChild(drag);
        }

        #configure = shadowRoot => {
            const displayDragArea = (show = true) => {
                const content = this.#config.shadow.getElementById('drag-text-area');
                const drag = this.#config.shadow.getElementById('drag-area');

                if (show) {
                    content.style= 'display: none';
                    drag.style = 'display: flex';
                } else {
                    content.style= 'display: flex';
                    drag.style = 'display: none';
                }
            }

            this.#config = {
                dragText: this.getAttribute('drag-text') || 'Drag files here or',
                uploadText: this.getAttribute('upload-text') || 'upload files',
                icon:
                    '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980.000000 980.000000" preserveAspectRatio="xMidYMid meet">' +
                        '<g transform="translate(0.000000,980.000000) scale(0.100000,-0.100000)" stroke="none">' +
                            '<path d="M705 9789 c-342 -48 -626 -320 -689 -659 -15 -77 -16 -454 -14 -3945 l3 -3860 23 -74 c88 -283 291 -486 573 -573 l74 -23 2400 -5 2400 -5 80 -66 c186 -154 490 -327 729 -414 780 -286 1650 -185 2344 272 283 187 562 468 750 756 201 310 328 643 395 1037 l21 125 3 3345 c4 3695 8 3427 -59 3587 -100 241 -295 411 -557 486 l-76 22 -4170 1 c-2293 1 -4197 -2 -4230 -7z m8070 -663 c75 -21 116 -41 175 -85 101 -76 169 -189 190 -312 6 -43 10 -787 10 -2223 l0 -2159 -137 134 c-313 305 -674 520 -1075 639 -56 17 -103 32 -105 33 -1 2 -51 84 -111 183 -452 749 -928 1324 -1210 1461 -45 22 -71 27 -128 28 -61 0 -80 -5 -145 -37 -100 -49 -191 -120 -328 -252 -221 -216 -405 -441 -966 -1186 -560 -744 -761 -989 -974 -1192 -164 -156 -320 -248 -420 -248 -64 0 -178 84 -257 190 -44 59 -121 195 -251 438 -187 353 -273 484 -378 580 -109 100 -216 126 -321 78 -115 -53 -287 -263 -426 -522 -243 -450 -474 -1083 -579 -1587 -68 -323 -42 -613 73 -817 48 -84 170 -201 254 -243 142 -71 38 -67 1591 -67 l1399 0 28 -93 c41 -136 108 -302 176 -436 33 -65 60 -121 60 -124 0 -12 -3778 -8 -3850 3 -214 34 -382 208 -410 425 -7 55 -10 1170 -8 3540 3 3331 4 3462 21 3515 56 165 187 291 350 335 77 21 7676 22 7752 1z m-1435 -4556 c697 -60 1288 -459 1600 -1081 281 -558 273 -1238 -21 -1788 -308 -576 -868 -957 -1519 -1032 -130 -15 -423 -7 -540 15 -485 90 -893 330 -1200 706 -180 220 -332 538 -388 815 -32 151 -42 255 -42 412 0 355 90 691 265 989 253 430 667 754 1135 889 251 72 471 96 710 75z" />' +
                            '<path d="M2755 7800 c-205 -32 -397 -130 -546 -279 -126 -127 -214 -278 -260 -451 -19 -71 -23 -110 -23 -240 -1 -182 17 -266 89 -417 53 -113 89 -166 172 -254 126 -133 293 -232 473 -280 122 -33 346 -33 474 -1 179 45 331 134 466 272 141 143 233 325 265 521 19 120 19 202 -1 320 -68 397 -366 710 -757 795 -88 19 -270 26 -352 14z" />' +
                            '<path d="M6860 3450 l0 -510 -510 0 -510 0 0 -325 0 -325 510 0 510 0 0 -510 0 -510 325 0 325 0 0 510 0 510 510 0 510 0 0 325 0 325 -507 2 -508 3 -3 508 -2 507 -325 0 -325 0 0 -510z" />' +
                        '</g>' +
                    '</svg>',
                processFiles: () => {
                    this.addEventListener('drop', (event) => {
                        displayDragArea(false)

                        const { items } = event.dataTransfer;
                        this.#process(items);
                    })

                    this.addEventListener('dragenter', (event) => {
                        displayDragArea()
                    })

                    this.addEventListener('dragleave', (event) => {
                        displayDragArea(false)
                    })
                },
                shadow: shadowRoot,
                style:
                    ':host #drag-text-area {' +
                        'display: flex;' +
                        'flex-wrap: wrap;' +
                        'justify-content: center;' +
                        'align-items: center;' +
                    '}' +
                    '#drag-area {' +
                        'height: 100%;' +
                        'background: #E8E8E8' +
                    '}' +
                    '.item {' +
                        'margin: 10px;' +
                    '}' +
                    'div svg {' +
                        'min-width: 50px;' +
                    '}' +
                    'div > * {' +
                        'position: relative;' +
                    '}' +
                    '.upload {' +
                        'color: blue;' +
                        'cursor: pointer;' +
                    '}' +
                    '.upload:hover {' +
                        'text-decoration: underline;' +
                    '}'
            }
        }

        #process = (
            items
        ) => {
            const emit = event => this.#config.shadow.dispatchEvent(event);
            const eventProperties = (file, metadata) => {
                const properties = {
                    bubbles: true,
                    composed: true
                }

                if (metadata) {
                    properties.detail = {
                        name: file.name,
                        image: file,
                        location: metadata.location,
                        exif: metadata.details
                    }
                } else if (file) {
                    properties.detail = file
                }

                return properties
            }
            const emitWhenImageReady = (file, exifMetadata) => emit(new CustomEvent('drop-photo-for-exif:image', eventProperties(file, exifMetadata)))
            const emitWhenFileReady = file => emit(new CustomEvent('drop-photo-for-exif:file', eventProperties(file)))
            const emitOnCompleted = () => emit(new CustomEvent('drop-photo-for-exif:completed-batch', eventProperties()))

            dropFiles(emitWhenImageReady, emitWhenFileReady, emitOnCompleted)
                .process(items)
        }

        #stopPreventDefaultAndBubblingUp = () => {
            const stopEvents = e => {
                e.stopPropagation();
                e.preventDefault();
            };

            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                this.addEventListener(eventName, stopEvents, false)
            });
        }
    }

    const dropFiles = function (afterImageReady = (image, exif) => console.log('Do something after image is ready')
        , afterFileReady = file => console.log('Do something after file is ready')
        , afterCompletion = () => console.log('Do something on complete')) {

        const significantMimetypes = {
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

        let unproccessedItems = 0;

        const exploreDirectoryContent = directory => {
            ++unproccessedItems
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
            return significantMimetypes[ext] || ''
        }

        const classifyItem = item => {
            const isFile = item.lastModified != undefined;
            const directory = isFile ? undefined : (item?.isDirectory && item) ?? (item?.webkitGetAsEntry().isDirectory && item.webkitGetAsEntry());
            return {
                directory: directory,
                file: (item.name && item) ?? (item?.webkitGetAsEntry().isFile && item.getAsFile())
            }
        }

        const onFileReady = (file, exif) => {
            exif ? afterImageReady(file, exif) : afterFileReady(file);

            --unproccessedItems;
            if (!unproccessedItems) afterCompletion();
        };

        const processDirectoryContent = entries => {
            --unproccessedItems

            const subdirectories = entries.filter(entry => entry.isDirectory);
            process(subdirectories)

            const files = entries.filter(entry => entry.isFile);
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

        const process = items => {
            for (let item of items) {
                const itemType = classifyItem(item);
                itemType.directory ? exploreDirectoryContent(itemType.directory) : processFile(itemType.file)
            }
        }

        return {
            process
        }
    };

    let exifReaderScriptEl = document.createElement('script');
    exifReaderScriptEl.src = exifReaderLib;

    exifReaderScriptEl.onload = function (ev) {
        customElements.define('drop-photo-for-exif', DropPhotoForExif);
        exifReaderScriptEl = null;
    }

    document.body.append(exifReaderScriptEl);
})('https://cdn.jsdelivr.net/npm/exifreader@4.12.0/dist/exif-reader.min.js');
