/************************************ FUNCTIONS APP *******************************************************/

/* FUNCTION GENERALES DE LA APP */
//isLogin
function isLogin(){
    var res = false;
    var cookie_user = $.parseJSON(readCookie("user"));
    if(cookie_user !== null){
        res = true;
        COOKIE = cookie_user;
    }else{
        REDIREC_TO = window.location.href;
    }
    return res;
}

//Abrimos el enlace en un navegador del sistema (IOS|ANDROID)
//target: the target to load the URL in (String) (Optional, Default: "_self")
//_self - opens in the Cordova WebView if url is in the white-list, else it opens in the InAppBrowser 
//_blank - always open in the InAppBrowser 
//_system - always open in the system web browser/
function openOnWindow(element, target){
	element.find('a').bind("click", function() {
	   window.open($(this).attr('href') , target );
	   return false;
	});
}

//fixea el error que hay cuando se selecciona un elemento del selector
function fixedSelector(form_id, element_selector){
    var selector_deporte = jQuery('#'+form_id).find("#" +element_selector);
    var opcion_selected = selector_deporte.find("option:selected").html();
    var element = selector_deporte.prev(".ui-btn-inner").find(".ui-btn-text").find("span");
    element.removeClass()
    element.addClass("valid")
    element.text(opcion_selected);
    element.show();
}

/*EVENTOS QUE SE LANZAN AL MOMENTO DE CAMBIAR DE LANSCAPE A PORTRAIT O VICEVERSA*/
/*orientation:puede ser landscape o portrait*/
/*page_id:el id de la pagina actual en el que se realizo el movimiento*/
function callbackOrientationChange(orientation, page_id){
    if(page_id == "index"){
        var parent = $("#"+page_id);
        if(orientation == "landscape"){
            parent.find(".ui-footer p").css("width","120%");
        }else if(orientation == "portrait"){
            parent.find(".ui-footer p").css("width","180%");
        }
    }
}

//registramos el dispositivo solo si no fue registrado
function registerNewDevice(){
    
    $.ajax({
        data: {device_plataforma:device.platform, device_version:device.version, device_uuid:device.uuid, token_notificacion:PUSH_NOTIFICATION_TOKEN},
        type: "POST",
        url: BASE_URL_APP + 'usuarios/mobileNewRegistro',
        dataType: "html",
        success: function(data){
            data = $.parseJSON(data);
            var success = data.success;
            if(success){
                //una vez creado guardamos en cookies su datos importantes
                createCookie("user", JSON.stringify(data.usuario.Usuario), 365);
                REGISTER_PUSH_NOTIFICATION_TOKEN = true;
            }
        }
    });
}

//MOSTRAMOS EL GOOGLE MAP
function showGoogleMap(latitud, longitud) {
    var map;
    var marcador;
    if(latitud != "" && longitud != ""){
        var latlng = new google.maps.LatLng(latitud, longitud);
        var myOptions = {
          zoom: 16,
          center: latlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          zoomControl: true
        };
        map = new google.maps.Map(document.getElementById("map_canvas"),myOptions);
        marcador = new google.maps.Marker({position: latlng, map: map});
        // Enable the visual refresh
        google.maps.visualRefresh = true;
        setTimeout(function(){
            google.maps.event.trigger(map, 'resize');
        },200);
    }
}

//showNotification
function showNotification(event, type){
    var message = type == "android" ? event.message : event.alert;
    var seccion = type == "android" ? event.payload.seccion : event.seccion;
    var seccion_id = type == "android" ? event.payload.seccion_id : event.seccion_id;
    
    navigator.notification.alert(
        message,
        function(){
            redirectToPage(seccion, seccion_id);
        },
        "Alert",
        "Aceptar"
    );
}

//redirectToPage
function redirectToPage(seccion, id){
    var page = "";
    if(seccion == "agencia"){
        page = "agencias.html?id="+ZONA_ID;
        if(id != ""){
            page = "agencia_descripcion.html?id="+id;
        }        
    }else if(seccion == "escort"){
        page = "home.html?id="+ZONA_ID;
        if(id != ""){
            page = "escort_descripcion.html?id="+id;
        }
    }else if(seccion == "promo"){
        page = "promos.html?id="+ZONA_ID;
        if(id != ""){
            page = "promo_descripcion.html?id="+id;
        }
    }
    
    if(seccion != ""){
        setTimeout(function(){
            $.mobile.changePage(page);
        },200);
    }else{
        //TODO
    }
}

function showAlertEdad(usuario_id, page_id){
    navigator.notification.confirm(
        "Pulsa Ok para confirmar que tienes al menos 18 a\u00F1os. Tu contenido espezar\u00E1 a descargarse inmediatamente.", // message
        function(buttonIndex){
            //1:aceptar,2:cancelar
            if(buttonIndex == 1){
                showLoadingCustom('Guardando datos...');
                
            	$.getJSON(BASE_URL_APP + 'usuarios/mobileSetAdulto/'+usuario_id+'/1', function(data) {
                    
                    if(data){
                        //ocultamos loading
                        $.mobile.loading( 'hide' );
                        
                        if(data.success){
                            //re-escribimos la cookie con el nuevo valor
                            reWriteCookie("user","adulto",data.valor);
                            
                            //si el tiene mayoria de edad mostramos el contenido
                            var parent = $("#"+page_id);
                            parent.find(".ui-content").fadeIn('slow');
                        }else{
                            showAlert(data.mensaje, "Error", "Aceptar");
                        }
                    }
            	});
            }else{
                $.getJSON(BASE_URL_APP + 'usuarios/mobileSetAdulto/'+usuario_id+'/2', function(data) {});
            }
        },            // callback to invoke with index of button pressed
    'Bunny Finder contiene material s\u00F3lo para adultos.',           // title
    'Ok,Cancelar'         // buttonLabels
    );
}

function parrafo(element, init){
    var left = init ? "0px" : element.parent().width() + "px";
    element.css("left",left);
    element.animate({ "left" : - (element.parent().width() + 180) + "px"}, 10000, function(){
        parrafo(element, false);
    });
}