import os

if os.environ.get('RUN_MAIN', None) != 'true':
    default_app_config = 'FElab_app.load_mymodel.LoadConfig'