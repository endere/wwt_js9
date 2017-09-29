function wwtReady() {
    wwt.loadImageCollection('http://wwt-js9-server.herokuapp.com/images.wtml');

}
 

function initialize() {
    var wwt = wwtlib.WWTControl.initControl("WWTCanvas");

    // wwt.add_ready(wwtReady);
    wwt.loadImageCollection('http://wwt-js9-server.herokuapp.com/images.wtml');
    return wwt;
}
//

function Goto() {
    // var testurl = 'https://wwt-js9-server.herokuapp.com/
    // loadExternalImage(null, testurl, function(result){
    //     console.log(result);
    // })
    // wwt.loadImageCollection('https://wwt-js9-server.herokuapp.com/images2.wtml');
    // console.log(encodeURIComponent('https://wwt-js9-server.herokuapp.com/'))
    // $('#WorldWideTelescopeControlHost').remove();
//     newWindow();
//     $('<div/>',{id: 'WorldWideTelescopeControlHost'}).appendTo('body');
//     $('<div/>',{
//     id: 'WWTCanvas',
//     style: 'width: 750px; height: 750px; border-style: none; border-width: 0px;'
// }).appendTo('#WorldWideTelescopeControlHost');
    var wwt = initialize();
    setTimeout(function(){
        wwt.setForegroundImageByName('Stored Image');
        wwt.gotoRaDecZoom($('#RA').val(), $('#Dec').val(), 0.2, false);
    }, 1000);

    }
//
//
// function setImage(b){
//     // var b = wwt.getImagesetByName(a);
//     wwt.renderContext.set_foregroundImageset(b);
// }

// function getImgWtml(url) {
//     var encodedUrl = 'http://www.worldwidetelescope.org/WWTWeb/TileImage.aspx?imageurl=' + encodeURIComponent(url);
//     $.ajax({
//         url: encodedUrl,
//         crossDomain: true,
//         dataType: 'xml'
//     }).done(wtmlLoaded).fail(ajaxError);
// }

// function wtmlLoaded(xml){
//     var wtml = $(xml);
//     var place = parseWtml(wtml)[0];
//     var imageSet = place.get_studyImageset();
//     // console.log(wtml);
//     console.log(imageSet);
//     console.log(place._name);

// }
// function ajaxError(){
//     console.log('error!');
// }
// setForegroundImageByName:function(a){var b=this.getImagesetByName(a);null!=b&&this.renderContext.set_foregroundImageset(b)}
//getImagesetByName:function(a){for(var b=ss.enumerate(Ec.imageSets);b.moveNext();){var c=b.current;if(c.get_name().toLowerCase().indexOf(a.toLowerCase())>-1)return c}return null},

// set_foregroundImageset:function(a){
//     return this._foregroundImageset=a,a
// }

//---------------------------------------------
