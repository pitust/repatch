let ftpapi = require('./ftpapi');
let fs = require('fs');
let patch = require('./patch')
const VA_DIR = '/data/data/io.va.exposed';
const REBRAWL_PACKAGE = 'com.reBrawl.classic.iii';
const PACKAGE = REBRAWL_PACKAGE;
let PACKAGE_ID = 'ReBrawl';
const PACKAGE_DIR = VA_DIR + '/virtual/data/user/0/' + PACKAGE;
const LOGIC_DIR = PACKAGE_DIR + '/update/csv_logic';
if (!fs.existsSync('tmp')) fs.mkdirSync('tmp');
if (!fs.existsSync('tmp/mod')) fs.mkdirSync('tmp/mod');
module.exports.test = async function test() {
    try {
        await ftpapi.ls(VA_DIR);
    } catch (e) {
        console.error('You need VirtualExposed for this.');
        return 'You need VirtualExposed for this.'
    }
    try {
        await ftpapi.ls(PACKAGE_DIR);
    } catch (e) {
        console.error(`You need ${PACKAGE_ID} loaded into VirtualExposed for this.`);
        return `You need ${PACKAGE_ID} loaded into VirtualExposed for this.`;
    }
    try {
        await ftpapi.ls(LOGIC_DIR);
    } catch (e) {
        console.error(`${PACKAGE_ID} content not downloaded.`);
        return `${PACKAGE_ID} content not downloaded.`;
    }
    return false;
}
module.exports.download = async function download(lenCb, progressCb) {
    let files = await ftpapi.ls(LOGIC_DIR);
    lenCb(files.length + 1);
    let p = 0;
    for (let f of fs.readdirSync('tmp/mod')) fs.unlinkSync('tmp/mod/' + f);
    for (let f of files) {
        console.log('Downloading %s', f);
        progressCb(p++);
        fs.writeFileSync('tmp/' + f, await ftpapi.download(LOGIC_DIR + '/' + f));
        progressCb(p);
    }
    console.log('Downloading texts.csv');
    fs.writeFileSync('tmp/texts.csv', await ftpapi.download(PACKAGE_DIR + '/update/localization/texts_patch.csv'));
    progressCb(++p);
}
module.exports.mod = async function mod(mods) {

    let changed = [];
    for (let mod of mods) {
        changed.push(patch.map(mod, changed));
    }
}
module.exports.upload = async function upload(lenCb, progressCb) {
    let changes = fs.readdirSync('tmp/mod');
    lenCb(changes.length);
    let p = 0;
    for (let change of changes) {
        console.log('Uploading %s', change);
        progressCb(p++);
        if (change == 'texts.csv') {
            await ftpapi.upload(PACKAGE_DIR + '/update/localization/texts_patch.csv', fs.readFileSync('tmp/mod/texts.csv'));
        } else {
            await ftpapi.upload(LOGIC_DIR + '/' + change, fs.readFileSync('tmp/mod/' + change));
        }
        progressCb(p);
    }
}