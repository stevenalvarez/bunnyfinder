
/************************************ BIND EVENT *******************************************************/

$(document).bind('pagebeforecreate', function(event){
    var page_id = event.target.id;
});

$(document).bind('pagecreate', function(event){
    var page_id = event.target.id;
});

$(document).bind('pageinit', function(event){
    var page_id = event.target.id;
});

$(document).bind('pageshow', function(event, ui) {
    //verificamos si esta logeado sino lo esta logeamos automaticamente al usuario
    if(!isLogin() && PUSH_NOTIFICATION_TOKEN != 0){
        registerNewDevice();
    }
    
    var page_id = event.target.id;
    var page = $("#" + $.mobile.activePage.attr('id'));
    page.find(".ui-footer ul").find("a.nav_escorts").attr("href","escorts.html?id="+CATEGORIA_ID);
    page.find(".ui-footer ul").find("a.nav_agencias").attr("href","agencias.html?id="+ZONA_ID);
    page.find(".ui-footer ul").find("a.nav_promos").attr("href","promos.html?id="+ZONA_ID);
    
    //inicializamos la ubicacion
    getLocationGPS();
    
    //mostramos alert de mayor de edad
    //0:por defecto,1:es aduto,2: no es adulto
    if(page_id == "index"){
        
        var parent = $("#"+page_id);
        if(isLogin()){
            var user = COOKIE;
            var adulto = user.adulto;
            if(adulto != 0 && adulto == 1){
                //si el tiene mayoria de edad mostramos el contenido
                parent.find(".ui-content").fadeIn('slow');
            }else if(adulto == 2){
                parent.find(".ui-content").hide();
            }
        }else{
            var interval = setInterval(function(){
                if(isLogin()){
                    $.mobile.loading( 'hide' );
                    clearInterval(interval);
                    
                    var user = COOKIE;
                    var adulto = user.adulto;
                    if(adulto == 0){
                        showAlertEdad(user.id, page_id);
                    }else if(adulto == 1){
                        //si el tiene mayoria de edad mostramos el contenido
                        parent.find(".ui-content").fadeIn('slow');
                    }
                }else{
                    showLoadingCustom('Espere por favor...');
                }
            },200);
        }
    }
    
});

/************************************ EVENTOS *******************************************************/

//HOME
$('#home').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    ZONA_ID = getUrlVars()["id"];
    getCategorias(page_id);
});

//ESCORTS
$('#escorts').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    CATEGORIA_ID = getUrlVars()["id"];
    //si en undefined verificamos su url, para el redirect automatico
    if(CATEGORIA_ID == undefined) CATEGORIA_ID = getUrl($(ui.prevPage).context.baseURI)["id"];
    getEscorts(page_id, CATEGORIA_ID);
});

//ESCORT DESCRIPCION
$('#escort_descripcion').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    var id = getUrlVars()["id"];
    //si en undefined verificamos su url, para el redirect automatico
    if(id == undefined) id = getUrl($(ui.prevPage).context.baseURI)["id"];
    getEscortById(page_id, id);
});

//PROMOS
$('#promos').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    ZONA_ID = getUrlVars()["id"];
    //si en undefined verificamos su url, para el redirect automatico
    if(ZONA_ID == undefined) ZONA_ID = getUrl($(ui.prevPage).context.baseURI)["id"];
    getPromos(page_id, ZONA_ID);
});

//PROMO DESCRIPCION
$('#promo_descripcion').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    var id = getUrlVars()["id"];
    //si en undefined verificamos su url, para el redirect automatico
    if(id == undefined) id = getUrl($(ui.prevPage).context.baseURI)["id"];
    getPromoById(page_id, id);
});

//AGENCIAS
$('#agencias').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    ZONA_ID = getUrlVars()["id"];
    //si en undefined verificamos su url, para el redirect automatico
    if(ZONA_ID == undefined) ZONA_ID = getUrl($(ui.prevPage).context.baseURI)["id"];
    getAgencias(page_id, ZONA_ID);
});

//AGENCIA DESCRIPCION
$('#agencia_descripcion').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    var id = getUrlVars()["id"];
    //si en undefined verificamos su url, para el redirect automatico
    if(id == undefined) id = getUrl($(ui.prevPage).context.baseURI)["id"];
    getAgenciaById(page_id, id);
});

