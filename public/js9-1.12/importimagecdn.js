
var parseWtml = function(wtml) {

    var places = [];
    var constellationInstance;

    function findConstellation(ra, dec) {
        if (!constellationInstance) {
            constellationInstance = new wwtlib.Constellations();
        }
        return constellationInstance.findConstellationForPoint(ra, dec);
    }

    var imageSetTypes = [];

    function getImageSetType(sType) {
        if (!imageSetTypes.length) {
            $.each(wwtlib.ImageSetType, function(k, v) {
                if (!isNaN(v)) {
                    imageSetTypes[v] = k.toLowerCase();
                }
            });
        }
        return imageSetTypes.indexOf(sType.toLowerCase()) == -1 ? 2 : imageSetTypes.indexOf(sType.toLowerCase());

    }

    var isId = 100;
    var createPlace = function(node) {
        var place = null, fgi, constellation;
        var createImageset = function() {
            isId++;
            return wwtlib.Imageset.create(
                fgi.attr('Name'),
                fgi.attr('Url'),
                getImageSetType(fgi.attr('DataSetType')),
                fgi.attr('BandPass'),
                wwtlib.ProjectionType[fgi.attr('Projection').toLowerCase()],
                isId, //imagesetid
                parseInt(fgi.attr('BaseTileLevel')),
                parseInt(fgi.attr('TileLevels')),
                null, //tilesize
                parseFloat(fgi.attr('BaseDegreesPerTile')),
                fgi.attr('FileType'),
                fgi.attr('BottomsUp') === 'True',
                '', //quadTreeTileMap 
                parseFloat(fgi.attr('CenterX')),
                parseFloat(fgi.attr('CenterY')),
                parseFloat(fgi.attr('Rotation')),
                true, //sparse
                fgi.find('ThumbnailUrl').text(), //thumbnailUrl,
                false, //defaultSet,
                false, //elevationModel
                parseFloat(fgi.attr('WidthFactor')), //widthFactor,
                parseFloat(fgi.attr('OffsetX')),
                parseFloat(fgi.attr('OffsetY')),
                fgi.find('Credits').text(),
                fgi.find('CreditsUrl').text(),
                '', '',
                0, //meanRadius
                null);
        };
        if (node.tagName === 'ImageSet') {
            fgi = $(node);
            place = wwtlib.Place.create(fgi.attr('Name'), 0, 0, 'Sky', null, fgi ? getImageSetType(fgi.attr('DataSetType')) : 2, 360);
            place.set_studyImageset(createImageset());
        } else if (node.tagName === 'Place') {
            var plNode = $(node);
            var ra = parseFloat(plNode.attr('RA')), dec = parseFloat(plNode.attr('Dec'));
            constellation = findConstellation(ra, dec);

            fgi = plNode.find('ImageSet').length ? plNode.find('ImageSet') : null;
            place = wwtlib.Place.create(
                plNode.attr('Name'),
                dec,
                ra,
                plNode.attr('DataSetType'),
                constellation,
                fgi ? getImageSetType(fgi.attr('DataSetType')) : 2, //type
                parseFloat(plNode.find('ZoomLevel')) //zoomfactor
            );
            if (fgi != null) {
                place.set_studyImageset(createImageset());
            }

        }
        return place;
    };


    wtml.find('Folder').children().each(function(i, childnode) {
        var wwtPlace = createPlace(childnode);
        if (wwtPlace) {
            places.push(wwtPlace);
        }

    });
    return places;
};

//------------------------------------------------

 var loadExternalImage = function (manualData, imageUrl, callback) {
        var url = imageUrl;
        var encodedUrl = 'http://www.worldwidetelescope.org/WWTWeb/TileImage.aspx?imageurl=' + encodeURIComponent(url);
        if (manualData && typeof manualData === "string") {
            encodedUrl += manualData;
        }
        
        var wtmlLoaded = function (xml) {
            var wtml = $(xml);
            var place = parseWtml(wtml)[0];
            var imageSet = place.get_studyImageset();
            console.log(place);
            if (place.get_RA() == 1 && place.get_dec() === 0 && imageSet.get_rotation() == 0) {
                if (callback) {
                    callback({
                        success: false, place: place, imageSet: imageSet, wtml: wtml
                    });
                }
                return;
            } else {
                // wwt.loadImageCollection('https://wwt-js9-server.herokuapp.com/wtmlreturn');
                // wwt.setForegroundImageByName('Image File');
                // console.log(place);
                wwtlib.WWTControl.singleton.renderContext.set_foregroundImageset(place.get_studyImageset());
                wwtlib.WWTControl.singleton.gotoTarget(place, false, false, true);
                // if (!crossFader) {
                //     initXFader();
                // }
                // btnFGInfo.hide();
                
                // btnOpenWWT.show().attr('href', encodedUrl);
                
                // showBottomBar(false);
                if (callback) {
                    callback({ success: true });
                }
            }
        };

        function getImgWtml() {
            $.ajax({
                url: 'https://wwt-js9-server.herokuapp.com/images.wtml',
                crossDomain: true,
                dataType: 'xml'
            }).done(wtmlLoaded).fail(ajaxError);
        }

        var errCount = 0;

        function ajaxError(xhr, status, er) {
            if (er === 'Internal Server Error') {
                errCount++;
                if (errCount < 10) {
                    getImgWtml();
                }
            } else {
                try {
                    console.log(er, status, xhr);
                    wtmlLoaded($.parseXML(xhr.responseText.replace(/& /g, '&amp; ')));
                } catch (er) {
                    errCount++;
                    if (errCount < 10) {
                        getImgWtml();
                    } else {
                        return;
                    }
                }
            }
        }

        getImgWtml();
    };




//http://www.worldwidetelescope.org/wwtweb/ShowImage.aspx?scale=0.12659775555556124&rotation=279.06000000000006&ra=210.341898772&dec=-33.0637077139&y=399.40799210656144&x=800.0&thumb=http://images.ipac.caltech.edu/esahubble/potw1737a/esahubble_potw1737a_100.jpg&imageurl=https://i.pinimg.com/736x/92/9d/3d/929d3d9f76f406b5ac6020323d2d32dc--pretty-cats-beautiful-cats