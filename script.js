function downloadBinFile(dataAsHexStr, fileName) {
    var bin = new Array();
    for (var i = 0; i < dataAsHexStr.length / 2; i++) {
        var h = dataAsHexStr.substr(i * 2, 2);
        bin[i] = parseInt(h, 16);
    }
    console.log(dataAsHexStr)

    var byteArray = new Uint8Array(bin);
    var a = window.document.createElement('a');

    a.href = window.URL.createObjectURL(new Blob([byteArray], { type: 'application/octet-stream' }));
    a.download = fileName;

    // Append anchor to body.
    document.body.appendChild(a)
    a.click();

    // Remove anchor from body
    document.body.removeChild(a)
}

function downloadTextFile(text, filename) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}


function generateNfcFromBinary(data, uidLength = 4) {
    console.log(data)
    const dataLen = data.length;
    const uid = data.slice(0, uidLength);
    if (dataLen != 1024 && dataLen != 4096) {
        alert("Invalid data length");
        return;
    }
    const classicType = (dataLen == 1024) ? "1K" : "4K";
    const header =
        `#Generated at https://micsen.github.io/flipperNfcToBin/
Filetype: Flipper NFC device
Version: 3
# Nfc device type can be UID, Mifare Ultralight, Mifare Classic
Device type: Mifare Classic
# UID, ATQA and SAK are common for all formats
UID: ${printHex(uid)}
ATQA: ${(uidLength == 4) ? "00 04" : "00 44"}
SAK: 08
# Mifare Classic specific data
Mifare Classic type: ${classicType}
Data format version: 2
# Mifare Classic blocks, '??' means unknown data
`
    let dataStr = "";
    for (let i = 0; i < data.length; i += 16) {
        const block = i / 16
        let bytes = printHex(data.slice(i, i + 16))
        dataStr += "Block " + block + ": " + bytes + "\n"
    }
    return header + dataStr;
}


function getBinaryFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            resolve(data);
        };
        reader.onerror = (e) => {
            reject(e);
        };
        reader.readAsArrayBuffer(file);
    });
}


function getTextFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target.result
            resolve(data);
        };
        reader.onerror = (e) => {
            reject(e);
        };
        reader.readAsText(file);
    });
}

function printHex(data, lsbFirst = false) {
    var hex = "";
    for (var i = 0; i < data.length; i++) {
        j = (lsbFirst) ? data.length - i - 1 : i;
        hex += data[j].toString(16).padStart(2, '0') + " ";
    }
    return hex.trim();
}

function isBigSector(sector) {
    return sector < 32;
}

function getBlocks(sector) {
    if (sector < 32) {
        const s = sector * 4
        return {start: s, end: s + 3};
    } else {
        const s = 128 + (sector - 16) * 16
        return {start: s, end: s + 15};
    }
}