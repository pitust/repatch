// A high-level wrapper over the FTP library.
let Client = require('ftp');
let path = require('path');
let fs = require('fs');

let c = new Client();
async function p(cb) {
    return new Promise((res, rej) => {
        cb(res, rej);
    });
}
let isReady = false;
let onReady = [];
async function ensureReady() {
    if (isReady) return;
    return p((res) => {
        onReady.push(res);
    });
}
/**
 * 
 * @param {string} dir 
 * @returns {Promise<string[]>}
 */
async function ls(dir) {
    await ensureReady();
    return p((res, rej) => {
        c.cwd(dir, function (err) {
            if (err) return rej(err.message);
            c.list((err, list) => {
                if (err) return rej(err.message);
                res(list.map(e => e.name));
            });
        })
    })
}
/**
 * 
 * @param {string} file
 * @param {string|Buffer|Uint8Array} data 
 * @returns {Promise<void>}
 */
async function upload(file, data) {
    fs.writeFileSync('upload.bin', data);
    await ensureReady();
    return p((res, rej) => {
        c.cwd(path.dirname(file), function (err) {
            if (err) return rej(err.message);
            c.put('upload.bin', path.basename(file), false, function (err) {
                if (err) rej(err.message);
                res();
                fs.unlinkSync('upload.bin');
            })
        })
    })
}
/**
 * 
 * @param {string} file
 * @returns {Promise<Buffer>}
 */
async function download(file) {
    console.log('ER');
    await ensureReady();
    console.log('RDY');
    return p((res, rej) => {
        c.cwd(path.dirname(file), function (err) {
            console.log('CWD');
            if (err) return rej(err.message);
            c.get(path.basename(file), function (err, stream) {
                if (err) return rej(err.message);
                console.log('ONIT');
                stream.once('close', function () {
                    console.log('DONE');
                    res(fs.readFileSync('download.bin'));
                    fs.unlinkSync('download.bin');
                });
                stream.pipe(fs.createWriteStream('download.bin'));
            });
        })
    })
}
c.once('ready', function () {
    isReady = true;
    onReady.forEach(e => e());
});
c.on('error', function (e) {
    M.toast({ html: e.message, classes: 'red' });
})
let ip = prompt('Please enter the IP address from WiFi FTP Server', '192.168.');
c.connect({
    host: ip,
    port: 2221
});
module.exports = {
    ls,
    download,
    upload
}