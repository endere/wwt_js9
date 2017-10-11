function wwtReady() {
    wwt.loadImageCollection('http://wwt-js9-server.herokuapp.com/images.wtml');

}
 
function initialize(address) {
    var wwt = wwtlib.WWTControl.initControl("WWTCanvas");
    wwt.loadImageCollection(`http://wwt-js9-server.herokuapp.com/${address}.wtml`);
    return wwt;
}

function Goto(coordinates) {
    var wwt = initialize(coordinates['address']);
    setTimeout(function(){
        wwt.setForegroundImageByName('Stored Image');
        wwt.gotoRaDecZoom(parseFloat(coordinates['CenterX']), parseFloat(coordinates['CenterY']), 1, false);
    }, 1000);
}
