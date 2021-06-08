import pymysql
import datetime
import pandas as pd
import numpy as np
from scipy.optimize import minimize
import json

class c_Models:
    #Input 값으로, 자산 list, 사용자 포트폴리오 비중, 시작일, 마지막일, DB
    def __init__(self, assets, assets_w, start, end, conn):
        self.result = None
        self.graph = None
        eon_db = conn
        cursor = eon_db.cursor(pymysql.cursors.DictCursor)
        
        #sql = "SHOW TABLES;"
        #cursor.execute(sql)
        #result = cursor.fetchall()
        #total_list = [] 
        #start = datetime.datetime.strptime(start, "%Y-%m-%d")
        #end = datetime.datetime.strptime(end, "%Y-%m-%d")

        #for i in range(len(result)):
           # total_list.extend(list(result[i].values())) #전체 자산 리스트 

        #total_data = pd.DataFrame() #전체 데이터를 저장할 데이터프레임
        data = pd.DataFrame()
        # 전체 자산 data들을 가지고 온 후, 정리함
        for asset in assets: #total_list:
            sql = "SELECT * FROM krmarket." + asset + ";"
            cursor.execute(sql)
            result = cursor.fetchall()
            result = pd.DataFrame(result)
            result.index = result['Date']
            result.drop(['Open','High','Low','Volume','Change','Date'],axis=1, inplace=True)
            result.rename(columns={'Close': asset}, inplace=True)
            
            data = pd.concat([data, result], axis=1)
            #total_data = pd.concat([total_data, result], axis=1) 
            
        #self.total_data = total_data

        # 사용자가 입력한 기간 및 자산군 받은 걸로 데이터프레임을 추출
        #data = total_data.loc[:assets]
        data = data.loc[:,assets]
        data = data.loc[start:end]
        
        
        if data.isnull().values.any() == True: #불러온 data에 결측있으면 x
            return "No Data",''
        else:
            
            data = data.resample('M').mean() #일별 데이터를 월별 데이터로 만들어줌
            data = data.pct_change() #월별 주가 데이터를 이용해 수익률 데이터로 변환
            data.dropna(inplace=True) #결측치 제외(첫 row)

            self.data = data
            self.assets_w = assets_w
            self.mu = data.mean() * 12
            self.cov = data.cov() * 12
            '''self.strategy = strategy
            
            if "gmv" in strategy:
                self.result = self.gmv_opt()
                #self.graph = self.efplot()
            elif "ms" in strategy:
                self.result  = self.ms_opt()
                #self.graph = self.efplot()
            elif "rp" in strategy:
                self.result = self.rp_opt()
                #self.graph = self.efplot()
            else:
                self.result = print("전략이 잘못 입력되었습니다. ")'''
    #GMV 최적화 : 제약 조건은 비중합=1, 공매도 불가능
    def gmv_opt(self):
        n_assets = len(self.data.columns)
        w0 = np.ones(n_assets) / n_assets
        fun = lambda w: np.dot(w.T, np.dot(self.cov, w))
        constraints = ({'type':'eq', 'fun':lambda x: np.sum(x)-1})
        bd = ((0,1),) * n_assets
        #cov = data.cov() * 12
        
        gmv = minimize(fun, w0, method = 'SLSQP', constraints=constraints, bounds=bd)
        return gmv.x
    
    #Max Sharp ratio : risk free rate은 0.8%로 지정했고, 
    def ms_opt(self):
        n_assets = len(self.data.columns)
        w0 = np.ones(n_assets) / n_assets
        fun = lambda w: -(np.dot(w.T, self.mu) - 0.008) / np.sqrt(np.dot(w.T, np.dot(self.cov, w)))
        bd = ((0,1),) * n_assets     
        constraints = ({'type': 'eq', 'fun': lambda x:  np.sum(x) - 1})

        maxsharp = minimize(fun, w0, method ='SLSQP', constraints=constraints, bounds=bd)
        return maxsharp.x
    
    def rp_opt(self):
        def RC(cov, w):
            pfo_std = np.sqrt(np.dot(w.T, np.dot(self.cov, w)))
            mrc = 1/pfo_std * (np.dot(self.cov, w))
            rc = mrc * w
            rc = rc / rc.sum()
            return rc
        
        
        def RP_objective(x):
            pfo_std = np.sqrt(np.dot(x.T, np.dot(self.cov, x)))
            mrc = 1/pfo_std * (np.dot(self.cov, x))
            rc = mrc * x
            rc = rc / rc.sum()

            a = np.reshape(rc, (len(rc),1))
            differs = a - a.T
            objective = np.sum(np.square(differs))

            return objective    
        
        n_assets = len(self.data.columns)
        w0 = np.ones(n_assets) / n_assets
        constraints = [{'type':'eq', 'fun': lambda x: np.sum(x) -1}]
        bd = ((0,1),) * n_assets

        rp = minimize(RP_objective, w0,  constraints=constraints, bounds = bd, method='SLSQP')

        return rp.x     #, RC(self.cov, rp.x)
    

    #def recommended_asset(total_data):
     #   total_n_data = total_data
      #  total_n_data.dropna(axis=1, inplace=True)
       # total_n_data = total_n_data.resample('M').mean()
        #total_n_data = total_n_data.pct_change()
        #total_n_data.dropna(inplace=True)

       # total_mu = total_n_data.mean() * 12
       # total_std = total_n_data.std() * np.sqrt(12)

       # total_sr = (total_mu - 0.008 / total_std)

       # rec_rs = list(total_sr.sort_values(ascending=False).index)[:10] #샤프지수 상위 10개 
        #a = total_sr.sort_values(axis=1, ascending=False) 

       # return rec_rs
    
    def plotting(self):
        ret_gmv = np.dot(self.gmv_opt(), self.mu)
        ret_ms = np.dot(self.ms_opt(), self.mu)
        ret_rp = np.dot(self.rp_opt(), self.mu)
        vol_gmv = np.sqrt(np.dot(self.gmv_opt().T, np.dot(self.cov, self.gmv_opt())))
        vol_ms = np.sqrt(np.dot(self.ms_opt().T, np.dot(self.cov, self.ms_opt())))
        vol_rp = np.sqrt(np.dot(self.rp_opt().T, np.dot(self.cov, self.rp_opt())))
        
        wt_gmv = self.gmv_opt().tolist()
        wt_ms = self.ms_opt().tolist()
        wt_rp = self.rp_opt().tolist()
        
        user_ret = np.dot(self.assets_w, self.mu)
        user_risk = np.sqrt(np.dot(self.assets_w, np.dot(self.cov, self.assets_w)))

        weights = {'gmv': wt_gmv, "ms" : wt_ms, "rp": wt_rp}
        
        #rec_rs = recommended_asset()

        trets = np.linspace(ret_gmv, max(self.mu), 30) # 30개 짜르기 
        tvols = []
        
        efpoints = dict()
        for i, tret in enumerate(trets): #이 개별 return마다 최소 risk 찾기
            n_assets = len(self.data.columns)
            w0 = np.ones(n_assets) / n_assets
            fun = lambda w: np.dot(w.T ,np.dot(self.cov, w))
            constraints = [{'type': 'eq', 'fun': lambda x: np.sum(x) - 1},
                           {'type': 'ineq', 'fun': lambda x: np.dot(x, self.mu) - tret}]
                           #{'type': 'ineq', 'fun': lambda x: x}]
            bd = ((0,1),) * n_assets

            minvol = minimize(fun, w0, method='SLSQP',bounds = bd, constraints=constraints)
            tvols.append(np.sqrt(np.dot(minvol.x, np.dot(self.cov, minvol.x))))
            
            pnumber = '{}point'.format(i+1)
            efpoints[pnumber] = minvol.x.tolist()
        
        if self.data.shape[0] <= 1:
            error = '기간에러'
            return error,1,1
        else:
            ret_vol = {"GMV": [vol_gmv, ret_gmv],"MaxSharp": [vol_ms, ret_ms],"RiskParity": [vol_rp, ret_rp], "Trets" : trets.tolist(), "Tvols": tvols, "User" : [user_risk,user_ret]} #, "Recommended" : rec_rs}        
            return ret_vol, json.dumps(efpoints), json.dumps(weights)
        # {"GMV": [vol_gmv, ret_gmv].tolist(), "MaxSharp": [vol_ms, ret_ms].tolist(), "RiskParity": [vol_rp, ret_rp], "Trets" : trets, "Tvols": tvols}



