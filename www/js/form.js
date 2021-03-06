//date field
$.datepicker.setDefaults({
    dateFormat: 'dd-mm-yy',
    dayNamesMin: [ "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb" ],
    monthNamesShort: [ "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez" ],
    monthNames: [ "janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro" ]
});
$("#date").datepicker();

//populates personal in fields information if available in storage
function loadsPersonalInfo(){
  
  $('.personal_info').each(function(){    
      var id = $(this).attr('id');
      var value = window.localStorage.getItem(id);
      if(value){
        $(this).val(value);
      }
  });
}

$("#personal_data_hideShowBtn").click(function() {
    $("#personal_data").collapse("toggle");
});

//removes leading and trailing spaces on every text field "on focus out"
$( ":text" ).each(function( index ) {
    $( this ).focusout(function() {
      var text = $(this).val();
      text = $.trim(text);
      text = text.replace(/\s\s+/g, ' '); //removes consecutive spaces in-between        
      $(this).val(text);
    });
});


//save to storage for later usage on every select
$('select.personal_info').each(function(){
    $( this ).on('change', function() {
        var id = $(this).attr('id');
        console.log(id);
        var value = $(this).val();
        window.localStorage.setItem(id, value);
    });
});

//save to storage for later usage on every "focus out" of text input fields
$('input.personal_info').each(function(){
    $( this ).focusout(function() {      
        var id = $(this).attr('id');
        console.log(id);
        var value = $(this).val();
        value = $.trim(value);
        value = value.replace(/\s\s+/g, ' '); //removes consecutive spaces in-between
        window.localStorage.setItem(id, value);
    });
});


function populatesPenalties(){
  
    var keys = [];
    for (var key in PENALTIES) {
        if (PENALTIES.hasOwnProperty(key)) {
            keys.push(key);
        }
    }

    $("#penalties").append("<option></option>");
    for (var i = 0; i < keys.length; i++) {
        key = keys[i];
        $("#penalties").append("<option>" + PENALTIES[key].select + "</option>");
    }
}

//as the user writes Postal Code, detects if the name is ok
$("#postal_code").on('input', function() {
    if (!isPostalCodeOK()){ 
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }
    
    $(this).val(function (index, value) {        
        if (value.length < 8){//length of 0000-000
            return value.toUpperCase().replace(/[^0-9]/g, '').replace(/(.{4})/g, '$1\u2013');
        }
        else{
            return value.toUpperCase().substr(0, 7) + value.toUpperCase().substr(7, 8).replace(/[^0-9]/g, '');
        }
    });    
});


function setPortuguesePlateInput(){
    $('#plate').attr('placeholder','XX-XX-XX');
    $("#plate").addClass("mandatory");
    $('#plate').attr('maxlength','8');
    
    $('#plate').on('input', function () {
        $(this).val(function (index, value) {        
            if (value.length < 8){//length of XX-XX-XX
                return value.toUpperCase().replace(/\W/gi, '').replace(/(.{2})/g, '$1\u2013');
            }
            else{
                return value.toUpperCase().substr(0, 7) + value.toUpperCase().substr(7, 8).replace(/\W/gi, '');
            }
        });
    });
}

//matrícula estrangeira, matrículas da GNR, etc.
function setAnyPlateFormat(){
    $('#plate').off('input');
    $('#plate').attr('placeholder','');
    $("#plate").removeClass("mandatory");
    $('#plate').attr('maxlength','');
}

$("#free_plate").change(function(){
    if (this.checked){
        setAnyPlateFormat();
    }
    else{
        setPortuguesePlateInput();
    }
});

//Car Make and Car Model dealing with input
//Car List and Models are got from www/js/res/car-list.js
(function(){
    var prevValueCarmake = "";
    $('#carmake').on('input', function () {    

        $(this).val(function (index, value) {                

            if(!prevValueCarmake){
                prevValueCarmake = value;
            }
            else if (value.length < prevValueCarmake.length){//backspace key
                prevValueCarmake = value;
                return value;
            }        

            var brand;
            for(var found=false, i=0; i<CAR_LIST.length; i++){            
                //if 'value' is on the begining of the 'brand'
                if(CAR_LIST[i].brand.indexOf(value) == 0){
                    if(found){
                        prevValueCarmake = value;
                        return value;
                    }
                    brand = CAR_LIST[i].brand;
                    found = true;
                }
            }        
            //just found one
            var strToReturn = prevValueCarmake = brand ? brand : value;            
            return strToReturn;
        });
    });
    
    var prevValueCarmodel = "";
    $('#carmodel').on('input', function () {    

        $(this).val(function (index, value) {                

            if(!prevValueCarmodel){
                prevValueCarmodel = value;
            }
            else if (value.length < prevValueCarmodel.length){//backspace key
                prevValueCarmodel = value;
                return value;
            }        

            var i, model, models=[];
            var found=false;  
            
            //is the brand on #carmake valid?
            for(i=0; i<CAR_LIST.length; i++){
                if(CAR_LIST[i].brand.toLowerCase().trim() === $('#carmake').val().toLowerCase().trim()){
                    models = CAR_LIST[i].models;
                    found=true;
                    break;
                }
            }

            if(!found){
                prevValueCarmodel = value;
                return value;
            }
            
            //finding carmodel
            //user input may be "As" which matches "Astra", "Astra cabrio" or "Astra caravan"
            //therefore gets common string, it should return "Astra"
            var foundModels = [];
            for(i=0; i<models.length; i++){            
                //if 'value' is on the begining of the 'model'
                if(models[i].indexOf(value) == 0){
                    foundModels.push(models[i]);                    
                }
            }                   
            if(foundModels.length === 0){
                prevValueCarmodel = value;
                return value;
            }
            else{
                //longest common starting substring in the array models
                //with ["Astra", "Astra cabrio", "Astra caravan"] returns "Astra"
                var A = foundModels.concat().sort(), 
                a1= A[0], a2= A[A.length-1], L= a1.length, i= 0;
                while(i<L && a1.charAt(i)=== a2.charAt(i)) i++;
                
                var strToReturn = prevValueCarmodel = a1.substring(0, i);
                return strToReturn;            
            }
        });
    });    
}());

    
$('#id_number').on('input', function() {
    if ($(this).val() == "" && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }  
});
$('#address').on('input', function() {
    if ($(this).val() == "" && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }  
});
$('#address_city').on('input', function() {
    if ($(this).val() == "" && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }  
});
$('#carmake').on('input', function() {
    if ($(this).val() == "" && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }  
});
$('#carmodel').on('input', function() {
    if ($(this).val() == "" && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }  
});
$('#locality').on('input',  function() {
    if ($(this).val() == "" && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");        
    }  
});
$('#locality').focusout(function(){    
    getAuthoritiesFromAddress();
});
$('#street').on('input',  function() {
    if ($(this).val() == "" && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }  
});
$('#street_number').on('input', function() {
    if ($(this).val() == "" && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }  
});