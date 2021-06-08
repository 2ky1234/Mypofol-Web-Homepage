from django.urls import path
from . import views

urlpatterns = [
    path('',views.home, name='home'),
    path('home/',views.home, name='home'),
    path('portfolio_optimize/',views.portfolio_optimize, name='ajax_portfolio_optimize'),
    path('portfolio_optimize_result/',views.portfolio_optimize_result, name='portfolio_optimize_result'),
    path('ajax_db_return/', views.ajax_db_return, name='ajax_db_return'),
    path('ajax_portfolio_optimize_return/', views.ajax_portfolio_optimize_return, name='ajax_portfolio_optimize_return'),
    path('ajax_news_return/', views.ajax_news_return, name='ajax_news_return'),
    path('ajax_news_analysis/', views.ajax_news_analysis, name='ajax_news_analysis'),
    path('ajax_company_analysis/', views.ajax_company_analysis, name='ajax_company_analysis'),
    path('ajax_stockname_return/', views.ajax_stockname_return, name='ajax_stockname_return'),
    path('ajax_backtest/', views.ajax_backtest, name='ajax_backtest'),
    path('ajax_macro_return/', views.ajax_macro_return, name='ajax_macro_return'),
    path('portfolio_backtest/',views.portfolio_backtest, name='portfolio_backtest'),
    path('textmining/',views.textmining, name='textmining'),
    path('signup/',views.signup, name='signup'),
    path('login/', views.login, name='login'),
]
