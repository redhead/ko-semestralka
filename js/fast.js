function fastGreedyMethod() {
    var reorderedItems = orderItems();
    items = reorderedItems;
    renderUI();

    var binWidth = parseInt($('#binWidth').val());
    var binHeight = parseInt($('#binHeight').val());

    function createBin() {
        return {
            element: $('<div>').addClass('bin').css({
                width: binWidth * SCALE,
                height: binHeight * SCALE
            }),
            root: {
                left: null,
                right: null,
                content: null,
                width: binWidth,
                height: binHeight,
                x: 0,
                y: 0
            }
        }
    }

    function placeInBinTree(item, node) {
        if (node.left != null && node.right != null) {
            var placedNode = placeInBinTree(item, node.left);
            if (placedNode == null) {
                placedNode = placeInBinTree(item, node.right);
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
                node.left.x = node.x;
                node.left.y = node.y;
                node.left.width = item.width;
                node.left.height = node.height;

                node.right.x = node.x + item.width;
                node.right.y = node.y;
                node.right.width =  node.width - item.width;
                node.right.height = node.height
            } else {
                node.left.x = node.x;
                node.left.y = node.y;
                node.left.width = node.width;
                node.left.height = item.height;

                node.right.x = node.x;
                node.right.y = node.y + item.height;
                node.right.width = item.width;
                node.right.height = node.height - item.height;
            }

            return placeInBinTree(item, node.left);
        }
    }

    function renderItem(bin, node) {
        var item = $('<div>').addClass('item').css({
            left: (node.x * SCALE) + "px",
            bottom: (node.y * SCALE) + "px",
            width: (node.width * SCALE) + "px",
            height: (node.height * SCALE) + "px"
        });
        bin.element.append(item);
    }

    var bin = createBin();
    $('#solution').append(bin.element);

    $.each(items, function(i, item) {
        var nodePlaced = placeInBinTree(item, bin.root);
        if (nodePlaced != null) {
            renderItem(bin, nodePlaced);
        } else {
            alert('Could not place item #' + (i+1));
            return;
        }
    });
}