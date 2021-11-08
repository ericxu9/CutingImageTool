// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
var JSZip = require("jszip");
var FileSaver = require('file-saver');

const { dialog } = require('electron')
let cutingImages = [];
require('electron').ipcRenderer.on('FILE_OPEN', (event, message) => {
    let image = new Image();
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = message;
    image.onload = function () {
        //reset content.
        document.getElementById('rootContainer').innerHTML = '';
        cutImageUp(image, document.getElementById("rowInput").value, document.getElementById("columnInput").value);
    }
})

function cutImageUp(image, rows, columns) {
    cutingImages = [];
    let rootContainer = document.getElementById('rootContainer');
    let widthOfOnePiece = image.width / columns;
    let heightOfOnePiece = image.height / rows;
    console.log(widthOfOnePiece);
    for (let x = 0; x < rows; ++x) {
        let rowDiv = document.createElement("div");
        rootContainer.appendChild(rowDiv);
        for (let y = 0; y < columns; ++y) {
            let canvas = document.createElement('canvas');
            canvas.width = widthOfOnePiece;
            canvas.height = heightOfOnePiece;
            let context = canvas.getContext('2d');
            context.drawImage(image, y * widthOfOnePiece, x * heightOfOnePiece, widthOfOnePiece, heightOfOnePiece, 0, 0, canvas.width, canvas.height);

            let img = document.createElement('img');
            img.setAttribute('crossOrigin', 'anonymous');
            img.setAttribute("style", "margin: 10px; border: 1px solid #62b900;");
            img.src = canvas.toDataURL();
            rowDiv.appendChild(img);
            cutingImages.push(canvas.toDataURL());
        }
    }
}

function saveBase64AsFile(cutingImages) {
    console.log('size: ' + cutingImages.length);
    var zip = new JSZip();
    for (let index = 0; index < cutingImages.length; index++) {
        const element = cutingImages[index];
        console.log(element)
        var img = zip.folder("images");
        img.file("img" + (index + 1) + ".png", element.replace(/^data:image\/(png|jpg);base64,/, ""), { base64: true });
    }

    zip.generateAsync({ type: "blob" }).then(function (content) {
        // see FileSaver.js
        saveAs(content, "切图.zip");
    });
}

// download button

document.getElementById('download').onclick = function () {
    if (cutingImages.length == 0) {
        return;
    }
    saveBase64AsFile(cutingImages)
}