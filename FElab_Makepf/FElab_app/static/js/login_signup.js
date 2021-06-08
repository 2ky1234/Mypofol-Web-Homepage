var assetsBox = []
var stocknames = [];
$(document).ready(function () {
    $("input").keyup(function() {
        var pwd = $("#password").val();
        var pwd_check = $('#password_check').val();
        if(pwd != "" || pwd_check != ""){
            if(pwd == pwd_check){
                $('#submit').removeAttr('disabled');
            }
            else{
                $('#submit').attr("disabled", "disabled");
            }
        }
    });
    $.ajax({
        url: '/ajax_db_return/',
        type: "POST",
        dataType: "json",
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                stocknames.push(data[i][0]);
            }
        },
        error: function (request, status, error) {
            console.log('실패');
        }
    });
    $('#comboBox').autocomplete({
        source: stocknames,
        select: function (event, ui) {
            $.ajax({
                url: '/ajax_db_return/',
                type: "POST",
                dataType: "json",
                data: { 'stock_code': ui.item.value },
                success: function (data) {
                },
                error: function (request, status, error) {
                    console.log('실패');
                }
            })
        },
        focus : function(event, ui){
            return false;
        },

        minLength : 1,
        autoFocus : true,
        classes : {
            'ui-autocomplete' : 'highlight'
        },
        delay : 500,
        disable : false,
        position : {my : 'right top', at: 'right bottom'},
    });
    $('#invest_checkbox').change(function(){
        if($('#invest_checkbox').is(":checked")){

        }
    });
    $('#putin_btn').click(function(){
        if (stocknames.includes($('#comboBox').val())) {
            stocknames.splice(stocknames.indexOf($('#comboBox').val()),1);
            assetsBox.push($('#comboBox').val());
            $('#my_assets').append("<div style='position:relative;margin: 10px 0;width:100%;height:30px;display:flex;justify-content:center;border-bottom:1px solid #eeeeee;'><p>"+$('#comboBox').val() +"</p> <input type='button' id='putout_btn' name=" + $('#comboBox').val() +
            " style='position:absolute;right:5px;;width:60px;height:30px;border:none;border-radius:5px; background-color:#eeeeee;bottom:3px;' value='빼기'></div>");
            $('#comboBox').val("");
        }
        else{
            alert("종목 정보가 올바르지 않습니다.");
        }
    });
    $(document).on('click', '#putout_btn', function () {
        $('#my_assets').empty();
        assetsBox.splice(assetsBox.indexOf($(this).attr('name')),1);
        for (i = 0; i < assetsBox.length; i++) {
            $('#my_assets').append("<div style='position:relative;margin-bottom:5px;width:100%;height:30px;display:flex;justify-content:center;border-bottom:1px solid #eeeeee;'><p>"
                + assetsBox[i] + "</p > <button id='putout_btn' name=" + assetsBox[i] +
                " style='position:absolute;right:5px;;width:60px;height:30px;border:none;border-radius:5px; background-color:#eeeeee;bottom:3px;'>빼기</button></div>");
        }
        stocknames.push($(this).attr('name'));
    });
    $('#multiple-checkboxes').multiselect({
        includeSelectAllOption: true,
      });
});