let fs = require('fs');
/*
{
    "from": "testmap.txt",
    "name": "The test map",
    "maptype": "GEMGRAB"
}
*/
const MAP_ID_TRANSFORM = {
    SHOWDOWN: 'Survival',
    GEMGRAB: 'Gemgrab',
    BOUNTY: 'Wanted',
    HOTZONE: 'KingOfHill',
    LONESTAR: 'SoloBounty',
    TAKEDOWN: 'BossRace',
    SIEGE: 'Siege',
    BRAWLBALL: 'Ball',
    HEIST: 'Heist',
}
const MAP_ID_LOOKUP = {
    SHOWDOWN: 'SurvivalTeam',
    GEMGRAB: 'Gemgrab',
    BOUNTY: 'Wanted',
    HOTZONE: 'KingOfHill',
    LONESTAR: 'SoloBounty',
    TAKEDOWN: 'BossRace',
    SIEGE: 'Siege',
    BRAWLBALL: 'Ball',
    HEIST: 'Heist',
}
const MAP_ID_TO_GAMEMODE = {
    GEMGRAB: 'GOLDRUSH',
    SHOWDOWN: 'BATTLE_ROYALE',
    BOUNTY: 'WANTED',
    HOTZONE: 'KING_OF_HILL',
    LONESTAR: 'LONESTAR',
    TAKEDOWN: 'BOSS_RACE',
    SIEGE: 'ROBO_WARS',
    BRAWLBALL: 'BALL',
    HEIST: 'BANKHEIST',
}
module.exports.map = function (config, patched = []) {
    let mapFile = config.from.split('\n');
    let maps = fs.readFileSync('tmp/maps.csv').toString().trim().split('\n').slice(2).map(e => e.split(','));
    let locs = fs.readFileSync('tmp/locations.csv').toString().trim().split('\n').slice(2).map(e => e.split(','));
    let translations = fs.readFileSync('tmp/texts.csv').toString().trim().split('\n').slice(2).map(e => e.split(','));
    let typeId = MAP_ID_TRANSFORM[config.maptype];
    let typeIdLookup = MAP_ID_LOOKUP[config.maptype];
    let selId = (locs.filter(e => e[0].startsWith(typeIdLookup)).map(e => console.log(e[0]) || +e[0].slice(typeIdLookup.length)).filter(e => {
        console.log(typeIdLookup + '+' + e.toString(), e);
        return !patched.includes(typeIdLookup + '+' + e.toString())
    }).reduce((p, c) => Math.max(p, c), 0));
    let mapId = typeId + '_' + selId.toString();
    let tid = 'TID_' + MAP_ID_TO_GAMEMODE[config.maptype] + '_' + selId.toString();
    let idx = maps.findIndex(e => {
        try {
            return JSON.parse(e[1]) == mapId;
        } catch (_e) {
            return e[1] == mapId;
        }
    })
    console.log(selId, tid, idx);
    for (let row of mapFile) {
        if (maps[idx][1].trim()) break;
        maps[idx++][2] = row;
    }
    let translationRow = (','.repeat(21)).split(',');
    translationRow = translationRow.map(_e => config.name);
    translationRow[0] = tid;
    let tidx = translations.findIndex(e => {
        try {
            return JSON.parse(e[0]) == tid;
        } catch (_e) {
            return e[0] == tid;
        }
    });
    if (tidx == -1) {
        translations.push(translationRow);
    } else {
        translations[tidx] = translationRow;
    }
    fs.writeFileSync('tmp/mod/maps.csv', `"CodeName","Group","Data","ConstructFromBlocks"
"String","String","String","boolean"\n` + maps.map(e => e.join(',')).join('\n') + '\n');
    fs.writeFileSync('tmp/mod/texts.csv', `TID,EN,AR,CN,CNT,DE,ES,FI,FR,HE,ID,IT,JP,KR,MS,NL,PL,PT,RU,TH,TR,VI
string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string\n` + translations.map(e => e.join(',')).join('\n') + '\n');
fs.writeFileSync('tmp/texts.csv', fs.readFileSync('tmp/mod/texts.csv'));
fs.writeFileSync('tmp/maps.csv', fs.readFileSync('tmp/mod/maps.csv'));
    return typeIdLookup + '+' + selId.toString();
}