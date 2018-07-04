function onMapClick(e) {
    var coord = e.latlng;
    //var lat = coord.lat;
    //var lng = coord.lng;
    //L.marker(coord).addTo(map);
    coord = JSON.stringify(coord);
    console.log(coord);
}

function addToolbar() {
    drawControlEdit.remove(map);
    drawControlFull.addTo(map);
    //Delete information of zone created
    $("#form_save_zone").remove();
    $("#inf_form").html("");
}

// Create the form element that permit save the zone
function elementCreated(layer) {
    var action = "#";
    var large1 = '<form id="form_save_zone" action="' + action + '">' + '<label for="zone_name">Nombre de la zona:</label>';
    var large2 = '<input type="text" name="zone_name" required><input type="submit" value="Guardar zona"><p id="inf_form"></p></form> ';
    $("#map").after(large1 + large2);
    formSaveZone(layer);
}

// Send form to server to save the zone
function formSaveZone(layer) {
    $("#form_save_zone").submit(function(event) {
        event.preventDefault();
        var shape = JSON.stringify(layer.toGeoJSON());
        var zone_name = $('[name=zone_name]').val();
        console.log(zone_name);
        var data = JSON.stringify({
            "name": zone_name,
            "zone": shape
        });

        $.ajax({
            type: "POST",
            url: "/save_zone",
            data: data,
            contentType: 'application/json; charset=utf-8'
        }).done(function(response) {
            var obj = JSON.parse(response)
            if (obj.fail != undefined) {
                $("#inf_form").css("color", "red");
                $("#inf_form").html(obj.fail);
            } else {
                $("#inf_form").css("color", "green");
                $("#inf_form").html(obj.result);
            }
        }).fail(function(response) {
            $("#inf_form").css("color", "red");
            $("#inf_form").html("Error interno. Inténtelo más tarde.");
        });
    });
}

// Load all zones that the server sent
function loadZones() {
    var zones = $("#zones_loaded").html();
    if (zones != "") {
        var data = JSON.parse(zones);
        for (var i in data) {
            var name = data[i].name;
            var zone = JSON.stringify(data[i].zone);
            var l1 = '<li><form class="form_show_zone"><input type="hidden" value=\'' + zone + '\'>';
            var l2 = '<input type="submit" class="load_zone_button" value="' + name + '"></form></li>';
            $("#zones_list").append(l1 + l2);
        }
        formShowZone();
    }
}

// Show zone in map
function formShowZone() {
    $(".form_show_zone").submit(function(event) {
        event.preventDefault();
        if (lastLayer != undefined) {
            map.removeLayer(lastLayer);
            drawnItems.removeLayer(lastLayer);
        }
        var geoJSONZone = L.geoJSON(JSON.parse(JSON.parse($(this[0]).val())));
        lastLayer = geoJSONZone.addTo(map);
        drawControlFull.remove(map);
        drawControlEdit.remove(map);
        drawControlNone.addTo(map);
        //Delete information of zone created
        $("#form_save_zone").remove();
        $("#inf_form").html("");
        map.fitBounds(geoJSONZone.getBounds());
    });

}

$("#clear_map").click(function() {
    if (lastLayer != undefined) {
        map.removeLayer(lastLayer);
        drawnItems.removeLayer(lastLayer);
    }
    addToolbar();
});

loadZones();

var lastLayer = undefined;

var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    osm = L.tileLayer(osmUrl, {
        maxZoom: 18,
        attribution: osmAttrib
    }),
    map = new L.Map('map', {
        center: new L.LatLng(41.648, -0.889),
        zoom: 14
    }),
    drawnItems = L.featureGroup().addTo(map);

osm.addTo(map);

var drawControlFull = new L.Control.Draw({
    position: 'topright',
    edit: {
        featureGroup: drawnItems,
        poly: {
            allowIntersection: false
        }
    },
    draw: {
        polygon: {
            allowIntersection: false
        },
        polyline: false,
        circle: false, // Turns off this drawing tool
        rectangle: false,
        marker: false,
        circlemarker: false,
    }
});

var drawControlEdit = new L.Control.Draw({
    position: 'topright',
    edit: {
        featureGroup: drawnItems,
        poly: {
            allowIntersection: false
        }
    },
    draw: false
});

var drawControlNone = new L.Control.Draw({
    edit: false,
    draw: false
});

map.addControl(drawControlFull);

//map.on('click', onMapClick);

map.on("draw:created", function(event) {
    var layer = event.layer;

    drawnItems.addLayer(layer);
    //No allow more creation
    drawControlFull.remove(map);
    drawControlEdit.addTo(map);
    elementCreated(layer);
    lastLayer = layer;
});

map.on("draw:deleted", function(event) {
    addToolbar();
});