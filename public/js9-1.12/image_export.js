JS9.resizeOnLoad = JS9.Load;
JS9.Load = function(url, opts){
    JS9.resizeOnLoad(url, opts);
    setTimeout(function(){
        JS9.ResizeDisplay(JS9.GetImageData().width, JS9.GetImageData().height);
        JS9.SetZoom(1);
    }, 40);

}

JS9.Image.prototype.getExportURL = function(factor, width, height){
    //Edited save file code from JS9
    var key,img, ctx;
    var canvas, width, height;
    console.log(width);
    console.log(height);
    console.log('----------------');
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

//http://www.worldwidetelescope.org/wwtweb/ShowImage.aspx?name=test&ra=316.0458&dec=-11.35987&x=800&y=705.103&scale=7.47818204162235&rotation=-0.0000069754007796518636&imageurl=http://wwt-js9-server.herokuapp.com/image.png

//http://www.worldwidetelescope.org/wwtweb/ShowImage.aspx?scale=7.460268756516279&rotation=180.1&ra=316.045823855&dec=-11.3598782647&y=705.1030753632984&x=800.0&thumb=http://images.ipac.caltech.edu/eso/eso1731e/eso_eso1731e_100.jpg&imageurl=http://images.ipac.caltech.edu/eso/eso1731e/eso_eso1731e_1600.jpg&name=NGC%207009
//Ra 316.0458
//Dec -11.35987
//y = 705.103
//x = 800.0
//rotation = 180.1
//scale = 7.4602
// $(document).ready(function(){
//     $('#submit').click(function(event){
//         event.preventDefault();
//         image = JS9.GetImage();
//         // headerInfo = headerParse(JS9.GetImageData('array').header);
//         // console.log(JS9.GetImageData('array'));
        // console.log(JS9.GetImageData('base64').data);
//         // flaskRequest([JS9.GetImageData('base64').data, $('#Dec').val(), $('#RA').val(), $('#Rotation').val(), $('#BaseDegreesPerTile').val()], updateImage);
//         flaskRequest([image.getExportURL(2), $('#Dec').val(), $('#RA').val(), $('#Rotation').val(), $('#BaseDegreesPerTile').val()], updateImage);
//         // flaskRequest(image.getExportURL());
//     })
// });


$(document).ready(function(){
    console.log(JS9.OpenFileMenu());
    $('#submit').click(function(event){
        event.preventDefault();
        // console.log(JS9.GetImageData('base64'));
        // headerParse(JS9.GetImageData('array').header);
        // console.log(header.CRPIX1);
        // headerParse(JS9.GetFITSHeader(true));
        // console.log(JS9.GetWCS());
        // console.log(JS9.GetValPos(JS9.GetPan(), false));
        // console.log(JS9.GetImageData());
        // console.log(JS9.PixToWCS(JS9.GetImageData().height, JS9.GetImageData().width));
        // console.log(JS9.PixToWCS(0,0));


        //test code, delete ++++++++++++++++++++++
        // head = JS9.GetImageData('array').header;
        // head.lowestPoint = JS9.PixToWCS(0,0).str.replace('+', '').slice(0, -4);
        // head.highestPoint = JS9.PixToWCS(JS9.GetImageData().width, JS9.GetImageData().height).str.replace('+', '').slice(0, -4);
        // console.log(head);
        // head = {}
        // head['RA_CENT'] = 316.0458
        // head['DEC_CENT'] = -11.35987
        // head['CRPIX1'] = 800.0
        // head['CRPIX2'] = 705.103
        // head['RA'] = null
        // head['DEC'] = null
        // head['NAXIS1'] = 1600
        // head['NAXIS2'] = 1410
        // head['lowestPoint'] = "21:11:02 -13:49:35"
        // head['highestPoint'] = "20:57:26 -10:53:39"
        // flaskRequest([JS9.GetImage().getExportURL(2), $('#Dec').val(), $('#RA').val(), $('#Rotation').val(), $('#BaseDegreesPerTile').val(), head], viewImageRequest);
        //test code, delete ++++++++++++++++++++++

        console.log(JS9.GetZoom());
        console.log(JS9.GetPan());
        console.log(JS9.GetScale());

        console.log(JS9.SetZoom('toFit'));
        console.log(JS9.GetPan());
        console.log(JS9.GetZoom());
        console.log(JS9.GetScale());

        //keeping this code safe --------------------------------------------------------
        head = JS9.GetImageData('array').header;
        head.lowestPoint = JS9.PixToWCS(0,0).str.replace('+', '').slice(0, -4);
        head.highestPoint = JS9.PixToWCS(JS9.GetImageData().width, JS9.GetImageData().height).str.replace('+', '').slice(0, -4);
        // JS9.ResizeDisplay(JS9.GetImageData().width, JS9.GetImageData().height);
        // JS9.SetZoom(1);
        flaskRequest([JS9.GetImage().getExportURL(2, JS9.GetImageData().width/2, JS9.GetImageData().height/2), $('#Dec').val(), $('#RA').val(), $('#Rotation').val(), $('#BaseDegreesPerTile').val(), head], success);
    })
});

$(document).ready(function(){
    $('#viewInwwt').click(function(event){
        event.preventDefault();
        head = JS9.GetImageData('array').header;
        head.lowestPoint = JS9.PixToWCS(0,0).str.replace('+', '').slice(0, -4);
        head.highestPoint = JS9.PixToWCS(JS9.GetImageData().width, JS9.GetImageData().height).str.replace('+', '').slice(0, -4);
        console.log(head);
        flaskRequest([JS9.GetImage().getExportURL(1, JS9.GetImageData().width, JS9.GetImageData().height), $('#Dec').val(), $('#RA').val(), $('#Rotation').val(), $('#BaseDegreesPerTile').val(), head], viewImageRequest);
    })
});
function viewImageRequest(response){
    parsedResp = JSON.parse(response);
    console.log(`http://www.worldwidetelescope.org/wwtweb/ShowImage.aspx?name=test&ra=${parsedResp['RA']}&dec=${parsedResp['Dec']}&x=${parsedResp['x']}&y=${parsedResp['y']}&scale=${parsedResp['BaseDegreesPerTile']}&rotation=${parsedResp['Rotation']}&imageurl=http://wwt-js9-server.herokuapp.com/image.png`);
    window.open(`http://www.worldwidetelescope.org/wwtweb/ShowImage.aspx?name=test&ra=${parsedResp['RA']}&dec=${parsedResp['Dec']}&x=${parsedResp['x']}&y=${parsedResp['y']}&scale=${parsedResp['BaseDegreesPerTile']}&rotation=${parsedResp['Rotation'] + 180}&imageurl=http://wwt-js9-server.herokuapp.com/image.png`);
}
http://www.worldwidetelescope.org/wwtweb/ShowImage.aspx?name=test&ra=189.67166666666665&dec=32.77194444444444&x=457&y=471&scale=1.1359209872912663&rotation=-0.00010826155916277003&imageurl=http://wwt-js9-server.herokuapp.com/image.png
function viewReqSuccess(response){
    console.log('success');
    var wind = window.open("");
    wind.document.write(response);
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

// function headerParse(headerObject) {
//     json = JSON.stringify(headerObject);
//     $.ajax({
//         type: 'POST',
//         url: 'http://wwt-js9-server.herokuapp.com/header',
//         crossDomain: true,
//         dataType: "json",
//         contentType: "application/json; charset=utf-8",
//         data: json,
//     }).done(headerSuccess).fail(failed);
// }
// function success(response){
//     Goto();
//     // Goto('https://wwt-js9-server.herokuapp.com/' + response);
// }

// function headerSuccess(response){
//     console.log(response)
// }

function failed(response){
    console.log(response)
    console.log('failed');
}

function success(response) {
    parsedResp = JSON.parse(response);
    Goto(parsedResp);
    // $.ajax({
    //     type: 'GET',
    //     url: 'http://wwt-js9-server.herokuapp.com/',
    //     crossDomain: true,
    //     processData: false,
    //     contentType: false,
    // }).done(success).fail(failed);
}



//-----------------------------------------------------------------
// $(document).ready(function(){
//     $('#imabutton').click(function(){
//         image = JS9.GetImage();
//         flaskRequest(image.getExportURL());
//         // testReq();
//         // url = image.getExportURL();
//         // console.log(url.substr(url.length - 5));
//         // $.parseXML('images.wtml');
//         // var file = new File([''], 'images.wtml');
//         // console.log(file);
//         // var reader = new FileReader();
//         // console.log(reader.readAsBinaryString(file));
//         // window.open(image.getExportURL());
//         // window.open(cat_url);

//         // wwt.setImage(image.getExportURL());
//     })
// });

var cat_url = 'https://i.pinimg.com/736x/92/9d/3d/929d3d9f76f406b5ac6020323d2d32dc--pretty-cats-beautiful-cats.jpg';
