
"use strict";

importScripts('functions.js');


var TreeAlgState = function(binWidth, binHeight, items) {

    items = orderItems(items);

    var marks = {};
    var markIdx = 1;
    for (var i in items) {
        var item = items[i];
        var w = item.width;
        var h = item.height;
        if (marks[w]) {
            if (marks[w][h]) {
                item.mark = marks[w][h];
                continue;
            } else {
                item.mark = markIdx;
                marks[w][h] = markIdx++;
            }
        } else {
            item.mark = markIdx;
            marks[w] = {};
            marks[w][h] = markIdx++;
        }
    }

    var root = {
        left: null,
        right: null,
        content: null,
        width: binWidth,
        height: binHeight,
        x: 0,
        y: 0
    };

    function placeInBinTree(item, node, splitNodeHolder) {
        if (node.left != null && node.right != null) {
            var placedNode = placeInBinTree(item, node.left, splitNodeHolder);
            if (placedNode == null) {
                placedNode = placeInBinTree(item, node.right, splitNodeHolder);
            }
            return placedNode;
        } else {
            if (node.content != null) {
                return null;
            }
            if (item.width > node.width || item.height > node.height) {
                return null;
            }
            if (item.width == node.width && item.height == node.height) {
                node.content = item;
                return node;
            }

            node.left = {
                left: null,
                right: null,
                content: null
            };
            node.right = {
                left: null,
                right: null,
                content: null
            };

            var dw = node.width - item.width;
            var dh = node.height - item.height;

            if (dw > dh) {
                setNode(node.left, node.x, node.y, item.width, node.height);
                setNode(node.right, node.x + item.width, node.y, node.width - item.width, node.height);
            } else {
                setNode(node.left, node.x, node.y, node.width, item.height);
                setNode(node.right, node.x, node.y + item.height, item.width, node.height - item.height);
            }

            var ret = placeInBinTree(item, node.left, splitNodeHolder);
            splitNodeHolder.node = node;
            return ret;
        }
    }

    function setNode(node, x, y, w, h) {
        node.x = x;
        node.y = y;
        node.width = w;
        node.height = h;
    }

    function renderAllItems(nodes) {
        var items = [];
        for (var i in nodes) {
            var item = nodes[i];
            if (item != null) {
                items.push(createItem(nodes[i]));
            }
        }
        message.renderItems(items, true);
    }

    function renderItem(node) {
        var item = createItem(node);
        message.renderItems([item], false);
    }

    function createItem(node) {
        return {
            x: node.x,
            y: node.y,
            w: node.width,
            h: node.height
        }
    }




    var history = [];
    var placedNodeList = [];
    var backtrackedLast = false;

    this.backtrack = function() {
        var lastNode = history.pop();
        if (lastNode) {
            lastNode.left = null;
            lastNode.right = null;
        }

        placedNodeList.pop();
        backtrackedLast = true;
    };

    this.addItem = function(idx) {
        var splitNodeHolder = {
            node: null
        };
        var nodePlaced = placeInBinTree(items[idx], root, splitNodeHolder);

        if (backtrackedLast) {
            //renderAllItems(placedNodeList);
            backtrackedLast = false;
        }

        history.push(splitNodeHolder.node);
        placedNodeList.push(nodePlaced);

        if (nodePlaced != null) {
            if (placedNodeList.length == items.length) {
                renderAllItems(placedNodeList);
            }
            //renderItem(nodePlaced);
        } else {
            log('Could not place item #' + (idx + 1));
            return 'skip';
        }
    };

    this.run = function() {
        doPermuted(this, items.length);
    };

    var idxList = [];

    function doPermuted(algState, size) {
        var origList = range(0, size - 1);
        var g = permute(origList);

        var next;
        var send;
        while((next = g.next(send)).done == false) {
            var val = next.value;
            send = undefine();

            if (val == -1) {
                idxList.pop();
                algState.backtrack();
            } else {
                idxList.push(val);
                send = algState.addItem(val);
            }
        }
    }

    function switchValues(list, idx1, idx2) {
        var tmp = list[idx1];
        list[idx1] = list[idx2];
        list[idx2] = tmp;
    }

    function* permute(list, low) {
        if (arguments.length == 1) {
            low = 0;
        }

        if (low + 1 >= list.length) {
            yield list[low];
            yield -1;

        } else {
            var msg = yield list[low];
            if (msg == 'skip') {
                yield -1;
                return;
            }

            var next;
            var send;
            var p = permute(list, low + 1);
            while ((next = p.next(send)).done == false) {
                send = yield next.value;
            }

            for (var i = low + 1; i < list.length; i++) {
                if (items[list[i]].mark == items[list[low]].mark) {
                    continue;
                }

                switchValues(list, i, low);

                msg = yield list[low];
                if (msg == 'skip') {
                    yield -1;
                    return;
                }

                send = undefine();
                p = permute(list, low + 1);
                while ((next = p.next(send)).done == false) {
                    send = yield next.value;
                }

                switchValues(list, i, low);
            }
        }
        if (low > 0) {
            yield -1;
        }
    }
};

function orderItems(items) {
    var sortItems = items.slice(0); // clone array

    sortItems.sort(function(i1, i2) {
        var delta = i2.height - i1.height;
        if (delta != 0) {
            return delta;
        } else {
            return i2.width - i1.width;
        }
    });

    return sortItems;
}


var treeAlg;

self.addEventListener('message', function (e) {
    var data = e.data;
    switch (data.cmd) {

        case 'start':
            treeAlg = new TreeAlgState(data.binWidth, data.binHeight, data.items);
            treeAlg.run();

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

message.onDone = function() {
    postMessage({
        cmd: 'onDone',
        args: []
    });
};