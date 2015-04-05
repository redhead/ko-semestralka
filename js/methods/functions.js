
function range(from, to) {
    if (from > to) {
        return [];
    }
    var size = to - from + 1;
    return Array.apply(null, new Array(size)).map(function (x, i) {
        return i + from;
    });
}


function log(obj) {
    if (console) {
        console.log;
    }
}


var message = message || {};
message.log = log;

function undefine() {
    return;
}







// my tests

//function* permuteTest(list, low, startList) {
//    if (arguments.length == 1) {
//        low = 0;
//    }
//    if (typeof(startList) == 'undefined') {
//        startList = list.slice();
//    }
//
//    if (low + 1 >= list.length) {
//        yield list[low];
//        yield -1;
//
//    } else {
//        var msg = yield list[low];
//        if (msg == 'skip') {
//            yield -1;
//            return;
//        }
//
//        var next, send, p, i;
//
//        if (list[low] == startList[low]) {
//            p = permuteTest(list, low + 1, startList);
//            while ((next = p.next(send)).done == false) {
//                send = yield next.value;
//            }
//
//            for (i = low + 1; i < list.length; i++) {
//                switchValues(list, i, low);
//
//                msg = yield list[low];
//                if (msg == 'skip') {
//                    yield -1;
//                    return;
//                }
//
//                send = undefine();
//                p = permuteTest(list, low + 1);
//                while ((next = p.next(send)).done == false) {
//                    send = yield next.value;
//                }
//
//                switchValues(list, i, low);
//            }
//        } else {
//            for (i = low + 1; i < list.length; i++) {
//                switchValues(list, i, low);
//
//                msg = yield list[low];
//                if (msg == 'skip') {
//                    yield -1;
//                    return;
//                }
//
//                send = undefine();
//                p = permuteTest(list, low + 1);
//                while ((next = p.next(send)).done == false) {
//                    send = yield next.value;
//                }
//
//                switchValues(list, i, low);
//            }
//        }
//    }
//    if (low > 0) {
//        yield -1;
//    }
//}
//
//function switchValues(list, idx1, idx2) {
//    var tmp = list[idx1];
//    list[idx1] = list[idx2];
//    list[idx2] = tmp;
//}
//
//var wholeList = [];
//
//function doPermutedTest(origList, startList) {
//    var g = permuteTest(origList, 0, startList);
//
//    var list = [];
//
//    var next;
//    var send;
//    while((next = g.next(send)).done == false) {
//        var val = next.value;
//
//        if (val == -1) {
//            list.pop();
//        } else {
//            list.push(val);
//        }
//
//        if (list.length == origList.length) {
//            wholeList.push(list.slice());
//        }
//    }
//}
//
//wholeList = [];
//doPermutedTest([1,0,2], [0, 1, 2]);
//$.each(wholeList, function(i,e) { console.log(e); });
//console.log(JSON.stringify(wholeList) == '[[1,0,2],[1,2,0],[2,1,0],[2,0,1]]');
//
//console.log("----------------");
//
//wholeList = [];
//doPermutedTest([0, 1, 2]);
//console.log(JSON.stringify(wholeList) == '[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,1,0],[2,0,1]]');
