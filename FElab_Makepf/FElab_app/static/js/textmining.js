var mystocks_names;
var mystocks_codes;
var mystocksDB=[];
var stocknames=[];
var imp_chart_company_cnt =0;
var imp_chart_array=[];
var sent_chart_cnt=0;
$(document).ready(function(){
    if(localStorage.getItem('mystocks_names')){
        mystocks_names = localStorage.getItem('mystocks_names').split(',');;  
        mystocks_codes = localStorage.getItem('mystocks_codes').split(',');;
        for (var i=0;i<mystocks_codes.length;i++){
            $('#myasset').append("<input type='button' class='myasset_btn' data='"+mystocks_codes[i]+"' value='"+mystocks_names[i]+"'/>");
        }
    }
    $(document).on('click', '.myasset_btn', function () {
        $('#comboBox2').val($(this).attr('data').slice(2,) +' '+ $(this).val());
    });
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
    $('#comboBox2').autocomplete({
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
        open: function(event, ui) {
            $(this).autocomplete("widget").css({
                "width": 300
            });
        },
        delay : 500,
        disable : false,
        position : {my : 'center top', at: 'center bottom', collision: "None Flip"},
    });
    
    $("#js-navbar-toggle").attr("src", "/static/images/menu_black.png");
    $('.nav-links').css("color","black");
    let today = new Date();  
    $('.now_date').text("기준일 " + today.getFullYear()+"/"+(Number(today.getMonth())+1)+"/"+today.getDate());
    
    $('#market_analysis').css('display','block');
    $('.category').click(function(){
        $(".category").removeClass("clicked");
        $(this).addClass("clicked");
        if($(this).html()=="시장 분석"){
            $('#market_analysis').css('display','block');
            $('#company_analysis').css('display','none');
            $('#company_analysis_result').css('display','none');
            $('#macro_analysis').css('display','none');
        }
        else if($(this).html()=="기업 분석"){
            $('#market_analysis').css('display','none');
            $('#market_analysis_result').css('display','none');
            $('#company_analysis').css('display','block');
            $('#macro_analysis').css('display','none');
        }
        else{
            $('#market_analysis').css('display','none');
            $('#company_analysis').css('display','none');
            $('#macro_analysis').css('display','block');
            $('#market_analysis_result').css('display','none');
            $('#company_analysis_result').css('display','none');
            $.ajax({
                url: '/ajax_macro_return/',
                type: "POST",
                dataType: "json",
                data: {},
                success: function (data) {
                    console.log(data);
                    var macro = {}
                    macro['Date'] = [];
                    macro['Gold'] = [];
                    macro['Silver'] = [];
                    macro['oil'] = [];
        
                    macro['exchange'] = [];
                    macro['exchange_eur'] = [];
                    macro['exchange_cny'] = [];
                    macro['exchange_jpy'] = [];
                    
                    macro['KR10'] = [];
                    macro['US10'] = [];
        
                    macro['Kospi'] = [];
                    macro['nasdaq'] = [];
                    macro['SP500'] = [];
        
                    macro['BTC'] = [];
                    macro['ETH'] = [];
                    
                    for(var i=0;i<data.m_data.length;i++){
                        macro['Date'].push(data.m_data[i][15]);
                        macro['Gold'].push(data.m_data[i][1]);
                        macro['Silver'].push(data.m_data[i][2]);
                        macro['oil'].push(data.m_data[i][3]);
        
                        macro['exchange'].push(data.m_data[i][4]);
                        macro['exchange_eur'].push(data.m_data[i][5]);
                        macro['exchange_cny'].push(data.m_data[i][6]);
                        macro['exchange_jpy'].push(data.m_data[i][7]);
        
                        macro['KR10'].push(data.m_data[i][8]);
                        macro['US10'].push(data.m_data[i][9]);
                        
                        macro['Kospi'].push(data.m_data[i][10]);
                        macro['nasdaq'].push(data.m_data[i][11]);
                        macro['SP500'].push(data.m_data[i][12]);
        
                        macro['BTC'].push(data.m_data[i][13]);
                        macro['ETH'].push(data.m_data[i][14]);
                        
                    }
                    Draw_macro1(macro);
                    Draw_macro2(macro);
                    Draw_macro3(macro);
                    Draw_macro4(macro);
                    Draw_macro5(macro);
                    Draw_impchart(data.result);
                    $('#asset_row').empty();
                    for(var i=0; i<data.d_data.length;i++){
                        var append_text= ""
                        r_array = round_array(data.d_data[i]);
                        append_text+='<tr><td>'+data.d_data[i][0].substring(0,10)+'</td>';
                        for(var j=1; j<r_array.length; j++){
                            append_text+='<td class="numberCell">'+r_array[j]+'</td>';
                        }
                        $('#asset_row').append(append_text+'</tr>');
                    }
                },
        
                error: function (request, status, error) {
                    console.log('실패');
                }
            });
        }
    });
    $('.horizon-prev').click(function(event) {
        event.preventDefault();
        if (screen.width>=375 && screen.width<420){
            $('#content').animate({
                scrollLeft: "-=275px"
              }, "slow");    
        }
        else{
            $('#content').animate({
                scrollLeft: "-=775px"
              }, "slow");
        }
        
    });
    $('.horizon-next').click(function(event) {
        event.preventDefault();
        //모바일 버전에서는 scroll 되는 범위를 줄여줘야함.
        if (screen.width>=375 && screen.width<420){
            $('#content').animate({
                scrollLeft: "+=275px"
              }, "slow");    
        }else{
            $('#content').animate({
                scrollLeft: "+=775px"
            }, "slow");
        }
        
    });
    $('.recmd_btn').click(function(){
        $('#comboBox').val($(this).val());
    });
    
    var news_data
    $('#search_btn').click(function(){
        var keyword = $('#comboBox').val();
        if($('#comboBox').val()==""){
            alert("키워드를 입력해주세요");
        }
        else{
            $('#news_board').empty();
            $.ajax({
                url: '/ajax_news_return/',
                type: "POST",
                dataType: "json",
                data: {'keyword': keyword},
                success: function (data) {
                    news_data = data.news;
                    for(i=0;i<data.news.items.length;i++){
                        $('#news_board').append("<a class='news' href="+data.news.items[i]['link']+"><br></br>"+data.news.items[i]['title']);
                    }
                },
                error: function (request, status, error) {
                    console.log('실패');
                }
            });
        }
    });
    $('#market_analysis_btn').click(function(){
        if (typeof(news_data) == "undefined" || $('#comboBox').val()==""){
            alert("수집된 뉴스가 없습니다");
        }
        else{
            $.ajax({
                url: '/ajax_news_analysis/',
                type: "POST",
                dataType: "json",
                data: {'news_data': JSON.stringify(news_data)},
                success: function(data){
                    $('#wordcloud').empty();
                    var words = []
                    for (i=0;i<data.words_list.length;i++){
                        words.push({'text': data.words_list[i][0], 'weight': data.words_list[i][1]})
                    }
                    $('#wordcloud').jQCloud(words,{
                        autoResize : false,
                        height: 350,
                        delay: 50,
                    });
                    if (data.LSTM_sent>50){
                        var comment = "수집된 뉴스의 감성지수는 "+ data.LSTM_sent.toFixed(0)+ " 점 입니다. 내일의 주가(코스피 종가)를 긍정적으로 예상하고 있습니다.";
                    }else if(data.LSTM_sent<=50){
                        var comment = "수집된 뉴스의 감성지수는 "+ data.LSTM_sent.toFixed(0)+ " 점 입니다. 내일의 주가(코스피 종가)를 부정적으로 예상하고 있습니다.";
                    }
                    $('#sent_score').html(comment);
                    $('#market_analysis_result').css('display','inline-block');
                    $('#company_analysis_result').css('display','none');
                    $('#macro_analysis_result').css('display','none');
                    
                    if(sent_chart_cnt>=1){
                        window.sent_chart.destroy();
                    }
                    Draw_sentchart(data.LSTM_sent);

                },beforeSend:function(){
                    loading();
                },complete:function(){
                    closeloading();
                },error: function (request, status, error) {
                    alert('서버와 통신에 실패했습니다');
                }
            });
        }
    });
    $('#company_analysis_btn').click(function(){
        if (stocknames.includes($('#comboBox2').val())){
            $('#market_analysis_result').css('display','none');
            $('company_analysis_result').css('display','block');
            $('#company_name').text($('#comboBox2').val().split(' ')[1]);
            $('#company_info').text("기본재무정보");
            $.ajax({
                url: '/ajax_company_analysis/',
                type: "POST",
                dataType: "json",
                data: {'stock_code': 'kp'+$('#comboBox2').val().split(' ')[0]},
                success: function (data) {
                    console.log(data);
                    if(imp_chart_company_cnt>=1){
                        imp_chart_array[0].destroy();
                        imp_chart_array[1].destroy();
                        imp_chart_array =[];
                    }
                    Draw_impchart_company(data.ada_boost, 'imp_chart_ada');
                    Draw_impchart_company(data.random_forest, 'imp_chart_rf');
                    $('#accuracy_row').empty();
                    $('#accuracy_row').append('<tr id="ada_row"><td>Ada-Boost</td></tr><tr id="rf_row"><td>Random-Forest</td></tr>');
                    
                    for(var i=0; i<data.accuracy[0]['accuracy_measure'].length;i++){
                        $('#ada_row').append('<td>'+data.accuracy[0]['ada_boost'][i]+'</td>');
                    }
                    for(var i=0; i<data.accuracy[0]['accuracy_measure'].length;i++){
                        $('#rf_row').append('<td>'+data.accuracy[0]['random_forest'][i]+'</td>');
                    }
                    
                },beforeSend:function(){
                    loading();
                },complete:function(){
                    closeloading();
                },error: function (request, status, error) {
                    console.log('실패');
                }
            });
            $.ajax({
                url: '/ajax_db_return/',
                type: "POST",
                dataType: "json",
                data: {'stock_code': 'kp'+$('#comboBox2').val().split(' ')[0]},
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
            });
            $.ajax({
                url: '/ajax_news_return/',
                type: "POST",
                dataType: "json",
                data: {'keyword': $('#comboBox2').val().split(' ')[1]},
                success: function (data) {
                    $('#company_news_board').empty();
                    news_data = data.news;
                    for(i=0;i<data.news.items.length;i++){
                        $('#company_news_board').append("<a class='news' href="+data.news.items[i]['link']+"><br></br>"+data.news.items[i]['title']);
                    }
                },
                error: function (request, status, error) {
                    console.log('실패');
                }
            });
            $('#market_analysis_result').css('display','none');
            $('#company_analysis_result').css('display','inline-block');
            $('#macro_analysis_result').css('display','none');
        }
        else{
            alert("종목 정보가 올바르지 않습니다.");
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
function round_array(array){
    r_array = []
    for(var i=0;i<array.length;i++){
        r_array.push(Number(array[i]).toFixed(2));
    }
    return r_array
}
function option(title){
    return options ={
        title:{
            display: true,
            text : title,
        },
        responsive: true,
        maintainAspectRatio: false,
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
                    labelString: '시세변동'
                }
            }]
        }
    }
};
function Draw_impchart(importances){
    var impctx = document.getElementById('imp_chart').getContext('2d');
    var imp_chart = new Chart(impctx, {
        type: 'horizontalBar',
        data: {
            labels:['국제 금가격','국제 은가격','WTI(원유)','원달러 환율','원유로 환율','원위엔 환율','원엔 환율','국채10년물 금리','미국채 10년물 금리','나스닥','S&P500','BTC','ETH'],
            datasets:[{
                label : '',
                data: importances,
                backgroundColor: ['#003f5c','#2f4b7c','#665191','#a05195','#d45087','#f95d6a','#ff7c43','#ffa600','#2f4b7c','#665191','#a05195','#d45087','#f95d6a','#ff7c43','#ffa600'],
            }],
        },
        options: {
            legend: {
                display: false
            },
            responsive:true,
            maintainAspectRatio:false,
            scales: {
                xAxes: [{
                    ticks: {
                        beginAtZero: 0 // Edit the value according to what you need
                    }
                }],
                yAxes: [{
                    stacked: true
                }]
            }
        }
    });
}
function Draw_impchart_company(importances,elementid){
    imp_chart_company_cnt++;
    var impctx = document.getElementById(elementid).getContext('2d');
    var imp_chart = new Chart(impctx, {
        type: 'horizontalBar',
        data: {
            labels:importances[0]['Feature'],
            datasets:[{
                label : '',
                data: importances[0]['Importances'],
                backgroundColor: ['#003f5c','#2f4b7c','#665191','#a05195','#d45087','#f95d6a','#ff7c43','#ffa600','#2f4b7c','#665191','#a05195','#d45087','#f95d6a','#ff7c43','#ffa600'],
            }],
        },
        options: {
            legend: {
                display: false
            },
            responsive:true,
            maintainAspectRatio:false,
            scales: {
                xAxes: [{
                    ticks: {
                        beginAtZero: 0 // Edit the value according to what you need
                    }
                }],
                yAxes: [{
                    stacked: true
                }]
            }
        }
    });
    imp_chart_array.push(imp_chart);
}

function Draw_sentchart(sent){
    sent_chart_cnt++;
    sentctx= document.getElementById('sent_chart').getContext('2d');

    var purple_orange_gradient = sentctx.createLinearGradient(0, 0, 0, 600);
    purple_orange_gradient.addColorStop(0, 'orange');
    purple_orange_gradient.addColorStop(1, 'purple');
    
    window.sent_chart = new Chart(sentctx, {
        type: 'bar',
        data: {
            labels: ["감성점수"],
            datasets: [{
                label: '',
                data: [sent],
                backgroundColor: purple_orange_gradient,
                hoverBackgroundColor: purple_orange_gradient,
                hoverBorderWidth: 2,
                hoverBorderColor: 'purple'
            }]
        },
        options: {
            legend: {
                display: false
             },
            responsive:true,
            maintainAspectRatio:false,
            scales: {
                yAxes: [{
                    gridLines: {
                        drawBorder: false,
                      },
                    ticks: {
                        min:0,
                        max:100,
                        beginAtZero:true
                    }
                }]
            }
        }
    });
}
function Draw_macro1(data){
    var macro_ctx1 = document.getElementById("macro_graph1").getContext('2d');
    window.macro_chart1 = new Chart(macro_ctx1, {
        type: 'line',
        data: {
            labels: data['Date'],
            datasets: [{
                label: '국제 금가격',
                data: data['Gold'],
                borderColor: "#FFA500",
                backgroundColor: "#FFA500",
                lineTension: 0,
                pointRadius: 1,
                pointHoverRadius: 1,
                fill: false,
            },
            {
                label: '국제 은가격',
                data: data['Silver'],
                borderColor: "#04092a",
                backgroundColor: '#04092a',
                lineTension: 0,
                pointRadius: 1,
                pointHoverRadius: 1,
                fill: false,
            },
            {
                label: 'WTI(원유)',
                data: data['oil'],
                borderColor: "#639371",
                backgroundColor: '#639371',
                pointRadius: 1,
                pointHoverRadius: 1,
                lineTension: 0,
                fill: false,
            }]
        },
        options : option("원자재")
    });

}
function Draw_macro2(data){
    var macro_ctx2 = document.getElementById("macro_graph2").getContext('2d');
    window.macro_chart2 = new Chart(macro_ctx2, {
        type: 'line',
        data: {
            labels: data['Date'],
            datasets: [{
                label: '미국고채 10년물 금리',
                data: data['US10'],
                borderColor: "#04092a",
                backgroundColor: '#04092a',
                lineTension: 0,
                pointRadius: 1,
                pointHoverRadius: 1,
                fill: false,
            },
            {
                label: '국고채 10년물 금리',
                data: data['KR10'],
                borderColor: "#cccccc",
                backgroundColor: '#cccccc',
                pointRadius: 1,
                pointHoverRadius: 1,
                lineTension: 0,
                fill: false,
            }]
        },
        options: option("금리")
    });
}
function Draw_macro3(data){
    var macro_ctx3 = document.getElementById("macro_graph3").getContext('2d');
    window.macro_chart3 = new Chart(macro_ctx3, {
        type: 'line',
        data: {
            labels: data['Date'],
            datasets: [
            {
                
                label: '코스피',
                data: data['Kospi'],
                borderColor: "#04092a",
                backgroundColor: "#04092a",
                lineTension: 0,
                pointRadius: 1,
                pointHoverRadius: 1,
                fill: false,
            },
            {
                label: 'NASDAQ',
                data: data['nasdaq'],
                borderColor: "#cccccc",
                backgroundColor: '#cccccc',
                lineTension: 0,
                pointRadius: 1,
                pointHoverRadius: 1,
                fill: false,
            },
            {
                label: 'S&P500',
                data: data['SP500'],
                borderColor: "#639371",
                backgroundColor: '#639371',
                pointRadius: 1,
                pointHoverRadius: 1,
                lineTension: 0,
                fill: false,
            }],
        },
        options: option("인덱스")
    });
}
function Draw_macro4(data){
    var macro_ctx4 = document.getElementById("macro_graph4").getContext('2d');
    window.macro_chart4 = new Chart(macro_ctx4, {
        type: 'line',
        data: {
            labels: data['Date'],
            datasets: [{
                label: 'USD/KRW',
                data: data['exchange'],
                borderColor: "#FFA500",
                backgroundColor: "#FFA500",
                lineTension: 0,
                pointRadius: 1,
                pointHoverRadius: 1,
                fill: false,
            },
            {
                label: 'EUR/KRW(유로화)',
                data: data['exchange_eur'],
                borderColor: "#04092a",
                backgroundColor: "#04092a",
                lineTension: 0,
                pointRadius: 1,
                pointHoverRadius: 1,
                fill: false,
            },
            {
                label: 'CNY/KRW(위엔화)',
                data: data['exchange_cny'],
                borderColor: "#cccccc",
                backgroundColor: "#cccccc",
                lineTension: 0,
                pointRadius: 1,
                pointHoverRadius: 1,
                fill: false,
            },
            {
                label: 'JPY/KRW(엔화)',
                data: data['exchange_jpy'],
                borderColor: "#639371",
                backgroundColor: "#639371",
                lineTension: 0,
                pointRadius: 1,
                pointHoverRadius: 1,
                fill: false,
            }],
        },
        options : option("환율")
    });
}
function Draw_macro5(data){
    var macro_ctx5 = document.getElementById("macro_graph5").getContext('2d');
    window.macro_chart5 = new Chart(macro_ctx5, {
        type: 'line',
        data: {
            labels: data['Date'],
            datasets: [{
                label: 'BTC',
                data: data['BTC'],
                borderColor: "#FFA500",
                backgroundColor: "#FFA500",
                lineTension: 0,
                pointRadius: 1,
                pointHoverRadius: 1,
                fill: false,
            },
            {
                label: 'ETH',
                data: data['ETH'],
                borderColor: "#04092a",
                backgroundColor: "#04092a",
                lineTension: 0,
                pointRadius: 1,
                pointHoverRadius: 1,
                fill: false,
            }],
        },
        options : option("가상화폐")
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
