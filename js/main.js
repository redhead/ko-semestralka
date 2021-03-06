
"use strict";


var items;
var SCALE = 5; // one unit = 20 pixels


var distributionFunctions = {
    0: function() {
        return Math.random();
    },
    1: function() {
        var n = jStat.normal.sample(0, 1);
        if (n > 5) {
            n = 5;
        }
        if (n < -5) {
            n = -5;
        }
        n += 5;
        n /= 10;
        return n;
    },
    2: function() {
        return 1 - distributionFunctions[3]();
    },
    3: function beta() {
        return jStat.beta.sample(5, 1);
    }
};

function random(min, max, randomFn) {
    return Math.floor((randomFn() * (max - min + 1)) + min);
}

function createItems() {
    var itemCount = parseInt($('#itemCount').val());
    var minSize = parseInt($('#itemMinSize').val());
    var maxSize = parseInt($('#itemMaxSize').val());

    var distributionIdx = parseInt($('#distribution').val());
    var randomFn = distributionFunctions[distributionIdx];

    var items = [];
    for (var i = 0; i < itemCount; i++) {
        items[i] = {
            width: random(minSize, maxSize, randomFn),
            height: random(minSize, maxSize, randomFn)
        };
    }
    return items;
}

function createBinCanvas(binWidth, binHeight) {
    var binCanvas = $('<canvas>').addClass('bin').attr({
        width: binWidth * SCALE,
        height: binHeight * SCALE
    });
    $('#solution').append(binCanvas);
    return binCanvas;
}

function renderSolution(context, items) {
    for (var i in items) {
        renderItem(context, items[i]);
    }
}

function renderPoints(context, points, spaces) {
    for (var i in points) {
        renderPoint(context, points[i]);
    }
    //for (var i in points) {
    //    renderSpace(context, spaces[i]);
    //}
}

function renderPoint(context, point) {
    var x = point.x * SCALE;
    var y = point.y * SCALE;

    context.beginPath();
    context.arc(x, y, 2, 0, 2 * Math.PI, true);
    context.fillStyle = '#00aa00';
    context.fill();
}

function renderSpace(context, space) {
    var x = space.x * SCALE;
    var y = space.y * SCALE;
    var w = space.w * SCALE;
    var h = space.h * SCALE;

    context.beginPath();
    context.rect(x, y, w, h);
    context.fillStyle = "rgba(0, 0, 255, 0.1)";
    context.fill();
}

function renderItem(context, item) {
    var x = item.x * SCALE;
    var y = item.y * SCALE;
    var w = item.w * SCALE;
    var h = item.h * SCALE;

    context.beginPath();
    context.rect(x, y, w, h);
    context.fillStyle = '#eee161';
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = '#eee';
    context.stroke();
}

function renderItemPreviews() {
    SCALE = parseFloat($('#scale').val());

    var el = $('#itemsPreview');
    el.html('');

    var maxHeight = 0;
    var maxWidth = 0;

    items = orderItems(items);

    $.each(items, function (i, item) {
        var width = item.width * SCALE;
        var height = item.height * SCALE;

        if (maxWidth < item.width) {
            maxWidth = item.width;
        }
        if (maxHeight < item.height) {
            maxHeight = item.height;
        }

        var itemEl = $('<div>').addClass('item').css({
            width: width + 'px',
            height: height + 'px'
        });

        el.append(itemEl);

        itemEl.click(function () {
            items.splice(i, 1);
            itemEl.remove();
        });
    });

    $('#binWidth').attr('min', maxWidth).val(Math.max(maxWidth, $('#binWidth').val()));
    $('#binHeight').attr('min', maxHeight).val(Math.max(maxHeight, $('#binHeight').val()));
}

function renderUI() {
    renderItemPreviews();
}


function run(e) {
    if (e) e.preventDefault();

    SCALE = parseFloat($('#scale').val());

    log(items);

    $('#solution').html('');

    var methodIdx = $('#method').val();
    //var method = methods[methodIdx];

    //log("Executing method " + method.name);

    var binWidth = parseInt($('#binWidth').val());
    var binHeight = parseInt($('#binHeight').val());


    var binCanvas = createBinCanvas(binWidth, binHeight);
    var context = binCanvas[0].getContext('2d');

    var itemsToRender = null;
    var pointsToRender = null;
    var spacesToRender = null;

    var commands = {
        renderItems: function(items, clear) {
            itemsToRender = items;
            setTimeout(render, 1);
            //if (clear) {
            //    context.clearRect(0, 0, binCanvas.width() * SCALE, binCanvas.height() * SCALE);
            //}
            //renderSolution(context, items);
        },

        renderPoints: function(points, spaces) {
            pointsToRender = points;
            spacesToRender = spaces;
            setTimeout(render, 1);
        },

        log: log,

        onDone: function() {
            worker.terminate();
            worker = undefined;

            $('#run').attr('disabled', false);
            $('#stop').attr('disabled', true);
        },

        print: function(msg) {
            $('#console').append(msg.replace(/\n/g, "<br>") + "<br>");
            $('#consoleContainer code').scrollTop($('#consoleContainer code')[0].scrollHeight);
        }
    };

    var render = function() {
        if (itemsToRender) {
            context.clearRect(0, 0, binCanvas.width() * SCALE, binCanvas.height() * SCALE);
            renderSolution(context, itemsToRender);
            itemsToRender = null;
        }
        if (pointsToRender) {
            renderPoints(context, pointsToRender, spacesToRender);
            pointsToRender = null;
        }
        setTimeout(render, 1);
    };
    render();

    var worker = new Worker("js/methods/ep-based.js");
    worker.postMessage({
        cmd: 'start',
        binWidth: binWidth,
        binHeight: binHeight,
        items: items,
        metric: toInt($('#metric').val()),
        renderProgress: $('#render').is(':checked')
    });
    worker.onmessage = function (e) {
        commands[e.data.cmd].apply(this, e.data.args);
    };


    $('#run').attr('disabled', true);
    $('#stop')
        .unbind()
        .attr('disabled', false)
        .on('click', commands.onDone);
}

function addItem(e) {
    if (e) e.preventDefault();

    var width = parseInt($('#itemWidth').val());
    var height = parseInt($('#itemHeight').val());

    items.push({
        width: width,
        height: height
    });
    renderUI();
}

function randomize(e) {
    if (e) e.preventDefault();

    items = createItems();
    renderUI();
}

//function initMethodsSelect() {
//    var methodSelect = $('#method');
//
//    for (var i = 0; i < methods.length; i++) {
//        var option = $('<option>')
//            .val(i)
//            .html(methods[i].name);
//
//        methodSelect.append(option);
//    }
//}

$(function () {

    $('#addItemButton').click(addItem);
    $('#randomizeButton').click(randomize);
    $('#scale').change(renderUI);

    $('#run').click(run);
    $('#stop').attr('disabled', true);

    //initMethodsSelect();

    randomize();
    renderUI();

});