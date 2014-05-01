window.Whiteboard = (function(canvas, context, callback) {

    // get the canvas element and its context
    // var canvas = document.getElementById('sketch');
    // var context = canvas.getContext('2d');

    // the aspect ratio is always based on 1140x400, height is calculated from width:
    canvas.width = $('#sketchContainer').outerWidth();
    canvas.height = (canvas.width / 1140) * 400;
    $('#sketchContainer').outerHeight(String(canvas.height) + "px", true);
    // scale function needs to know the width/height pre-resizing:
    var oWidth = canvas.width;
    var oHeight = canvas.height;
    var lines = [];

    var lastMouse = {
        x: 0,
        y: 0
    };

    // brush settings
    context.lineWidth = 2;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.strokeStyle = '#000';

    // attach the mousedown, mouseout, mousemove, mouseup event listeners.
    canvas.addEventListener('mousedown', function(e) {
        lastMouse = {
            x: e.pageX - this.offsetLeft,
            y: e.pageY - this.offsetTop
        };
        canvas.addEventListener('mousemove', move, false);
    }, false);

    canvas.addEventListener('mouseout', function() {
        canvas.removeEventListener('mousemove', move, false);
    }, false);

    canvas.addEventListener('mouseup', function() {
        canvas.removeEventListener('mousemove', move, false);
    }, false);

    // Sets the brush size:
    function setSize(size) {
        context.lineWidth = size;
    }

    // Sets the brush color:
    function setColor(color) {
        context.globalCompositeOperation = 'source-over';
        context.strokeStyle = color;
    }

    // Sets the brush to erase-mode:
    function eraser() {
        context.globalCompositeOperation = 'destination-out';
        context.strokeStyle = 'rgba(0,0,0,1)';
    }

    // Clears the canvas and the lines-array:
    function clear(send) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        lines = [];
        if (send)
            io.socket.get('/session/clear');
    }

    // Redraws the lines from the lines-array:
    function reDraw(lines) {


        for (var i in lines) {
            try {
                draw(lines[i][0], lines[i][1], lines[i][2], lines[i][3], lines[i][4], false);
            } catch (e) {
                console.log("ERROR", e);
            }
        }
    }
    // Draws the lines, called by move and the TogetherJS event listener:
    function draw(start, end, color, size, compositeOperation, save) {
        //console.log("Our context", context);

        try {

            context.save();
            context.lineJoin = 'round';
            context.lineCap = 'round';
            // Since the coordinates have been translated to an 1140x400 canvas, the context needs to be scaled before it can be drawn on:
            context.scale(canvas.width / 1140, canvas.height / 400);
            context.strokeStyle = color;
            context.globalCompositeOperation = compositeOperation;
            context.lineWidth = size;
            context.beginPath();
            context.moveTo(start.x, start.y);
            context.lineTo(end.x, end.y);
            context.closePath();
            context.stroke();
            context.restore();
            if (save) {
                // Won't save if draw() is called from reDraw().
                lines.push([{
                        x: start.x,
                        y: start.y
                    }, {
                        x: end.x,
                        y: end.y
                    },
                    color, size, compositeOperation
                ]);
            }

        } catch (error) {
            console.log("There was a problem defining a variable");
        }
    }

    // Called whenever the mousemove event is fired, calls the draw function:
    function move(e) {
        var mouse = {
            x: e.pageX - this.offsetLeft,
            y: e.pageY - this.offsetTop
        };
        // Translates the coordinates from the local canvas size to 1140x400:
        sendMouse = {
            x: (1140 / canvas.width) * mouse.x,
            y: (400 / canvas.height) * mouse.y
        };
        sendLastMouse = {
            x: (1140 / canvas.width) * lastMouse.x,
            y: (400 / canvas.height) * lastMouse.y
        };
        draw(sendLastMouse, sendMouse, context.strokeStyle, context.lineWidth, context.globalCompositeOperation, true);


        var sketch = {
            type: 'draw',
            start: sendLastMouse,
            end: sendMouse,
            color: context.strokeStyle,
            size: context.lineWidth,
            compositeOperation: context.globalCompositeOperation,
            //lines: lines
        };

        if (_.isFunction(callback)) {
            callback(sketch, lines);
        }


        io.socket.get('/session/draw', sketch, function(res) {
            //  console.log(res)
        });

        lastMouse = mouse;
    }

    io.socket.on('draw', function(msg) {
        draw(msg.start, msg.end, msg.color, msg.size, msg.compositeOperation, true);
    });

    io.socket.on('clear', function(msg) {
        clear(false);
    });

    io.socket.on('session init', function() {
        socket.post('/session/init', {
            _crsf: ''
        }, function() {
            console.log("Session set");
        });
    });

    // JQuery to handle buttons and resizing events, also changes the cursor to a dot resembling the brush size:
    $(document).ready(function() {
        // changeMouse creates a temporary invisible canvas that shows the cursor, which is then set as the cursor through css:
        function changeMouse() {
            // Makes sure the cursorSize is scaled:
            var cursorSize = context.lineWidth * (canvas.width / 1140);
            if (cursorSize < 10) {
                cursorSize = 10;
            }
            var cursorColor = context.strokeStyle;
            var cursorGenerator = document.createElement('canvas');
            cursorGenerator.width = cursorSize;
            cursorGenerator.height = cursorSize;
            var ctx = cursorGenerator.getContext('2d');

            var centerX = cursorGenerator.width / 2;
            var centerY = cursorGenerator.height / 2;

            ctx.beginPath();
            ctx.arc(centerX, centerY, (cursorSize / 2) - 4, 0, 2 * Math.PI, false);
            ctx.lineWidth = 3;
            ctx.strokeStyle = cursorColor;
            ctx.stroke();
            $('#sketch').css('cursor', 'url(' + cursorGenerator.toDataURL('image/png') + ') ' + cursorSize / 2 + ' ' + cursorSize / 2 + ',crosshair');
        }
        // Init mouse
        changeMouse();

        // Redraws the lines whenever the canvas is resized:
        $(window).resize(function() {
            if ($('#sketchContainer').width() != oWidth) {
                canvas.width = $('#sketchContainer').width();
                canvas.height = (canvas.width / 1140) * 400;
                $('#sketchContainer').outerHeight(String(canvas.height) + "px", true);
                var ratio = canvas.width / oWidth;
                oWidth = canvas.width;
                oHeight = canvas.height;
                reDraw(lines);
                changeMouse();
            }
        });

        $('#staring-together').click(function() {
            // console.log("Starting together", TogetherJS.running);
            var $this = $(this);
            if ($this.hasClass('btn-success')) {
                $this.removeClass('btn-success');
                $this.addClass('btn-warning');
                $this.html("Disconnect...");
                io.socket.get('/session/activate');

            } else {
                $this.removeClass('btn-warning');
                $this.addClass('btn-success');
                $this.html("Start Session");
                io.socket.get('/session/destroy', function(msg) {
                    console.log(msg);
                });
            }


        })

        // Clears the canvas:
        $('.clear').click(function() {
            clear(true);
        });

        // Color-button functions:
        $('.color-picker').click(function() {
            var $this = $(this);

            $this.siblings('.active').removeClass('active');

            $this.addClass('active');

            //  console.log($this);
            setColor($this.css("background-color"));
            changeMouse();
        });

        $('.eraser').click(function() {
            eraser();
            changeMouse();
        });
        // TogetherJS user color:
        $('.user-color-pick').click(function() {
            setColor(TogetherJS.require('peers').Self.color);
            changeMouse();
        });

        // Increase/decrease brush size:
        $('.plus-size').click(function() {
            setSize(context.lineWidth + 3);
            changeMouse();
        });

        $('.minus-size').click(function() {
            if (context.lineWidth > 3) {
                setSize(context.lineWidth - 3);
            }
            changeMouse();
        });
    });

});