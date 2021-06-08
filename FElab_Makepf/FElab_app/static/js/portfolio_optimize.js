var mystocksDB = [];
var mystocks = [];
var stocknames= [];
var mystocks_weights = [];
var mystocks_names=[];
var mystocks_codes=[];
$(document).ready(function () {
    $("#js-navbar-toggle").attr("src", "/static/images/menu_black.png");
    $('.nav-links').css("color","black");
    $('#register_pf').click(function(){
        $('.modal-mask').css('display',"table");
    });
    $('.modal-close').click(function(){
        $('.modal-mask').css('display', 'none');
    });
    
    if(localStorage.getItem("mystocks_codes")){
        mystocks_names = localStorage.getItem("mystocks_names").split(',');
        mystocks_codes = localStorage.getItem("mystocks_codes").split(',');
        mystocks_weights = localStorage.getItem("mystocks_weights").split(',');
        from_period = localStorage.getItem("from");
        to_period = localStorage.getItem("to");
        investment_kinds = localStorage.getItem("investment_kinds").split(',');
        

        for(i =0; i<investment_kinds.length;i++){
            $("input:checkbox[id='"+investment_kinds[i]+"']").prop("checked", true);
        }
        $('#my_from').val(from_period);
        $('#my_to').val(to_period);
        for (i = 0; i < mystocks_names.length; i++) {
            $('#asset_row').append("<tr eq= "+i+"><td class='numberCell'>"+mystocks_names[i]+
        "</td><td class='numberCell'><input id='mystocks_weights"+i+"' class='my_input_weight' type='number' style='width:100px;height:30px;border:none; background-color:#eeeeee;bottom:3px' value='"+Number(mystocks_weights[i])+
        "'></td><td class='numberCell'><button class='my_putout_btn' eq= "+i+" kor-name="+mystocks_names[i]+" name=" + mystocks_codes[i] +
        " style='width:60px;height:30px;border:none;border-radius:5px; background-color:#eeeeee;bottom:3px;'>빼기</button></td><td><image src='/static/images/loupe.png' id='showSise' data-stock = '"+mystocks_codes[i]+"'data-popup-open = 'showSise' style='width:25px;height:25px;text-align:center;cursor:pointer;' align='middle' title='시세보기' cursor:pointer></image></td></tr>");        
    }
}   
    
    $.ajax({
        url: '/ajax_stockname_return/',
        type: "POST",
        dataType: "json",
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                mystocksDB.push(data[i].split(' ')[0]);
                stocknames.push(data[i]);
            }
        },
        error: function (request, status, error) {
            console.log('실패');
        }
    });
    $('#my_comboBox').autocomplete({
        source: stocknames,
        appendTo: $('.modal-container'),
        select: function (event, ui) {
        },
        focus : function(event, ui){
            return false;
        },
        minLength : 1,
        autoFocus : true,
        classes : {
            'ui-autocomplete' : 'highlight'
        },
        open: function(event, ui) {
            $(this).autocomplete("widget").css({
                "width": 300
            });
        },
        delay : 500,
        disable : false,
        position : {my : 'left top', at: 'left bottom', collision: "None Flip"},
    });

    
    $("#my_putin_btn").click(function () {
        if (stocknames.includes($('#my_comboBox').val())) {
            code = "kp"+$('#my_comboBox').val().split(' ')[0];
            stockname = $('#my_comboBox').val().split(' ').slice(1,).join(' ');
            if(mystocks_names.includes(stockname)){
                alert("이미 포트폴리오에 담겨 있는 종목입니다");
                
            }else{
                mystocks_names.push(stockname);
                mystocks_codes.push(code);
                add_eq = $('#asset_row tr')['length'];
                
                stocknames.splice(stocknames.indexOf($('#my_comboBox').val()),1);
                $('#my_comboBox').val("");
                $('#asset_row').append("<tr eq= "+Number(add_eq)+"><td class='numberCell'>"+stockname+
            "</td><td class='numberCell'><input id='mystocks_weights"+Number(add_eq)+"' class='my_input_weight' type='number' style='width:100px;height:30px;border:none; background-color:#eeeeee;bottom:3px' value=''></td><td class='numberCell'><button class='my_putout_btn' eq= '"+Number(add_eq)+"' kor-name='"+stockname+"' name='" + code +
            "' style='width:60px;height:30px;border:none;border-radius:5px; background-color:#eeeeee;bottom:3px;'>빼기</button></td><td><image src='/static/images/loupe.png' id='showSise' data-stock = '"+code+"'data-popup-open = 'showSise' style='width:25px;height:25px;text-align:center;cursor:pointer;' align='middle' title='시세보기' cursor:pointer></image></td></tr>");
            }
        } else {
            alert("종목 정보가 올바르지 않습니다");
        }
    });

    $(document).on('click', '.my_putout_btn', function () {
        mystocks_codes.splice(mystocks_codes.indexOf($(this).attr('name')),1);
        mystocks_names.splice(mystocks_names.indexOf($(this).attr('kor-name')),1);
        if (!stocknames.includes($(this).attr('name').slice(2,)+' '+ $(this).attr('kor-name'))){
            stocknames.push($(this).attr('name').slice(2,)+' '+ $(this).attr('kor-name'));
            
        }
        $("#asset_row tr[eq="+$(this).attr('eq')+"]").remove();
        for (i=0;i<mystocks_codes.length;i++){
            $('#asset_row tr').eq(i).attr('eq',i);
            $('#asset_row tr[eq='+i+'] td button').attr('eq',i);
            $('#asset_row tr[eq='+i+'] td input').attr('id','mystocks_weights'+i);
        }
    });


    var dateFormat = "mm/dd/yy",
    my_from = $("#my_from")
        .datepicker({
            container:'.modal-container',
            defaultDate: "+1w",
            changeMonth: true,
            changeYear: true,
            numberOfMonths: 1
        }).on("change", function () {
            my_to.datepicker("option", "minDate", getDate(this));
    });
    $('#ui-datepicker-div').css('z-index', '100002');

    my_to = $("#my_to").datepicker({
        defaultDate: "+1w",
        changeMonth: true,
        changeYear: true,
        numberOfMonths: 1,
        }).on("change", function () {
            my_from.datepicker("option", "maxDate", getDate(this));
    });
    
    $('#my_from').focus(function(){
        $('#ui-datepicker-div').css('z-index','10002');
    });
    $('#my_to').focus(function(){
        $('#ui-datepicker-div').css('z-index','10002');
    });

    function getDate(element) {
        var date;
        try {
            date = $.datepicker.parseDate(dateFormat, element.value);
        } catch (error) {
            date = null;
        }

        return date;
    }
    $('#optimize_btn').click(function () {
        if (mystocks_codes.length == 0) {
            alert("선택된 자산이 없습니다.");
        }else if(mystocks_codes.length==1){
            alert("한개의 자산으로는 최적화를 진행할 수 없습니다.");
        }else if(90>(new Date($('#my_to').val())- new Date($('#my_from').val())) / 1000 / 60 / 60 / 24){
            alert("투자 기간은 최소 3개월 이상이어야 합니다.");
        }
        else {
            var sum = 0
            mystocks_weights= [];
            for (i=0;i<mystocks_codes.length;i++){
                mystocks_weights.push(parseFloat($('#mystocks_weights'+i).val()));
                sum = sum+ Number(parseFloat($('#mystocks_weights'+i).val()).toFixed(1));
            }
            if(Number(sum.toFixed(12))!=1){
                alert("비중의 합이 1이 아닙니다.")
            }else{
                var investment_kinds = []
                for ( var i = 0; i < $("input[name=investment_kind]:checkbox" ).length; i++) {
                    if ($( "input[name=investment_kind]:checkbox")[i].checked == true ) {
                        investment_kinds.push($( "input[name=investment_kind]:checkbox" )[i].value);
                    }
                }
                localStorage.setItem("investment_kinds", investment_kinds);
                localStorage.setItem("mystocks_codes", mystocks_codes);
                localStorage.setItem("mystocks_weights", mystocks_weights);
                localStorage.setItem("from", $('#my_from').val());
                localStorage.setItem("to", $('#my_to').val());
                localStorage.setItem("mystocks_names",mystocks_names);
                for (var i=0; i<mystocks_codes.length;i++){
                    $('#modal_form').append("<input type='hidden' name='mystocks[]' value='"+mystocks_codes[i]+"'/>");
                    $('#modal_form').append("<input type='hidden' name='mystocks_weights[]' value='"+mystocks_weights[i]+"'/>");
                }
                $.ajax({
                    url: '/ajax_portfolio_optimize_return/',
                    type: "POST",
                    dataType: "json",
                    data: {
                        "mystocks[]": mystocks_codes, "mystocks_weights[]" : mystocks_weights, "from": $('#my_from').val(), 'to': $('#my_to').val(),
                        //"investment_kinds" : 
                    },
                    success: function (data) {
                        $('#modal_form').submit();
                    },error: function(request, status, error){
                        alert("입력하신 기간동안의 데이터가 부족한 종목이 포함되어 있습니다.");
                    }
                });
                
            }
        }
    });

    
    $(document).on('click', '#showSise',function(){
        var targeted_popup_class = $(this).attr('data-popup-open'); 
        $('[data-popup="' + targeted_popup_class + '"]').fadeIn(350);
        $.ajax({
            url: '/ajax_db_return/',
            type: "POST",
            dataType: "json",
            data: { 'stock_code': $(this).attr('data-stock')},
            success: function (data) {
                var stockdata = [];
                for (var i = 0; i < data.length; i++) {
                    stockdata.push({ 'Date': moment(data[i][0]).format('YYYY-MM-DD'), 'Open': data[i][1], 'High': data[i][2], 'Low': data[i][3], 'Close': data[i][4], 'Volume': data[i][5] })
                }
                var chartdiv = document.querySelector('#chartdiv');
                var charttype = am4charts.XYChart;
                var chart = createChart(chartdiv, charttype);
                stockGraph(stockdata,chart);
            },
            error: function (request, status, error) {
                console.log('실패');
            }
        })
    });
    $('[data-popup-close]').on('click', function(e) { // 팝업 닫기 버튼 클릭시 동작하는 이벤트입니다. 
        var targeted_popup_class = $(this).attr('data-popup-close'); 
        $('[data-popup="' + targeted_popup_class + '"]').fadeOut(350); 
        e.preventDefault(); 
    });
});
function return_dict_items(dict){
    var i, arr= [];
    for(i in dict){
        arr.push(dict[i]);
    }
    return arr;
}
var chartReg = {};
function createChart(chartdiv, charttype) {
    // Check if the chart instance exists
    maybeDisposeChart(chartdiv);

    // Create new chart
    chartReg[chartdiv] = am4core.create(chartdiv, charttype);
    return chartReg[chartdiv];
}
function maybeDisposeChart(chartdiv){
    if (chartReg[chartdiv]) {
        chartReg[chartdiv].dispose();
        delete chartReg[chartdiv];
    }
}
function stockGraph(stockdata,chart) {
    am4core.ready(function () {
        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        //chart = am4core.create("chartdiv", am4charts.XYChart);

        chart.padding(0, 15, 0, 15);

        // Load data
        chart.data = stockdata;

        // the following line makes value axes to be arranged vertically.
        chart.leftAxesContainer.layout = "vertical";

        // uncomment this line if you want to change order of axes
        //chart.bottomAxesContainer.reverseOrder = true;

        var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.grid.template.location = 0;
        dateAxis.renderer.ticks.template.length = 8;
        dateAxis.renderer.ticks.template.strokeOpacity = 0.1;
        dateAxis.renderer.grid.template.disabled = true;
        dateAxis.renderer.ticks.template.disabled = false;
        dateAxis.renderer.ticks.template.strokeOpacity = 0.2;
        dateAxis.renderer.minLabelPosition = 0.01;
        dateAxis.renderer.maxLabelPosition = 0.99;
        dateAxis.keepSelection = true;
        dateAxis.minHeight = 30;

        dateAxis.groupData = true;
        dateAxis.minZoomCount = 5;

        // these two lines makes the axis to be initially zoomed-in
        // dateAxis.start = 0.7;
        // dateAxis.keepSelection = true;

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.tooltip.disabled = true;
        valueAxis.zIndex = 10001;
        valueAxis.renderer.baseGrid.disabled = true;
        // height of axis
        valueAxis.height = am4core.percent(65);

        valueAxis.renderer.gridContainer.background.fill = am4core.color("#000000");
        valueAxis.renderer.gridContainer.background.fillOpacity = 0.05;
        valueAxis.renderer.inside = true;
        valueAxis.renderer.labels.template.verticalCenter = "bottom";
        valueAxis.renderer.labels.template.padding(2, 2, 2, 2);

        //valueAxis.renderer.maxLabelPosition = 0.95;
        valueAxis.renderer.fontSize = "0.8em"

        var series = chart.series.push(new am4charts.CandlestickSeries());
        series.dataFields.dateX = "Date";
        series.dataFields.openValueY = "Open";
        series.dataFields.valueY = "Close";
        series.dataFields.lowValueY = "Low";
        series.dataFields.highValueY = "High";
        series.clustered = false;
        series.tooltipText = "open: {openValueY.value}\nlow: {lowValueY.value}\nhigh: {highValueY.value}\nclose: {valueY.value}";
        series.name = "MSFT";
        series.defaultState.transitionDuration = 0;

        var valueAxis2 = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis2.tooltip.disabled = true;
        // height of axis
        valueAxis2.height = am4core.percent(35);
        valueAxis2.zIndex = 3
        // this makes gap between panels
        valueAxis2.marginTop = 30;
        valueAxis2.renderer.baseGrid.disabled = true;
        valueAxis2.renderer.inside = true;
        valueAxis2.renderer.labels.template.verticalCenter = "bottom";
        valueAxis2.renderer.labels.template.padding(2, 2, 2, 2);
        //valueAxis.renderer.maxLabelPosition = 0.95;
        valueAxis2.renderer.fontSize = "0.8em"

        valueAxis2.renderer.gridContainer.background.fill = am4core.color("#000000");
        valueAxis2.renderer.gridContainer.background.fillOpacity = 0.05;

        var series2 = chart.series.push(new am4charts.ColumnSeries());
        series2.dataFields.dateX = "Date";
        series2.clustered = false;
        series2.dataFields.valueY = "Volume";
        series2.yAxis = valueAxis2;
        series2.tooltipText = "{valueY.value}";
        series2.name = "Series 2";
        // volume should be summed
        series2.groupFields.valueY = "sum";
        series2.defaultState.transitionDuration = 0;

        chart.cursor = new am4charts.XYCursor();

        var scrollbarX = new am4charts.XYChartScrollbar();

        var sbSeries = chart.series.push(new am4charts.LineSeries());
        sbSeries.dataFields.valueY = "Close";
        sbSeries.dataFields.dateX = "Date";
        scrollbarX.series.push(sbSeries);
        sbSeries.disabled = true;
        scrollbarX.marginBottom = 20;
        chart.scrollbarX = scrollbarX;
        scrollbarX.scrollbarChart.xAxes.getIndex(0).minHeight = undefined;
        /**
         * Set up external controls
         */

        // Date format to be used in input fields
        var inputFieldFormat = "yyyy-MM-dd";

        document.getElementById("b1m").addEventListener("click", function () {
            var max = dateAxis.groupMax["day1"];
            var date = new Date(max);
            am4core.time.add(date, "month", -1);
            zoomToDates(date);
        });

        document.getElementById("b3m").addEventListener("click", function () {
            var max = dateAxis.groupMax["day1"];
            var date = new Date(max);
            am4core.time.add(date, "month", -3);
            zoomToDates(date);
        });

        document.getElementById("b6m").addEventListener("click", function () {
            var max = dateAxis.groupMax["day1"];
            var date = new Date(max);
            am4core.time.add(date, "month", -6);
            zoomToDates(date);
        });

        document.getElementById("b1y").addEventListener("click", function () {
            var max = dateAxis.groupMax["day1"];
            var date = new Date(max);
            am4core.time.add(date, "year", -1);
            zoomToDates(date);
        });

        document.getElementById("bytd").addEventListener("click", function () {
            var max = dateAxis.groupMax["day1"];
            var date = new Date(max);
            am4core.time.round(date, "year", 1);
            zoomToDates(date);
        });

        document.getElementById("bmax").addEventListener("click", function () {
            var min = dateAxis.groupMin["day1"];
            var date = new Date(min);
            zoomToDates(date);
        });

        dateAxis.events.on("selectionextremeschanged", function () {
            updateFields();
        });

        dateAxis.events.on("extremeschanged", updateFields);

        function updateFields() {
            var minZoomed = dateAxis.minZoomed + am4core.time.getDuration(dateAxis.mainBaseInterval.timeUnit, dateAxis.mainBaseInterval.count) * 0.5;
            document.getElementById("fromfield").value = chart.dateFormatter.format(minZoomed, inputFieldFormat);
            document.getElementById("tofield").value = chart.dateFormatter.format(new Date(dateAxis.maxZoomed), inputFieldFormat);
        }

        document.getElementById("fromfield").addEventListener("keyup", updateZoom);
        document.getElementById("tofield").addEventListener("keyup", updateZoom);

        var zoomTimeout;
        function updateZoom() {
            if (zoomTimeout) {
                clearTimeout(zoomTimeout);
            }
            zoomTimeout = setTimeout(function () {
                var start = document.getElementById("fromfield").value;
                var end = document.getElementById("tofield").value;
                if ((start.length < inputFieldFormat.length) || (end.length < inputFieldFormat.length)) {
                    return;
                }
                var startDate = chart.dateFormatter.parse(start, inputFieldFormat);
                var endDate = chart.dateFormatter.parse(end, inputFieldFormat);

                if (startDate && endDate) {
                    dateAxis.zoomToDates(startDate, endDate);
                }
            }, 500);
        }

        function zoomToDates(date) {
            var min = dateAxis.groupMin["day1"];
            var max = dateAxis.groupMax["day1"];
            dateAxis.keepSelection = true;
            //dateAxis.start = (date.getTime() - min)/(max - min);
            //dateAxis.end = 1;

            dateAxis.zoom({ start: (date.getTime() - min) / (max - min), end: 1 });
        }
    }); // end am4core.ready()
}