//CERCA DE TI
$('#cerca_de_ti').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    getEscortsByDistance(page_id);
});

//GOOGLE MAP
$('#google_map').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    showGoogleMap(getUrlVars()["latitud"],getUrlVars()["longitud"]);
});

//PARTICIPAR
$('#participar').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    getParticiparById(page_id, getUrlVars()["id"]);
});

//SETTING
$('#setting').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    setSetting(page_id);
});

/************************************ FUNCTIONS *******************************************************/

//OBTENEMOS LAS CATEGORIAS
function getCategorias(parent_id) {
    var parent = $("#"+parent_id);
    var container = parent.find(".ui-listview");
    container.find("li.clone").remove();
    
    parent.find(".ui-content").hide();
	
    $.getJSON(BASE_URL_APP + 'categorias/mobileGetCategorias', function(data) {
        if(data){
            
            //mostramos loading
            $.mobile.loading('show');
            
    		items = data.items;
    		$.each(items, function(index, item) {
    		    var imagen = item.Categoria.imagen!=""?item.Categoria.imagen:"default.png";
                var clone = container.find('li:first').clone(true);
                clone.css("background","url('"+BASE_URL_APP+"img/categorias/"+imagen+"')  no-repeat scroll top center transparent");
                clone.css("background-position","0 -35px");
                clone.css("background-size","100% auto");
                clone.find("a").attr("href", "escorts.html?id=" + item.Categoria.id);
                clone.find("a").find(".ui-btn-text").html(item.Categoria.title);
                clone.css("display","block");
                clone.addClass("clone");
                
                //append container
                container.append(clone);
    		});
            
            container.promise().done(function() {
                //ocultamos loading
                $.mobile.loading( 'hide' );
                parent.find(".ui-content").fadeIn("slow");
            });
        }
	});
}

//OBTENEMOS LOS ESCORTS
function getEscorts(parent_id, categoria_id){
    var parent = $("#"+parent_id);
    var container = parent.find("#carrousel_escorts");
    container.find('.m-item').remove();
    container.find(".m-carousel-controls > a").remove();
    
    parent.find(".ui-content").hide();
    
    $.getJSON(BASE_URL_APP + 'escorts/mobileGetEscorts/'+categoria_id+"/"+ZONA_ID+"/"+LATITUDE+"/"+LONGITUDE, function(data) {
        
        if(data){
            //mostramos loading
            $.mobile.loading( 'show' );
            
    		items = data.items;
            if(items.length){
        		$.each(items, function(index, item) {
                    
               	    var imagen = item.Escort.imagen!=""?item.Escort.imagen:"default.png";
               	    var mclass = ""; 
               	    if(index == 0) mclass = "m-active";
                    var html='<div class="m-item '+mclass+'">' +
                        '<div class="container-top">' +
                            '<img src="'+BASE_URL_APP+'img/escorts/thumbnails/' + imagen + '"/>' +
                        '</div>' +
                        '<div class="container-bottom">' +
                            '<div class="left">' +
                                '<h2>' +
                                    '<a href="escort_descripcion.html?id='+item.Escort.id+'">'+item.Escort.title+'</a>' +
                                '</h2>' +
                            '</div>' +
                            '<div class="right">' +
                                '<p class="km">';
                                //si esta menos de 1km le mostramos la distancia en metros en la cual se encuentra
                                if(parseInt(item.Escort.kilomentros) < 1){
                                    html+=parseFloat(item.Escort.metros).toFixed(2)+'M';
                                }else{
                                    html+=parseFloat(item.Escort.kilomentros).toFixed(2)+'KM';
                                }                                
                                html+='</p>' +
                                '<p class="euro">'+item.Escort.precio+'<b>&euro;</b></p>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
                    
               	    container.find(".m-carousel-inner").append(html);
                    container.find(".m-carousel-controls").append('<a href="#" data-slide="'+(index+1)+'">'+(index+1)+'</a>');
        		});
                
                //iniciamos el carousel
                container.find(".m-carousel-inner").promise().done(function() {
                    //iniciamos el carrousel
                    container.carousel();
                    
                    //ocultamos loading
                    $.mobile.loading( 'hide' );
                    parent.find(".ui-content").fadeIn("slow");
                });
            }else{
                //ocultamos loading
                $.mobile.loading( 'hide' );
                parent.find(".ui-content").fadeIn("slow");
            }
        }
	}); 
}

