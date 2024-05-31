import { dropFiles } from "./drop-photo-for-exif-files.js";

; ((exifReaderLib) => {
    class DropPhotoForExif extends HTMLElement {

        #config;

        constructor() {
            super();
            this.attachShadow({ mode: 'open' });

            this.#configure();

            this.#stopDefaultsForDragAndDropEvents();
            this.#config.processFiles();
        }

        connectedCallback() {
            this.#addCss();
            this.#addIcon();
            this.#addHelperText();
        }

        #addCss = () => {
            const contentCss = document.createElement('style');
            contentCss.textContent = this.#config.style;
            this.shadowRoot.appendChild(contentCss);
        }

        #addHelperText() {
            const divEl = document.createElement('div');
            divEl.className = 'item';
            this.shadowRoot.appendChild(divEl);

            const helpEl = document.createElement('span');
            helpEl.textContent = this.#config.legend;
            divEl.appendChild(helpEl);
        }

        #addIcon = () => {
            const divEl = document.createElement('div');
            divEl.className = 'item';
            divEl.innerHTML = this.#config.icon
            this.shadowRoot.appendChild(divEl);
        }

        #emitImageEvent = (image, exif) => {
            const evt = new CustomEvent('drop-photo-for-exif:image', {
                bubbles: true,
                composed: true,
                detail: {
                    name: image.name,
                    image: image,
                    location: exif.location,
                    exif: exif.details
                }
            });
            this.shadowRoot.dispatchEvent(evt);
        }

        #emitFileEvent = file => {
            const evt = new CustomEvent('drop-photo-for-exif:file', {
                bubbles: true,
                composed: true,
                detail: file
            });
            this.shadowRoot.dispatchEvent(evt);
        }

        #emitOnCompleted = () => {
            const evt = new CustomEvent('drop-photo-for-exif:completed-batch', {
                bubbles: true,
                composed: true,
            });
            this.shadowRoot.dispatchEvent(evt);
        }

        #preventDefaults = e => {
            e.preventDefault();
            e.stopPropagation();
        }

        #process = (
            items,
            fireOnImage = this.#emitImageEvent,
            fireOnFile = this.#emitFileEvent,
            fireOnCompletion = this.#emitOnCompleted
        ) => dropFiles.process(items, fireOnImage, fireOnFile, fireOnCompletion)

        #configure = () => {
            const userAgent = navigator.userAgent || window.opera;
            const isMobile = (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i
                .test(userAgent.substr(0, 4)));

            const textAttr = this.getAttribute('helperText')
            const chooseFiles = {
                legend: textAttr || 'Choose files',
                icon:
                    '<svg fill="#000000" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">' +
                        '<path d="M0 26.016v-20q0-2.496 1.76-4.256t4.256-1.76h8q1.92 0 3.456 1.12t2.176 2.88h6.368q2.464 0 4.224 1.76t1.76 4.256v16q0 2.496-1.76 4.224t-4.224 1.76h-20q-2.496 0-4.256-1.76t-1.76-4.224zM4 26.016q0 0.832 0.576 1.408t1.44 0.576h1.984v-13.984q0-0.832 0.576-1.408t1.44-0.608h17.984v-1.984q0-0.832-0.576-1.408t-1.408-0.608h-10.016v-1.984q0-0.832-0.576-1.408t-1.408-0.608h-8q-0.832 0-1.44 0.608t-0.576 1.408v20zM18.016 23.008q0 2.080 1.44 3.552t3.552 1.44 3.52-1.44 1.472-3.552-1.472-3.52-3.52-1.472-3.552 1.472-1.44 3.52zM20 24v-1.984h2.016v-2.016h1.984v2.016h2.016v1.984h-2.016v2.016h-1.984v-2.016h-2.016z"></path>' +
                    '</svg>',
                processFiles: () => this.addEventListener('click', (_, process = this.#process) => {
                    let input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = "multiple"
                    input.onchange = _ => {
                        const files = Array.from(input.files);
                        process(files)
                    }

                    input.click();
                })
            };
            const dropFiles = {
                legend: textAttr || 'Drop files here',
                icon:
                    '<svg id="drop-image" version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980.000000 980.000000" preserveAspectRatio="xMidYMid meet">' +
                        '<g transform="translate(0.000000,980.000000) scale(0.100000,-0.100000)" stroke="none">' +
                            '<path d="M705 9789 c-342 -48 -626 -320 -689 -659 -15 -77 -16 -454 -14 -3945 l3 -3860 23 -74 c88 -283 291 -486 573 -573 l74 -23 2400 -5 2400 -5 80 -66 c186 -154 490 -327 729 -414 780 -286 1650 -185 2344 272 283 187 562 468 750 756 201 310 328 643 395 1037 l21 125 3 3345 c4 3695 8 3427 -59 3587 -100 241 -295 411 -557 486 l-76 22 -4170 1 c-2293 1 -4197 -2 -4230 -7z m8070 -663 c75 -21 116 -41 175 -85 101 -76 169 -189 190 -312 6 -43 10 -787 10 -2223 l0 -2159 -137 134 c-313 305 -674 520 -1075 639 -56 17 -103 32 -105 33 -1 2 -51 84 -111 183 -452 749 -928 1324 -1210 1461 -45 22 -71 27 -128 28 -61 0 -80 -5 -145 -37 -100 -49 -191 -120 -328 -252 -221 -216 -405 -441 -966 -1186 -560 -744 -761 -989 -974 -1192 -164 -156 -320 -248 -420 -248 -64 0 -178 84 -257 190 -44 59 -121 195 -251 438 -187 353 -273 484 -378 580 -109 100 -216 126 -321 78 -115 -53 -287 -263 -426 -522 -243 -450 -474 -1083 -579 -1587 -68 -323 -42 -613 73 -817 48 -84 170 -201 254 -243 142 -71 38 -67 1591 -67 l1399 0 28 -93 c41 -136 108 -302 176 -436 33 -65 60 -121 60 -124 0 -12 -3778 -8 -3850 3 -214 34 -382 208 -410 425 -7 55 -10 1170 -8 3540 3 3331 4 3462 21 3515 56 165 187 291 350 335 77 21 7676 22 7752 1z m-1435 -4556 c697 -60 1288 -459 1600 -1081 281 -558 273 -1238 -21 -1788 -308 -576 -868 -957 -1519 -1032 -130 -15 -423 -7 -540 15 -485 90 -893 330 -1200 706 -180 220 -332 538 -388 815 -32 151 -42 255 -42 412 0 355 90 691 265 989 253 430 667 754 1135 889 251 72 471 96 710 75z" />' +
                            '<path d="M2755 7800 c-205 -32 -397 -130 -546 -279 -126 -127 -214 -278 -260 -451 -19 -71 -23 -110 -23 -240 -1 -182 17 -266 89 -417 53 -113 89 -166 172 -254 126 -133 293 -232 473 -280 122 -33 346 -33 474 -1 179 45 331 134 466 272 141 143 233 325 265 521 19 120 19 202 -1 320 -68 397 -366 710 -757 795 -88 19 -270 26 -352 14z" />' +
                            '<pathd="M6860 3450 l0 -510 -510 0 -510 0 0 -325 0 -325 510 0 510 0 0 -510 0 -510 325 0 325 0 0 510 0 510 510 0 510 0 0 325 0 325 -507 2 -508 3 -3 508 -2 507 -325 0 -325 0 0 -510z" />' +
                        '</g>' +
                    '</svg>',
                processFiles: () => this.addEventListener('drop', (event) => {
                    const { items } = event.dataTransfer;
                    this.#process(items);
                })
            }

            this.#config = isMobile ? chooseFiles : dropFiles
            this.#config.style =
                ':host {' +
                    'display: flex;' +
                    'flex-wrap: wrap;' +
                    'justify-content: center;' +
                    'align-items: center;' +
                    '' +
                    'border-radius: 10px;' +
                    'border-style: dashed;' +
                    '' +
                    'position: absolute;' +
                    'left: 50%;' +
                    '-ms-transform: translate(-50%);' +
                    'transform: translate(-50%);' +
                '}' +
                '.item {' +
                    'margin: 10px;' +
                '}' +
                'div svg {' +
                    'min-height: 50px;' +
                '}' +
                'div > * {' +
                    'position: relative;' +
                    'z-index: -1;' +
                '}'
        }

        #stopDefaultsForDragAndDropEvents = () => {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                this.addEventListener(eventName, this.#preventDefaults);
            });
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
