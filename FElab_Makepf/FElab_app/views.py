from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
import json
import pymysql
from django.views.decorators.csrf import csrf_exempt
from FElab_app.opt_models import c_Models
from FElab_app.variable_importances import RF_model
from FElab_app.back_test import back_test

import pandas as pd
from django.http import HttpResponse,JsonResponse
import numpy as np
import FinanceDataReader as fdr
from datetime import datetime, timedelta
import time
import requests
from io import BytesIO
from sqlalchemy import create_engine 
import re
from eunjeon import Mecab

import tensorflow as tf
from tensorflow.keras.models import load_model
from sklearn.model_selection import train_test_split
from tensorflow.keras.preprocessing.sequence import pad_sequences
from FElab_app.load_mymodel import LoadConfig
import collections

loaded_model = LoadConfig.model
tokenizer = LoadConfig.tokenizer
#-*-coding:utf-8 -*-
# Create your views here.
#db 
db = {
        'host': "localhost",
        'user': "root",
        'password' : "su970728!",
        'db_name' : "krmarket",
    }
    #홈페이지 메인
def home(request):
    return render(request, 'FElab_app/home.html',{})
#-------------------------------#

@csrf_exempt
def ajax_stockname_return(request):
    conn = pymysql.connect(host=db['host'], user=db['user'], password=db['password'], db='stockcodename')
    sql = "SELECT * FROM codename;"
        
    #sql문 실행/ 데이터 받기
    curs = conn.cursor()
    curs.execute(sql)
    data = curs.fetchall()

    #db 접속 종료
    curs.close()
    conn.close()
    stock_arr = []
    for i in range(len(data)):
        stock_arr.append(data[i][1]+' '+data[i][2])

    return JsonResponse(stock_arr, safe=False)
#ajax 통신 (디비 내용 json으로 response)
@csrf_exempt
def ajax_db_return(request):
    conn = pymysql.connect(host=db['host'], user=db['user'], password=db['password'], db=db['db_name'])
    sql = "SELECT * FROM "+ request.POST['stock_code']+";"

    #sql문 실행/ 데이터 받기
    curs = conn.cursor()
    curs.execute(sql)
    data = curs.fetchall()

    #db 접속 종료
    curs.close()
    conn.close()

    return JsonResponse(data, safe=False)
#포트폴리오 최적화 한 것을 ajax로 통신
@csrf_exempt
def ajax_portfolio_optimize_return(request):
    conn = pymysql.connect(host=db['host'], user=db['user'], password=db['password'], db=db['db_name'])
    mystocks= request.POST.getlist('mystocks[]')
    mystocks_weights = request.POST.getlist('mystocks_weights[]')
    from_period = pd.to_datetime(request.POST.get('from'))
    to_period = pd.to_datetime(request.POST.get('to'))
    w =[]
    for i in range(len(mystocks_weights)):
        w.append(float(mystocks_weights[i]))
    mystocks_weights = w
    strategy = request.POST.get('strategy')
    c_m = c_Models(mystocks,mystocks_weights,from_period,to_period,conn)
    ret_vol, efpoints, weights = c_m.plotting()
    data = {'ret_vol': ret_vol, 'efpoints': efpoints, "weights" : weights}
    return JsonResponse(data, safe=False)
    
#포트폴리오 최적화 한 것을 ajax로 통신
#ajax 백테스트
@csrf_exempt
def ajax_backtest(request):
    conn = pymysql.connect(host=db['host'], user=db['user'], password=db['password'], db=db['db_name'])
    assetnames= request.POST.getlist('assetsBox[]')
    assetweights = request.POST.getlist('assetweights[]')
    from_period = request.POST.get('from')
    to_period = request.POST.get('to')
    rebalancing_month = request.POST.get('rebalancing_month')
    rebalancing_option = request.POST.get('rebalancing_option')
    start_amount = request.POST.get('start_amount')
    interval = request.POST.get('interval')
    #strategy = request.POST.get('strategy')
    backtest = back_test()

    data = backtest.backtest_data(assetnames,assetweights,from_period,to_period,start_amount,rebalancing_month,conn,interval,rebalancing_option)

    return JsonResponse(data, safe=False)

#포트폴리오 최적화 페이지
def portfolio_optimize(request):
    return render(request, 'FElab_app/portfolio_optimize.html',{})
#--------------------------------#
def portfolio_optimize_result(request):
    conn = pymysql.connect(host=db['host'], user=db['user'], password=db['password'], db=db['db_name'])
    mystocks= request.POST.getlist('mystocks[]')
    mystocks_weights = request.POST.getlist('mystocks_weights[]')
    from_period = pd.to_datetime(request.POST.get('my_from'))
    to_period = pd.to_datetime(request.POST.get('my_to'))
    w =[]
    for i in range(len(mystocks_weights)):
        w.append(float(mystocks_weights[i]))
    mystocks_weights = w
    #strategy = request.POST.get('strategy')
    c_m = c_Models(mystocks,mystocks_weights,from_period,to_period,conn)
    if(c_m=="No Data"):
        data = "No Data"
    else:
        ret_vol, efpoints, weights = c_m.plotting()
        data = {'ret_vol': ret_vol, 'efpoints': efpoints, "weights" : weights}
    return render(request, 'FElab_app/portfolio_optimize_result.html',context={'data':json.dumps(data)})
