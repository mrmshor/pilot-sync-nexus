// Helper files content for different operating systems

export const createWindowsBatchFile = () => `@echo off
setlocal enabledelayedexpansion

if "%~1"=="" (
    echo Usage: folder-opener.bat "folder_path"
    pause
    exit /b 1
)

set "folder_path=%~1"

if exist "!folder_path!" (
    explorer "!folder_path!"
) else (
    echo Folder not found: !folder_path!
    pause
    exit /b 1
)
`;

export const createUnixShellScript = () => `#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Usage: folder-opener.sh folder_path"
    exit 1
fi

folder_path="$1"

if [ -d "$folder_path" ]; then
    if command -v open >/dev/null 2>&1; then
        # macOS
        open "$folder_path"
    elif command -v xdg-open >/dev/null 2>&1; then
        # Linux
        xdg-open "$folder_path"
    elif command -v nautilus >/dev/null 2>&1; then
        # GNOME
        nautilus "$folder_path"
    elif command -v dolphin >/dev/null 2>&1; then
        # KDE
        dolphin "$folder_path"
    else
        echo "No supported file manager found"
        exit 1
    fi
else
    echo "Folder not found: $folder_path"
    exit 1
fi
`;

export const createWindowsRegistryFile = () => `Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\\folder-opener]
@="URL:Folder Opener Protocol"
"URL Protocol"=""

[HKEY_CLASSES_ROOT\\folder-opener\\shell]

[HKEY_CLASSES_ROOT\\folder-opener\\shell\\open]

[HKEY_CLASSES_ROOT\\folder-opener\\shell\\open\\command]
@="\\"C:\\\\path\\\\to\\\\folder-opener.bat\\" \\"%1\\""
`;

export const downloadHelperFiles = async (): Promise<boolean> => {
  try {
    const files = {
      'folder-opener.bat': createWindowsBatchFile(),
      'folder-opener.sh': createUnixShellScript(),
      'setup-folder-protocol.reg': createWindowsRegistryFile(),
    };

    for (const [filename, content] of Object.entries(files)) {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    return true;
  } catch (error) {
    console.error('Error downloading helper files:', error);
    return false;
  }
};