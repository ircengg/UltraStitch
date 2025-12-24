# -*- mode: python ; coding: utf-8 -*-
# pyinstaller --clean --distpath output/ --workpath build/ app.spec


block_cipher = None


excludes = [
    "PySide6",   
    "scipy",  
    "plotly",
    "pyvista",
    "matplotlib",
    "scikit-learn",
    "jupyter",
    "notebook",
    "nbconvert",
    "nbformat",
    "jupyter_client",
    "jupyter_core",
    "ipykernel",
    "ipython",
    "ipywidgets",
    "jedi",
    "json-parser",
    "matplotlib-inline",
    "mock",  
    "platformdirs",
    "py-mon",
    "pyinstaller-hooks-contrib",
    "pyinstaller",
    "nutika",
    "python-dotenv",
    "QtPy",
    "sixwatchdog",
    "fastexcel",
    "auto-py-to-exe",   
    "PySide6_Addons",
    "PySide6_Essentials",
    "QtPy",
    "ViTables",
    "watchdog"
]




hiddenimports=[]





a = Analysis(
    ['main.py'],  # Path to your main script
    pathex=['Application'],
    binaries=[],
    datas=[
        (".\\dist", "dist"),
        (".\\public", "public"),
    ],
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=excludes,
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False  # <-- Optional: leave this as False for .pyz use
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    exclude_binaries=True,  # ✅ This is key for COLLECT mode
    name='UltraScan',
    bootloader_ignore_signals=False,
    upx_exclude=[],
    icon='.\\public\\UltraStitch.png',
    splash='.\\public\\UltraStitch.png',
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)





# List of DLLs to exclude (case-insensitive)
excluded_dlls = [

    # PySide6 DLLs
    "PySide6\opengl32sw.dll", 
    "PySide6\Qt6OpenGLWidgets.dll",
    "PySide6\Qt6OpenGLWidgets.pyd",   
    "PySide6\Qt6QmlWorkerScript.dll",
    "PySide6\Qt6Network.dll",
    "PySide6\Qt6OpenGL.dll",
    "PySide6\Qt6Pdf.dll",
    "PySide6\Qt6Qml.dll",
    "PySide6\Qt6QmlMeta.dll",
    "PySide6\Qt6QmlModels.dll",
    "PySide6\Qt6Quick.dll",
    "PySide6\Qt6Svg.dll",
    "PySide6\Qt6VirtualKeyboard.dll",
    "PySide6\Qt6Pdf.dll",

    # Core
    "api-ms-win-core-console-l1-1-0.dll",
    "api-ms-win-core-datetime-l1-1-0.dll",
    "api-ms-win-core-debug-l1-1-0.dll",
    "api-ms-win-core-errorhandling-l1-1-0.dll",
    "api-ms-win-core-fibers-l1-1-0.dll",
    "api-ms-win-core-file-l1-1-0.dll",
    "api-ms-win-core-file-l1-2-0.dll",
    "api-ms-win-core-file-l2-1-0.dll",
    "api-ms-win-core-handle-l1-1-0.dll",
    "api-ms-win-core-heap-l1-1-0.dll",
    "api-ms-win-core-interlocked-l1-1-0.dll",
    "api-ms-win-core-libraryloader-l1-1-0.dll",
    "api-ms-win-core-localization-l1-2-0.dll",
    "api-ms-win-core-memory-l1-1-0.dll",
    "api-ms-win-core-namedpipe-l1-1-0.dll",
    "api-ms-win-core-processenvironment-l1-1-0.dll",
    "api-ms-win-core-processthreads-l1-1-0.dll",
    "api-ms-win-core-processthreads-l1-1-1.dll",
    "api-ms-win-core-profile-l1-1-0.dll",
    "api-ms-win-core-rtlsupport-l1-1-0.dll",
    "api-ms-win-core-string-l1-1-0.dll",
    "api-ms-win-core-synch-l1-1-0.dll",
    "api-ms-win-core-synch-l1-2-0.dll",
    "api-ms-win-core-sysinfo-l1-1-0.dll",
    "api-ms-win-core-timezone-l1-1-0.dll",
    "api-ms-win-core-util-l1-1-0.dll",
    "api-ms-win-crt-conio-l1-1-0.dll",
    "api-ms-win-crt-convert-l1-1-0.dll",
    "api-ms-win-crt-environment-l1-1-0.dll",
    "api-ms-win-crt-filesystem-l1-1-0.dll",
    "api-ms-win-crt-heap-l1-1-0.dll",
    "api-ms-win-crt-locale-l1-1-0.dll",
    "api-ms-win-crt-math-l1-1-0.dll",
    "api-ms-win-crt-multibyte-l1-1-0.dll",
    "api-ms-win-crt-private-l1-1-0.dll",
    "api-ms-win-crt-process-l1-1-0.dll",
    "api-ms-win-crt-runtime-l1-1-0.dll",
    "api-ms-win-crt-stdio-l1-1-0.dll",
    "api-ms-win-crt-string-l1-1-0.dll",
    "api-ms-win-crt-time-l1-1-0.dll",
    "api-ms-win-crt-utility-l1-1-0.dll"
]

print("binaries: ")
for (dest, src, typecode) in a.binaries:    
        print(dest)


# Filter binaries using normalized dest paths
binaries = [
    (dest, src, typecode)
    for (dest, src, typecode) in a.binaries
    if dest not in excluded_dlls
]





coll = COLLECT(
    exe,
    binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='UltraStitch'
)
