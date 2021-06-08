from sklearn.ensemble import RandomForestRegressor
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.model_selection import train_test_split
import json
from datetime import date
import datetime
from dateutil import rrule
from calendar import monthrange
import pymysql
from dateutil.relativedelta import relativedelta
import FinanceDataReader as fdr
from sklearn.ensemble import AdaBoostRegressor
from sklearn.metrics import accuracy_score, mean_squared_error, r2_score
from sklearn.preprocessing import MinMaxScaler

class RF_model():
    def getDf(self,data):
        X_data = data[data.drop(['Date','Kospi'],axis=1).columns]
        y_data = data[['Kospi']]
        #정규화
        ss = StandardScaler()
        X_scaled = ss.fit_transform(X_data)
        y_scaled = ss.fit_transform(y_data)
        x_train, x_test, y_train, y_test = train_test_split(X_scaled, y_scaled, test_size=0.3,shuffle=True)
        # 학습 진행
        forest = RandomForestRegressor(n_estimators=100)
        forest.fit(x_train, y_train)
        
        return list(forest.feature_importances_)
    def retCorr(self,data):
        corr= list(data.corr(method='pearson')['Kospi'].drop(['Kospi']))
        n_corr = []
        for i in corr:
            n_corr.append(abs(i))
        return n_corr
        
    def stock_feature(self,select,conn,stock_conn):
        '''
        select : '013890'의 형태로 input 필요
        conn의 경우는 bokdata db 필요
        '''
        curs = conn.cursor()
        # 013890
        sql = "select bok_data.index, RealEstateIndices as 부동산업지수, ReturBonds as 국고채3년수익률, ConsumerPrice as 소비자물가등락율, KOSPI, Unemployment as 실업률, ManufacturingOperatingRates as 제조업가동률, HousingPrice as 주택매매가격등락률, Construction as 건설업_업황실적, Wholesale as 도소매업_업황실적, Service as 서비스업_업황실적, LargeBusinesses as 대기업_업황실적,SmallBusinesses as 중소기업_업항실적, Export as 수출기업_업황실적, Domestic as 내수기업_업황실적, FoodProducts as 식료품_업황실적, Chemicals as 화학제품_업황실적, Medicine 의약품_업황실적, ElectronicCommunications as 전자_영상_통신장비_업황실적, ElectricalEquipment as 전기장비, Automobiles as 자동차_업황실적, Shipbuilding as 조선_기타운수_업황실적, furniture as 가구_업황실적 from bok_data;"

        bok_data = pd.read_sql(sql,conn)

        conn.close()
        bok_data.rename(columns = {'index':'Date'}, inplace=True)
        ###
        # 추후 추가필요사항 -> 정규화 및 shitf 최적화 
        ###
        #bok_data # 주의 사항 데이터 마다 현 시점으로 부터 1달전, 2달전 업데이트가 다를 수 있음 NA값이 허용되는 분석 혹은 삭제 필

        ticker = str(select)
        curs = stock_conn.cursor()
        sql = "SELECT * FROM " + ticker
        stock_data = pd.read_sql(sql,stock_conn)
        stock_conn.close()
        
        start_d = stock_data['Date'] >= datetime.datetime.now() - relativedelta(years=5)
        end_d =  stock_data['Date'] <= datetime.datetime.now()
        stock_data = stock_data[start_d & end_d]
        stock_data = stock_data.set_index('Date')
        stock_data = pd.DataFrame(stock_data.resample('MS').first(),columns = ['Close','Change']).reset_index()
        stock_data = stock_data[stock_data.Close != 0] # 거래정지종목의 Open값이 0으로 나오는 문제 -> row 삭제
        # 주가가 선반영하는 성질을 반영해, shift를 휴리스틱하게 주었음( 추후 근거 필요 )
        stock_data['Change'] = stock_data['Change'].shift(1)
        #rfada_dataset
        
        rfada_dataset = pd.merge(stock_data,bok_data,how='left', left_on='Date',right_on='Date')
        rfada_dataset['KOSPI'] = rfada_dataset['KOSPI'].pct_change()
        # randomforest 변수선정
        clf=RandomForestRegressor(n_estimators=1000)
        X = rfada_dataset[rfada_dataset.columns[3:]].fillna(0)
        Y = rfada_dataset[rfada_dataset.columns[2]].fillna(0)
        clf.fit(X,Y)
        rf_imp = pd.Series(clf.feature_importances_,index=rfada_dataset.columns[3:]).sort_values(ascending=False)
        rf_imp = pd.DataFrame(rf_imp)
        rf_imp = rf_imp.rename_axis('feature').reset_index() 
        predict_rf = clf.predict(X)
        #print('MSE  : ', mean_squared_error(Y,predict_rf))
        #print('RMSE : ', np.sqrt(mean_squared_error(Y,predict_rf)))
        #rint('R^2  : ', r2_score(Y, predict_rf))
        
        
        # adaboost 변수 선정 
        clf=AdaBoostRegressor(n_estimators=1000)
        
        X = rfada_dataset[rfada_dataset.columns[3:]].fillna(0)
        Y = rfada_dataset[rfada_dataset.columns[2]].fillna(0)
        clf.fit(X,Y)
        ada_imp = pd.Series(clf.feature_importances_,index=rfada_dataset.columns[3:]).sort_values(ascending=False)
        ada_imp = pd.DataFrame(ada_imp)
        ada_imp = ada_imp.rename_axis('feature').reset_index() 
        predict_ada = clf.predict(X)
        #print('MSE  : ', mean_squared_error(Y,predict_ada))
        #print('RMSE : ', np.sqrt(mean_squared_error(Y,predict_ada)))
        #print('R^2  : ', r2_score(Y, predict_ada))
        
        accuracy =  {'accuracy_measure': ['MSE','RMSE','R^2'],
            'random_forest': [mean_squared_error(Y,predict_rf),np.sqrt(mean_squared_error(Y,predict_rf)),r2_score(Y, predict_rf)],
            'ada_boost': [mean_squared_error(Y,predict_ada),np.sqrt(mean_squared_error(Y,predict_ada)),r2_score(Y, predict_ada)]}
        accuracy = pd.DataFrame(accuracy)

        feature_selection = {
            'random_forest': [
                    {
                    'Feature': list(rf_imp['feature']),
                    'Importances': list(rf_imp[0])
                    }
            ],         
            'ada_boost': [
                    {
                    'Feature': list(ada_imp['feature']),
                    'Importances': list(ada_imp[0])
                    }
            ],
            'accuracy': [
                    {
                    'accuracy_measure': list(accuracy['accuracy_measure']),
                    'random_forest': list(accuracy['random_forest']),                 
                    'ada_boost': list(accuracy['ada_boost'])
                    }
            ]
        }  


        
        return feature_selection