//OBTENEMOS EL ESCORT SEGUN EL ID
function getEscortById(parent_id, escort_id){
    var parent = $("#"+parent_id);
    var container = parent.find("#carrousel_escort_descripcion");
    container.find('.m-item').remove();
    container.find(".m-carousel-controls > a").remove();
    
    parent.find(".ui-content").hide();
        
	$.getJSON(BASE_URL_APP + 'escorts/mobileGetEscortById/'+escort_id+'/'+LATITUDE+'/'+LONGITUDE, function(data) {
        
        if(data){
            //mostramos loading
            $.mobile.loading( 'show' );
            
            var escort = data.item.Escort;
            var escort_fotos = data.item.EscortsFoto;
            var promo = data.item.Promo;
            var pais = data.item.Pais;
           	$.each(escort_fotos, function(index, escort_foto) {
           	    var imagen = escort_foto.imagen!=""?escort_foto.imagen:"default.png";
           	    var mclass = ""; 
           	    if(index == 0) mclass = "m-active";
                var html='<div class="m-item '+mclass+'">' +
                    '<div data-role="navbar" data-corners="false" class="ui-navbar ui-mini" role="navigation">' +
                        '<ul class="ui-grid-b">' +
                            '<li class="ui-block-a">' +
                                '<a href="#" data-slide="prev" data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="span" data-theme="a" data-inline="true" class="ui-btn ui-btn-inline ui-btn-up-a"><span class="ui-btn-inner"><span class="ui-btn-text">previous</span></span></a>' +
                            '</li>' +
                            '<li class="ui-block-b">&nbsp;</li>' +
                            '<li class="ui-block-c">' +
                                '<a href="#" data-slide="next" data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="span" data-theme="a" data-inline="true" class="ui-btn ui-btn-up-a ui-btn-inline"><span class="ui-btn-inner"><span class="ui-btn-text">next</span></span></a>' +
                            '</li>' +
                        '</ul>' +
                    '</div>' +
                    '<img src="'+BASE_URL_APP+'img/escorts/' + imagen + '">' +
                '</div>';
                
           	    container.find(".m-carousel-inner").append(html);
                container.find(".m-carousel-controls").append('<a href="#" data-slide="'+(index+1)+'">'+(index+1)+'</a>');
            });
            
            //llenamos los datos
            parent.find(".page h2").html(escort.title);
            parent.find(".texto_descripcion").html(escort.descripcion);
            parent.find(".precio").html(escort.precio);
            parent.find(".pais").html(pais.nombre);
            parent.find(".edad").html(escort.edad+" a&ntilde;os");
            parent.find(".tono_piel").html(escort.tono_piel);
            parent.find(".info_viaje").html(escort.disponibilidad);
            parent.find(".info_idioma").html(escort.idiomas);
            parent.find(".info_besos").html(escort.besos);
            parent.find(".info_atiende").html(escort.atiende);
            
            //si esta menos de 1km le mostramos la distancia en metros en la cual se encuentra
            if(parseInt(escort.kilomentros) < 1){
                parent.find(".km").html(parseFloat(escort.metros).toFixed(2)+'m');
            }else{
                parent.find(".km").html(parseFloat(escort.kilomentros).toFixed(2)+'km');
            }
            
            var telefonos = (escort.telefono).split("-");
            
            //llamar
            parent.find(".llamar a").attr("href","tel:"+$.trim(telefonos[0]));
            
            //mapa
            parent.find(".map a").attr("href","google_map.html?latitud="+escort.latitud+"&longitud="+escort.longitud);
            
            //web
            if(escort.web != null && escort.web != ""){
                parent.find(".web a").attr("href",escort.web);
                parent.find(".web a").attr("onclick", "window.open(this.href,'_system'); return false;");
            }
            
            //promo
            if(promo.length > 0){
                //siempre sacamos el primero por mas que haiga mil
                var promo_id = promo[0]['id'];
                parent.find(".promo a").attr("href","promo_descripcion.html?id="+promo_id);
            }            
            
            //iniciamos el carousel
            container.find(".m-carousel-inner").promise().done(function() {
                //iniciamos el carrousel
                container.carousel();
                
                //ocultamos loading
                $.mobile.loading( 'hide' );
                parent.find(".ui-content").fadeIn("slow");
            });
        }
	});
}

