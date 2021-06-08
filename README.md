# 경희대학교 학부연구 
## <포트폴리오 최적화 서비스 제공과 텍스트마이닝을 사용한 금융 데이터 분석>

> 해외의 포트폴리오 최적화 및 백테스트 사이트인 PortfolioVisualizer의 국내화 버전으로 개발한 "Name" 은 개인의 포트폴리오 최적화와 백테스트 기능을 제공하고 텍스트마이닝을 사용하여 시장, 기업, 금융 데이터를 분석하는 서비스를 제공한다. 개인 투자자의 포트폴리오 구성을 도와주고 투자지표로 삼을 데이터를 제공함으로써 국내의 개인 투자자들에게 보다 더 나은 의사결정을 할 수 있게 도와주고자 개발하였다.

## Table of Contents
_Note: This is only a navigation guide for the specification, and does not define or mandate terms for any specification-compliant documents._

- [Sections](#sections)
  - [Title](#title)
  - [Methodology](#methodology)
  - [Stacks](#stacks)
  - [Install](#install)
  - [Maintainers](#maintainers)
  - [Thanks](#thanks)
  - [License](#license)

## Sections

### Title
-WebSite 이름

### Methodology

**Frontend**
- Jquery : HTML의 클라이언트 사이드 조작을 단순화 하도록 설계된 크로스 플랫폼의 자바스크립트 라이브러리다.
- Ajax :  DB 종목 리스트 Return, 최적화, 백테스트, 뉴스 수집 등 비동기 통신에 사용
- Chartjs : 최적화 결과와 백테스트 결과에 보여줄 Chart를 그리는데 사용 [Chartjs](https://github.com/chartjs/Chart.js)
- Amchart : 주가 그래프 그리는데 사용 [Amchart](https://github.com/amcharts/amcharts4)
- HTML5
- CSS
> Reference : Socar, Apple, Toss

**Backend**

1. 포트폴리오 최적화
  - Scipy 라이브러리 
	  * GMV 포트폴리오
	    목적함수 `fun = lambda w: np.dot(w.T, np.dot(self.cov, w))` 은  W^T ∑W   (포트폴리오 분산)
	    제약조건: 총 비중 합 = 1, 비중 양수(공매도 제한)
	    최적화방법: Scipy 라이브러리의 minimize 함수를 사용하여 포트폴리오 분산을 최소화
	  * Max Sharpe Ratio
	    목적함수 ` fun = lambda w: -(np.dot(w.T, self.mu) - 0.008) / np.sqrt(np.dot(w.T, np.dot(self.cov, w))) `은 –((μ^T W-r_f)/√(W^T ∑W  )) (- 위험대비 수익률)
	    제약조건: 총 비중 합 = 1, 비중 양수(공매도 제한)
	    최적화방법: 샤프지수의 최대화를 Scipy 라이브러리의 minimize 함수를 사용하기 위해 샤프지수 최대화 대신 (- 샤프지수)의 최소화를 진행하였음
	  * Risk Parity 
	    기존 위 두 최적화와 다르게 Risk Parity 전략은 기대수익률 data를 사용하지 않고, 자산 비중 및 공분산 행렬만을 사용한다. 과정은 크게 두 가지로, Risk Contribution(리스크 기여도)계산과         Risk Parity Optimization(자산 기여도를 동등하게 최적화)으로 이루어져있다. 우선, Risk Contribution이란 개별종목이 전체 포트폴리오 위험에 기여하는 정도를 의미한다. 다른 조건들이 동일할 때, 특정 종목의 비중을 한 단위 늘렸을 경우 증가하는 포트폴리오 위험인 Marginal Risk Contribution과 개별 종목 비중의 곱으로 정의된다. 
	    MRC=  (∂σ_P)/(∂w_i )  ,RC=  (∂σ_P)/(∂w_i )  ×w_i 
	    즉 MRC가 작더라도 전체 포트폴리오에서 차지하는 비중 W_i 값이 크면 해당 종목으로 인해 발생하는 위험인 RC가 커질 수 있다. 
	    먼저  (1/pfo_std ) * (np.dot(self.cov, w))로  MRC=  (∂σ_P)/(∂w_i )  행렬을 구하였고,  mrc * w  를 이용해  RC=  (∂σ_P)/(∂w_i )  ×w_i  행렬을 구하였다. 그 후  rc = rc / rc.sum()  를 이용하여 추후 최적화가 쉽도록 scaling 해주었다.
	    다음으로는 `a = np.reshape(rc, (len(rc),1))` 를 이용하여 앞서 구한 rc를 array 형태로 만들어준 후 differs = a - a.T 라는 각 rc 값들의 차를 계산했다. 결과적으로 저 differs 값의 제곱을       최소화시켜줌으로써 각 rc값들이 모두 같도록 최적화한다. 
	    목적함수: objective = np.sum(np.square(differs))
	    제약조건: 총 비중 합 = 1, 비중 양수(공매도 제한)
	    최적화방법: Scipy 라이브러리의 minimize 함수를 사용하여 각 자산의 리스크기여도 차이를 최소화

2. 포트폴리오 백테스트
  - 성과지표 ( input은 return값만 필요하다. )
    * 산술평균
    * dd(drawdown)
    * mdd(maximum drawdown)
    * sharpe ratio
    * value at risk
    * winning rate
  - 포트폴리오 성과 및 리밸런싱 ( input은 종목, 투자비중, 시작일, 종료일, 초기투자금, 리밸런싱 주기, 
  조회간격, 자산배분전략이 필요하다. )
    * DB에서 선택한 종목과 날짜를 활용해 종목들의 수익률과 날짜를 가져와 DataFrame으로 만든다.
    * 자산배분 전략에 따라 리밸런싱 전까지, 매일 변하는 가중치를 계산하여 DataFrame으로 만든다.
      (이때, 선택된 자산배분 전략에 따라 리밸런싱 기간마다 새로운 가중치를 가져오게 된다.)
    * 포트폴리오의 수익률을 계산하기 위해 앞서 구한 두 데이터프레임에서 종목별 수익률과 가중치를 
      곱하여 포트폴리오 수익률을 산출한다.
    * FinanceDataReader함수로 부터 벤치마크 대상인 S&P500과 KOSPI의 수익률과 날짜를 가져와 DataFrame
      으로 만든다.
    * 포트폴리오와 벤치마크의 일별 수익률을 앞서 산출한 성과지표에 입력하여 값을 산출한다.
    * 포트폴리오와 벤치마크의 수익률 데이터를 조회간격에 따라 월별, 주별, 일별로 resample하여 최종적으로 보여줄 수익률을 확정한다.
    * resample된 수익률을 활용하여 누적수익률, 수익금, Drawdown을 산출한다. 
    

3. 기업분석
  - 관련변수 선정 ( input은 종목값만 필요하다. ) 
    * DB에서 최근 n개년의 한국은행 월별 거시경제 데이터와, 선택한 종목의 수익률을 가져온다.
    * resample함수를 통해 수익률을 월별로 변환하고 거시경제 데이터와 통합하여 하나의 DataFrame을 산출
    * shift함수를 통해 수익률 column을 n개월 shift한다.
    * sklearn함수의 RandomForestRegressor, AdaBoostRegressor를 활용하여 해당종목의 수익률과 가장관련이 큰 거시경제 지표를 선정한다. 
    * RandomForest와 AdaBoost의 결과로 거시경제 지표별 중요도와 모델의 정확도 RMSE, R^2를 도출한다.

**DataBase**

1. 주가 데이터 수집
 - FinanceDataReader 라이브러리를 활용해서 주가 데이터를 매일 저장한다.
   * 해당 라이브러리에 코스피 종목을 불러오는 함수가 있지만 현재 상장된 주식 목록은 KRX에서 직접 크롤링 한다.
   * 그 이유는 라이브러리의 함수를 사용하면 ETF를 포함한 정보를 가지고 온다. 그러나 비슷한 성격의 ETF가 많기 때문에 TIGER ETF만을 고려하기 위해 KRX에서 코스피 상장 '주식'을 직접 크롤링한다.

2. 데이터베이스 저장
 - Pymysql을 활용하여 mysql에 데이터를 저장한다.
   * 간단한 프로젝트에서는 csv 파일로 저장하여 사용하지만 현재 종목수가 900개가 넘고 이를 일일히 csv 파일로 저장하여 관리하는 것은 비효율적이므로 데이터베이스를 활용한다.
   * 주가 데이터는 krmarket 스키마에 각 종목마다 테이블이 존재한다. 즉 926개의 테이블이 존재한다. 탐색 속도와 primary key까지 고려하여 개선할 수 있는 여지가 있다.
   * 데이터를 수집하는 FinanceDataReader가 파이썬으로 작동하는 라이브러리이기 때문에 이렇게 불러온 데이터를 pymysql을 통해서 mysql DB에 저장한다.
  
  - 데이터베이스 구성
    * krmarket (Schema) : krmarket 스키마 내에 종목 코드를 이름으로 하는 테이블들이 존재한다. 테이블 내에는 해당 종목의 시작가, 고가, 저가, 종가, 거래량, rate of return 정보가 있다.
    
    * stockcodename(Schema)
      - codename(Table) : 종목코드와 종목명이 매칭 된 정보가 들어있다.
      - macro_economics(Table) : 각종 거시경제 지표, 비트코인, 대표 지수 정보가 들어있다. 추후에 따로 다른 스키마로 구성할 필요가 있다.

3. 업데이트 자동화
 - schedule 라이브러리를 사용하여 매일 특정 시간 업데이트를 진행한다. 

**Natural Language Processing**
1. 뉴스 감성지수 분류기
  - 감성사전 구축 
    * 뉴스 플랫폼 빅카인즈에서 5년간 50만건의 경제 섹터 뉴스를 수집
    * 다음날 코스피 종가와 concat한 DataFrame을 생성
    * Konlpy.tag의 Okt.nouns를 사용하여 뉴스에서 명사만을 추출
    * 전체 기간에서 코스피가 상승한 날의 비율과 하락한 날의 비율을 구함
    * 뉴스가 나온 다음날 코스피가 전날 대비 상승했다면 해당 뉴스에 등장한 단어에 하락비율을 더해줌. 반대의 경우 상승비율을 차감.
    _상승기간과 하락기간의 비율 차이가 존재하기 때문에 Scaling하기 위함.
    * 당일 뉴스에 등장하는 단어들의 평균 감성점수를 구하여 전체 단어들의 평균 감성점수보다 크면 1 작거나 같으면 0을 labeling
  ![image](https://user-images.githubusercontent.com/56333934/118783559-2646a280-b8ca-11eb-9ed3-7cfd27233bdc.png)
  - Classifier 모델 성능 비교
    * 전처리
      - Train : Test (8:2) 
      - 독립변수 : 뉴스의 워드 임베딩 벡터
      - 종속변수 : 해당 뉴스의 감성지수 (평균보다 높으면 1 or 낮으면0)
    * 모델 
      - Bert : 0.91
      - Bi-LSTM : 0.92
  - 네이버 뉴스 API를 사용해 당일 뉴스를 수집(100건) 
  - Input으로 뉴스데이터를 넣고 감성지수값이 Output인 Bi-LSTM모델을 구축.
2. 금융 데이터 변수 중요도
  - 금, 은, WTI(유가), 환율, 나스닥, S&P500, 비트코인, 이더리움의 시세를 독립변수, 코스피 종가를 종속변수로 하여 상관계수 분석을 진행
  - 상관계수에 절대값을 취해 웹에 변수 중요도라는 카테고리로 지난 7일의 데이터를 제공.

**Server**
- 연구실 서버용 컴퓨터(Linux Ubuntu)에 Django App 배포
- 주소 : 163.180.132.180:8080

### Stacks
- `Python Django`, `Python colab`, `Mysql Database`, `Tensorflow`, `Sklearn`, `한국은행API`, `네이버뉴스API`, `FinanceDataReader`, `Pandas-DataReader`

### Install
- Django App Download
- 가상환경 설치 및 라이브러리 Install
- Manage.py 가 있는 디렉토리에서 `python manage.py runserver 163.180.132.180:8080` 실행

### Maintainers
- 이근영 : Backend 개발
- 김장언 : Backend 개발
- 신시언 : Full Stack 개발. 
- 진주성 : Database 및 업데이트 자동화 프로그램 개발

### Thanks
- 김장호 교수님

### License
- `경희대학교 산업경영공학과 금융공학 연구실`
