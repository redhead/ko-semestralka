
"use strict";

function range(from, to) {
    if (from > to) {
        return [];
    }
    var size = to - from + 1;
    return Array.apply(null, new Array(size)).map(function (x, i) {
        return i + from;
    });
}

function toInt(num) {
    num = num + "";
    return parseInt(num);
}

function objectSize(obj) {
    var j = 0;
    for (var key in obj) {
        j++;
    }
    return j;
}

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


function log(obj) {
    if (console) {
        console.log(obj);
    }
}


var message = message || {};
message.log = log;

function undefine() {
    return;
}


var jQ = {

    extend: function () {
        var src, copyIsArray, copy, name, options, clone, target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if (typeof target === "boolean") {
            deep = target;

            // skip the boolean and the target
            target = arguments[i] || {};
            i++;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target !== "object") {
            target = {};
        }

        // extend jQuery itself if only one argument is passed
        if (i === length) {
            target = this;
            i--;
        }

        for (; i < length; i++) {
            // Only deal with non-null/undefined values
            if ((options = arguments[i]) != null) {
                // Extend the base object
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    // Prevent never-ending loop
                    if (target === copy) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && ((copyIsArray = Array.isArray(copy)) || typeof copy === "object")) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && Array.isArray(src) ? src : [];

                        } else {
                            clone = src && typeof src === "object" ? src : {};
                        }

                        // Never move original objects, clone them
                        target[name] = jQ.extend(deep, clone, copy);

                        // Don't bring in undefined values
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    }

};


var cachedPush = Array.prototype.push;

function pushAll(array, elements) {
    cachedPush.apply(array, elements);
}