//OBTENEMOS LOS ESCORTS POR DISTANCIA
function getEscortsByDistance(parent_id){
    var parent = $("#"+parent_id);
    var container = parent.find("#carrousel_cerca_de_ti");
    container.find('.m-item').remove();
    container.find(".m-carousel-controls > a").remove();
    
    parent.find(".ui-content").hide();
    
    $.getJSON(BASE_URL_APP + 'escorts/mobileGetEscortsByDistance/'+LATITUDE+"/"+LONGITUDE, function(data) {
        
        if(data){
            //mostramos loading
            $.mobile.loading( 'show' );
            
    		items = data.items;
            if(items.length){
        		$.each(items, function(index, item) {
                    
               	    var imagen = item.Escort.imagen!=""?item.Escort.imagen:"default.png";
               	    var mclass = ""; 
               	    if(index == 0) mclass = "m-active";
                    var html='<div class="m-item '+mclass+'">' +
                        '<div class="container-top">' +
                            '<img src="'+BASE_URL_APP+'img/escorts/thumbnails/' + imagen + '"/>' +
                        '</div>' +
                        '<div class="container-bottom">' +
                            '<div class="left">' +
                                '<h2>' +
                                    '<a href="escort_descripcion.html?id='+item.Escort.id+'">'+item.Escort.title+'</a>' +
                                '</h2>' +
                            '</div>' +
                            '<div class="right">' +
                                '<p class="km">';
                                //si esta menos de 1km le mostramos la distancia en metros en la cual se encuentra
                                if(parseInt(item.Escort.kilomentros) < 1){
                                    html+=parseFloat(item.Escort.metros).toFixed(2)+'M';
                                }else{
                                    html+=parseFloat(item.Escort.kilomentros).toFixed(2)+'KM';
                                }                                
                                html+='</p>' +
                                '<p class="euro">'+item.Escort.precio+'<b>&euro;</b></p>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
                    
               	    container.find(".m-carousel-inner").append(html);
                    container.find(".m-carousel-controls").append('<a href="#" data-slide="'+(index+1)+'">'+(index+1)+'</a>');
        		});
                
                //iniciamos el carousel
                container.find(".m-carousel-inner").promise().done(function() {
                    //iniciamos el carrousel
                    container.carousel();
                    
                    //ocultamos loading
                    $.mobile.loading( 'hide' );
                    parent.find(".ui-content").fadeIn("slow");
                });
            }else{
                //ocultamos loading
                $.mobile.loading( 'hide' );
                parent.find(".ui-content").fadeIn("slow");
            }
        }
	}); 
}

//OBTENEMOS LAS PROMOS
function getPromos(parent_id, zona_id){
    var parent = $("#"+parent_id);
    var container = parent.find("#carrousel_promos");
    container.find('.m-item').remove();
    container.find(".m-carousel-controls > a").remove();
    
    parent.find(".ui-content").hide();
    
    $.getJSON(BASE_URL_APP + 'promos/mobileGetPromos/'+zona_id, function(data) {
        
        if(data){
            //mostramos loading
            $.mobile.loading( 'show' );
            
    		items = data.items;
            if(items.length){
        		$.each(items, function(index, item) {
                    
               	    var imagen = item.imagen!=""?item.imagen:"default.png";
               	    var mclass = ""; 
               	    if(index == 0) mclass = "m-active";
                    var html='<div class="m-item '+mclass+'">' +
                        '<div class="container-top">' +
                            '<img src="'+BASE_URL_APP+'img/promos/thumbnails/' + imagen + '"/>' +
                        '</div>' +
                        '<div class="container-bottom">' +
                            '<h2>' +
                                '<a href="promo_descripcion.html?id='+item.id+'">'+item.title+'</a>' +
                            '</h2>' +
                        '</div>' +
                    '</div>';
                    
               	    container.find(".m-carousel-inner").append(html);
                    container.find(".m-carousel-controls").append('<a href="#" data-slide="'+(index+1)+'">'+(index+1)+'</a>');
        		});
                
                //iniciamos el carousel
                container.find(".m-carousel-inner").promise().done(function() {
                    //iniciamos el carrousel
                    container.carousel();
                    
                    //ocultamos loading
                    $.mobile.loading( 'hide' );
                    parent.find(".ui-content").fadeIn("slow");
                });
            }else{
                //ocultamos loading
                $.mobile.loading( 'hide' );
                parent.find(".ui-content").fadeIn("slow");
            }
        }
	}); 
}

