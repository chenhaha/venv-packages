import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


export class PackageProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    constructor(private workspaceRoot: string) {}

    getTreeItem(element: Dependency): Dependency {
      return element;
    }

    getChildren(element?: Dependency): Thenable<Dependency[]> {
      if (element) {
        let path_ = element.path;
        return Promise.resolve(this.getDeps(path_));
      }
      else {
        let finder = new PackageFolderFinder(this.workspaceRoot);
        let interpreterPath = finder.getInterpreterPath();
        let sitePackagePath = finder.getPackagePath(interpreterPath);
        return Promise.resolve(this.getDeps(sitePackagePath));
      }
    }

    getDeps(path_: string) :Dependency[] {
      let files:Dependency[] = [];
      fs.readdirSync(path_).forEach((item, index) => {
        let itemPath = path.join(path_, item);
        let dep;        

        if (fs.lstatSync(itemPath).isDirectory()) {
          dep = new Dependency(item, itemPath, vscode.TreeItemCollapsibleState.Collapsed);
        }
        else if(!this.isPycFile(itemPath)) {
          dep = new FileDependency(item, itemPath, vscode.TreeItemCollapsibleState.None);
        } 
        
        if (dep){
          files.push(dep);
        }
        
        
      });
      return files;
    }

    isPycFile(path_: string): Boolean {
      if (path_.substring(path_.lastIndexOf('.') + 1) === 'pyc'){
        return true;
      }
      return false;
    }
}


class PackageFolderFinder{
  constructor(private workspaceRoot: string){}

  getInterpreterPath(): string {
    let settingPath = path.join(this.workspaceRoot, '.vscode', 'settings.json');
    if (!this.pathExists(settingPath)) {
      throw new Error('can not find settings.json file');
    }

    let config = JSON.parse(fs.readFileSync(settingPath, 'utf8'));
    let interpreterPath = config['python.pythonPath'];

    if (!interpreterPath) {
      throw new Error('can not find python interpreter path');
    }

    return interpreterPath;
  }

  getPackagePath(interpreterPath: string): string {
    let venvPath = path.dirname(path.dirname(interpreterPath));
    let libPath = path.join(venvPath, 'lib');

    if (!this.pathExists(libPath)) {
      throw new Error('no lib folder');
    }

    let pythonFolder;
    fs.readdirSync(libPath).forEach(file => {
      if (file.indexOf('python') !== -1){
       pythonFolder = file;
       return;
      }
    });

    if (!pythonFolder){
      throw new Error('new python folder');
    }

    return path.join(libPath, pythonFolder, 'site-packages');
  }

  private pathExists(p: string): Boolean {
    try {
      fs.accessSync(p);
    } catch(err) {
      return false;
    }
    return true;
  }

}

export class Dependency extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly path: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
  }
  
}

export class FileDependency extends Dependency {
  command = {
    title: this.label,
    command: 'helloworld.openfile',
    arguments: [this]
  };
}