; ((exifReaderLib) => {
    class DropPhotoForExif extends HTMLElement {

        #config;

        constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });

            this.#config = this.#getConfiguration(shadow);

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

            const drag = document.createElement('div');
            drag.id = 'drag-area';

            drag.appendChild(icon);
            drag.appendChild(dragText);

            const dropText = document.createElement('div');
            dropText.className = 'item';
            dropText.textContent = this.#config.dropText;

            const drop = document.createElement('div');
            drop.id = 'drop-area';
            drop.style = 'display: none;';

            drop.appendChild(dropText)

            const shadow = this.#config.shadow;
            shadow.appendChild(style);
            shadow.appendChild(drag);
            shadow.appendChild(drop);
        }

        #dropFiles = function (afterImageReady = (image, exif) => console.log('Do something after image is ready')
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
                if (item.isDirectory) return { directory: item }

                if (item instanceof File) return { file: item }

                const entry = item?.webkitGetAsEntry()
                if(entry.isDirectory) return { directory: entry }

                return { file: item.getAsFile() }
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
        }

        #emitEvent = (() => {
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
            const whenImageReady = (file, exifMetadata) => emit(new CustomEvent('drop-photo-for-exif:image', eventProperties(file, exifMetadata)))
            const whenFileReady = file => emit(new CustomEvent('drop-photo-for-exif:file', eventProperties(file)))
            const onCompleted = () => emit(new CustomEvent('drop-photo-for-exif:completed-batch', eventProperties()))

            return {
                onCompleted, whenFileReady, whenImageReady
            }
        })();

        #getConfiguration = shadowRoot => {
            const defaults = {
                backgrounColor: '#E8E8E8',
                dragText: 'Drag files here or',
                dropText: 'Drop files here',
                uploadText: 'upload files'
            };
            const displayDragArea = (show = true) => {
                const drag = this.#config.shadow.getElementById('drag-area');
                const drop = this.#config.shadow.getElementById('drop-area');

                if (show) {
                    drag.style = 'display: none';
                    drop.style = 'display: flex';
                } else {
                    drag.style = 'display: flex';
                    drop.style = 'display: none';
                }
            }

            const backgrounColor = this.getAttribute('drag-area-background') || defaults.backgrounColor;
            return {
                dragText: this.getAttribute('drag-text') || defaults.dragText,
                dropText: this.getAttribute('drop-text') || defaults.dropText,
                uploadText: this.getAttribute('upload-text') || defaults.uploadText,
                icon:
                    '<svg viewBox="0 0 59 49" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                        `<rect width="40.772121" height="31.674221" x="0.614479" y="12.7783" fill="${backgrounColor}" />` +
                        '<path fill-rule="evenodd" clip-rule="evenodd" d="M0.614479 12.7783L6.74988 12.7783L6.74988 14.7158L2.55198 14.7158L2.55198 18.9137L0.614479 18.9137L0.614479 12.7783Z" fill="#000000"></path>' +
                        '<path fill-rule="evenodd" clip-rule="evenodd" d="M39.3644 42.4866L39.3644 38.2887L41.3019 38.2887L41.3019 44.4241L35.1665 44.4241L35.1665 42.4866L39.3644 42.4866Z" fill="#000000"></path>' +
                        '<path fill-rule="evenodd" clip-rule="evenodd" d="M0.614479 38.2887L2.55198 38.2887L2.55198 42.4866L6.74987 42.4866L6.74987 44.4241L0.614479 44.4241L0.614479 38.2887Z" fill="#000000"></path>' +
                        '<path d="M19.6665 30.2531H58.4165L58.4165 0.544722H19.6665L19.6665 30.2531Z" fill="#379fe5"></path>' +
                        '<path d="M19.6665 21.8429L19.6665 30.2525L58.4168 30.2525L58.4168 19.7406L49.6667 12.4069C48.6234 11.5342 47.2931 11.0699 45.9272 11.1018C44.5614 11.1337 43.2547 11.6596 42.2542 12.5801L33.4166 20.7918L28.4166 17.2548C27.7332 16.7781 26.9013 16.5563 26.0684 16.6288C25.2354 16.7012 24.4554 17.0632 23.8666 17.6505L19.6665 21.8429Z" fill="#145207"></path>' +
                        '<path d="M30.0056 12.9386C31.7315 12.9386 33.1306 11.5395 33.1306 9.8136C33.1306 8.08773 31.7315 6.68863 30.0056 6.68863C28.2798 6.68863 26.8807 8.08773 26.8807 9.8136C26.8807 11.5395 28.2798 12.9386 30.0056 12.9386Z" fill="#F2DF2E"></path>' +
                    '</svg>',
                processFiles: () => {
                    this.addEventListener('drop', (event) => {
                        event.preventDefault()
                        displayDragArea(false)

                        const { items } = event.dataTransfer;
                        this.#process(items)
                    })

                    this.addEventListener('dragenter', (event) => {
                        event.preventDefault()
                        displayDragArea()
                    })

                    this.addEventListener('dragleave', (event) => {
                        displayDragArea(false)
                    })

                    this.addEventListener('dragover', (event) => {
                        event.preventDefault()
                        displayDragArea()
                    })
                },
                shadow: shadowRoot,
                style:
                    ':host #drag-area, :host #drop-area {' +
                        'display: flex;' +
                        'flex-wrap: wrap;' +
                        'justify-content: center;' +
                        'align-items: center;' +
                    '}' +
                    '#drop-area {' +
                        'height: 100%;' +
                        `background: ${backgrounColor}` +
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

            this.#dropFiles(this.#emitEvent.whenImageReady, this.#emitEvent.whenFileReady, this.#emitEvent.onCompleted)
                .process(items)
        }
    }

    let exifReaderScriptEl = document.createElement('script');
    exifReaderScriptEl.src = exifReaderLib;

    exifReaderScriptEl.onload = function (ev) {
        customElements.define('drop-photo-for-exif', DropPhotoForExif);
        exifReaderScriptEl = null;
    }

    document.body.append(exifReaderScriptEl);
})('https://cdn.jsdelivr.net/npm/exifreader@4.12.0/dist/exif-reader.min.js');