//OBTENEMOS LA PROMO SEGUN EL ID
function getPromoById(parent_id, promo_id){
    var parent = $("#"+parent_id);
    var container = parent.find("#carrousel_promo_descripcion");
    container.find('.m-item').remove();
    container.find(".m-carousel-controls > a").remove();
    
    parent.find(".ui-content").hide();
        
	$.getJSON(BASE_URL_APP + 'promos/mobileGetPromoById/'+promo_id, function(data) {
        
        if(data){
            //mostramos loading
            $.mobile.loading( 'show' );
            
            var promo = data.item.Promo;
            var promo_fotos = data.item.PromosFoto;
            var extra = data.item.Extra;
           	$.each(promo_fotos, function(index, promo_foto) {
           	    var imagen = promo_foto.imagen!=""?promo_foto.imagen:"default.png";
           	    var mclass = ""; 
           	    if(index == 0) mclass = "m-active";
                var html='<div class="m-item '+mclass+'">' +
                    '<div data-role="navbar" data-corners="false" class="ui-navbar ui-mini" role="navigation">' +
                        '<ul class="ui-grid-b">' +
                            '<li class="ui-block-a">' +
                                '<a href="#" data-slide="prev" data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="span" data-theme="a" data-inline="true" class="ui-btn ui-btn-inline ui-btn-up-a"><span class="ui-btn-inner"><span class="ui-btn-text">previous</span></span></a>' +
                            '</li>' +
                            '<li class="ui-block-b">&nbsp;</li>' +
                            '<li class="ui-block-c">' +
                                '<a href="#" data-slide="next" data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="span" data-theme="a" data-inline="true" class="ui-btn ui-btn-up-a ui-btn-inline"><span class="ui-btn-inner"><span class="ui-btn-text">next</span></span></a>' +
                            '</li>' +
                        '</ul>' +
                    '</div>' +
                    '<img src="'+BASE_URL_APP+'img/promos/' + imagen + '">' +
                '</div>';
                
           	    container.find(".m-carousel-inner").append(html);
                container.find(".m-carousel-controls").append('<a href="#" data-slide="'+(index+1)+'">'+(index+1)+'</a>');
            });
            
            //llenamos los datos
            parent.find(".page h2").html(promo.title);
            parent.find(".texto_descripcion").html(promo.descripcion);
            
            var telefonos = (extra.telefono).split("-");
            
            //llamar
            parent.find(".llamar a").attr("href","tel:"+$.trim(telefonos[0]));
            
            //mapa
            parent.find(".map a").attr("href","google_map.html?latitud="+extra.latitud+"&longitud="+extra.longitud);
            
            //web
            if(extra.web != null && extra.web != ""){
                parent.find(".web a").attr("href",extra.web);
                parent.find(".web a").attr("onclick", "window.open(this.href,'_system'); return false;");
            }
            
            //iniciamos el carousel
            container.find(".m-carousel-inner").promise().done(function() {
                //iniciamos el carrousel
                container.carousel();
                
                //ocultamos loading
                $.mobile.loading( 'hide' );
                parent.find(".ui-content").fadeIn("slow");
            });
        }
	});
}

