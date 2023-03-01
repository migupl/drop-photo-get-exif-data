# A vanilla javascript Web Component for obtain EXIF data

A simple solution for obtaining EXIF data from photos.

## Install

Copy the directory */components/drop-photo-for-exif-component/* to any directory in your project.

## Getting started

To get started you need to import the Web Component

```html
<head>
    <script type="module" src="./components/drop-photo-for-exif-component/drop-photo-for-exif.js"></script>
</head>
<body>
    <drop-photo-for-exif></drop-photo-for-exif>
</body>
```

## Events

The Web Component *drop-photo-for-exif* exposes the following information

```json
{
    name: 'the filename for the image',
    image: File object,
    location: {
        latitude: "43.66366 N"
        longitude: "7.357704 W"
    },
    exif: { // EXIF details }
}
```

about the images dragged through the event 'drop-photo-for-exif:data'.

See the _index.html_ file for a simple example.

## Helpers

A [container is used for hot reloading](https://github.com/migupl/hot-reloading-container) during development.

[File drag and drop](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop).

[A complete guide on shadow DOM and event propagation](https://pm.dartus.fr/blog/a-complete-guide-on-shadow-dom-and-event-propagation/)

[ExifReader](https://github.com/mattiasw/ExifReader) is a JavaScript library that parses image files and extracts the metadata.

[Highlight.js](https://highlightjs.org/). Syntax highlighting for the Web.

Good luck and I hope you enjoy it.

## License

[MIT license](http://www.opensource.org/licenses/mit-license.php)