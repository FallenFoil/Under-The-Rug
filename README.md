# Under The Rug

A VS Code extension to instantly declutter your workspace by hiding selected files and folders from the Explorer view, with a dedicated panel to easily manage them.

## Installation

Currently, this extension is not available on the VS Code Marketplace. You will need to install it manually using the provided `.vsix` file.

1. Download the latest `under-the-rug-*.vsix` file from the [Releases](https://github.com/FallenFoil/Under-The-Rug/releases) page of this repository.
2. Open VS Code.
3. Open the **Extensions** view (`Ctrl+Shift+X` on Windows/Linux or `Cmd+Shift+X` on macOS).
4. Click on the **Views and More Actions** `...` menu icon in the top right corner of the Extensions view.
5. Select **Install from VSIX...**
6. Locate and select the downloaded `under-the-rug-*.vsix` file to install the extension.

Alternatively, you can install it using the command line:

```bash
code --install-extension under-the-rug-1.2.0.vsix
```
(Replace `1.2.0` with the version you downloaded).

## Features

- **Hide Files & Folders**: Right-click any file or folder in the VS Code Explorer and select **"Hide File(s)"** to instantly remove it from view.
- **Multi-select Support**: Select multiple files or folders and hide them all at once.
- **Hidden Files View**: A dedicated "Hidden Files" view is added to your Explorer side bar, listing all the files and folders you have currently hidden.
- **One-Click Unhide**: Hover over any item in the Hidden Files view and click the eye icon to restore it to your workspace.
- **Smart Folder Unhiding**: Unhiding a folder automatically unhides all of its previously hidden contents.

## How it Works

When you hide a file, the extension automatically adds it to your workspace's `files.exclude` settings, keeping your Explorer clean. It also tracks these files in a custom `under-the-rug.hiddenFiles` setting to populate the Hidden Files view. Unhiding removes the entry from both settings.

## Extension Settings

This extension relies on the following configuration:

* `under-the-rug.hiddenFiles`: An array of strings containing the relative paths of all currently hidden files and folders. The extension actively tracks hidden items here to populate the "Hidden Files" tree view.

## Video Demo

https://github.com/user-attachments/assets/89e9e83e-c160-44af-ae6b-d6289625ed73

## Issues and Feedback

If you find any bugs or have feature requests, please report them on the [GitHub Issue Tracker](https://github.com/FallenFoil/Under-The-Rug/issues).
