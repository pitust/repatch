console.log('RePatch v1.0.0 (c) 2020 Piotr Stelmaszek');
let mod = require('../mod-insertor');
let proc = require('child_process');
let ftpapi = require('../mod-insertor/ftpapi');
M.AutoInit()
let down = false;
let pmodal = function pmodal(text, cancel, total = 100) {
    let canceled = false;
    document.getElementById('pmodal-cancel').onclick = function (ev) {
        ev.preventDefault();
        cancel();
        canceled = true;
        $('#pmodal').slideUp(450);
    }
    document.getElementById('pmodal-progress').style.width = `0%`;
    document.getElementById('pmodal-content').innerText = text;
    $('#pmodal').slideDown(450);
    return function pmodalSetProgress(progress) {
        if (canceled) return;
        if (progress == total) {
            cancel();
            canceled = true;
            setTimeout(function () {
                $('#pmodal').slideUp(450);
            }, 300);
        }
        document.getElementById('pmodal-progress').style.width = `${progress / total * 100}%`;
    }
}
$('#pmodal').fadeOut(0);
console.log(mod)
mod.test().then(e => {
    if (e) {
        M.toast({ html: e, classes: 'red' });
    }
});
let pulledData;
let stagedMods = [];
let forceLevel = false;
/**
 * 
 * @param {'download'|'stage'|'upload'|'load:pc'|'load:phone'|'all-mobile'} action 
 */
function action(action) {
    if (action == 'download') {
        let pm;
        mod.download((max) => {
            pm = pmodal('Downloading', () => {
                down = true;
            }, max);
        }, (p) => pm(p));
    }
    if (action == 'upload') {
        if (!down) {
            M.toast({ html: 'You first need to download reBrawl files!', classes: 'red' });
            return;
        }
        let pm;
        (async function () {
            await mod.mod(stagedMods);
            await mod.upload((max) => {
                pm = pmodal('Uploading', () => { }, max);
            }, (p) => pm(p));
            installed.push(...q);
            q = [];
            refreshCollections();
        })();
    }
    if (action == 'load:phone') {
        if (!down) {
            M.toast({ html: 'You first need to download reBrawl files!', classes: 'red' });
            return;
        }
        ftpapi.ls('/sdcard').then(async e => {
            let maps = [];
            for (let f of e) {
                if (!f.endsWith('.txt')) continue;
                if (!f.includes('BrawlMaker')) continue;
                maps.push(f);
            }
            fileReq(maps).then(async map => {
                pulledData = (await ftpapi.download('/sdcard/' + map)).toString();
                ulock();
            })
        });
    }
    if (action == 'load:pc') {
        if (!down) {
            M.toast({ html: 'You first need to download reBrawl files!', classes: 'red' });
            return;
        }
        let inp = document.createElement('input');
        inp.type = 'file';
        inp.onchange = function () {
            let fileso = [...inp.files];
            if (!fileso[0]) return;
            let [file] = fileso;
            file.text().then(e => {
                pulledData = e;
                ulock();
            });
        }
        inp.click();
    }
    if (action == 'stage') {
        if (!down) {
            M.toast({ html: 'You first need to download reBrawl files!', classes: 'red' });
            return;
        }
        let name = document.querySelector('#mapname').value;
        q.push(name);
        stagedMods.push({
            from: pulledData,
            name,
            maptype: document.querySelector('#modeselect').value
        });
        refreshCollections();
    }
    if (action == 'all-mobile') {
        ftpapi.ls('/sdcard').then(async e => {
            let maps = [];
            for (let f of e) {
                if (!f.endsWith('.txt') && !forceLevel) continue;
                maps.push(f);
            }
            fileReq(maps, forceLevel ? '' : 'NOTE: only .txt files are treated as maps').then(async map => {
                pulledData = (await ftpapi.download('/sdcard/' + map)).toString();
                ulock();
                forceLevel = false;
            })
            forceLevel = true;
        });
    }
}
let q = [], installed = [];
function refreshCollections() {
    document.querySelector('#installed-coll').innerHTML = installed.map(e => `<li class="collection-item">${e}</li>`);
    document.querySelector('#q-coll').innerHTML = q.map(e => `<li class="collection-item">${e}</li>`);
}
refreshCollections();
function ulock() {
    $('#addq').removeClass('disabled');
}
let cb;
function fileReq(files, notice = 'NOTE: only .txt files with "BrawlMaker" are treated as maps') {
    $('.notice').text(notice);
    let html = files.map(e => `<option value="${e}">${e}</option>`);
    $('#fileselect').html(html);
    let m = M.Modal.getInstance(document.querySelector('#fileselmodal'));
    M.FormSelect.getInstance($('#fileselect')[0]).destroy();
    $('#fileselect').formSelect();
    m.open();
    return new Promise((res, rej) => {
        cb = { res, rej };
    })
}
function mobileFileAddCommit() {
    cb && cb.res(document.querySelector('#fileselect').value);
    cb = null;
}
function rejectMobileFileCommit() {
    cb && cb.rej();
    cb = null;
}
let adbION = false;
function adbcheck() {
    proc.exec('adb devices', (err, stdout) => {
        if (stdout.trim().split('\n').slice(1).length && !adbION) {
            M.toast({ html: 'ADB Integration is ON' });
            adbION = true;
            let [ip] = proc.execSync('adb shell netstat -u').toString().trim().split('\n').slice(2).map(e => e.split(' ').filter(e => e)[3].split(':',1)[0]).reverse();
            ftpapi.setIP(ip);
        } else if (adbION) {
            M.toast({ html: 'ADB Integration is OFF' });
            adbION = false;
            ftpapi.askIP();
        }
    })
}
adbcheck();