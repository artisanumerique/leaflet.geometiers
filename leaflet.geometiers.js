
///////////////////////////////////////////////////////////////////////////////////////////////////////
/// leaflet.geometiers.js
function number_format(number, decimals, dec_point, thousands_sep) {
        number = (number+'').replace(',', '').replace(' ', '');
        var n = !isFinite(+number) ? 0 : +number, 
            prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
            sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
            dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
            s = '',
            toFixedFix = function (n, prec) {
                var k = Math.pow(10, prec);
                return '' + Math.round(n * k) / k;
            };
        // Fix for IE parseFloat(0.55).toFixed(0) = 0;
        s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
        }
        if ((s[1] || '').length < prec) {
            s[1] = s[1] || '';
            s[1] += new Array(prec - s[1].length + 1).join('0');
        }
        return s.join(dec);
}


function format(inte){
        var inte = inte.toString();
        var inte = inte.replace('.',',');   
        if(inte.charAt(3)!=''){
            inte = inte.slice(0,inte.length-3) + ' ' + inte.slice(inte.length-3,inte.length) 
        }   
        return(inte);
}


var Legende = L.Control.extend({
    
    options: {
        position: 'bottomleft'
    },

    
    initialize: function (options) {
        L.Util.setOptions(this, options);
    },

    reverseArr: function (input) {
        var ret = new Array;
        for(var i = input.length-1; i >= 0; i--) {
            ret.push(input[i]);
        }
        return ret;
    },
    
          
    onAdd: function (map) {     
        jQuery("div.legend" ).remove();
        
        // create the control container with a particular class name
        var div =  L.DomUtil.create('div', 'legend');
        var color  =  this.options.couleurs.palette;
        var grades =  this.options.couleurs.grades;
        
        var npalette = color.slice(-grades.length);
        var html = new Array();
        
        i=0;
        src = "";
        src2 = "";
      
        var densiteh = this.options.couleurs.densiteh;
        var evolcreation = 0;
        var sep = ' - ';
       
        //cas pour filtre densité habitants
        /*if(($('#densite').is(':visible')) && ($('#densite select option:selected').val() == 'densiteh'))
            densiteh = 1;
        else if(($('#suggestion').is(':visible')) && ($('#suggestion select option:selected').val() == 'evolcreation'))
            sep = ' / ';*/

        //cas pas de classe 
        var i = grades.length - 1;
        
        if(grades.length < 5){          
            if(densiteh){
                var j=0;
                for(i;i>=0;i--,j++){
                        src = '<span style="background:'+npalette[j]+'"></span>';
                        src2 = '<label>' + format(grades[i]) + '</label>';
                        html.push({label:src2,couleur:src});
                    }  
            }
            else{
                for(i; i >= 0; i--){
                    src = '<span style="background:' + npalette[i] + '"></span>';
                    src2 = '<label>' + format(grades[i]) + '</label>';
                    
                    html.push({label:src2,couleur:src});
            }}
        }
        else{
            if(densiteh){
                  var j=0;
                  for(i; i > 0; i--, j++){
                      //si pas d'artisan   && grades[i-1] != 0   && i!=1
                      /*
                      if(grades[i] == 0 ){
                          alert(i);
                          alert(grades[i]);
                          src += '<span style="background:white"></span>';
                          src2 += '<label>Pas d\'artisan</label>';
                      }
                      */

                      if (grades[i - 1] == grades[i] || (grades[i - 1] == grades[i]-1 && i != grades.length-1))
                          src2 = '<label>' + format(grades[i-1]) + '</label>';
                      //si c'est la plus grande classe on affiche la vrai valeur de la borne supérieure
                      else if(i == grades.length-1 )
                          src2 = '<label>' + format(grades[i - 1]) + ' - ' +  format(grades[i]) + '</label>';
                      else
                          src2 = '<label>' + format(grades[i - 1]) + ' - ' +  format(grades[i]-1) + '</label>';
                        
                      src = '<span style="background:' + npalette[j] + '"></span>'; 
                      html.push({label:src2,couleur:src});
                  }     
              }
              else{
                  for(i; i > 0; i--){   
                      var leg = '';
                      // (si deux bornes de la classe sont égales) ou (different de 1 sans que ce soit la 1ere borne) on affiche que la deuxieme
                      if (grades[i - 1] == grades[i] || (grades[i - 1] == grades[i]-1) )
                          leg = format(grades[i-1]);
                      //si c'est la plus grande classe on affiche la vrai valeur de la borne superieure
                      else if(i == grades.length -1)
                          leg = format(grades[i - 1]) + sep +  format(grades[i]);
                      //-1 pour pas afficher le même nombre d'une classe à l'autre
                      else
                          leg = format(grades[i - 1]) + sep +  format(grades[i]-1) ;
                      // && i!=1 || (grades[i - 1] == grades[i]-1 && (i == grades.length - 1))  (format(grades[i - 1]) != 0?format(grades[i - 1])+1:format(grades[i - 1]))   (grades[i - 1]) != 0 &&
                                      
                      src = '<span style="background:' + npalette[i - 1] + '"></span>';
                      src2 = '<label>' + leg + '</label>';
                      html.push({label:src2,couleur:src});
                  }
              }           
        }

        var l = "", c = "";
        html.reverse().forEach(function(element) {
            l += element.label;
            c += element.couleur;
        });
        
        div.innerHTML += l +  "<br/>" + c;    
        return div;
     }
});



