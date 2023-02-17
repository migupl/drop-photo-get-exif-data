function dropHandler(ev) {
    console.log('File(s) dropped');

    ev.preventDefault();

    const { items, files } = ev.dataTransfer;
    if (items) {
        [...items].forEach((item, i) => {
            if (item.kind === 'file') {
                const file = item.getAsFile();
                console.log(`… item[${i}].name = ${file.name}`);
            }
        });
    } else {
        [...files].forEach((file, i) => {
            console.log(`… file[${i}].name = ${file.name}`);
        });
    }
}

function dragOverHandler(ev) {
    ev.preventDefault();
}