//OBTENEMOS LAS AGENCIAS
function getAgencias(parent_id, zona_id){
    var parent = $("#"+parent_id);
    var container = parent.find("#carrousel_agencias");
    container.find('.m-item').remove();
    container.find(".m-carousel-controls > a").remove();
    
    parent.find(".ui-content").hide();
    
    $.getJSON(BASE_URL_APP + 'agencias/mobileGetAgencias/'+zona_id+"/"+LATITUDE+"/"+LONGITUDE, function(data) {
        
        if(data){
            //mostramos loading
            $.mobile.loading( 'show' );
            
    		items = data.items;
            if(items.length){
        		$.each(items, function(index, item) {
                    
               	    var imagen = item.Agencia.imagen!=""?item.Agencia.imagen:"default.png";
               	    var mclass = ""; 
               	    if(index == 0) mclass = "m-active";
                    var html='<div class="m-item '+mclass+'">' +
                        '<div class="container-top">' +
                            '<img src="'+BASE_URL_APP+'img/agencias/thumbnails/' + imagen + '"/>' +
                        '</div>' +
                        '<div class="container-bottom">' +
                            '<div class="left">' +
                                '<h2>' +
                                    '<a href="agencia_descripcion.html?id='+item.Agencia.id+'">'+item.Agencia.title+'</a>' +
                                '</h2>' +
                            '</div>' +
                            '<div class="right">' +
                                '<p class="km">';
                                //si esta menos de 1km le mostramos la distancia en metros en la cual se encuentra
                                if(parseInt(item.Agencia.kilomentros) < 1){
                                    html+=parseFloat(item.Agencia.metros).toFixed(2)+'M';
                                }else{
                                    html+=parseFloat(item.Agencia.kilomentros).toFixed(2)+'KM';
                                }                                
                                html+='</p>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
                    
               	    container.find(".m-carousel-inner").append(html);
                    container.find(".m-carousel-controls").append('<a href="#" data-slide="'+(index+1)+'">'+(index+1)+'</a>');
        		});
                
                //iniciamos el carousel
                container.find(".m-carousel-inner").promise().done(function() {
                    //iniciamos el carrousel
                    container.carousel();
                    
                    //ocultamos loading
                    $.mobile.loading( 'hide' );
                    parent.find(".ui-content").fadeIn("slow");
                });
            }else{
                //ocultamos loading
                $.mobile.loading( 'hide' );
                parent.find(".ui-content").fadeIn("slow");
            }
        }
	}); 
}

//OBTENEMOS LA AGENCIA SEGUN EL ID
function getAgenciaById(parent_id, agencia_id){
    var parent = $("#"+parent_id);
    var container = parent.find("#carrousel_agencia_descripcion");
    container.find('.m-item').remove();
    container.find(".m-carousel-controls > a").remove();
    
    parent.find(".ui-content").hide();
        
	$.getJSON(BASE_URL_APP + 'agencias/mobileGetAgenciaById/'+agencia_id+'/'+LATITUDE+'/'+LONGITUDE, function(data) {
        
        if(data){
            //mostramos loading
            $.mobile.loading( 'show' );
            
            var agencia = data.item.Agencia;
            var agencia_fotos = data.item.AgenciasFoto;
            var promo = data.item.Promo;
           	$.each(agencia_fotos, function(index, agencia_foto) {
           	    var imagen = agencia_foto.imagen!=""?agencia_foto.imagen:"default.png";
           	    var mclass = ""; 
           	    if(index == 0) mclass = "m-active";
                var html='<div class="m-item '+mclass+'">' +
                    '<div data-role="navbar" data-corners="false" class="ui-navbar ui-mini" role="navigation">' +
                        '<ul class="ui-grid-b">' +
                            '<li class="ui-block-a">' +
                                '<a href="#" data-slide="prev" data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="span" data-theme="a" data-inline="true" class="ui-btn ui-btn-inline ui-btn-up-a"><span class="ui-btn-inner"><span class="ui-btn-text">previous</span></span></a>' +
                            '</li>' +
                            '<li class="ui-block-b">&nbsp;</li>' +
                            '<li class="ui-block-c">' +
                                '<a href="#" data-slide="next" data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="span" data-theme="a" data-inline="true" class="ui-btn ui-btn-up-a ui-btn-inline"><span class="ui-btn-inner"><span class="ui-btn-text">next</span></span></a>' +
                            '</li>' +
                        '</ul>' +
                    '</div>' +
                    '<img src="'+BASE_URL_APP+'img/agencias/' + imagen + '">' +
                '</div>';
                
           	    container.find(".m-carousel-inner").append(html);
                container.find(".m-carousel-controls").append('<a href="#" data-slide="'+(index+1)+'">'+(index+1)+'</a>');
            });
            
            //llenamos los datos
            parent.find(".page h2").html(agencia.title);
            parent.find(".texto_descripcion").html(agencia.descripcion);
            
            //si esta menos de 1km le mostramos la distancia en metros en la cual se encuentra
            if(parseInt(agencia.kilomentros) < 1){
                parent.find(".km").html(parseFloat(agencia.metros).toFixed(2)+'m');
            }else{
                parent.find(".km").html(parseFloat(agencia.kilomentros).toFixed(2)+'km');
            }
            
            var telefonos = (agencia.telefono).split("-");
            
            //llamar
            parent.find(".llamar a").attr("href","tel:"+$.trim(telefonos[0]));
            
            //mapa
            parent.find(".map a").attr("href","google_map.html?latitud="+agencia.latitud+"&longitud="+agencia.longitud);
            
            //web
            if(agencia.web != null && agencia.web != ""){
                parent.find(".web a").attr("href",agencia.web);
                parent.find(".web a").attr("onclick", "window.open(this.href,'_system'); return false;");
            }
            
            //promo
            if(promo.length > 0){
                //siempre sacamos el primero por mas que haiga mil
                var promo_id = promo[0]['id'];
                parent.find(".promo a").attr("href","promo_descripcion.html?id="+promo_id);
            }            
            
            //iniciamos el carousel
            container.find(".m-carousel-inner").promise().done(function() {
                //iniciamos el carrousel
                container.carousel();
                
                //ocultamos loading
                $.mobile.loading( 'hide' );
                parent.find(".ui-content").fadeIn("slow");
            });
        }
	});
}

