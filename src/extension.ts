import * as vscode from 'vscode';
import { HiddenFilesProvider, HiddenFileItem } from './hiddenfilesprovider';

export function activate(context: vscode.ExtensionContext) {
	const hiddenFilesProvider = new HiddenFilesProvider();
	vscode.window.registerTreeDataProvider('hiddenFilesView', hiddenFilesProvider);

	// Refresh the tree view whenever the extension's configuration changes
	vscode.workspace.onDidChangeConfiguration(e => {
		if (e.affectsConfiguration('under-the-rug.hiddenFiles')) {
			hiddenFilesProvider.refresh();
		}
	});

	const hideCommand = vscode.commands.registerCommand(
		'under-the-rug.hideSelectedFiles',
		async (clickedUri: vscode.Uri, selectedUris: vscode.Uri[]) => {

			// Handle single or multiple selections
			const urisToHide = selectedUris || [clickedUri];

			const config = vscode.workspace.getConfiguration();
			const excludes = config.get<Record<string, boolean>>('files.exclude') || {};
			const customHiddenFiles = config.get<string[]>('under-the-rug.hiddenFiles') || [];

			// Add all selected files to the exclude list and custom hidden files
			for (const uri of urisToHide) {
				const relativePath = vscode.workspace.asRelativePath(uri);
				excludes[relativePath] = true;
				if (!customHiddenFiles.includes(relativePath)) {
					customHiddenFiles.push(relativePath);
				}
			}

			// Save the configuration once
			await config.update('files.exclude', excludes, vscode.ConfigurationTarget.Workspace);
			await config.update('under-the-rug.hiddenFiles', customHiddenFiles, vscode.ConfigurationTarget.Workspace);
		}
	);

	context.subscriptions.push(hideCommand);

	const unhideCommand = vscode.commands.registerCommand(
		'under-the-rug.unhideFile',
		async (item: HiddenFileItem) => {
			const config = vscode.workspace.getConfiguration();
			const excludes = config.get<Record<string, boolean>>('files.exclude') || {};
			const customHiddenFiles = config.get<string[]>('under-the-rug.hiddenFiles') || [];

			if (item && item.relativePath) {
				const relativePath = item.relativePath;

				// Remove from excludes
				let newExcludes = { ...excludes };
				if (newExcludes[relativePath]) {
					delete newExcludes[relativePath];
				}

				// Remove from custom hidden files
				const newCustomHiddenFiles = customHiddenFiles.filter(p => p !== relativePath);

				await config.update('files.exclude', newExcludes, vscode.ConfigurationTarget.Workspace);
				await config.update('under-the-rug.hiddenFiles', newCustomHiddenFiles, vscode.ConfigurationTarget.Workspace);
			}
		}
	);

	context.subscriptions.push(unhideCommand);

	const unhideFolderCommand = vscode.commands.registerCommand(
		'under-the-rug.unhideFolder',
		async (item: HiddenFileItem) => {
			if (!item || !item.relativePath) {
				return;
			}

			const config = vscode.workspace.getConfiguration();
			const excludes = config.get<Record<string, boolean>>('files.exclude') || {};
			const customHiddenFiles = config.get<string[]>('under-the-rug.hiddenFiles') || [];

			const folderPrefix = item.relativePath + '/';

			// Remove all entries that are the folder itself or reside inside it
			const newCustomHiddenFiles = customHiddenFiles.filter(
				p => p !== item.relativePath && !p.startsWith(folderPrefix)
			);

			const newExcludes = { ...excludes };
			for (const key of Object.keys(newExcludes)) {
				if (key === item.relativePath || key.startsWith(folderPrefix)) {
					delete newExcludes[key];
				}
			}

			await config.update('files.exclude', newExcludes, vscode.ConfigurationTarget.Workspace);
			await config.update('under-the-rug.hiddenFiles', newCustomHiddenFiles, vscode.ConfigurationTarget.Workspace);
		}
	);

	context.subscriptions.push(unhideFolderCommand);
}

export function deactivate() { }
