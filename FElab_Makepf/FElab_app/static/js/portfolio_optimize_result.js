var mystocksDB = [];
var mystocks = [];
var stocknames= [];
var mystocks_weights = [];
var adjusted_assets_names = [];
var adjusted_assets_codes = [];
var adjusted_assets_weights = [];
var mystocks_names=[];
var mystocks_codes=[];
var original_ctx = "";
var after_ctx = "";
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
    mystocks_names = localStorage.getItem("mystocks_names").split(',');
    mystocks_codes = localStorage.getItem("mystocks_codes").split(',');
    mystocks_weights = localStorage.getItem("mystocks_weights").split(',');
    from_period = localStorage.getItem("from");
    to_period = localStorage.getItem("to");
    investment_kinds = localStorage.getItem("investment_kinds").split(',');
    
    opt_data = JSON.parse($('#any').val());
    GMV = opt_data .ret_vol['GMV'];
    MaxSharp = opt_data .ret_vol['MaxSharp'];
    RiskParity = opt_data .ret_vol['RiskParity'];
    Trets = opt_data .ret_vol['Trets'];
    Tvols = opt_data .ret_vol['Tvols'];
    Userpf = opt_data .ret_vol['User'];
    ef_points = JSON.parse(opt_data .efpoints);
    ef_points_tooltip = return_dict_items(ef_points);
    asset_weights = JSON.parse(opt_data .weights);
    ef_points_tooltip.push(asset_weights['gmv']);
    ef_points_tooltip.push(asset_weights['ms']);
    ef_points_tooltip.push(asset_weights['rp']);
    ef_points_tooltip.push(numtofix(mystocks_weights));
    $('#user_ret').text((Userpf[1]*100).toFixed(2)+"%");
    $('#user_vol').text(Userpf[0].toFixed(2));
    if (asset_weights ==1){
        alert("입력한 기간이 짧습니다.");
        location.reload();
    }
    if(window.Efchart){
        window.Efchart.destroy();
    }
    pie_backgroundColor = ['#003f5c','#2f4b7c','#665191','#a05195','#d45087','#f95d6a','#ff7c43','#ffa600','#2f4b7c','#665191','#a05195','#d45087','#f95d6a','#ff7c43','#ffa600'];
    $('#strategy_name_h2').html('Global Minimum Variance');
    $('#strategy_comment_span').html('GMV(전역 최소 분산) 포트폴리오는 투자자의 위험 성향이 아주 강한 경우의 포트폴리오입니다. 이러한 상황에서 투자자는 수익의 최대화보다 위험의 최소화를 우선순위로 두게 되며, 이에 따라 최적화 프로세스는 가장 낮은 변동성의 포트폴리오를 구성할 수 있도록 가중치의 해를 찾습니다.');
    data = {
        datasets: [{
            data: mystocks_weights,
            backgroundColor:pie_backgroundColor.slice(0,mystocks_codes.length),
        }],
        labels : mystocks_names, 
    }
    r_array= round_array(mystocks_weights);
    Draw_optimize_pie(data);
    
    
    $('#opt_report_table').empty();
    for (i =0; i<mystocks_codes.length; i++){
        $('#opt_report_table').append('<tr><td>'+mystocks_names[i]+'</td><td class="numberCell">'+r_array[i]+'%</td></tr>');
    }
    opt_result(mystocks_names, GMV, MaxSharp, RiskParity, Trets, Tvols,ef_points_tooltip);
    $("#putin_btn").click(function () {
        if (stocknames.includes($('#comboBox').val())) {
            var code = "kp"+$('#comboBox').val().split(' ')[0];
            var stockname = $('#comboBox').val().split(' ').slice(1,).join(' ');
            if(adjusted_assets_codes.includes(code)){
                alert("이미 담겨 있습니다");
            }else{
                adjusted_assets_names.push(stockname);
                adjusted_assets_codes.push(code);
                var add_eq = $('#adjusted_asset_row tr')['length'];
                $('#comboBox').val("");
                $('#adjusted_asset_row').append("<tr eq= "+Number(add_eq)+"><td class='numberCell'>"+stockname+
            "</td><td class='numberCell'><input id='adjusted_assets_weights"+Number(add_eq)+"' class='my_input_weight' type='number' style='width:100px;height:30px;border:none; background-color:#eeeeee;bottom:3px' value=''></td><td class='numberCell'><button id='putout_btn' eq= '"+Number(add_eq)+"' kor-name="+adjusted_assets_names[i]+" name=" + code +
            " style='width:60px;height:30px;border:none;border-radius:5px; background-color:#eeeeee;bottom:3px;'>빼기</button></td><td><image src='/static/images/loupe.png' id='showSise' data-stock = '"+code+"'data-popup-open = 'showSise' style='width:25px;height:25px;text-align:center;cursor:pointer;' align='middle' title='시세보기' cursor:pointer></image></td></tr>");
                
            }
            
        } else {
            alert("종목 정보가 올바르지 않습니다");
        }
    });
    
    $(document).on('click', '#putout_btn', function () {
        adjusted_assets_codes.splice(adjusted_assets_codes.indexOf($(this).attr('name')),1);
        adjusted_assets_names.splice(adjusted_assets_names.indexOf($(this).attr('kor-name')),1);
        $("#adjusted_asset_row tr[eq="+$(this).attr('eq')+"]").remove();
        mystocksDB.push($(this).attr('name'));
        for (i=0;i<adjusted_assets_codes.length;i++){
            $('#adjusted_asset_row tr').eq(i).attr('eq',i);
            $('#adjusted_asset_row tr[eq='+i+'] td button').attr('eq',i);
            $('#adjusted_asset_row tr[eq='+i+'] td input').attr('id','adjusted_assets_weights'+i);
        }
    });
    $('#add_asset_btn').click(function(){
        $('#add_block').css('display', "block");
        adjusted_assets_weights= mystocks_weights.slice();
        adjusted_assets_codes= mystocks_codes.slice();
        adjusted_assets_names= mystocks_names.slice();
        $('#adjusted_asset_row').empty();
        for(i =0; i<adjusted_assets_codes.length; i++){
        $('#adjusted_asset_row').append("<tr eq= "+i+"><td class='numberCell'>"+adjusted_assets_names[i]+
            "</td><td class='numberCell'><input id='adjusted_assets_weights"+i+"' class='my_input_weight' type='number' style='width:100px;height:30px;border:none; background-color:#eeeeee;bottom:3px' value='"+Number(adjusted_assets_weights[i])+"'></td><td class='numberCell'><button id='putout_btn' eq= "+i+" kor-name="+mystocks_names[i]+" name=" + mystocks_codes[i] +
            " style='width:60px;height:30px;border:none;border-radius:5px; background-color:#eeeeee;bottom:3px;'>빼기</button></td><td><image src='/static/images/loupe.png' id='showSise' data-stock = '"+adjusted_assets_codes[i]+"'data-popup-open = 'showSise' style='width:25px;height:25px;text-align:center;cursor:pointer;' align='middle' title='시세보기' cursor:pointer></image></td></tr>")
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
                alert("서버와 통신에 실패했습니다.");
            }
        })
    });
    $('[data-popup-close]').on('click', function(e) { // 팝업 닫기 버튼 클릭시 동작하는 이벤트입니다. 
        var targeted_popup_class = $(this).attr('data-popup-close'); 
        $('[data-popup="' + targeted_popup_class + '"]').fadeOut(350); 
        e.preventDefault(); 
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
        open: function(event, ui) {
            $(this).autocomplete("widget").css({
                "width": 300
            });
        },
        delay : 500,
        disable : false,
        position : {my : 'center top', at: 'center bottom', collision: "None Flip"},
    });
    $('#change_btn').click(function(){
        var ad_sum = 0
        adjusted_assets_weights= [];
        for (i=0;i<adjusted_assets_codes.length;i++){
            adjusted_assets_weights.push(parseFloat($('#adjusted_assets_weights'+i).val()));
            ad_sum = ad_sum+ parseFloat($('#adjusted_assets_weights'+i).val());
        }
        console.log(Number(ad_sum.toFixed(12)));

        if(Number(ad_sum.toFixed(12))!=1){
            alert("비중의 합이 1이 아닙니다.")
        }else{
            $.ajax({
                url: '/ajax_portfolio_optimize_return/',
                type: "POST",
                dataType: "json",
                data: {
                    "mystocks[]": adjusted_assets_codes, "mystocks_weights[]" : adjusted_assets_weights, "from": from_period, 'to': to_period,
                    //"investment_kinds" : 
                },
                success: function (data) {
                    var adjusted_GMV = data.ret_vol['GMV'];
                    var adjusted_MaxSharp = data.ret_vol['MaxSharp'];
                    var adjusted_RiskParity = data.ret_vol['RiskParity'];
                    var adjusted_Trets = data.ret_vol['Trets'];
                    var adjusted_Tvols = data.ret_vol['Tvols'];
                    adjusted_Userpf = data.ret_vol['User'];
                    var adjusted_ef_points = JSON.parse(data.efpoints);
                    var adjusted_ef_points_tooltip = return_dict_items(adjusted_ef_points);
                    var adjusted_asset_weights = JSON.parse(data.weights);
                    adjusted_ef_points_tooltip.push(adjusted_asset_weights['gmv']);
                    adjusted_ef_points_tooltip.push(adjusted_asset_weights['ms']);
                    adjusted_ef_points_tooltip.push(adjusted_asset_weights['rp']);
                    adjusted_ef_points_tooltip.push(adjusted_assets_weights);
                    if (adjusted_asset_weights ==1){
                        alert("입력한 기간이 짧습니다.");
                        location.reload();
                    }
                    //$('.optimize_result').css('display', 'flex');
                    opt_result_change(adjusted_assets_names, adjusted_GMV, adjusted_MaxSharp, adjusted_RiskParity, adjusted_Trets, adjusted_Tvols,adjusted_ef_points_tooltip);
                },error: function(request, status, error){
                    alert("입력하신 기간동안의 데이터가 부족한 종목이 포함되어 있습니다.");

                }

            });
        }
    });
});

