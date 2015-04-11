
importScripts('functions.js');


var AlgState = function(binWidth, binHeight, items) {

    items = orderItems(items);

    var EP = {}, SPACE = {};

    EP[[0, 0]] = [0, 0];
    SPACE[[0, 0]] = [binWidth, binHeight];
    var EPlength = 1;

    var packed = [];

    for (var i in items) {
        var item = items[i];

        var bestEP = null;

        for (var j in EP) {
            var ep = EP[j];
            var space = SPACE[j];

            if (space[0] < item.width || space[1] < item.height) {
                // cannot be put to this EP
                continue;
            }

            var maxX = ep[0];
            var maxY = ep[1];

            var epX = [ep[0] + item.width, 0];
            var epY = [0, ep[1]+ item.height];

            for (var k in packed) {
                var _item = packed[k];

                var itemTop = _item.y + _item.height;
                var itemRight = _item.x + _item.width;

                //epX[1] = getEpCoord(maxY, itemTop, itemRight, epX[0], epX[1], _item.x);
                //epY[0] = getEpCoord(maxX, itemRight, itemTop, epY[1], epY[0], _item.y);

                if (itemTop <= maxY && itemTop > epX[1] && _item.x <= epX[0] && epX[0] <= itemRight) {
                    if (_item.x < epX[0] && epX[0] < itemRight) {
                        // we hit the item side, no worry
                        epX[1] = itemTop;
                    } else {
                        // we hit an edge
                        if (epX[0] != itemRight) {
                            // item is "above"
                            epX[1] = itemTop;
                        }
                    }
                }

                if (itemRight <= maxX && itemRight > epY[0] && _item.y <= epY[1] && epY[1] <= itemTop) {
                    if (_item.y < epY[1] && epY[1] < itemTop) {
                        // we hit the item side, no worry
                        epY[0] = itemRight;
                    } else {
                        // we hit an edge
                        if (epY[1] != itemTop) {
                            // item is "above"
                            epY[0] = itemRight;
                        }
                    }
                }
            }

            var newPoints = -1 + (EP[epX] ? 0 : 1) + (EP[epY] ? 0 : 1);
            var totalCount = EPlength + newPoints;

            if (bestEP == null || bestEP.idx > totalCount) {
                if (bestEP == null) {
                    bestEP = {};
                }
                bestEP.idx = totalCount;
                bestEP.placingEP = ep;
                bestEP.epX = epX;
                bestEP.epY = epY;
                bestEP.epLength = totalCount;
            }
        }

        if (bestEP == null) {
            console.log("Could not place item #" + (toInt(i) + 1));
            continue;
        }

        updateEPs(item, bestEP.placingEP, bestEP.epX, bestEP.epY);

        packed.push({
            x: bestEP.placingEP[0],
            y: bestEP.placingEP[1],
            width: item.width,
            height: item.height
        });

        renderItems(packed);
        renderExtremePoints(EP);

        log(EP);

    }

    //function getEpCoord(maxEPCoord, mainItemEdge, itemEdge2, epCoord1, epUpdatedCoord, itemCoord) {
    //    if (mainItemEdge <= maxEPCoord && mainItemEdge > epUpdatedCoord && itemCoord <= epCoord1 && epCoord1 <= itemEdge2) {
    //        if (itemCoord < epCoord1 && epCoord1 < itemEdge2) {
    //            // we hit the item side, no worry
    //            return mainItemEdge;
    //        } else {
    //            // we hit an edge
    //            if (epCoord1 != itemEdge2) {
    //                // item is "above"
    //                return mainItemEdge;
    //            }
    //        }
    //    }
    //    return epUpdatedCoord;
    //}

    function updateEPs(item, placingEP, epX, epY) {
        var oldSpace = SPACE[placingEP];


        delete EP[placingEP];
        delete SPACE[placingEP];
        EPlength--;


        var spaceX = createSpace(item.width, 0, oldSpace, epX);
        if (spaceX[0] == 0 || spaceX[1] == 0) {
            delete EP[epX];
            delete SPACE[epX];
        } else {
            EPlength += (EP[epX] ? 0 : 1);
            EP[epX] = epX;
            SPACE[epX] = spaceX;
        }

        var spaceY = createSpace(0, item.height, oldSpace, epY);
        if (spaceY[0] == 0 || spaceY[1] == 0) {
            delete EP[epY];
            delete SPACE[epY];
        } else {
            EPlength += (EP[epY] ? 0 : 1);
            EP[epY] = epY;
            SPACE[epY] = spaceY;
        }

        for(var i in SPACE) {
            var ep = EP[i];
            var space = SPACE[i];

        }
    }

    function createSpace(w, h, oldSpace, newEP) {
        if (SPACE[newEP]) {
            return SPACE[newEP]
        } else {
            return [
                oldSpace[0] - w,
                oldSpace[1] - h
            ]
        }
    }

    function renderItems(items) {
        var renderItems = [];
        for (i in items) {
            var renderItem = createRenderItem(packed[i]);
            renderItems.push(renderItem);
        }
        message.renderItems(renderItems, true);
    }

    function renderExtremePoints(eps) {
        var renderEPs = [];
        for (i in eps) {
            renderEPs.push({
                x: eps[i][0],
                y: eps[i][1]
            });
        }
        message.renderPoints(renderEPs);
    }

    function createRenderEP(ep) {
        return
    }

    function createRenderItem(node) {
        return {
            x: node.x,
            y: node.y,
            w: node.width,
            h: node.height
        }
    }

};


var algState;

self.addEventListener('message', function (e) {
    var data = e.data;
    switch (data.cmd) {

        case 'start':
            algState = new AlgState(data.binWidth, data.binHeight, data.items);
            algState.run();

            message.onDone();

            self.close();
            break;

        case 'stop':
            self.postMessage({
                event: 'stopped'
            });
            self.close();
            break;

        default:
            self.postMessage('Unknown command: ' + data.msg);
    }
}, false);


var message = message || {};

message.renderItems = function (items, clear) {
    postMessage({
        cmd: 'renderItems',
        args: [items, clear]
    });
};

message.renderPoints = function (points) {
    postMessage({
        cmd: 'renderPoints',
        args: [points]
    });
};

message.onDone = function() {
    postMessage({
        cmd: 'onDone',
        args: []
    });
};