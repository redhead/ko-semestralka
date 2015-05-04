
"use strict";

importScripts('functions.js');


var AlgState = function(binWidth, binHeight, items, metricType, renderProgress) {

    print("");
    print("Started!");
    print("---");

    var startDate = new Date();

    items = orderItems(items);

    var EP = {}, EPdata = {}, SPACE = {};

    EP[[0, 0]] = [0, 0];
    EPdata[[0, 0]] = {
        xCoord: [],
        yCoord: []
    };
    SPACE[[0, 0]] = {};
    SPACE[[0,0]][[binWidth, binHeight]] = [binWidth, binHeight];

    var packed = [];

    for (var i in items) {
        var item = items[i];

        var bestEP = null;

        //console.log("placing item #" + (parseInt(i) + 1));

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
                    xCoord: [ep[0], itemRight],
                    yCoord: []
                }
            } else {
                newEPdata[epY].xCoord.push(ep[0]);
                newEPdata[epY].xCoord.push(itemRight);
            }
            if (!newEPs[epX]) {
                newEPs[epX] = epX;
                newEPdata[epX] = {
                    xCoord: [],
                    yCoord: [ep[1], itemTop]
                }
            } else {
                newEPdata[epX].yCoord.push(ep[1]);
                newEPdata[epX].yCoord.push(itemTop);
            }

            if (!newSPACE[epY]) {
                newSPACE[epY] = {};
            }
            if (!newSPACE[epX]) {
                newSPACE[epX] = {};
            }

            var maxXep = {}; // max X EP depending on Y, item level
            var maxYep = {}; // max Y EP depending on X, item level

            var maxXcomp = {}; // max X of "floating" EP made by epX
            var rightEdgeY = {};
            rightEdgeY[epX[1]] = epX[1];

            var maxYcomp = {}; // max Y of "floating" EP made by epY
            var topEdgeX = {};
            topEdgeX[epY[0]] = epY[0];

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

                    if (_ep[0] == ep[0]) {
                        maxYcomp[_ep[0]] = _ep[1];
                    }
                    if (_ep[1] == _ep[1]) {
                        maxXcomp[_ep[1]] = _ep[0];
                    }

                    /*let*/var topEP = [_ep[0], itemTop];
                    if (ep[0] <= _ep[0] && _ep[0] < itemRight) {
                        if (_data.yCoord.length > 0) {
                            /*let*/var yCoords = _data.yCoord;
                            /*let*/var topCoords = [];
                            /*let*/var hasAbove = false;
                            for (/*let*/var coord in yCoords) {
                                if (yCoords[coord] >= itemTop) {
                                    topCoords.push(yCoords[coord]);
                                }
                                if (yCoords[coord] > itemTop) {
                                    hasAbove = true;
                                }
                            }
                            if (topCoords.length > 0 && hasAbove) {
                                if (!newEPs[topEP]) {
                                    newEPs[topEP] = topEP;
                                    newEPdata[topEP] = {
                                        xCoord: [_ep[0], itemRight],
                                        yCoord: topCoords
                                    };
                                } else {
                                    newEPdata[topEP].yCoord = topCoords;
                                }
                                newEPdata[topEP].yCoord.push(itemTop);
                                if (!maxYep[_ep[0]] || maxYep[_ep[0]] < _ep[1]) {
                                    maxYep[_ep[0]] =_ep[1];
                                }
                            }
                        }
                    }
                    /*let*/var rightEP = [itemRight, _ep[1]];
                    if (ep[1] <= _ep[1] && _ep[1] < itemTop) {
                        if (_data.xCoord.length > 0) {
                            /*let*/var xCoords = _data.xCoord;
                            /*let*/var rightCoords = [];
                            /*let*/var hasRight = false;
                            for (/*let*/var coord in xCoords) {
                                if (xCoords[coord] >= itemRight) {
                                    rightCoords.push(xCoords[coord]);
                                }
                                if (xCoords[coord] > itemRight) {
                                    hasRight = true;
                                }
                            }
                            if (rightCoords.length > 0 && hasRight) {
                                if (!newEPs[rightEP]) {
                                    newEPs[rightEP] = rightEP;
                                    newEPdata[rightEP] = {
                                        xCoord: rightCoords,
                                        yCoord: [_ep[1], itemTop]
                                    };
                                } else {
                                    newEPdata[rightEP].xCoord = rightCoords;
                                }
                                newEPdata[rightEP].xCoord.push(itemRight);
                                if (!maxXep[_ep[1]] || maxXep[_ep[1]] < _ep[0]) {
                                    maxXep[_ep[1]] =_ep[0];
                                }
                            }
                        }
                    }

                } else if (_ep[0] < ep[0] && _ep[1] == itemTop && _ep[0] > epY[0]) {
                    // left of item, top edge line
                    newEPdata[_ep].xCoord.push(ep[0]);
                    newEPdata[_ep].xCoord.push(itemRight);

                    topEdgeX[_ep[0]] = _ep[0];

                } else if (_ep[1] < ep[1] && _ep[0] == itemRight && _ep[1] > epX[1]) {
                    // below item, right edge line
                    newEPdata[_ep].yCoord.push(ep[1]);
                    newEPdata[_ep].yCoord.push(itemTop);

                    rightEdgeY[_ep[1]] = _ep[1];

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
                        if (_data.xCoord.length > 0) {
                            // left of item, origin to the right
                            /*let*/var coordOriginList = _data.xCoord;
                            /*let*/var newRightCoordList = [];
                            /*let*/var newLeftCoordList = [];
                            var hasRight = false;
                            for (/*let*/var coord in coordOriginList) {
                                /*let*/var originX = coordOriginList[coord];
                                if (originX >= itemRight) {
                                    newRightCoordList.push(originX);
                                } else {
                                    newLeftCoordList.push(originX);
                                }
                                if (originX > itemRight) {
                                    hasRight = true;
                                }
                            }
                            if (newLeftCoordList.length == 0 && newEPdata[_ep].yCoord.length == 0) {
                                delete newEPdata[_ep];
                                delete newEPs[_ep];
                                delete newSPACE[_ep];
                            } else {
                                newEPdata[_ep].xCoord = newLeftCoordList;
                            }
                            if (newRightCoordList.length != 0 && hasRight) {
                                /*let*/var coord = [itemRight, _ep[1]];

                                if (newEPdata[coord]) {
                                    // TODO predelat na Set
                                    pushAll(newEPdata[coord].xCoord, newRightCoordList);
                                } else {
                                    newEPdata[coord] = {
                                        xCoord: newRightCoordList,
                                        yCoord: []
                                    };
                                }
                                if (!newEPs[coord]) {
                                    newEPs[coord] = coord;
                                }
                                if (!maxXep[_ep[1]] || maxXep[_ep[1]] < _ep[0]) {
                                    maxXep[_ep[1]] = _ep[0];
                                }
                            }
                        }

                    }
                    if (_ep[1] <= ep[1] && ep[0] <= _ep[0]) {
                        if (_data.yCoord.length > 0) {
                            // below item, origin above
                            /*let*/var coordOriginList = _data.yCoord;
                            /*let*/var newAboveCoordList = [];
                            /*let*/var newBellowCoordList = [];
                            var hasAbove = false;
                            for (/*let*/var coord in coordOriginList) {
                                /*let*/var originY = coordOriginList[coord];
                                if (originY >= itemTop) {
                                    newAboveCoordList.push(originY);
                                } else {
                                    newBellowCoordList.push(originY);
                                }
                                if (originY > itemTop) {
                                    hasAbove = true;
                                }
                            }
                            if (newBellowCoordList.length == 0 && newEPdata[_ep].xCoord.length == 0) {
                                delete newEPdata[_ep];
                                delete newEPs[_ep];
                                delete newSPACE[_ep];
                            } else {
                                newEPdata[_ep].yCoord = newBellowCoordList;
                            }
                            if (newAboveCoordList.length != 0 && hasAbove) {
                                /*let*/var coord = [_ep[0], itemTop];

                                if (newEPdata[coord]) {
                                    // TODO predelat na Set
                                    pushAll(newEPdata[coord].yCoord, newAboveCoordList);
                                } else {
                                    newEPdata[coord] = {
                                        xCoord: [],
                                        yCoord: newAboveCoordList
                                    };
                                }
                                if (!newEPs[coord]) {
                                    newEPs[coord] = coord;
                                }
                                if (!maxYep[_ep[0]] || maxYep[_ep[0]] < _ep[1]) {
                                    maxYep[_ep[0]] = _ep[1];
                                }
                            }
                        }
                    }
                    if (epY[0] <= _ep[0] && _ep[0] <= ep[0] && _ep[1] < itemTop) {
                        var compEP = [_ep[0], itemTop];
                        if (newEPs[compEP] && epY[0] != _ep[0]) {
                            newEPdata[compEP].xCoord.push(ep[0]);
                            newEPdata[compEP].xCoord.push(itemRight);

                            if (!EP[compEP] && (!maxYcomp[_ep[0]] || maxYcomp[_ep[0]] < _ep[1])) {
                                maxYcomp[_ep[0]] = _ep[1];
                            }
                        } else {
                            /*let*/var coordOriginList = _data.yCoord;
                            /*let*/var newCoordList = [];
                            for (/*let*/var coord in coordOriginList) {
                                if (coordOriginList[coord] > itemTop) {
                                    newCoordList.push(coordOriginList[coord]);
                                }
                            }
                            if (newCoordList.length > 0) {
                                if (epY[0] == _ep[0]) {
                                    newEPdata[compEP].yCoord = newCoordList;
                                } else {
                                    newEPs[compEP] = compEP;
                                    newEPdata[compEP] = {
                                        yCoord: newCoordList,
                                        xCoord: [ep[0], itemRight]
                                    };
                                    if (!maxYcomp[_ep[0]] || maxYcomp[_ep[0]] < _ep[1]) {
                                        maxYcomp[_ep[0]] = _ep[1];
                                    }
                                }
                            }
                        }
                    }
                    if (epX[1] <= _ep[1] && _ep[1] <= ep[1] && _ep[0] < itemRight) {
                        var compEP = [itemRight, _ep[1]];
                        if (newEPs[compEP] && epX[1] != _ep[1]) {
                            newEPdata[compEP].yCoord.push(ep[1]);
                            newEPdata[compEP].yCoord.push(itemTop);

                            if (!EP[compEP] && (!maxXcomp[_ep[1]] || maxXcomp[_ep[1]] < _ep[0])) {
                                maxXcomp[_ep[1]] = _ep[0];
                            }
                        } else {
                            /*let*/var coordOriginList = _data.xCoord;
                            /*let*/var newCoordList = [];
                            for (/*let*/var coord in coordOriginList) {
                                if (coordOriginList[coord] > itemRight) {
                                    newCoordList.push(coordOriginList[coord]);
                                }
                            }
                            if (newCoordList.length > 0) {
                                if (epX[1] == _ep[1]) {
                                    newEPdata[compEP].xCoord = newCoordList;
                                } else {
                                    newEPs[compEP] = compEP;
                                    newEPdata[compEP] = {
                                        yCoord: [ep[1], itemTop],
                                        xCoord: newCoordList
                                    };
                                    if (!maxXcomp[_ep[1]] || maxXcomp[_ep[1]] < _ep[0]) {
                                        maxXcomp[_ep[1]] = _ep[0];
                                    }
                                }
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
                /*let*/var spaceToUpdate = newSPACE[[itemRight, y]] = (newSPACE[[itemRight, y]] || {});
                for (/*let*/var space in spaces) {
                    if (intersect([x, y], spaces[space], ep, itemSpaces)) {
                        /*let*/var ok = true;
                        /*let*/var newSpace = [spaces[space][0] - (itemRight - x), spaces[space][1]];
                        if (newSpace[0] > 0 && newSpace[1] > 0) {
                            for (/*let*/var space2 in spaceToUpdate) {
                                /*let*/var _space = spaceToUpdate[space2];
                                if (newSpace[0] <= _space[0] && newSpace[1] <= _space[1]) {
                                    ok = false;
                                } else if (newSpace[0] >= _space[0] && newSpace[1] >= _space[1]) {
                                    delete spaceToUpdate[space2];
                                }
                            }
                            if (ok) {
                                spaceToUpdate[newSpace] = newSpace;
                            }
                        }
                    }
                }
                if (objectSize(spaceToUpdate) == 0) {
                    delete newEPs[[itemRight, y]];
                    delete newEPdata[[itemRight, y]];
                    delete newSPACE[[itemRight, y]];
                }
            }
            for (/*let*/var x in maxYep) {
                /*let*/var y = maxYep[x];
                /*let*/var spaces = SPACE[[x, y]];
                /*let*/var spaceToUpdate = newSPACE[[x, itemTop]] = (newSPACE[[x, itemTop]] || {});
                for (/*let*/var space in spaces) {
                    if (intersect([x, y], spaces[space], ep, itemSpaces)) {
                        /*let*/var ok = true;
                        /*let*/var newSpace = [spaces[space][0], spaces[space][1] - (itemTop - y)];
                        if (newSpace[0] > 0 && newSpace[1] > 0) {
                            for (/*let*/var space2 in spaceToUpdate) {
                                /*let*/var _space = spaceToUpdate[space2];
                                if (newSpace[0] <= _space[0] && newSpace[1] <= _space[1]) {
                                    ok = false;
                                } else if (newSpace[0] >= _space[0] && newSpace[1] >= _space[1]) {
                                    delete spaceToUpdate[space2];
                                }
                            }
                            if (ok) {
                                spaceToUpdate[newSpace] = newSpace;
                            }
                        }
                    }
                }
                if (objectSize(spaceToUpdate) == 0) {
                    delete newEPs[[x, itemTop]];
                    delete newEPdata[[x, itemTop]];
                    delete newSPACE[[x, itemTop]];
                }
            }

            for (/*let*/var y in maxXcomp) {
                y = parseInt(y + "");
                /*let*/var topY = null;
                for (/*let*/var _y in rightEdgeY) {
                    _y = rightEdgeY[_y];
                    if (_y < y && (topY === null || topY < _y)) {
                        topY = _y;
                    }
                }
                if (topY === null) {
                    continue;
                }

                /*let*/var x = maxXcomp[y];
                /*let*/var ep1 = EP[[itemRight, topY]];
                /*let*/var ep2 = EP[[x, y]];
                /*let*/var compEP = [itemRight, y];
                mergeSpaces(SPACE, newSPACE, compEP, ep1, ep2);
            }

            for (/*let*/var x in maxYcomp) {
                x = parseInt(x + "");
                /*let*/var topX = null;
                for (/*let*/var _x in topEdgeX) {
                    _x = topEdgeX[_x];
                    if (_x < x && (topX === null || topX < _x)) {
                        topX = _x;
                    }
                }
                if (topX === null) {
                    continue;
                }

                /*let*/var y = maxYcomp[x];
                /*let*/var ep1 = EP[[topX, itemTop]];
                /*let*/var ep2 = EP[[x, y]];
                /*let*/var compEP = [x, itemTop];
                mergeSpaces(SPACE, newSPACE, compEP, ep1, ep2);
            }

            var biggestEmptySpace = 0;

            for (var _ep in newSPACE) {
                if (!newEPs[_ep]) {
                    delete newSPACE[_ep];
                } else {
                    for (var space in newSPACE[_ep]) {
                        var size = newSPACE[_ep][space][0] * newSPACE[_ep][space][1];
                        if (size > biggestEmptySpace) {
                            biggestEmptySpace = size;
                        }
                    }
                }
            }

            var numberOfEPs = objectSize(newEPs);
            var spaceRatio = biggestEmptySpace / (binWidth * binHeight);
            var pointsRatio = numberOfEPs / (2 * items.length);
            if (pointsRatio > 1) {
                pointsRatio = 0.9999999999;
            }

            switch (metricType) {
                case 0:
                    var feasibility = spaceRatio * (1 - pointsRatio);
                    break;
                case 1:
                    var feasibility = spaceRatio;
                    break;
                case 2:
                    var feasibility = (1 - pointsRatio);
                    break;
            }

            //var _packed = packed.slice();
            //_packed.push({
            //    x: ep[0],
            //    y: ep[1],
            //    width: item.width,
            //    height: item.height
            //});
            //renderItems(_packed);
            //renderExtremePoints(newEPs, newSPACE);

            if (bestEP == null || feasibility > bestEP.feasibility) {
                if (bestEP == null) {
                    bestEP = {};
                }
                bestEP.feasibility = feasibility;
                bestEP.placingEP = ep;
                bestEP.EP = newEPs;
                bestEP.EPdata = newEPdata;
                bestEP.SPACE = newSPACE;
                bestEP.result = {
                    epCount: numberOfEPs,
                    maxSpace: biggestEmptySpace,
                    feasibility: feasibility
                }
            }
        }

        if (bestEP == null) {
            //console.log("Could not place item #" + (toInt(i) + 1));
            print("Could not place item " + (toInt(i) + 1) + " of " + items.length + ". Consider increasing bin size!");
            return;
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

        if (renderProgress) {
            renderItems(packed);
            renderExtremePoints(EP, {});
        }
    }

    var endDate = new Date();
    var milis = endDate.getTime() - startDate.getTime();
    var secs = milis / 1000;

    switch (metricType) {
        case 0:
            var metricName = "combined";
            break;
        case 1:
            var metricName = "space-based";
            break;
        case 2:
            var metricName = "EP-based";
            break;
    }

    print("Done!");
    print("Number of EPs: \t\t" + bestEP.result.epCount);
    print("Max empty space: \t" + bestEP.result.maxSpace);
    print("Metric: \t\t" + metricName);
    print("Feasibility: \t\t" + bestEP.result.feasibility);
    print("Time: \t\t\t" + (+secs.toFixed(4)));


    renderItems(packed);
    renderExtremePoints(EP, {});


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

    function mergeSpaces(SPACE, newSPACE, compEP, ep1, ep2) {
        var space1 = SPACE[ep1];
        var space2 = SPACE[ep2];

        var spaceToUpdate = newSPACE[compEP] = (newSPACE[compEP] || {});

        for (var space in space1) {
            var space = space1[space];
            var newSpace = [space[0] - (compEP[0] - ep1[0]), space[1] - (compEP[1] - ep1[1])];
            if (newSpace[0] > 0 && newSpace[1] > 0) {
                spaceToUpdate[newSpace] = newSpace;
                for (var _space in spaceToUpdate) {
                    _space = spaceToUpdate[_space];
                    if (newSpace[0] <= _space[0] && newSpace[1] <= _space[1]) {
                        ok = false;
                    } else if (newSpace[0] >= _space[0] && newSpace[1] >= _space[1]) {
                        delete spaceToUpdate[_space];
                    }
                }
                if (ok) {
                    spaceToUpdate[newSpace] = newSpace;
                }
            }
        }

        for (var space in space2) {
            var space = space2[space];
            var newSpace = [space[0] - (compEP[0] - ep2[0]), space[1] - (compEP[1] - ep2[1])];
            if (newSpace[0] > 0 && newSpace[1] > 0) {
                var ok = true;
                for (var _space in spaceToUpdate) {
                    _space = spaceToUpdate[_space];
                    if (newSpace[0] <= _space[0] && newSpace[1] <= _space[1]) {
                        ok = false;
                    } else if (newSpace[0] >= _space[0] && newSpace[1] >= _space[1]) {
                        delete spaceToUpdate[_space];
                    }
                }
                if (ok) {
                    spaceToUpdate[newSpace] = newSpace;
                }
            }
        }
    }

    function renderItems(items) {
        var renderItems = [];
        for (var i in items) {
            var renderItem = createRenderItem(items[i]);
            renderItems.push(renderItem);
        }
        message.renderItems(renderItems, true);
    }

    function renderExtremePoints(eps, spaces) {
        var renderEPs = [];
        var renderSpaces = [];
        for (var i in eps) {
            for (var j in spaces[i]) {
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

    function print(msg) {
        message.print(msg);
    }

};


var algState;

self.addEventListener('message', function (e) {
    var data = e.data;
    switch (data.cmd) {

        case 'start':
            algState = new AlgState(data.binWidth, data.binHeight, data.items, data.metric, data.renderProgress);
            //algState.run();

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

message.print = function(msg) {
    postMessage({
        cmd: 'print',
        args: [msg]
    });
};