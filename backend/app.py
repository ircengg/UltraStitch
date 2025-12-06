import webview
from backend.api import API
from backend.app_menu import app_menu
import os

os.environ["PYWEBVIEW_GUI"] = "qt"

# env = os.getenv('ENV', 'production')
env = os.getenv('ENV', 'development')
print(env)


def get_entrypoint():   
    
    def exists(path):
        return os.path.exists(os.path.join(os.path.dirname(__file__), path))
    
    if env == 'development':
        print("Using vite dev server")
        return 'http://localhost:5173/'

    if exists("./dist/index.html"):  # unfrozen development
        print("Using index.html")
        return "./dist/index.html"

    if exists("./gui/index.html"):
        print("Using index.html")
        return "./gui/index.html"
    raise Exception("No index.html found")

def app():
        
    api = API()
    entry = get_entrypoint()
    window = webview.create_window(
        "UltraStitch",
        entry,
        width=1200,
        height=800,
        easy_drag=False,
        js_api= api,
        text_select=True
    )    
    

        
    webview.start(                          
        debug=True if env == 'development' else False,
        gui='edgechromium',
        ssl=True,
        # menu=app_menu
    )
    