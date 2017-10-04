


JS9.Image.prototype.getExportURL = function(factor){
    //Edited save file code from JS9
    var key,img, ctx;
    var canvas, width, height;
    width = this.display.width;
    height = this.display.height;
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
    $('#submit').click(function(event){
        event.preventDefault();
        // console.log(JS9.GetImageData('base64'));
        // headerParse(JS9.GetImageData('array').header);
        // console.log(header.CRPIX1);
        // headerParse(JS9.GetFITSHeader(true));
        // console.log(JS9.GetWCS());
        flaskRequest([JS9.GetImage().getExportURL(2), $('#Dec').val(), $('#RA').val(), $('#Rotation').val(), $('#BaseDegreesPerTile').val(), JS9.GetImageData('array').header], success);
        // flaskRequest(image.getExportURL());
    })
});

$(document).ready(function(){
    $('#viewInwwt').click(function(event){
        event.preventDefault();
        image = JS9.GetImage();
        flaskRequest([image.getExportURL(1), $('#Dec').val(), $('#RA').val(), $('#Rotation').val(), $('#BaseDegreesPerTile').val()], viewImageRequest);
    })
});
function viewImageRequest(){
    window.open('http://www.worldwidetelescope.org/wwtweb/ShowImage.aspx?name=test&ra=' + $('#RA').val() + '&dec='+ $('#Dec').val() +'&x=' + $('#RA').val() + '&y=' + $('#Dec').val() + '&scale=' + $('#BaseDegreesPerTile').val() + '&rotation=' + $('#Rotation').val() + '&imageurl=http://wwt-js9-server.herokuapp.com/image.png');
}

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
