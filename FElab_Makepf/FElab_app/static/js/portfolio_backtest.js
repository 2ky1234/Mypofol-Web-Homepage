var mystocksDB = [];
var mystocks = [];
var stocknames= [];
var mystocks_weights = [];
var mystocks_codes=[];
var mystocks_names=[];

pie_backgroundColor = ['#a05195','#d45087','#f95d6a','#ff7c43','#ffa600','#2f4b7c','#665191','#a05195','#d45087','#f95d6a','#ff7c43','#ffa600','#f95d6a','#ff7c43','#ffa600'];
$(document).ready(function () {
    $("#js-navbar-toggle").attr("src", "/static/images/menu_black.png");
    $('.nav-links').css("color","black");
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
    $('#comboBox').autocomplete({
        source: stocknames,
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
        delay : 500,
        disable : false,
        position : {my : 'center top', at: 'center bottom', collision: "None Flip"},
    });
    if (localStorage.getItem('mystocks_weights')){
        if(localStorage.getItem('adjusted_weights')){
            mystocks_weights = localStorage.getItem("adjusted_weights").split(',');
            mystocks_codes = localStorage.getItem("adjusted_codes").split(',');
            mystocks_names = localStorage.getItem("adjusted_names").split(',');
        }
        else{
            mystocks_names = localStorage.getItem("mystocks_names").split(',');
            mystocks_codes = localStorage.getItem("mystocks_codes").split(',');
            mystocks_weights =localStorage.getItem('mystocks_weights').split(',');
        }
        my_from = localStorage.getItem("from");
        my_to = localStorage.getItem("to");
        for(i=0; i<mystocks_codes.length;i++){
            mystocksDB.splice(mystocksDB.indexOf(mystocks_codes[i]),1);
        }
        for (i = 0; i < mystocks_names.length; i++) {
            $('#asset_row').append("<tr eq= "+i+"><td class='numberCell'>"+mystocks_names[i]+
        "</td><td class='numberCell'><input id='mystocks_weights"+i+"' class='input_weight' type='number' style='width:100px;height:30px;border:none; background-color:#eeeeee;bottom:3px;text-align:center;' value='"+Number(mystocks_weights[i])+
        "'></td><td class='numberCell'><button id='putout_btn' eq= "+i+" kor-name="+mystocks_names[i]+" name=" + mystocks_codes[i] +
        " style='width:60px;height:30px;border:none;border-radius:5px; background-color:#eeeeee;bottom:3px;'>빼기</button></td><td><image src='/static/images/loupe.png' id='showSise' data-stock = '"+mystocks_codes[i]+"'data-popup-open = 'showSise' style='width:25px;height:25px;text-align:center;cursor:pointer;' align='middle' title='시세보기' cursor:pointer></image></td></tr>");
        }
        $('#from').val(my_from);
        $('#to').val(my_to);
        
        data = {
            datasets: [{
                data: mystocks_weights,
                backgroundColor:pie_backgroundColor.slice(0,mystocks_names.length),
            }],
            labels : mystocks_names, 
        }
        Draw_optimize_pie(data);
    }
    
    $("#putin_btn").click(function () {
        if (stocknames.includes($('#comboBox').val())) {
            code = "kp"+$('#comboBox').val().split(' ')[0];
            if (mystocks_codes.includes(code)){
                alert("이미 담겨 있는 종목입니다");
            }else{
                stockname = $('#comboBox').val().split(' ').slice(1,).join(' ');
                mystocks_names.push(stockname);
                mystocks_codes.push(code);
    
                add_eq = $('#asset_row tr')['length'];
                mystocksDB.splice(mystocksDB.indexOf(code),1);
                $('#asset_row').append("<tr eq= "+Number(add_eq)+"><td class='numberCell'>"+stockname+
            "</td><td class='numberCell'><input id='mystocks_weights"+Number(add_eq)+"' class='input_weight' type='number' style='width:100px;height:30px;border:none; background-color:#eeeeee;bottom:3px' value=''></td><td class='numberCell'><button id='putout_btn' eq= '"+Number(add_eq)+"' kor-name='"+stockname+"' name=" + code +
            " style='width:60px;height:30px;border:none;border-radius:5px; background-color:#eeeeee;bottom:3px;'>빼기</button></td><td><image src='/static/images/loupe.png' id='showSise' data-stock = '"+code+"'data-popup-open = 'showSise' style='width:25px;height:25px;text-align:center;cursor:pointer;' align='middle' title='시세보기' cursor:pointer></image></td></tr>");
                $('#comboBox').val("");
            }
            
        } else {
            alert("종목 정보가 올바르지 않습니다");
        }
    });
    $(document).on('click', '#putout_btn', function () {
        mystocks_codes.splice(mystocks_codes.indexOf($(this).attr('name')),1);
        mystocks_names.splice(mystocks_names.indexOf($(this).attr('kor-name')),1);
        $("#asset_row tr[eq="+$(this).attr('eq')+"]").remove();
        mystocksDB.push($(this).attr('name'));
        for (i=0;i<mystocks_names.length;i++){
            $('#asset_row tr').eq(i).attr('eq',i);
            $('#asset_row tr[eq='+i+'] td button').attr('eq',i);
            $('#asset_row tr[eq='+i+'] td input').attr('id','mystocks_weights'+i);
        }
        
        mystocksDB.push($(this).attr('name'));
    });
    $(document).on('change', '.input_weight',function(){
        sum = 0
        mystocks_weights=[];
        for(i=0;i<mystocks_names.length;i++){
            sum = sum+Number($('#mystocks_weights'+i).val())
            mystocks_weights.push(Number($('#mystocks_weights'+i).val()));
        }
        if (Number(sum.toFixed(12))!=1){
        }else{
            if($('#portfolio_pie_chart').is(!':empty')){
                window.portfolio_pie_chart.destroy();
            }
            data = {
                datasets: [{
                    data: mystocks_weights,
                    backgroundColor:pie_backgroundColor.slice(0,mystocks_names.length),
                }],
                labels : mystocks_names, 
            }
            Draw_optimize_pie(data);
        }
    });
    var dateFormat = "mm/dd/yy",
    from = $("#from")
        .datepicker({
            defaultDate: "+1w",
            changeMonth: true,
            changeYear: true,
            numberOfMonths: 1
        })
        .on("change", function () {
            to.datepicker("option", "minDate", getDate(this));
        }),
        to = $("#to").datepicker({
            defaultDate: "+1w",
            changeMonth: true,
            changeYear: true,
            numberOfMonths: 1
        })
            .on("change", function () {
                from.datepicker("option", "maxDate", getDate(this));
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
    cl_cnt = 0
    $('#backtest_btn').click(function() {
        sum = 0
        mystocks_weights=[];
        for(i=0;i<mystocks_codes.length;i++){
            sum = sum+Number($('#mystocks_weights'+i).val());
            mystocks_weights.push(Number($('#mystocks_weights'+i).val()));
        }
        if(mystocks_names.length==0){
            alert("입력된 자산이 없습니다.");
        }
        else if(Number(sum.toFixed(12))!=1){
            alert("비중의 합이 1이 아닙니다.");
        }else if(90>(new Date($('#to').val())- new Date($('#from').val())) / 1000 / 60 / 60 / 24){
            alert("투자 기간은 최소 3개월 이상이어야 합니다.");
        }
        else if($('#input_amount')==""){
            alert("투자 금액을 입력해주세요");
        }
        else{
            $.ajax({
                url: '/ajax_backtest/',
                type: "POST",
                dataType: "json",
                //
                //,
                data : {"assetsBox[]" : mystocks_codes, "assetweights[]" : mystocks_weights, "from" : $('#from').val(), 'to' : $('#to').val(),
            'rebalancing_month' : $('#rebalancing_month').val(), 'start_amount' : $('#start_amount').val(), 'strategy': $('input[name=strategy]:checked').val(),
            "interval": $("input[name='interval']:checked").val(),'rebalancing_option' : $('#rebalancing_option').val()},
                success: function (data) {
                    back_Mean = data.indicator[0]['Mean'];
                    back_Std = data.indicator[0]['Std'];
                    back_Sharp_ratio = data.indicator[0]['Sharpe ratio'];
                    back_VaR = data.indicator[0]['VaR'];
                    back_MDD = data.indicator[0]['MDD'];
                    back_Gain_loss = data.indicator[0]['Gain/Loss Ratio'];
                    back_Winnig_ratio = data.indicator[0]['Winning Ratio'];
                    back_Date = data.pfo_return[0]['Date'];
                    back_Drawdown = data.pfo_return[0]['Drawdown_list'];
                    back_acc = data.pfo_return[0]['acc_return ratio'];
                    back_value = data.pfo_return[0]['final_balance'];
                    back_return = data.pfo_return[0]['mean_return'];
                    KOSPI_return = data.bench[0]['KOSPI_return'];
                    SP500_return = data.bench[0]['S&P500_return'];
                    KOSPI_balance = data.bench[0]['KOSPI_balance'];
                    SP500_balance = data.bench[0]['S&P500_balance'];
                    KOSPI_drawdown = data.bench[0]['KOSPI_Drawdown'];
                    SP500_drawdown = data.bench[0]['S&P500_Drawdown'];
                    
                    KOSPI_mean_return = data.KOSPI_indicator[0]['Mean'];
                    KOSPI_MDD = data.KOSPI_indicator[0]['MDD'];
                    KOSPI_sharpe = data.KOSPI_indicator[0]['Sharpe ratio'];
                    KOSPI_std = data.KOSPI_indicator[0]['Std'];
                    KOSPI_VaR = data.KOSPI_indicator[0]['VaR'];

                    SP500_mean_return = data['S&P500_indicator'][0]['Mean'];
                    SP500_MDD = data['S&P500_indicator'][0]['MDD'];
                    SP500_sharpe = data['S&P500_indicator'][0]['Sharpe ratio'];
                    SP500_std = data['S&P500_indicator'][0]['Std'];
                    SP500_VaR = data['S&P500_indicator'][0]['VaR'];
                    
                    

                    $('#daterange').html(" " + $('#from').val() +"~"+ $('#to').val());
                    //그래프 그리기
                    if(cl_cnt>=1){
                        window.value_chart.destroy();
                        window.return_chart.destroy();
                        window.mdd_chart.destroy();
                    }
                    cl_cnt = cl_cnt+1;

                    Draw_value_chart(back_Date, back_value,KOSPI_balance, SP500_balance);
                    Draw_Return_chart(back_Date, back_return,KOSPI_return, SP500_return);
                    Draw_MDD_chart(back_Date, back_Drawdown,KOSPI_drawdown,SP500_drawdown);
                    $('#mean_return').html((back_Mean*100).toFixed(2)+"%");
                    $('#std').html(back_Std.toFixed(2));
                    $('#sharp').html(back_Sharp_ratio.toFixed(2));
                    $('#VaR').html(back_VaR.toFixed(2));
                    $('#MDD').html(back_MDD.toFixed(2));

                    $('#KP_mean_return').html((KOSPI_mean_return*100).toFixed(2)+"%");
                    $('#KP_std').html(KOSPI_std.toFixed(2));
                    $('#KP_sharp').html(KOSPI_sharpe.toFixed(2));
                    $('#KP_VaR').html(KOSPI_VaR.toFixed(2));
                    $('#KP_MDD').html(KOSPI_MDD.toFixed(2));

                    $('#SP_mean_return').html((SP500_mean_return*100).toFixed(2)+"%");
                    $('#SP_std').html(SP500_std.toFixed(2));
                    $('#SP_sharp').html(SP500_sharpe.toFixed(2));
                    $('#SP_VaR').html(SP500_VaR.toFixed(2));
                    $('#SP_MDD').html(SP500_MDD.toFixed(2));

                    $('#backtest_outputdiv').css('display','block');
                },beforeSend:function(){
                    loading();
                },complete:function(){
                    closeloading();
                },error: function (request, status, error) {
                    console.log('실패');
                }
        });
    }
    });
    

});
function loading(){
    $("#loading_back").css('display','block');
    $("#wrap_loading").css('display','block');
}
function closeloading(){
    $("#loading_back").css('display','none');
    $("#wrap_loading").css('display','none');
}
function Draw_optimize_pie(data){
    var portfolio_ctx = document.getElementById("portfolio_pie_chart").getContext('2d');
    window.portfolio_pie_chart = new Chart(portfolio_ctx, {
        type: 'pie',
        data : data,
        option : {
            responsive: true,
            legend : true,
            maintainAspectRatio : false,
            animation: true,
            pieceLabel:{
                mode: 'label',
                potision: 'outside',
                fontsize: 15,
            }
        }
    });

}

function Draw_value_chart(x, y,y_kospi, y_SP) {
    var value_ctx = document.getElementById("value_chart").getContext('2d');
    window.value_chart = new Chart(value_ctx, {
        type: 'line',
        data: {
            labels: x,
            datasets: [{
                label: '포트폴리오 가치 변화',
                data: y,
                borderColor: "#FFA500",
                backgroundColor: "#FFA500",
                lineTension: 0,
                pointRadius: 1,
                pointHoverRadius: 1,
                fill: false,
            },
            {
                label: '벤치마크 : 코스피',
                data: y_kospi,
                borderColor: "#04092a",
                backgroundColor: '#04092a',
                lineTension: 0,
                pointRadius: 1,
                pointHoverRadius: 1,
                fill: false,
            },
            {
                label: '벤치마크 : S&P500',
                data: y_SP,
                borderColor: "#cccccc",
                backgroundColor: '#cccccc',
                pointRadius: 1,
                pointHoverRadius: 1,
                lineTension: 0,
                fill: false,
            }],
        },
        options: {
            responsive: true,
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: false,
                        labelString: '기간'
                    }
                }],
                yAxes: [{
                    display: true,
                    ticks: {
                        suggestedMin: 0,
                    },
                    scaleLabel: {
                        display: true,
                        labelString: '가치'
                    }
                }]
            }
        }
    });

}
function Draw_Return_chart(x, y, y_kospi, y_SP) {
    var return_ctx = document.getElementById("Return_chart").getContext('2d');
    window.return_chart = new Chart(return_ctx, {
        type: 'line',
        data: {
            labels: x,
            datasets: [{
                label: '포트폴리오 수익률 변화',
                data: y,
                borderColor: "#FFA500",
                backgroundColor: "#FFA500",
                lineTension: 0,
                pointRadius: 1,
                pointHoverRadius: 1,
                fill: false,
            },
            {
                label: '벤치마크 : 코스피',
                data: y_kospi,
                borderColor: "#04092a",
                backgroundColor: '#04092a',
                lineTension: 0,
                pointRadius: 1,
                pointHoverRadius: 1,
                fill: false,
            },
            {
                label: '벤치마크 : S&P500',
                data: y_SP,
                borderColor: "#cccccc",
                backgroundColor: '#cccccc',
                pointRadius: 1,
                pointHoverRadius: 1,
                lineTension: 0,
                fill: false,
            }]
        },
        options: {
            responsive: true,
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: false,
                        labelString: '기간'
                    }
                }],
                yAxes: [{
                    display: true,
                    ticks: {
                        suggestedMin: 0,
                    },
                    scaleLabel: {
                        display: true,
                        labelString: '수익률'
                    }
                }]
            }
        }
    });
}
function Draw_MDD_chart(x, y, y_kospi,y_SP) {
    var MDD_ctx = document.getElementById("MDD_chart").getContext('2d');
    window.mdd_chart = new Chart(MDD_ctx, {
        type: 'line',
        data: {
            labels: x,
            datasets: [{
                label: '포트폴리오 MDD',
                data: y,
                borderColor: "#FFA500",
                backgroundColor: "#FFA500",
                lineTension: 0,
                pointRadius: 1,
                pointHoverRadius: 1,
                fill: false,
            },
            {
                label: '벤치마크 : 코스피',
                data: y_kospi,
                borderColor: "#04092a",
                backgroundColor: '#04092a',
                lineTension: 0,
                pointRadius: 1,
                pointHoverRadius: 1,
                fill: false,
            },
            {
                label: '벤치마크 : S&P500',
                data: y_SP,
                borderColor: "#cccccc",
                backgroundColor: '#cccccc',
                pointRadius: 1,
                pointHoverRadius: 1,
                lineTension: 0,
                fill: false,
            }]
        },
        options: {
            responsive: true,
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: false,
                        labelString: '기간'
                    }
                }],
                yAxes: [{
                    display: true,
                    ticks: {
                        suggestedMin: 0,
                    },
                    scaleLabel: {
                        display: true,
                        labelString: '수익률'
                    }
                }]
            }
        }
    });
}
function Draw_hist_chart(x, y) {
    var return_ctx = document.getElementById("Histogram_chart").getContext('2d');
    window.hist_chart = new Chart(return_ctx, {
        type: 'line',
        data: {
            labels: x,
            datasets: [{
                label: '포트폴리오 수익률 변화',
                data: y,
                borderColor: "rgba(255, 201, 14, 1)",
                backgroundColor: "rgba(255, 201, 14, 0.5)",
                lineTension: 0
            }]
        },
        options: {
            responsive: true,
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: false,
                        labelString: '기간'
                    }
                }],
                yAxes: [{
                    display: true,
                    ticks: {
                        suggestedMin: 0,
                    },
                    scaleLabel: {
                        display: true,
                        labelString: '수익률'
                    }
                }]
            }
        }
    });
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
        valueAxis.zIndex = 1;
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