var Grades = (function() {
        
        //trie un tableau
        var sort = function sortC(arraytab) {
             return arraytab.sort(function(a, b) {
                return a - b;
             });
          }
        
        var reverseArr = function (input) {
            var ret = new Array;
            for(var i = input.length-1; i >= 0; i--) {
                ret.push(input[i]);
            }
            return ret;
        }
        
        
        // à partir du fichier geojson on créer un tableau (grades) contenant les valeurs limites des groupes 
        // où se répartissent l'ensemble des features geojson, chaque groupe correspondant à une couleur
        function Grades(result, densiteh){
            
        

            
            var arr = jQuery.map(result.features, function(o){ return o.properties.resultat._valeur; });
            
                var compt = 0;
                var grades = [];
                while((result['features'][compt]) != undefined){

                    if(jQuery.inArray(result['features'][compt]['properties']['resultat']['_valeur'], grades) == -1){
                        grades.push(result['features'][compt]['properties']['resultat']['_valeur']);                        
                    }                   
                    compt++;
                }

                grades = sort(grades);
                //s'il y a plus de 5 valeurs de features differentes on utilise la classification de jenks
                if(grades.length > 5){
                    
                    
                     if(densiteh){

                        var part = Math.round(grades.length/4);
                        var tab = [grades[0]];
                        var step = part-1;
                        while(grades[step] != undefined){
                            tab.push(grades[step]);
                            step += part;
                        }
                        if(tab.length!=5){
                            tab.push(grades[grades.length-1]);
                        }
                        if(tab[tab.length-1]!=grades[grades.length-1]){
                            tab[tab.length-1] = grades[grades.length-1];
                        }
                        grades = tab;
                    }
                    else{
                        //sinon classification de jenks                     
                        grades = ss.jenks(arr, 4);
                        //pour les 4 1eres valeurs de grades si deux valeurs qui se suivent st egales on incremente la 2eme sinon la premiere sera ds le 2eme groupe
                        for(var i=0; i < 4; i++){
                            if(grades[i]==grades[i+1]){
                                grades[i+1]++;
                            }
                        }
                    }
                
                }
                
                this.grades = grades;
        }
      
        return Grades;

}());


var Couleur = (function () {
        
        var defaults = {
                "coldefault"   : ['#B2DFDB','#4DB6AC',' #00897B','#004D40'],
                "Alimentation" : ['#bbdefb','#64b5f6','#1e88e5','#0d47a1'],
                "Batiment"     : ['#ffe0b2', '#ffb74d', '#ff9800', '#ef6c00'],
                "Fabrication"  : ['#ffccbc', '#ff7043', '#e64a19', '#bf360c'],    
                "Services"     : ['#c8e6c9', '#66bb6a', '#388e3c', '#1b5e20'],
                "secteur"      : "coldefault"
        }
        

        //à partir du tableau grades
        function Couleur(result, secteur){
            
            this.densiteh = (result.statistique.resultat[0]._nom == "Habitants pour 1 établissement");
            
            var features = $.map(result.features, function(o){ if(o.properties.resultat._valeur != 'IMPOSSIBLE') return o });

            var nresult = {'features' : features};
            
        

            var objgrades = new Grades(nresult, this.densiteh);
            this.grades = objgrades.grades;
            this.palette = getPalette(secteur);
            
            this.npalette = this.palette.slice(-this.grades.length);
        } 
        
        
        // retourne une palette de couleur en fonction d'un secteur
        var getPalette = function(secteur){

            switch(secteur){
                case 'Alimentation':
                    var palette = defaults.Alimentation;break;
                case "Bâtiment":
                    var palette = defaults.Batiment;break;
                case 'Fabrication':
                    var palette = defaults.Fabrication;break;
                case 'Services':
                    var palette = defaults.Services;break;
                default:
                    var palette = defaults.coldefault;
            }
            
            return palette;
        }
        
        //retourne la couleur d'une feature geojson (une commune par exemple) en fonction de grades
        Couleur.prototype.getcol = function (value){
            
            if(value == 'IMPOSSIBLE'){
                return '#dedede';
            }
            
            var j = 0;
            
              if(this.grades.length < 5){
                   j = this.grades.length - 1;
              }else{
                   j = this.grades.length - 2;  
              }
              
              
              if(this.densiteh){
                  

                  //si pas d'artisan
                    var i = 0;
                    while (!(value >= this.grades[j])){
                        i++;
                        j--;
                    }
                    return this.npalette[i];      
                  
              }
              
              //cas pour filtre densité habitants
             
 
            //chaque groupe de grades correspond à une valeur de la palette : on cherche à quel groupe de grades appartient la valeur pour trouver sa couleur
                  while (!(value >= this.grades[j])){
                      j--;                
                  }   
                  
                  return this.npalette[j];                
        }
        return Couleur;

}());



