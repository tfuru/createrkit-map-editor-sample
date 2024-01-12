/** MAP を セーブしたりロードしたりする 処理 
 * 
 * Cluster Creator Kit ドキュメント
 * https://docs.cluster.mu/creatorkit/
 * 
 * Cluster Creator Kit Script Reference 
 * https://docs.cluster.mu/script/
 * 
 */

const META_NAME = "Map";
const SIZE = 20;
const TYPE_COUNT = 5;

// Script has allocated too much memory 対策
// メモリを確保して破棄する
reserveMemory = (size) => {
    var arr = new Array(size * size);
    arr = null;
}

initialize = () => {
    $.log("initialize start");

    // Script has allocated too much memory 対策
    // メモリ確保できなかった場合 initialize が終わらずリトライされる
    reserveMemory(SIZE);
    
    $.state.mapdata = null;
    $.setStateCompat("this", "MAP_INITIALIZE", false);

    $.state.initialized = true;

    // 初期化成功したので　Switchなどを表示する
    $.setStateCompat("this", "INITIALIZED", true);

    $.log("initialize end");
}

$.onReceive((messageType, arg, sender) => {
    if (messageType != "MAP_BLOCK_CREATE") return;
    $.log(`onReceive ${messageType} ${arg} ${sender}`);

    $.state.targetPlayerId = arg.userId;
    $.setStateCompat("this", "MAP_INITIALIZE", true);
});

$.onExternalCallEnd((response, meta, errorReason) => {
    $.log("onExternalCallEnd");
    if (meta != META_NAME) return;
    $.state.mapdata = response;
});

$.onUpdate(deltaTime => {
    // 初期化
    if ($.state.initialized == null) {
        initialize();
        return;
    }

    // MAP_INITIALIZED boolean が true になたら、マップを作成する
    const MAP_INITIALIZE = $.getStateCompat("this", "MAP_INITIALIZE", "boolean");
    if (MAP_INITIALIZE == true) {
        $.setStateCompat("this", "MAP_INITIALIZE", false);

        // TODO ユーザーが入力したキーを使う or スイッチをインタラクトしたユーザーのIDを使う
        const key = "key"; // $.state.targetPlayerId;
        // APIを呼び出して初期化
        const request = {"CMD": "INITIALIZE", "TYPE": META_NAME, "KEY": key}
        $.callExternal(JSON.stringify(request), META_NAME);
    }

    // MAPデータが読み込まれたら、マップを表示する
    onMapLoad();
});

onMapLoad = () => {
    if ($.state.mapdata == null) return;
    const data = JSON.parse($.state.mapdata);
    if (data == null) return;

    // マップのブロック種類数
    data.MAP.forEach((row, x) => {
        row.forEach((block, y) => {
            for (var i = 0; i < data.TYPE_COUNT; i++) {
                $.subNode(`MAP_BLOCK_${x}_${y}_${i}`).setEnabled(i == block);
            }
        });
    });
    $.sendSignalCompat("this", "MAP_BLOCK_CREATE");
    $.state.mapdata = null;
}

