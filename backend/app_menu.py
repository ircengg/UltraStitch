from webview.menu import Menu, MenuAction, MenuSeparator
import webview

# ------- SINGLE MENU HANDLER --------

def handleMenuClick(name):
    print("Menu clicked:", name)
    webview.windows[0].evaluate_js(f"window.onMenuEvent && window.onMenuEvent('{name}')")
    


def menu(name):
    return lambda: handleMenuClick(name);
app_menu = [
    Menu('Project', [
        MenuAction('Open', menu("open_project")),
        MenuAction('New', menu("new_project")),
        MenuAction('Save', menu("save_project")),
    ]),
    Menu('View', [
        MenuAction('Drawing Settings', menu("drawing_settings")),
        MenuAction('Scan List', menu("scan_list")),
        MenuAction('Scan Editor', menu("scan_editor")),
        MenuAction('Drawing Settings', menu("drawing_settings")),
    ]),
    # Menu('About', [
    #     MenuAction('About App', menu("about_app")),
    # ]),
]