class c2_Models(c_Models):
    #새로운 자산과 비중이 주어졌을 때, 이를 최적화하고 plot해주게끔
    def __init__(self, assets, assets_w, start, end, conn, added, added_w): 
        super().__init__(assets, assets_w, start, end, conn)
        #total_data에서 assets와 added를 고려해 새로 뽑기
        #data = self.total_data
        
        eon_db = conn
        cursor = eon_db.cursor(pymysql.cursors.DictCursor)
        
        self.assets = assets
        self.assets_w = assets_w
        
        self.n_assets_w = assets_w.extend(added_w) #비중까지 연장
        self.n_assets = assets.extend(added) #추가된 자산군 연장


        data = pd.DataFrame()
        # 전체 자산 data들을 가지고 온 후, 정리함
        for asset in n_assets: #total_list:
            sql = "SELECT * FROM teststocks." + asset + ";"
            cursor.execute(sql)
            result = cursor.fetchall()
            result = pd.DataFrame(result)
            result.index = result['Date']
            result.drop(['Open','High','Low','Volume','Change','Date'],axis=1, inplace=True)
            result.rename(columns={'Close': asset}, inplace=True)
            
            data = pd.concat([data, result], axis=1)
            #total_data = pd.concat([total_data, result], axis=1) 
            
        #self.total_data = total_data

        # 사용자가 입력한 기간 및 자산군 받은 걸로 데이터프레임을 추출
        #data = total_data.loc[:assets]
        data = data.loc[:,assets]
        data = data.loc[start:end]
        
        
        if data.isnull().values.any() == True: #불러온 data에 결측있으면 x
            return "No Data",''
        else:
            
            data = data.resample('M').mean() #일별 데이터를 월별 데이터로 만들어줌
            data = data.pct_change() #월별 주가 데이터를 이용해 수익률 데이터로 변환
            data.dropna(inplace=True) #결측치 제외(첫 row)

            self.data = data
            self.mu = data.mean() * 12
            self.cov = data.cov() * 12
      
  
        def plotting(self):
            ret_gmv = np.dot(self.gmv_opt(), self.mu)
            ret_ms = np.dot(self.ms_opt(), self.mu)
            ret_rp = np.dot(self.rp_opt(), self.mu)
            vol_gmv = np.sqrt(np.dot(self.gmv_opt().T, np.dot(self.cov, self.gmv_opt())))
            vol_ms = np.sqrt(np.dot(self.ms_opt().T, np.dot(self.cov, self.ms_opt())))
            vol_rp = np.sqrt(np.dot(self.rp_opt().T, np.dot(self.cov, self.rp_opt())))

            wt_gmv = self.gmv_opt().tolist()
            wt_ms = self.ms_opt().tolist()
            wt_rp = self.rp_opt().tolist()

            user_ret = np.dot(self.assets_w, self.mu)
            user_risk = np.sqrt(np.dot(self.assets_w, np.dot(self.mu, self.assets_w)))
            
            user_n_ret = np.dot(self.n_assets_w, self.mu)
            user_n_risk = np.sqrt(self.n_assets_w, np.dot(self.mu, self.assets_w))
            
            

            weights = {'gmv': wt_gmv, "ms" : wt_ms, "rp": wt_rp}
            trets = np.linspace(ret_gmv, max(self.mu), 30) # 30개 짜르기 
            tvols = []

            efpoints = dict()
            for i, tret in enumerate(trets): #이 개별 return마다 최소 risk 찾기
                n_assets = len(self.data.columns)
                w0 = np.ones(n_assets) / n_assets
                fun = lambda w: np.dot(w.T ,np.dot(self.cov, w))
                constraints = [{'type': 'eq', 'fun': lambda x: np.sum(x) - 1},
                               {'type': 'ineq', 'fun': lambda x: np.dot(x, self.mu) - tret}]
                               #{'type': 'ineq', 'fun': lambda x: x}]
                bd = ((0,1),) * n_assets

                minvol = minimize(fun, w0, method='SLSQP',bounds = bd, constraints=constraints)
                tvols.append(np.sqrt(np.dot(minvol.x, np.dot(self.cov, minvol.x))))

                pnumber = str(i+1) + "point"
                efpoints[pnumber] = minvol.x.tolist()

            if self.data.shape[0] <= 1:
                error = '기간에러'
                return error,1,1
            else:

                ret_vol['GMV'] = [vol_gmv, ret_gmv],
                ret_vol['RiskParity'] = [vol_rp, ret_rp]
                ret_vol['Trets'] = trets.tolist()
                ret_vol['Tvols'] = tvols.tolist()
                ret_vol['User'] = [user_risk, user_ret]
                return ret_vol, json.dumps(efpoints), json.dumps(weights)
            # {"GMV": [vol_gmv, ret_gmv].tolist(), "MaxSharp": [vol_ms, ret_ms].tolist(), "RiskParity": [vol_rp, ret_rp], "Trets" : trets, "Tvols": tvols}
