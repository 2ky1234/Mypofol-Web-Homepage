from django.apps import AppConfig
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.text import Tokenizer
import pickle
class LoadConfig(AppConfig):
    name = 'FElab_app'

    model = load_model('lstm_model.h5')
    with open('news_corpus.txt', 'rb') as f:
        news = pickle.load(f) # 단 한줄씩 읽어옴
    tokenizer = Tokenizer(len(news))
    tokenizer.fit_on_texts(news)