#포트폴리오 백테스트 페이지
def portfolio_backtest(request):
    return render(request, 'FElab_app/portfolio_backtest.html',{})
#--------------------------------#


#뉴스 수집 후 반환 
@csrf_exempt
def ajax_news_return(request):
    keyword= str(request.POST.get('keyword'))
    c_id = "tYIGVa4i5v4xErQcG01z"
    c_pwd = "FZJ0DeaGzu"
    search_word = keyword #검색어
    encode_type = 'json' #출력 방식 json 또는 xml
    max_display = 100 #출력 뉴스 수
    sort = 'date' #결과값의 정렬기준 시간순 date, 관련도 순 sim
    start = 1 # 출력 위치
    url = f"https://openapi.naver.com/v1/search/news.{encode_type}?query={search_word}&display={str(int(max_display))}&start={str(int(start))}&sort={sort}"
    headers = {
        'X-Naver-Client-Id' : c_id,
        'X-Naver-Client-Secret' : c_pwd,
    }
    r = requests.get(url, headers=headers)
    news = r.json()
    data = {'news' : news}
    return JsonResponse(data, safe=False)
@csrf_exempt
def ajax_news_analysis(request):
    news_data = json.loads(request.POST.get('news_data', ''))
    mecab= Mecab()
    def sentiment_predict(new_sentence):
        max_len = 30
        stopwords = ['의','가','이','은','들','는','좀','잘','걍','과','도','를','으로','자','에','와','한','하다']
        new_sentence = re.sub(r'[^ㄱ-ㅎㅏ-ㅣ가-힣 ]','', new_sentence)
        new_sentence = mecab.morphs(new_sentence) # 토큰화
        new_sentence = [word for word in new_sentence if not word in stopwords] # 불용어 제거
        #tokenizer = Tokenizer()
        tokenizer.fit_on_texts([new_sentence])
        encoded = tokenizer.texts_to_sequences([new_sentence]) # 정수 인코딩
        pad_new = pad_sequences(encoded, maxlen = max_len) # 패딩
        score = float(loaded_model.predict(pad_new)) # 예측
        return score * 100
    score= []
    words_list = []
    for i in range(len(news_data['items'])):
        title = news_data['items'][i]['title']
        words_list.extend(mecab.nouns(title))
        s = sentiment_predict(title)
        if s>10 and s<90:
            score.append(s)
    score_avg = sum(score)/len(score)
    counter = collections.Counter(words_list)
    data = {'LSTM_sent' : score_avg, 'words_list' : counter.most_common(30)}
    return JsonResponse(data, safe=False)

@csrf_exempt
def ajax_company_analysis(request):
    conn = pymysql.connect(host=db['host'], user=db['user'], password=db['password'], db='stockcodename')
    stock_conn = pymysql.connect(host=db['host'], user=db['user'], password=db['password'], db=db['db_name'])
    assetnames= request.POST.get('stock_code')

    rf_model = RF_model()

    data = rf_model.stock_feature(assetnames,conn,stock_conn)
    return JsonResponse(data, safe=False)
@csrf_exempt
def ajax_macro_return(request):
    conn = pymysql.connect(host=db['host'], user=db['user'], password=db['password'], db='stockcodename')
    sql = "SELECT *,DATE_FORMAT(Date,'%Y-%m') m FROM macro_economics GROUP BY M;"
    curs = conn.cursor()
    curs.execute(sql)
    data = curs.fetchall()
    sql2 = "SELECT * FROM macro_economics ORDER BY Date DESC LIMIT 7;"
    #sql3 = "SELECT * FROM macro_economics ORDER BY Date DESC LIMIT 30;"
    curs.execute(sql2)
    data2 = curs.fetchall()
    rf_model = RF_model()

    df = pd.read_sql(sql2, con=conn)
    '''
    result_array=[]
    for i in range(10):
        result_array.append(rf_model.getDf(df))
    result = np.mean(result_array,axis=0)'''
    result = rf_model.retCorr(df)
    curs.close()
    conn.close()
    return JsonResponse({'m_data': data,'d_data': data2,'result':list(result)}, safe=False)

#텍스트 마이닝 페이지
def textmining(request):
    return render(request, 'FElab_app/textmining.html',{})
#--------------------------------#

#회원가입 페이지
def signup(request):
    if request.method == 'POST':
        signup_form = UserCreationForm(request.POST)
        if signup_form.is_valid():
            signup_form.save()
        return redirect('posts:list')
    else:
        signup_form = UserCreationForm()
    
    return render(request, 'FElab_app/signup.html', {'signup_form':signup_form})

#로그인 페이지
def login(reques):
    return render(reques, 'FElab_app/Login.html', {})