function numtofix(array){
    r_array = []
    for(var i=0;i<array.length;i++){
        r_array.push(Number(array[i]));
    }
    return r_array 
}
function round_array(array){
    r_array = []
    for(var i=0;i<array.length;i++){
        r_array.push(Math.round(array[i]*100));
    }
    return r_array
}
function Draw_optimize_pie(data){
    if(original_ctx !=""){
        window.portfolio_pie_chart.destroy();
    }
    var portfolio_ctx = document.getElementById("portfolio_pie_chart").getContext('2d');
    original_ctx= portfolio_ctx;
    window.portfolio_pie_chart = new Chart(portfolio_ctx, {
        type: 'pie',
        data : data,
        label: mystocks_names,
        option : {
            responsive: false,
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
function pushscatter(chart, x, y, label, color, order) {
    chart.data.datasets.push({
        type: 'scatter',
        label: label,
        showLine: false,
        data: [{ x: x, y: y }],
        backgroundColor: color,
        pointBackgroundColor: color,
        pointRadius: 8,
        pointHoverRadius: 8,
        order: order,
    });
    chart.update();
}
function ad_tobacktest(){
    adjusted_weights = [];
    for (var i=0;i<adjusted_assets_codes.length;i++){
        adjusted_weights.push(Number($('#adjusted_assets_weights'+i).val()));
    }
    localStorage.setItem("adjusted_weights", adjusted_weights);
    localStorage.setItem("adjusted_codes", adjusted_assets_codes);
    localStorage.setItem("adjusted_names", adjusted_assets_names);
    location.href='/portfolio_backtest';
}
function tobacktest() {
    localStorage.removeItem("adjusted_weights");
    location.href = '/portfolio_backtest';
    
}
function opt_result(assetsBox, GMV, MaxSharp, RiskParity, Trets, Tvols,ef_points_tooltip) {
    var Ef_ctx = document.getElementById("efficient_frontier_graph").getContext('2d'); 
    ef_storage = [];
    
    for (var i = 0; i < Trets.length; i++) {
        x = Number(Tvols[i]);
        y = Number(Trets[i]);
        var json = { x: x, y: y };
        ef_storage.push(json);
    }

    window.Efchart = new Chart(Ef_ctx, {
        type: 'scatter',
        data: {
            datasets : [{
                label : '효율적 투자선',
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data : ef_storage,
                showLine : true,
                fill : false,
                order : 1,
            }],
        },
        options: {
            responsive: true, // Instruct chart js to respond nicely.
            maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height 
            tooltips:{
                displayColors:false,
                titleFontColor:'#fff',
                titleAlign: 'center',
                bodyFontSize: 15,
                bodySpacing: 2,
                bodyFontColor: '#fff',
                bodyAlign: 'center',
                callbacks: {
                    label: function(tooltipitem, data){
                        var title = "기대수익률 : "+ tooltipitem['yLabel'].toFixed(2) + " 표준편차 : "+tooltipitem['xLabel'].toFixed(2);
                        var body = "";
                        tooltip_weights = [];
                        if(tooltipitem['datasetIndex']==0){
                            for (var i=0; i<mystocks_names.length; i++){
                                body= body + mystocks_names[i] + ": " + ef_points_tooltip[tooltipitem['index']][i].toFixed(2)*100 + '% \n';
                                tooltip_weights.push(ef_points_tooltip[tooltipitem['index']][i]);
                            }
                            
                        }else if(tooltipitem['datasetIndex']==1){
                            for (var i=0; i<mystocks_names.length; i++){
                                body= body + mystocks_names[i] + ": " + ef_points_tooltip[tooltipitem['datasetIndex']+29][i].toFixed(2)*100 + '% \n';
                                tooltip_weights.push(ef_points_tooltip[tooltipitem['datasetIndex']+29][i]);
                            }
                            $('#gmv_title').css('color','#06c');
                            $('#ms_title').css('color','black');
                            $('#rp_title').css('color','black');
                                
                        }else if(tooltipitem['datasetIndex']==2){
                            for (var i=0; i<mystocks_names.length; i++){
                                body= body + mystocks_names[i] + ": " + ef_points_tooltip[tooltipitem['datasetIndex']+29][i].toFixed(2)*100 + '% \n';
                                tooltip_weights.push(ef_points_tooltip[tooltipitem['datasetIndex']+29][i]);
                            }
                            $('#gmv_title').css('color','black');
                            $('#ms_title').css('color','#06c');
                            $('#rp_title').css('color','black');
                            /*data = {
                                datasets: [{
                                    data: tooltip_weights,
                                    backgroundColor:pie_backgroundColor.slice(0,mystocks_names.length),
    
                                }],
                                labels : mystocks_names, 
                            }
                            Draw_optimize_pie(data);
                            r_array= round_array(tooltip_weights);
                            $('#opt_report_table').empty();
                            for (i =0; i<mystocks_names.length; i++){
                                $('#opt_report_table').append('<tr><td>'+mystocks_names[i]+'</td><td class="numberCell">'+r_array[i]+'%</td></tr>');
                            }*/
                        }else if(tooltipitem['datasetIndex']==3){
                            for (var i=0; i<mystocks_names.length; i++){
                                body= body + mystocks_names[i] + ": " + ef_points_tooltip[tooltipitem['datasetIndex']+29][i].toFixed(2)*100 + '% \n';
                                tooltip_weights.push(ef_points_tooltip[tooltipitem['datasetIndex']+29][i]);
                            }
                            $('#gmv_title').css('color','black');
                            $('#ms_title').css('color','black');
                            $('#rp_title').css('color','#06c');
                        }else if(tooltipitem['datasetIndex']==4){
                            for (var i=0; i<mystocks_names.length; i++){
                                body= body + mystocks_names[i] + ": " + ef_points_tooltip[tooltipitem['datasetIndex']+29][i].toFixed(2)*100 + '% \n';
                                tooltip_weights.push(ef_points_tooltip[tooltipitem['datasetIndex']+29][i]);
                            }
                        }
                        return [title, "", body];
                    }
                }
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: '평균 수익률(Y)',
                        fontStyle: 'bold',
                        fontSize: '10',
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: '표준편차(Y)',
                        fontStyle: 'bold',
                        fontSize: '10',
                    }
                }]
            },
        }
    });
    pushscatter(Efchart, GMV[0], GMV[1], 'GMV Portfolio', '#003f5c', '2');
    pushscatter(Efchart, MaxSharp[0], MaxSharp[1], 'Max Sharp Portfolio', '#d45087', '2');
    pushscatter(Efchart, RiskParity[0], RiskParity[1], 'Risk Parity Portfolio', '#ff7c43', '2');
    pushscatter(Efchart, Userpf[0], Userpf[1], "내 포트폴리오","#ffa600", "2");
}
function opt_result_change(assetsBox, GMV, MaxSharp, RiskParity, Trets, Tvols,ef_points_tooltip){
    var adjusted_Ef_ctx = document.getElementById("after_efficient_frontier_graph").getContext('2d');
    adjusted_ef_storage = [];
    if(after_ctx != ""){
        window.adjusted_Efchart.destroy();
    }
    after_ctx = adjusted_Ef_ctx;

    
    for (var i = 0; i < Trets.length; i++) {
        x = Number(Tvols[i]);
        y = Number(Trets[i]);
        var json = { x: x, y: y };
        adjusted_ef_storage.push(json);
    }

    window.adjusted_Efchart = new Chart(adjusted_Ef_ctx, {
        type: 'scatter',
        data: {
            datasets : [{
                label : '효율적 투자선',
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data : adjusted_ef_storage,
                showLine : true,
                fill : false,
                order : 1,
            }],
        },
        options: {
            responsive: true, // Instruct chart js to respond nicely.
            maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height 
            tooltips:{
                displayColors:false,
                titleFontColor:'#fff',
                titleAlign: 'center',
                bodyFontSize: 15,
                bodySpacing: 2,
                bodyFontColor: '#fff',
                bodyAlign: 'center',
                callbacks: {
                    label: function(tooltipitem, data){
                        var title = "기대수익률 : "+ tooltipitem['yLabel'].toFixed(2) + " 표준편차 : "+tooltipitem['xLabel'].toFixed(2);
                        var body = "";
                        adjusted_tooltip_weights = [];
                        if(tooltipitem['datasetIndex']==0){
                            for (var i=0; i<adjusted_assets_names.length; i++){
                                body= body + adjusted_assets_names[i] + ": " + ef_points_tooltip[tooltipitem['index']][i].toFixed(2)*100 + '% \n';
                                adjusted_tooltip_weights.push(ef_points_tooltip[tooltipitem['index']][i]);
                            }
                        }else if(tooltipitem['datasetIndex']==1){
                            for (var i=0; i<adjusted_assets_names.length; i++){
                                body= body + adjusted_assets_names[i] + ": " + ef_points_tooltip[tooltipitem['datasetIndex']+29][i].toFixed(2)*100 + '% \n';
                                adjusted_tooltip_weights.push(ef_points_tooltip[tooltipitem['datasetIndex']+29][i]);
                            }
                        }else if(tooltipitem['datasetIndex']==2){
                            for (var i=0; i<adjusted_assets_names.length; i++){
                                body= body + adjusted_assets_names[i] + ": " + ef_points_tooltip[tooltipitem['datasetIndex']+29][i].toFixed(2)*100 + '% \n';
                                adjusted_tooltip_weights.push(ef_points_tooltip[tooltipitem['datasetIndex']+29][i]);
                            }
                        }else if(tooltipitem['datasetIndex']==3){
                            for (var i=0; i<adjusted_assets_names.length; i++){
                                body= body + adjusted_assets_names[i] + ": " + ef_points_tooltip[tooltipitem['datasetIndex']+29][i].toFixed(2)*100 + '% \n';
                                adjusted_tooltip_weights.push(ef_points_tooltip[tooltipitem['datasetIndex']+29][i]);
                            }
                        }else if(tooltipitem['datasetIndex']==4){
                            for (var i=0; i<adjusted_assets_names.length; i++){
                                body= body + adjusted_assets_names[i] + ": " + ef_points_tooltip[tooltipitem['datasetIndex']+29][i].toFixed(2)*100 + '% \n';
                                adjusted_tooltip_weights.push(ef_points_tooltip[tooltipitem['datasetIndex']+29][i]);
                            }
                        }
                        return [title, "", body];
                    }
                }
            }
        },
        scales: {
            yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'Annual Return',
                    fontStyle: 'bold',
                    fontSize: '15',
                }
            }],
            xAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'Annual Volatility',
                    fontStyle: 'bold',
                    fontSize: '15',
                }
            }]
        },
    });
    pushscatter(adjusted_Efchart, GMV[0], GMV[1], 'GMV Portfolio', '#003f5c', '2');
    pushscatter(adjusted_Efchart, MaxSharp[0], MaxSharp[1], 'Max Sharp Portfolio', '#d45087', '2');
    pushscatter(adjusted_Efchart, RiskParity[0], RiskParity[1], 'Risk Parity Portfolio', '#ff7c43', '2');
    pushscatter(adjusted_Efchart, adjusted_Userpf[0], adjusted_Userpf[1], "내 포트폴리오","#ffa600", "2");

}

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
