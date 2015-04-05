items = [];

SCALE = 5; // one unit = 20 pixels

methods = [
    {name: "Permuted", script: "permute.js"}
];


function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}

function createItems() {
    var itemCount = parseInt($('#itemCount').val());
    var minSize = parseInt($('#itemMinSize').val());
    var maxSize = parseInt($('#itemMaxSize').val());

    var items = [];
    for (var i = 0; i < itemCount; i++) {
        items[i] = {
            width: random(minSize, maxSize),
            height: random(minSize, maxSize)
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
    for (i in items) {
        renderItem(context, items[i]);
    }
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
    var el = $('#itemsPreview');

    el.html('');

    var maxHeight = 0;
    var maxWidth = 0;

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
            renderItemPreviews();
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

    log(items);

    $('#solution').html('');

    var methodIdx = $('#method').val();
    var method = methods[methodIdx];

    log("Executing method " + method.name);

    var binWidth = parseInt($('#binWidth').val());
    var binHeight = parseInt($('#binHeight').val());


    var binCanvas = createBinCanvas(binWidth, binHeight);
    var context = binCanvas[0].getContext('2d');

    var renderItems = null;

    var commands = {
        renderItems: function(items, clear) {
            renderItems = items;
            //if (clear) {
            //    context.clearRect(0, 0, binCanvas.width() * SCALE, binCanvas.height() * SCALE);
            //}
            //renderSolution(context, items);
        },

        log: log,

        onDone: function() {
            worker.terminate();
            worker = undefined;

            $('#run').attr('disabled', false);
            stopButton.remove();
        }
    };

    var render = function() {
        if (renderItems) {
            context.clearRect(0, 0, binCanvas.width() * SCALE, binCanvas.height() * SCALE);
            renderSolution(context, renderItems);
            renderItems = null;
        }
        setTimeout(render, 1);
    };
    render();

    var worker = new Worker("js/methods/" + method.script);
    worker.postMessage({
        cmd: 'start',
        binWidth: binWidth,
        binHeight: binHeight,
        items: items
    });
    worker.onmessage = function (e) {
        commands[e.data.cmd].apply(this, e.data.args);
    };


    $('#run').attr('disabled', true);

    var stopButton = $('<button class="btn">')
        .text('Stop')
        .insertAfter($('#run'))
        .click(commands.onDone);
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

function initMethodsSelect() {
    var methodSelect = $('#method');

    for (var i = 0; i < methods.length; i++) {
        var option = $('<option>')
            .val(i)
            .html(methods[i].name);

        methodSelect.append(option);
    }
}

$(function () {

    $('#addItemButton').click(addItem);
    $('#randomizeButton').click(randomize);

    $('#run').click(run);

    initMethodsSelect();

    randomize();

});