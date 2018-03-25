document.addEventListener('DOMContentLoaded', function () {
    var chessCanvas = document.getElementById("chess-canvas");
    var ctx = chessCanvas.getContext("2d");

    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            ctx.moveTo(0, 70 * j);
            ctx.lineTo(560, 70 * j);
            ctx.stroke();

            ctx.moveTo(70 * i, 0);
            ctx.lineTo(70 * i, 560);
            ctx.stroke();
            var left = 0;
            for (var a = 0; a < 8; a++) {
                for (var b = 0; b < 8; b += 2) {
                    startX = b * 70;
                    if (a % 2 == 0) startX = (b + 1) * 70;
                    ctx.fillRect(startX + left, (a * 70), 70, 70);
                }
            }
        }
    }
}, false);