//OBTENEMOS PARTICIPAR POR SU ID
function getParticiparById(parent_id, participar_id){
    var parent = $("#"+parent_id);
    var container = parent.find(".content_details");
    parent.find(".ui-content").hide();
    
    $.getJSON(BASE_URL_APP + 'sistemas/mobileGetParticiparById/'+participar_id, function(data) {
        if(data){
            
            //mostramos loading
            $.mobile.loading('show');
    		item = data.item;
            
            container.find("a .ui-btn-text").html(item.Sistema.title);
            container.find("p").html(item.Sistema.descripcion);
            
            container.promise().done(function() {
                //ocultamos loading
                $.mobile.loading( 'hide' );
                parent.find(".ui-content").fadeIn("slow");
            });
        }
	});
}

//HABILITAMOS/DESHABILITAMOS RECIBIR ALERTAS
function setSetting(parent_id){
    var parent = $("#"+parent_id);
    var recibir_alertas = 0;
    
    if(isLogin()){
        var user = COOKIE;
        recibir_alertas = user.recibir_alertas;
                
        if(recibir_alertas == "" || recibir_alertas == 0){
            parent.find(".recibir_alertas").find(".ui-btn-text").html("Recibir alertas");
        }
        
        //recibir/dejar de recibir alertas
        parent.find(".recibir_alertas").unbind("touchstart").bind("touchstart", function(){
            
            if(recibir_alertas == 1){
                navigator.notification.confirm(
                    "Estas seguro que quieres dejar de recibir alertas?", // message
                    function(buttonIndex){
                        //1:aceptar,2:cancelar
                        if(buttonIndex == 1){
                            showLoadingCustom('Espere por favor...');
                            
                            var me = user.id;
                            
                        	$.getJSON(BASE_URL_APP + 'usuarios/mobileSetAlerta/'+me, function(data) {
                                
                                if(data){
                                    //ocultamos loading
                                    $.mobile.loading( 'hide' );
                                    
                                    if(data.success){
                                        recibir_alertas = data.recibir_alertas;
                                        parent.find(".recibir_alertas").find(".ui-btn-text").html("Recibir alertas");
                                        //re-escribimos la cookie con el nuevo recibir_alertas
                                        reWriteCookie("user","recibir_alertas",data.recibir_alertas);
                                        showAlert(data.mensaje, "Aviso", "Aceptar");
                                    }else{
                                        showAlert(data.mensaje, "Error", "Aceptar");
                                    }
                                }
                        	});
                        }
                    },            // callback to invoke with index of button pressed
                'Salir',           // title
                'Aceptar,Cancelar'         // buttonLabels
                );
            
            }else{
                showLoadingCustom('Espere por favor...');
                
                var me = user.id;
                
            	$.getJSON(BASE_URL_APP + 'usuarios/mobileSetAlerta/'+me, function(data) {
                    
                    if(data){
                        //ocultamos loading
                        $.mobile.loading( 'hide' );
                        
                        if(data.success){
                            recibir_alertas = data.recibir_alertas;
                            parent.find(".recibir_alertas").find(".ui-btn-text").html("Dejar de recibir alertas");
                            //re-escribimos la cookie con el nuevo recibir_alertas
                            reWriteCookie("user","recibir_alertas",data.recibir_alertas);
                            showAlert(data.mensaje, "Aviso", "Aceptar");
                        }else{
                            showAlert(data.mensaje, "Error", "Aceptar");
                        }
                    }
            	});
            }
        });
    }
}