// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {PackageProvider, Dependency} from './provider';
import * as fs from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "venv-packages" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	vscode.commands.registerCommand('extension.openfile', (node: Dependency) => {
		if (fs.lstatSync(node.path).isFile()) {
			vscode.workspace.openTextDocument(node.path).then(doc => {
				vscode.window.showTextDocument(doc);
			});
		}
	});

	let folders = vscode.workspace.workspaceFolders;

	if (folders) {
	  let rootPath = folders[0]['uri']['path'];

	  const provider = new PackageProvider(rootPath);

	  vscode.commands.registerCommand('extension.refreshEntry', () => provider.refresh());

	  vscode.window.registerTreeDataProvider(
	    'sitePackages',
		provider	
	  );
	}
}

// this method is called when your extension is deactivated
export function deactivate() {}
