
"use strict";

importScripts('functions.js');


var AlgState = function(binWidth, binHeight, items) {

    items = orderItems(items);

    var EP = {}, EPdata = {}, SPACE = {};

    EP[[0, 0]] = [0, 0];
    EPdata[[0, 0]] = {
        composite: true,
        xCoord: [binWidth],
        yCoord: [binHeight]
        //coord: null,
        //axis : null
    };
    SPACE[[0, 0]] = {};
    SPACE[[0,0]][[binWidth, binHeight]] = [binWidth, binHeight];

    var packed = [];

    for (var i in items) {
        var item = items[i];

        var bestEP = null;

        for (var j in EP) {
            var ep = EP[j];

            /*let*/var canBePut = false;
            for (/*let*/var space in SPACE[j]) {
                if (item.width <= SPACE[j][space][0] && item.height <= SPACE[j][space][1]) {
                    canBePut = true;
                    break;
                }
            }
            if (!canBePut) {
                // can't place item on EP
                continue;
            }

            var epX = [ep[0] + item.width, 0];
            var epY = [0, ep[1]+ item.height];

            for (var k in packed) {
                var _item = packed[k];

                var _itemTop = _item.y + _item.height;
                var _itemRight = _item.x + _item.width;

                if (_itemTop <= ep[1] && _itemTop > epX[1] && _item.x <= epX[0] && epX[0] <= _itemRight) {
                    if (_item.x < epX[0] && epX[0] < _itemRight) {
                        // we hit the item side, no worry
                        epX[1] = _itemTop;
                    } else {
                        // we hit an edge
                        if (epX[0] != _itemRight) {
                            // item is "above"
                            epX[1] = _itemTop;
                        }
                    }
                }

                if (_itemRight <= ep[0] && _itemRight > epY[0] && _item.y <= epY[1] && epY[1] <= _itemTop) {
                    if (_item.y < epY[1] && epY[1] < _itemTop) {
                        // we hit the item side, no worry
                        epY[0] = _itemRight;
                    } else {
                        // we hit an edge
                        if (epY[1] != _itemTop) {
                            // item is "right"
                            epY[0] = _itemRight;
                        }
                    }
                }
            }

            var itemRight = ep[0] + item.width;
            var itemTop = ep[1] + item.height;
            var itemSpaces = [item.width, item.height];

            var newEPs = jQ.extend(true, {}, EP);
            var newEPdata = jQ.extend(true, {}, EPdata);
            var newSPACE = jQ.extend(true, {}, SPACE);

            if (!newEPs[epY]) {
                newEPs[epY] = epY;
                newEPdata[epY] = {
                    composite: false,
                    axis: 0,
                    coord: [ep[0]]
                }
            } else {
                if (newEPdata[epY].composite == true || newEPdata[epY].axis == 0) {
                    (newEPdata[epY].composite ? newEPdata[epY].yCoord : newEPdata[epY].coord).push(ep[0]);
                } else {
                    newEPdata[epY] = {
                        composite: true,
                        yCoord: newEPdata[epY].coord,
                        xCoord: [ep[0]]
                    };
                }
            }
            if (!newEPs[epX]) {
                newEPs[epX] = epX;
                newEPdata[epX] = {
                    composite: false,
                    axis: 1,
                    coord: [ep[1]]
                }
            } else {
                if (newEPdata[epX].composite == true || newEPdata[epX].axis == 1) {
                    (newEPdata[epX].composite ? newEPdata[epX].xCoord : newEPdata[epX].coord).push(ep[1]);
                } else {
                    newEPdata[epX] = {
                        composite: true,
                        xCoord: newEPdata[epX].coord,
                        yCoord: [ep[1]]
                    };
                }
            }

            if (!newSPACE[epY]) {
                newSPACE[epY] = {};
            }
            if (!newSPACE[epX]) {
                newSPACE[epX] = {};
            }

            var maxXep = {}; // max X EP depending on Y
            var maxYep = {}; // max Y EP depending on X

            for (var l in EP) {
                // skip the EP where we place an item
                //if (j == l) continue;

                /*let*/var _ep = EP[l];
                /*let*/var _data = EPdata[l];
                /*let*/var _spaces = SPACE[l];

                for (/*let*/var i in _spaces) {
                    /*let*/var space = _spaces[i];
                    if (intersect(_ep, space, epY)) {
                        /*let*/var newSpace = [space[0] - (epY[0] - _ep[0]), space[1] - (epY[1] - _ep[1])];
                        if (newSpace[0] != 0 && newSpace[1] != 0) {
                            /*let*/var ok = true;
                            for (/*let*/var space2 in newSPACE[epY]) {
                                if (newSpace[0] <= newSPACE[epY][space2][0] && newSpace[1] <= newSPACE[epY][space2][1]) {
                                    ok = false;
                                } else if (newSpace[0] >= newSPACE[epY][space2][0] && newSpace[1] >= newSPACE[epY][space2][1]) {
                                    delete newSPACE[epY][space2];
                                }
                            }
                            if (ok) {
                                newSPACE[epY][newSpace] = newSpace;
                            }
                        }
                    }
                    if (intersect(_ep, space, epX)) {
                        /*let*/var newSpace = [space[0] - (epX[0] - _ep[0]), space[1] - (epX[1] - _ep[1])];
                        if (newSpace[0] != 0 && newSpace[1] != 0) {
                            /*let*/var ok = true;
                            for (/*let*/var space2 in newSPACE[epX]) {
                                if (newSpace[0] <= newSPACE[epX][space2][0] && newSpace[1] <= newSPACE[epX][space2][1]) {
                                    ok = false;
                                } else if (newSpace[0] >= newSPACE[epX][space2][0] && newSpace[1] >= newSPACE[epX][space2][1]) {
                                    delete newSPACE[epX][space2];
                                }
                            }
                            if (ok) {
                                newSPACE[epX][newSpace] = newSpace;
                            }
                        }
                    }
                }

                if (_ep[0] == itemRight && _ep[1] == itemTop) {
                    // top-right corner
                    continue;

                } else if (ep[0] <= _ep[0] && _ep[0] < itemRight
                        && ep[1] <= _ep[1] && _ep[1] < itemTop) {
                    // inner max left-bottom rectangle
                    delete newEPs[_ep];
                    delete newEPdata[_ep];
                    delete newSPACE[_ep];

                    /*let*/var topEP = [_ep[0], itemTop];
                    if (ep[0] <= _ep[0] && _ep[0] < itemRight && !newSPACE[topEP]) {
                        if (_data.composite == true || _data.axis == 1) {
                            /*let*/var xCoords = _data.coord || _data.yCoord;
                            var topCoords = [];
                            for (/*let*/var coord in xCoords) {
                                if (xCoords[coord] >= itemTop) {
                                    topCoords.push(xCoords[coord]);
                                }
                            }
                            if (topCoords.length > 0) {
                                newEPs[topEP] = topEP;
                                newSPACE[topEP] = {};
                                for (/*let*/var space in _spaces) {
                                    var newSpace = [_spaces[space][0], _spaces[space][1] - item.height];
                                    if (newSpace[1] > 0) {
                                        newSPACE[topEP][newSpace] = newSpace;
                                    }
                                }
                                newEPdata[topEP] = {
                                    composite: false,
                                    axis: 1,
                                    coord: topCoords
                                };
                            }
                        }
                    }
                    /*let*/var rightEP = [itemRight, _ep[1]];
                    if (ep[1] <= _ep[1] && _ep[1] < itemTop && !newSPACE[rightEP]) {
                        if (_data.composite == true || _data.axis == 0) {
                            /*let*/var xCoords = _data.coord || _data.xCoord;
                            var rightCoords = [];
                            for (/*let*/var coord in xCoords) {
                                if (xCoords[coord] >= itemRight) {
                                    rightCoords.push(xCoords[coord]);
                                }
                            }
                            if (rightCoords.length > 0) {
                                newEPs[rightEP] = rightEP;
                                newSPACE[rightEP] = {};
                                for (/*let*/var space in _spaces) {
                                    var newSpace = [_spaces[space][0] - item.width, _spaces[space][1]];
                                    if (newSpace[0] > 0) {
                                        newSPACE[rightEP][newSpace] = newSpace;
                                    }
                                }
                                newEPdata[rightEP] = {
                                    composite: false,
                                    axis: 0,
                                    coord: rightCoords
                                };
                            }
                        }
                    }

                } else if (_ep[0] == itemRight && ep[1] <= _ep[1] && _ep[1] <= itemTop) {
                    // on right edge
                    newEPdata[_ep] = {
                        composite: false,
                        axis: 0,
                        coord: _data.coord ? _data.coord.slice() : _data.xCoord.slice()
                    };

                } else if (_ep[1] == itemTop && ep[0] <= _ep[0] && _ep[0] <= itemRight) {
                    // on top edge
                    newEPdata[_ep] = {
                        composite: false,
                        axis: 1,
                        coord: _data.coord ? _data.coord.slice() : _data.yCoord.slice()
                    };

                } else if (_ep[0] < ep[0] && ep[1] == itemTop && _ep[0] >= epY[0]) {
                    // left of item, top edge line
                    /*let*/var newData = newEPdata[_ep];
                    if (newData.composite) {
                        newEPdata.xCoord.push(ep[0]);
                    } else {
                        newEPdata.coord.push(ep[0]);
                    }

                } else if (_ep[1] < ep[1] && ep[0] == itemRight && _ep[1] >= epX[1]) {
                    // below item, right edge line
                    /*let*/var newData = newEPdata[_ep];
                    if (newData.composite) {
                        newEPdata.yCoord.push(ep[1]);
                    } else {
                        newEPdata.coord.push(ep[1]);
                    }

                } else if (_ep[0] < itemRight && _ep[1] < itemTop) {
                    for (/*let*/var space in _spaces) {
                        if (intersect(_ep, _spaces[space], ep, itemSpaces)) {
                            if (_spaces.length >= 2) {
                                // TODO DEBUG THIS....
                                break;
                            }
                            delete newSPACE[_ep][space];

                            if (_ep[0] < ep[0]) {
                                /*let*/var newSize = ep[0] - _ep[0];
                                if (newSize > 0) {
                                    /*let*/var newSpace = [newSize, _spaces[space][1]];
                                    newSPACE[_ep][newSpace] = newSpace;
                                }
                            }
                            if (_ep[1] < ep[1]) {
                                /*let*/var newSize = ep[1] - _ep[1];
                                if (newSize > 0) {
                                    /*let*/var newSpace = [_spaces[space][0], newSize];
                                    newSPACE[_ep][newSpace] = newSpace;
                                }
                            }
                        }
                    }

                    if (_ep[0] <= ep[0] && ep[1] <= _ep[1]) {
                        if (_data.composite || _data.axis == 0) {
                            // left of item, origin to the right
                            /*let*/var coordOriginList = _data.composite ? _data.xCoord : _data.coord;
                            /*let*/var newRightCoordList = [];
                            /*let*/var newLeftCoordList = [];
                            for (/*let*/var coord in coordOriginList) {
                                /*let*/var originX = coordOriginList[coord];
                                if (originX >= itemRight) {
                                    newRightCoordList.push(originX);
                                } else {
                                    newLeftCoordList.push(originX);
                                }
                            }
                            if (newLeftCoordList.length == 0) {
                                delete newEPdata[_ep];
                                delete newEPs[_ep];
                                delete newSPACE[_ep];
                            } else {
                                if (newEPdata[_ep].composite) {
                                    newEPdata[_ep].xCoord = newLeftCoordList;
                                } else {
                                    newEPdata[_ep].coord = newLeftCoordList;
                                }
                            }
                            if (newRightCoordList.length != 0) {
                                /*let*/var coord = [itemRight, _ep[1]];

                                newEPdata[coord] = jQ.extend({}, newEPdata[_ep], {
                                    composite: false,
                                    coord: newRightCoordList,
                                    axis: 0
                                });
                                if (!newEPs[coord]) {
                                    newEPs[coord] = coord;
                                }
                                if (!maxXep[_ep[1]] || maxXep[_ep[1]] < _ep[0]) {
                                    maxXep[_ep[1]] = _ep[0];
                                }
                            }
                        }

                    } else if (_ep[1] <= ep[1] && ep[0] <= _ep[0]) {
                        if (_data.composite || _data.axis == 1) {
                            // below item, origin above
                            /*let*/var coordOriginList = _data.composite ? _data.yCoord : _data.coord;
                            /*let*/var newAboveCoordList = [];
                            /*let*/var newBellowCoordList = [];
                            for (/*let*/var coord in coordOriginList) {
                                /*let*/var originY = coordOriginList[coord];
                                if (originY >= itemTop) {
                                    newAboveCoordList.push(originY);
                                } else {
                                    newBellowCoordList.push(originY);
                                }
                            }
                            if (newBellowCoordList.length == 0) {
                                delete newEPdata[_ep];
                                delete newEPs[_ep];
                                delete newSPACE[_ep];
                            } else {
                                if (newEPdata[_ep].composite) {
                                    newEPdata[_ep].yCoord = newBellowCoordList;
                                } else {
                                    newEPdata[_ep].coord = newBellowCoordList;
                                }
                            }
                            if (newAboveCoordList.length != 0) {
                                /*let*/var coord = [_ep[0], itemTop];

                                newEPdata[coord] = jQ.extend({}, newEPdata[_ep], {
                                    composite: false,
                                    coord: newAboveCoordList,
                                    axis: 1
                                });
                                if (!newEPs[coord]) {
                                    newEPs[coord] = coord;
                                }
                                if (!maxYep[_ep[0]] || maxYep[_ep[0]] < _ep[1]) {
                                    maxYep[_ep[0]] = _ep[1];
                                }
                            }
                        }
                    }
                    if (epY[0] < _ep[0] && _ep[0] <= ep[0] && _ep[1] < itemTop && (_data.composite || _data.axis == 1)) {
                        var compEP = [_ep[0], itemTop];
                        if (newEPs[compEP]) {
                            if (newEPdata[compEP].composite == false && newEPdata[compEP].axis == 0) {
                                newEPdata[compEP].coord.push(ep[0]);
                            } else if (newEPdata[compEP].composite == false) {
                                newEPdata[compEP] = {
                                    composite: true,
                                    yCoord: newEPdata[compEP].coord,
                                    xCoord: [ep[0]]
                                };
                            } else {
                                newEPdata[compEP].xCoord.push(ep[0]);
                            }
                        } else {
                            /*let*/var coordOriginList = _data.composite ? _data.yCoord : _data.coord;
                            /*let*/var newCoordList = [];
                            for (/*let*/var coord in coordOriginList) {
                                if (coordOriginList[coord] > itemTop) {
                                    newCoordList.push(coordOriginList[coord]);
                                }
                            }
                            if (newCoordList.length > 0) {
                                newEPs[compEP] = compEP;
                                newEPdata[compEP] = {
                                    composite: true,
                                    yCoord: newCoordList,
                                    xCoord: [ep[0]]
                                };
                                // TODO update SPACE
                            }
                        }
                    }
                    if (epX[1] < _ep[1] && _ep[1] <= ep[1] && _ep[0] < itemRight && (_data.composite || _data.axis == 0)) {
                        var compEP = [itemRight, _ep[1]];
                        if (newEPs[compEP]) {
                            if (newEPdata[compEP].composite == false && newEPdata[compEP].axis == 1) {
                                newEPdata[compEP].coord.push(ep[1]);
                            } else if (newEPdata[compEP].composite == false) {
                                newEPdata[compEP] = {
                                    composite: true,
                                    yCoord: [ep[1]],
                                    xCoord: newEPdata[compEP].coord
                                };
                            } else {
                                newEPdata[compEP].yCoord.push(ep[1]);
                            }
                        } else {
                            /*let*/var coordOriginList = _data.composite ? _data.xCoord : _data.coord;
                            /*let*/var newCoordList = [];
                            for (/*let*/var coord in coordOriginList) {
                                if (coordOriginList[coord] > itemRight) {
                                    newCoordList.push(coordOriginList[coord]);
                                }
                            }
                            if (newCoordList.length > 0) {
                                newEPs[compEP] = compEP;
                                newEPdata[compEP] = {
                                    composite: true,
                                    yCoord: [ep[1]],
                                    xCoord: newCoordList
                                };
                                // TODO update SPACE
                            }
                        }
                    }
                } else {

                }
            }

            if (epY[1] == binHeight || objectSize(newSPACE[epY]) == 0) {
                delete newEPs[epY];
                delete newEPdata[epY];
                delete newSPACE[epY];
            }
            if (epX[0] == binWidth || objectSize(newSPACE[epX]) == 0) {
                delete newEPs[epX];
                delete newEPdata[epX];
                delete newSPACE[epX];
            }

            for (/*let*/var y in maxXep) {
                /*let*/var x = maxXep[y];
                /*let*/var spaces = SPACE[[x, y]];
                for (/*let*/var space in spaces) {
                    if (intersect([x, y], spaces[space], ep, itemSpaces)) {
                        if (!newSPACE[[itemRight, y]]) {
                            newSPACE[[itemRight, y]] = {};
                        }
                        /*let*/var newSpace = [spaces[space][0] - (itemRight - x), spaces[space][1]];
                        newSPACE[[itemRight, y]][newSpace] = newSpace;
                    }
                }
            }
            for (/*let*/var x in maxYep) {
                /*let*/var y = maxYep[x];
                /*let*/var spaces = SPACE[[x, y]];
                for (/*let*/var space in spaces) {
                    if (intersect([x, y], spaces[space], ep, itemSpaces)) {
                        if (!newSPACE[[x, itemTop]]) {
                            newSPACE[[x, itemTop]] = {};
                        }
                        /*let*/var newSpace = [spaces[space][0], spaces[space][1] - (itemTop - y)];
                        newSPACE[[x, itemTop]][newSpace] = newSpace;
                    }
                }
            }

            //for (/*let*/var i in newSPACE) {
            //    if (newSPACE[i].length == 0) {
            //        delete newEP[i];
            //        delete newEPdata[i];
            //        delete newSPACE[i];
            //    }
            //}

            var _packed = packed.slice();
            _packed.push({
                x: ep[0],
                y: ep[1],
                width: item.width,
                height: item.height
            });
            renderItems(_packed);
            renderExtremePoints(newEPs, newSPACE);

            /*let*/var epCount = objectSize(newEPs);

            if (bestEP == null || bestEP.idx > epCount) {
                if (bestEP == null) {
                    bestEP = {};
                }
                bestEP.idx = epCount;
                bestEP.placingEP = ep;
                bestEP.EP = newEPs;
                bestEP.EPdata = newEPdata;
                bestEP.SPACE = newSPACE;
            }
        }

        if (bestEP == null) {
            console.log("Could not place item #" + (toInt(i) + 1));
            continue;
        }

        packed.push({
            x: bestEP.placingEP[0],
            y: bestEP.placingEP[1],
            width: item.width,
            height: item.height
        });
        EP = bestEP.EP;
        EPdata = bestEP.EPdata;
        SPACE = bestEP.SPACE;

        renderItems(packed);
        renderExtremePoints(EP, SPACE);

        log(EP);

    }

    function intersect(xy1, wh1, xy2, wh2) {
        var a_x1 = xy1[0];
        var a_y1 = xy1[1];
        var a_x2 = a_x1 + wh1[0];
        var a_y2 = a_y1 + wh1[1];

        var b_x1 = xy2[0];
        var b_y1 = xy2[1];

        if (arguments.length == 3) {
            return a_x1 <= b_x1 && b_x1 <= a_x2
                && a_y1 <= b_y1 && b_y1 <= a_y2;
        }

        var b_x2 = b_x1 + wh2[0];
        var b_y2 = b_y1 + wh2[1];

        return a_x1 < b_x2 && a_x2 > b_x1 &&
            a_y1 < b_y2 && a_y2 > b_y1;
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
            var renderItem = createRenderItem(items[i]);
            renderItems.push(renderItem);
        }
        message.renderItems(renderItems, true);
    }

    function renderExtremePoints(eps, spaces) {
        var renderEPs = [];
        var renderSpaces = [];
        for (i in eps) {
            for (j in spaces[i]) {
                renderSpaces.push({
                    x: eps[i][0],
                    y: eps[i][1],
                    w: spaces[i][j][0],
                    h: spaces[i][j][1]
                });
            }
            renderEPs.push({
                x: eps[i][0],
                y: eps[i][1]
            });
        }
        message.renderPoints(renderEPs, renderSpaces);
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

message.renderPoints = function (points, spaces) {
    postMessage({
        cmd: 'renderPoints',
        args: [points, spaces]
    });
};

message.onDone = function() {
    postMessage({
        cmd: 'onDone',
        args: []
    });
};