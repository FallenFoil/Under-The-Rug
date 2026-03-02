import * as vscode from 'vscode';

export class HiddenFileItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly relativePath: string,
        public readonly isFolder: boolean,
        public readonly hiddenDirectly: boolean,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        uri?: vscode.Uri
    ) {
        super(label, collapsibleState);
        this.contextValue = hiddenDirectly ? 'hiddenFile' : 'hiddenFolder';
        if (uri) {
            this.resourceUri = uri;
            if (!isFolder) {
                this.command = {
                    command: 'vscode.open',
                    title: 'Open File',
                    arguments: [uri]
                };
            }
        }
    }
}

export class HiddenFilesProvider implements vscode.TreeDataProvider<HiddenFileItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<HiddenFileItem | undefined | null | void> = new vscode.EventEmitter<HiddenFileItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<HiddenFileItem | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: HiddenFileItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: HiddenFileItem): Promise<HiddenFileItem[]> {
        const config = vscode.workspace.getConfiguration();
        const customHiddenFiles = config.get<string[]>('under-the-rug.hiddenFiles') || [];

        if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
            return [];
        }
        const workspaceUri = vscode.workspace.workspaceFolders[0].uri;

        const currentPath = element ? element.relativePath : '';
        const childrenMap = new Map<string, { label: string, relativePath: string, isFolder: boolean, hiddenDirectly: boolean }>();

        for (const hiddenPath of customHiddenFiles) {
            let isChild = false;
            let remainingPath = '';

            if (currentPath === '') {
                isChild = true;
                remainingPath = hiddenPath;
            } else if (hiddenPath.startsWith(currentPath + '/')) {
                isChild = true;
                remainingPath = hiddenPath.substring(currentPath.length + 1);
            }

            if (isChild && remainingPath.length > 0) {
                const parts = remainingPath.split(/[\\/]/);
                const childLabel = parts[0];
                const childRelativePath = currentPath ? `${currentPath}/${childLabel}` : childLabel;

                const existing = childrenMap.get(childLabel);
                const isFolder = parts.length > 1;
                const hiddenDirectly = parts.length === 1;

                if (existing) {
                    existing.isFolder = existing.isFolder || isFolder;
                    existing.hiddenDirectly = existing.hiddenDirectly || hiddenDirectly;
                } else {
                    childrenMap.set(childLabel, {
                        label: childLabel,
                        relativePath: childRelativePath,
                        isFolder: isFolder,
                        hiddenDirectly: hiddenDirectly
                    });
                }
            }
        }

        const items: HiddenFileItem[] = [];
        for (const child of childrenMap.values()) {
            const uri = vscode.Uri.joinPath(workspaceUri, child.relativePath);

            let isFolder = child.isFolder;
            if (child.hiddenDirectly && !isFolder) {
                try {
                    const stat = await vscode.workspace.fs.stat(uri);
                    if (stat.type === vscode.FileType.Directory || (stat.type & vscode.FileType.Directory)) {
                        isFolder = true;
                    }
                } catch (e) {
                    // Ignore, file might not exist
                }
            }

            const collapsibleState = isFolder ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
            items.push(new HiddenFileItem(child.label, child.relativePath, isFolder, child.hiddenDirectly, collapsibleState, uri));
        }

        return items.sort((a, b) => {
            if (a.isFolder && !b.isFolder) {
                return -1;
            }
            if (!a.isFolder && b.isFolder) {
                return 1;
            }
            return a.label.localeCompare(b.label);
        });
    }
}