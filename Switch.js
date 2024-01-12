/** Switch.js 
 * 
 * Cluster Creator Kit ドキュメント
 * https://docs.cluster.mu/creatorkit/
 * 
 * Cluster Creator Kit Script Reference 
 * https://docs.cluster.mu/script/
 * 
 */


$.onInteract(player => {
    $.log("onInteract");
    // 近くのアイテムを取得
    const pos = $.getPosition().clone();
    pos.z += 10;
    pos.y += -3;
    //$.log("pos:" + pos);
    $.getItemsNear(pos, 2).forEach(item => {
        $.log(item);
        // Map に　メッセージを送る
        item.send("MAP_BLOCK_CREATE", player);
    });
});
