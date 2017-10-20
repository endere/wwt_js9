JS9.resizeOnLoad = JS9.Load;
JS9.Load = function(url, opts){
    JS9.resizeOnLoad(url, opts);
    setTimeout(function(){
        JS9.ResizeDisplay(JS9.GetImageData().width, JS9.GetImageData().height);
        JS9.SetZoom(1);
    }, 100);

}

JS9.Image.prototype.getExportURL = function(factor, width, height){
    //Edited save file code from JS9
    var key,img, ctx;
    var canvas, width, height;
    // create off-screen canvas, into which we write all canvases
    img = document.createElement("canvas");
    img.setAttribute("width", width);
    img.setAttribute("height", height);
    ctx = img.getContext("2d");
    // image display canvas
    ctx.drawImage(this.display.canvas, 0, 0, width / factor, height / factor);
    for( key in this.layers ){
        if( this.layers.hasOwnProperty(key) ){
        // each layer canvas
        if( this.layers[key].dlayer.dtype === "main" &&
            this.layers[key].show ){
            canvas = this.layers[key].dlayer.canvasjq[0];
            ctx.drawImage(canvas, 0, 0, width / factor, height / factor);
        }
        }
    }
    var image = new Image();
    image.src = img.toDataURL('image/png', 1)
    return image['src'];
};

$(document).ready(function(){
    $('#submit').click(function(event){
        event.preventDefault();
        head = JS9.GetImageData('array').header;
        head.lowestPoint = JS9.PixToWCS(0,0).str.replace('+', '').slice(0, -4);
        head.highestPoint = JS9.PixToWCS(JS9.GetImageData().width, JS9.GetImageData().height).str.replace('+', '').slice(0, -4);
        flaskRequest([JS9.GetImage().getExportURL(2, JS9.GetImageData().width/2, JS9.GetImageData().height/2), $('#Dec').val(), $('#RA').val(), $('#Rotation').val(), $('#BaseDegreesPerTile').val(), head], success);
    })
    $('#viewInwwt').click(function(event){
        event.preventDefault();
        head = JS9.GetImageData('array').header;
        head.lowestPoint = JS9.PixToWCS(0,0).str.replace('+', '').slice(0, -4);
        head.highestPoint = JS9.PixToWCS(JS9.GetImageData().width, JS9.GetImageData().height).str.replace('+', '').slice(0, -4);
        console.log(head);
        flaskRequest([JS9.GetImage().getExportURL(1, JS9.GetImageData().width, JS9.GetImageData().height), $('#Dec').val(), $('#RA').val(), $('#Rotation').val(), $('#BaseDegreesPerTile').val(), head], viewImageRequest);
    })
    // JS9.Load('http://wwt-js9-server.herokuapp.com/image.fits');
});

function viewImageRequest(response){
    parsedResp = JSON.parse(response);
    window.open(`http://www.worldwidetelescope.org/wwtweb/ShowImage.aspx?name=test&ra=${parsedResp['RA']}&dec=${parsedResp['Dec']}&x=${parsedResp['x']}&y=${parsedResp['y']}&scale=${parsedResp['BaseDegreesPerTile']}&rotation=${parsedResp['Rotation']}&imageurl=http://wwt-js9-server.herokuapp.com/${parsedResp['address']}.png`);
}

function flaskRequest(attatchments, callback) {
    json = JSON.stringify(attatchments[5])
    $.ajax({
        type: 'POST',
        url: 'http://wwt-js9-server.herokuapp.com/',
        crossDomain: true,
        processData: false,
        contentType: false,
        data: 'url=' + attatchments[0] + '&Dec=' + attatchments[1] + '&RA=' + attatchments[2] + '&Rotation=' + attatchments[3] + '&BaseDegreesPerTile=' + attatchments[4] + '&Header=' + json
    }).done(callback).fail(failed);
}

function failed(response){
    console.log(response)
    console.log('failed');
}

function success(response) {
    parsedResp = JSON.parse(response);
    Goto(parsedResp);
}