(function($) {
    

    $.geometiers = function(element, options) {


        // Options défaut
        var defaults = {
            
            // token access
            accessToken : "pk.eyJ1IjoiYXJ0ODIiLCJhIjoic3hwSDFJRSJ9.D82gjhYrYR935Knj8cNVwg",
            
            // login map
            mapLogin : 'art82.5d30wpk0',

            // css
            urlstyle: "cixlnex77000s2sntu1jcfn6o",
            
            // latitude defaut du fond de carte
            lat : '44.01667',
            
            // longitude defaut du fond de carte
            lng : '1.35',
            
            // opacity defaut
            opacity: 1,

            // affichage des tiles
            displayTiles:false,
            
            // zoom defaut
            zoom: 8,
            
            // max zoom defaut
            maxZoom: 14,
            
            // Critère a affectés
            filtres : new Array(),    
           
            // Affichage des pins 
            arttruefalse : false, 
            
            // Couleurs des contours et backgrounds des zones
            colorLayerContour     : '#ffffff',
            colorLayerContourOver : '#ffffff',
            colorLayerBackground  : '#1a1a1a',
            colorContourArtisan   : '#FFC107',
            zoomLimitDisplayPopup : 10,
            
            // Zone sélectionnée par defaut
            zoneSelect : {name:'departement', value:'1'},
           
            // Découpage de la zone sélectionné
            decoupage :  {name:'decoupage', value:'arrondissement'},
            
            // Evenements
            initParent:null,
            update:null,
            updateMap:null,
            changeDatas:null,
            find:null,
            selectDecoupage:null,
            selectBreadcrumb:null,
            selectZone:null,
            selectAffichePins:null,
            
            // fonctions
            navigationControl : false,
            decoupeControl : false,
            legendeDisplay : false

        }
        
        // Plugin réference
        var plugin = this;
        plugin.settings = {}
        var $element = $(element),  // reference to the jQuery version of DOM element the plugin is attached to
               element = element;   // reference to the actual DOM element
        
        // fond de carte
        var carte;
        
        // Palette de couleur pour définir la légende/ou couleur simple permettant de colorier les territoires. 
        var couleurs = null;
        
        // liste de groupe layer (objets geojson)
        var listeGeoJson = new Array();
        
        // Liste de layer sélectionné
        var listeLayersSelect = new Array();
        
        // decoupage, zone initiale
        var decoupageInit,zoneSelectInit;
        
        // Conserve l'etat des sélections pour générer un fil d'arianne
        var listeEtapes = new Array();

        // parent group;
        var parent = new L.FeatureGroup();

        // marker
        var affichePins;

        // Initialisation du plugin
        plugin.init = function() {

            plugin.settings = $.extend({}, defaults, options);
            console.log('geometiers plugin init !');
          
            plugin.settings.decoupageInit  = plugin.settings.decoupage;

            plugin.settings.decoupage = {name:'decoupage',value:plugin.settings.decoupage};

            // Initialisation de la carte
            carte = new L.Map($element.attr("id"), {
                  zoomControl: false,
                  minZoom: 9,
                  maxZoom: 16, 
                  attributionControl: false,
                  dragging: true,
                  scrollWheelZoom: true,
                  doubleClickZoom: true,
                  boxZoom: true,
                  tap: true
            });


        }


 
        // Initialise le territoire racine
        plugin.parent = function(datas) {
            
            geojson = L.geoJson(datas, {
                style :function (feature) {
                    return {
                        fillColor: plugin.settings.colorLayerBackground,
                        weight: 0,
                        opacity: 0,
                        color: '#000000',
                        fillOpacity:1
                    };
                }
            });
            parent.clearLayers();
            parent.addLayer(geojson);
            parent.addTo(carte);

            var coord = parent.getBounds().getCenter();

            // init coordonnée parent
            plugin.settings.lat = coord.lat;
            plugin.settings.lng = coord.lng;

            carte.setView([coord.lat, coord.lng], plugin.settings.zoom);
            carte.setMaxBounds(carte.getBounds());


            var datas = plugin.datas();
            
            if(plugin.settings.initParent)plugin.settings.initParent(datas);
        }


        
        // si filtre particulier
        plugin.isDensiteh = function(){
            return plugin.getDatasItem('stats') != undefined 
                    && plugin.getDatasItem('stats').value == 'densiteh';
        }
        
        
        // Retourne un tableau de critères à envoyer au controleur pour générer le GeoJSON
        // On concatène les filtres, le territoire sélectionné, le découpage, le controleur
        plugin.datas = function(){
            return $.unique(plugin.settings.filtres.concat(plugin.settings.zoneSelect,
                    plugin.settings.decoupage
            ));
        }
        
        // Retourne un item de la liste de données
        // itemName, nom de l'item à rechercher
        plugin.getDatasItem = function(itemName){
            var datas = plugin.datas();
            var val = datas.filter(function(item) { return item.name === itemName; });
            return (val != undefined)?val[0]:false;
        }
        
        
        // Filtrage des données
        plugin.setFiltres = function(filtres){
            if(filtres)plugin.settings.filtres = filtres;
        }
        

        
        plugin.rechercher = function(result,territoire){
            deleteAllLayersOfTheMap();
            carte.setView([plugin.settings.lat, plugin.settings.lng], plugin.settings.zoom);
            
            //plugin.settings.zoneSelect = {name:"departement",value:'1'};
            plugin.settings.decoupage = {name:"decoupage",value:'commune'};

            geojson = L.geoJson(result, {
                    style : {weight: 1, 
                        opacity: 1,
                        color: plugin.settings.colorLayerContour, 
                        fillOpacity: 1, 
                        fillColor: '#BDBDBD'
                        },
            onEachFeature : initEvenement}).addTo(carte);
            
            listeGeoJson.push(geojson);
            
            var layer = getLayerListeGeoJson(territoire.value,territoire.name);

            if(layer != null){
                setTimeout(function(){
                    // on active le click pour le territoire recherché
                    layer.on('click', zoom);
                    layer.fireEvent('click');
                    }, 500);
            }
        }
        
        

        
        ////////////////////////////////////////////////////////////////////////////////////
        // dessiner les layers
        // @param result, tableau GeoJson, contenant les territoire à dessiner
        // @param layer, layer sélectionné
        ////////////////////////////////////////////////////////////////////////////////////
        plugin.dessiner = function(result,layer) {
    
           


            if(layer != undefined && layer != null){
               
                // On reinitialise la sélection précédente
                resetStylelisteLayersSelect(layer);
                layer.off('mouseout', mouseOut);
                layer.off('mouseover', mouseOver);
                layer.off('click', zoom);

                // On récupère l'indice du groupe auquel appartient la zone sélectionné
                var indiceGroupeLayer = getIndiceGroupeLayers(layer);
                // On initialise la liste de Layer avec l'indice
                listeLayersSelect[indiceGroupeLayer] = layer;
                // On supprime les groupes au dessus du layer selectionné
                supprimerGroupeLayersTop(layer);
                // On applique un style au calque non sélectionné mais selectionnable
                resetStyleGroupeLayers();
            
                // On cache le layer sélectionner
                layer.setStyle({weight: 3,fillOpacity:0, color:plugin.settings.colorLayerContourOver});
                
                //ZOOM uniquement en mode mobile
                carte.fitBounds(layer.getBounds(),{maxZoom : 11});
                
                // update breadcrumb
                if(plugin.settings.navigationControl)
                updateBreadcrumb(layer);

            }
            else{
                //on a changé les filtres
                //si ce n'est pas l'initialisation
                if(listeGeoJson[listeGeoJson.length - 1] != undefined){
                    listeGeoJson[listeGeoJson.length - 1].clearLayers();
                    listeGeoJson.pop();
                }
            }

            // On initialise une nouvelle palette de couleur en fonction d'un secteur
            if(plugin.getDatasItem('secteur') != undefined){
                var secteur = plugin.getDatasItem('secteur');
                couleurs = new Couleur(result, secteur.value);
            }
            else
                couleurs = new Couleur(result);

            // Objet geojson
            geojson = L.geoJson(result, {style : appliquerStyle});
            var nbrDeLayers = geojson.getLayers().length;

            
            if(nbrDeLayers === 1){
                displayAffichePins(geojson.getLayers()[0]);
            }
   

            var newgroupe = L.featureGroup();
            newgroupe.addTo(carte);
            listeGeoJson.push(newgroupe);   
            // on ajoute les layers
            addLayersToMap(0,nbrDeLayers);
            
            // Callback update
            if(plugin.settings.update)plugin.settings.update(result.statistique);
            
            // update decoupage
            if(plugin.settings.decoupeControl)updateSelectionDecoupage();
            
            // update legende
            if(plugin.settings.legendeDisplay){
                legende = new Legende({'couleurs':couleurs}); 
                legende.addTo(carte);
            }


        }
        
        
        
        
        // Méthode privée /////////////////////////////
        // Initialise les évènements pour le territoire 
        var initEvenement = function(feature,layer) {   
            if(!L.Browser.touch ||!L.Browser.mobile){
                    layer.on({mouseover: mouseOver, mouseout: mouseOut, click: zoom,
                })
                .bindLabel( "geo", { className:'labelZone', direction: 'auto', offset:[50, -10] });
            }
            else{
                layer.on({mouseover: mouseOver,mouseout: mouseOut,click: zoom})
            }
        }
          
          
        // Définie un style pour un territoire
        var appliquerStyle = function(feature) {
                return {weight: 1, 
                    opacity: 1,
                    color: plugin.settings.colorLayerContour, 
                    fillOpacity: 1, 
                    fillColor: couleurs.getcol(feature.properties.resultat._valeur)};
        }
           
        
        // Ajoutes les calques à la carte
        var addLayersToMap = function (i,nbrDeLayers) {           

              if(geojson.getLayers()[i] != undefined)
                  listeGeoJson[listeGeoJson.length - 1].addLayer(geojson.getLayers()[i]);
               
              i++;   
              if (i < nbrDeLayers) {            
                  addLayersToMap(i,nbrDeLayers);             
              }
              else{
                  listeGeoJson[listeGeoJson.length - 1].eachLayer(function (layer) {  
                      initEvenement(undefined,layer);
                  });
                  if(plugin.settings.updateMap)plugin.settings.updateMap();
              }

        }
        
        
        // Evenement déclencher lors du survol de la souris sur une territoire
        var mouseOver = function(e) {
            var layer = e.target;
            
            if(appartenirAZoneSelect(layer)){

                layer.setStyle({weight: 3, opacity:1, color: plugin.settings.colorLayerContourOver});
            
            }
            else{
                
                layer.setStyle({
                    fillColor: "#BDBDBD",
                    weight: 1, opacity: 1, 
                
                    fillOpacity: 1
                    });
            }
                    
            if (!L.Browser.ie && !L.Browser.opera) {
                // On met le calque devant
                layer.bringToFront(); 
            }

            $('.leaflet-label.labelZone').html(getHTMLContentPopupLayer(layer));
        }
        
        
        // Evenement déclencher lors de la sortie de la souris 
        var mouseOut = function(e) {
            var layer = e.target;
            if(appartenirAZoneSelect(layer)){
                layer.setStyle({weight: 1, opacity: 1,color: plugin.settings.colorLayerContour});
            }   
            else{
                
                layer.setStyle({
                    fillColor: plugin.settings.colorLayerBackground,
                    weight: 1, opacity: 1, 
                    color: plugin.settings.colorLayerContour,
                    fillOpacity: 1
                    });
                
                
           }
        }
        

        // Evenement lors du click sur un territoire 
        var zoom = function(e) {
            
            var layer = e.target;

            // on verifie que la zone sélectionner n'est pas celle en cour
            if(similaireAZoneSelect(layer)){
                 // Init datas pour requête
                 var datas = plugin.datas();
                 if(plugin.settings.selectZone)plugin.settings.selectZone(datas,null);
            }
            else {
                // Initialise la zone sélectionné
                plugin.settings.zoneSelect = {name:layer.feature.properties.type,value:layer.feature.properties.code};
                // Init affichage des pins NON
                plugin.settings.arttruefalse = false;
                
                if(layer.feature.properties.type == "departement"){
                    plugin.settings.decoupage = {name:'decoupage',value:'pays'};    
                }
                else if(layer.feature.properties.type == "pays"){
                    plugin.settings.decoupage = {name:'decoupage',value:'epci'};    
                }
                else if(layer.feature.properties.type == "epci" 
                    || layer.feature.properties.type == "canton" 
                    || layer.feature.properties.type == "arrondissement"){
                    plugin.settings.decoupage = {name:'decoupage',value:'commune'}; 
                }
                
                // Init datas pour requête
                var datas = plugin.datas();
                if(plugin.settings.selectZone)plugin.settings.selectZone(datas,layer);
            }
  
        }
        

        
        /**
         * Retourne un contenu HTML générer à afficher dans une popup pour le survol d'une zone
         * var layer : layer survolé
         */
        var getHTMLContentPopupLayer = function(layer){
            
            var htmlContentPopup = "";
            
            var htmlContentPopup = '<h4>' + layer.feature.properties.typeDeTerritoire + '</h4>'
            + '<h1>' + layer.feature.properties.nom + '</h1>';
            
            // on affiche les données filtrés dans la popup uniquement pour les zones sélectionnées
            // On regarde si le type du parent du layer correspond au type de la derniere zone sélectionné
            if(appartenirAZoneSelect(layer)){

                if(layer.feature.properties.resultat._valeur == 'IMPOSSIBLE')
                    htmlContentPopup += "<span class='error'>Pas d'établissement</span>";   
                else
                    htmlContentPopup += '<span class="nbrFiltrer">' + number_format(layer.feature.properties.resultat._valeur,0,' ', ' ') + '</span> ' + layer.feature.properties.resultat._type;   
                    
                htmlContentPopup += '<p class="filtresListes">'+layer.feature.properties.resultat._nom +'<br/>';
                    
                    for(var i in layer.feature.properties.resultat._filtres)
                        htmlContentPopup += layer.feature.properties.resultat._filtres[i]._nom +'<br/>';
                    
                    htmlContentPopup += '</p>'
                    
            }   
  
            return htmlContentPopup;
        }
        
        
        // Retourne l'indice du groupe auquel appartient le layer
        var getIndiceGroupeLayers = function(layer){
            
            var indice = 0;
            var find = false;

            while (find == false && indice < listeGeoJson.length) {
                 if(listeGeoJson[indice].hasLayer(layer)){

                     find = true
                 }
                 else    
                     indice++;

            }

            return indice;
        }
        
        
        // Supprime les groupes de layers au dessus de celui sélectionné
        var supprimerGroupeLayersTop = function(layer){
        
            var indice = getIndiceGroupeLayers(layer);
            var tab = listeGeoJson.slice(indice+1);
            var k = 0;

            while (k < tab.length) {
                listeGeoJson.pop(tab[k]);
                tab[k].clearLayers();
                
                // On augmente k de 1.
                k++;
            }
        }
        
        
        // Supprime tous les layers de la carte et reset listeGeoJson, listeLayersSelect
        var deleteAllLayersOfTheMap = function(){
            
             var k = 0;
                while (k < listeGeoJson.length) {
                    listeGeoJson[k].clearLayers();
                    k++;
                }

                listeGeoJson = new Array();
                listeLayersSelect = new Array();
        }
        
        
        
        // Retourne un layer appartenant à la listeGeoJson dessiné
        // code de l'objet à chercher, type de l'objet à chercher
        var getLayerListeGeoJson = function(code,type){
            var layer = null;
            for(var i = 0;  i < listeGeoJson.length; i++){
                listeGeoJson[i].eachLayer(function(l){
                    if(l.feature.properties.type == type && l.feature.properties.code == code)
                        layer = l;
               });
            }
            
            if(layer != null && plugin.settings.find)
                plugin.settings.find(layer);

            return layer;
        }
        
        // vérifie si un calque appartient à la zone Sélectionné
        var appartenirAZoneSelect = function(layer){
            // On regarde si le type du parent du layer correspond au type de la derniere zone sélectionné
            return(layer != undefined && layer.feature.properties.parent.type == plugin.settings.zoneSelect.name 
                && layer.feature.properties.parent.code == plugin.settings.zoneSelect.value);
        }

        // vérifie si un calque est déjà la zone Sélectionnée
        var similaireAZoneSelect = function(layer){
            return(layer != undefined && layer.feature.properties.type == plugin.settings.zoneSelect.name 
                && layer.feature.properties.code == plugin.settings.zoneSelect.value);
        }
         

        // Applique un style par défaut au groupes
        var resetStyleGroupeLayers = function(){
            for(var i = 0; i < listeGeoJson.length; i++){
                listeGeoJson[i].eachLayer(function(layer){
                layer.setStyle({ fillColor: plugin.settings.colorLayerBackground, weight: 1, opacity: 1, color: plugin.settings.colorLayerContour, fillOpacity: 1});
               });
            }
        }

        
        // reinitialise la liste des calques sélectionné
        var resetStylelisteLayersSelect = function(layer){
            var indice = getIndiceGroupeLayers(layer);
            var tab = listeLayersSelect.slice(indice);
            var k = 0;
            var layer;

            while (k < tab.length) {
                layer = tab[k];
                layer.setStyle({ fillColor: plugin.settings.colorLayerBackground, weight: 1, opacity: 1, color: plugin.settings.colorLayerContour, fillOpacity: 0.5});
                layer.on('mouseout', mouseOut);
                layer.on('mouseover', mouseOver);
                layer.on('click', zoom);
                // On augmente k de 1.
                k++;
            }
        }
        
        

       var displayAffichePins = function(layer){


            if(carte.hasLayer(affichePins)){
                carte.removeLayer(affichePins);
            }
            
            if(layer.feature.properties.type == "commune"){

                var latLng = layer.getBounds().getCenter();

                var LeafIcon = L.Icon.extend({
                  options: {
                    texte: '',
                    iconSize:     [200, 40], // size of the icon
                    shadowAnchor: [0, 0],  // the same for the shadow
                    className: 'pins-div-icon',
                    iconAnchor:   [0, 0],
                  },
                  createIcon: function () {
                    var div = document.createElement('div');
                    var numdiv = document.createElement('p');
                    numdiv.innerHTML = this.options['texte'] || '';
                    div.appendChild ( numdiv );
                    this._setIconStyles(div, 'icon');
                    return div;
                 }});

                var myicon = new LeafIcon({texte: 'Voir les établissements'});
                affichePins = L.marker(latLng,{icon:myicon}).setLatLng(latLng).addTo(carte);

                affichePins.on('click', function(e) {
                    if(plugin.settings.selectAffichePins)plugin.settings.selectAffichePins(layer);
                })    

            } 



       } 


        // Met à jour les étapes de la navigation des types de territoire sélectionnés
       var updateBreadcrumb = function(layer){
            

            if(carte.hasLayer(affichePins)){
                carte.removeLayer(affichePins);
            }

           
            $('#jq-dropdown-navigation').removeClass('open');
            $('#jq-dropdown-navigation').empty();
            
            var button = $('<button id="btn-navigation" class="mdl-button mdl-js-button mdl-button--icon" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="material-icons">&#xE5C4;</i></button>')


            var i = getIndiceGroupeLayers(layer);
            listeEtapes.splice(i+1, listeEtapes.length);
            
            //var etape = $('<li/>').addClass('mdl-menu__item')
            button.attr('data-type', layer.feature.properties.parent.type);
            button.attr('data-code', layer.feature.properties.parent.code);
            //.text(layer.feature.properties.parent.nom);

            //listeEtapes[i] = etape;

           // for (var i = listeEtapes.length-1; i >= 0; i--)
             //   listeEtapes[i].appendTo(ul);

            button.appendTo($('#jq-dropdown-navigation'));
            //ul.appendTo($('#jq-dropdown-navigation'));
            
            componentHandler.upgradeElement(button.get(0));
           // componentHandler.upgradeElement(ul.get(0));
            
            $('#jq-dropdown-navigation button').on('click', function(e) {
                
                if(carte.hasLayer(affichePins)){
                    carte.removeLayer(affichePins);
                }

                var layer = getLayerListeGeoJson($(this).data('code'),$(this).data('type'));
                
                // si on a des étapes
                if(layer != null){
                    // on active le click pour le territoire recherché
                    layer.on('click', zoom);
                    layer.fireEvent('click');
                }
                // Sinon on retourne à l'étape d'accueil
                else{
                    
                    deleteAllLayersOfTheMap();
                      carte.setView([plugin.settings.lat, plugin.settings.lng], plugin.settings.zoom);
                            
                    //map.fitBounds(bounds);
                    $('#jq-dropdown-navigation').empty();
                    // Initialise la zone sélectionné
                    plugin.settings.zoneSelect = {name:$(this).data('type'),value:$(this).data('code')};
                    plugin.settings.decoupage = {name:"decoupage",value:plugin.settings.decoupageInit};

                    //plugin.settings.decoupage = plugin.settings.decoupageInit;
                    
                    var datas = plugin.datas();
                    if(plugin.settings.selectBreadcrumb)plugin.settings.selectBreadcrumb(datas);
                    
                }



            });

        }

       
        
        // Retourne une boite de sélection HTML pour le découpage
        var updateSelectionDecoupage = function(){

            $('#jq-dropdown-decoupe').removeClass('open');
            $('#jq-dropdown-decoupe').empty();
            
            //var button = $('<button id="btn-decoupage"  class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored">Découpage du territoire</button>');
            

            //var button = $('<button id="btn-decoupage" class="mdl-button mdl-js-button mdl-button--icon" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="material-icons">&#xE14E;</i></button>');
            var button = $('<button id="btn-decoupage" class="mdl-button mdl-js-button mdl-button--icon" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="material-icons">&#xE14E;</i></button>');
          
            
            var ul = $('<ul />')
                    .addClass('dropdown-menu ' + plugin.settings.decoupeControl.class);
                    //.attr('for', 'btn-decoupage');

            if(plugin.settings.zoneSelect.name == 'departement'){
                button.appendTo($('#jq-dropdown-decoupe'));
                ul.appendTo($('#jq-dropdown-decoupe'));
                $('<li/>').addClass('mdl-menu__item').attr('data-type', 'arrondissement').text('Arrondissements').appendTo(ul);
                $('<li/>').addClass('mdl-menu__item').attr('data-type', 'pays').text("Pôles d'Equilibre Territorial et Rural").appendTo(ul);
                $('<li/>').addClass('mdl-menu__item').attr('data-type', 'canton').text('Cantons').appendTo(ul);
                $('<li/>').addClass('mdl-menu__item').attr('data-type', 'epci').text('Intercommunalités').appendTo(ul);
                $('<li/>').addClass('mdl-menu__item').attr('data-type', 'commune').text('Communes').appendTo(ul);
                // on teste si le decoupage initialisé est dans la liste
                if($("#jq-dropdown-decoupe li[data-type='"+plugin.settings.decoupage.value+"']").length > 0)
                    $("#jq-dropdown-decoupe li[data-type='"+plugin.settings.decoupage.value+"']").addClass("selected");
                // sinon on initialise une decoupe par défaut
                else
                    $("#jq-dropdown-decoupe li[data-type='pays']").addClass("selected");
             
                componentHandler.upgradeElement(button.get(0));
                componentHandler.upgradeElement(ul.get(0));
            }
            else if(plugin.settings.zoneSelect.name == 'pays'){
                button.appendTo($('#jq-dropdown-decoupe'));
                ul.appendTo($('#jq-dropdown-decoupe'));
                $('<li/>').addClass('mdl-menu__item').attr('data-type', 'epci').text('Intercommunalités').appendTo(ul);
                $('<li/>').addClass('mdl-menu__item').attr('data-type', 'commune').text('Communes').appendTo(ul);
                if($("#jq-dropdown-decoupe li[data-type='"+plugin.settings.decoupage.value+"']").length > 0)
                    $("#jq-dropdown-decoupe li[data-type='"+plugin.settings.decoupage.value+"']").addClass("selected");
                else
                    $("#jq-dropdown-decoupe li[data-type='epci']").addClass("selected");
                
                 componentHandler.upgradeElement(button.get(0));
                 componentHandler.upgradeElement(ul.get(0)); 
            }


           
            $('#jq-dropdown-decoupe li').on('click', function(e) {
                 plugin.settings.decoupage = {name:"decoupage",value:$(this).data("type")};
                 var datas = plugin.datas();
                 if(plugin.settings.selectDecoupage)plugin.settings.selectDecoupage(datas);
             });
        }



        // fire up the plugin!
        // call the "constructor" method
        plugin.init();
    
    }   


    // add the plugin to the jQuery.fn object
    $.fn.geometiers = function(options) {
      
        return this.each(function() {
 
            if (undefined == $(this).data('geometiers')) {

                var plugin = new $.geometiers(this, options);
                $(this).data('geometiers', plugin);

            }

        });

    }


})(jQuery);