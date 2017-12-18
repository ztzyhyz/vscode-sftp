import * as vscode from 'vscode';
import * as output from '../modules/output';
import { getConfig, getAllConfigs } from '../modules/config';
import { upload, download, sync2Remote, sync2Local } from '../modules/sync';
import { createFileCommand, ITarget } from '../helper/createCommand';
import checkRequire from '../helper/checkRequire';

// item:
// fsPath:"/Users/mymomo/workspace/lanyilv/src/htdocs/lanyicj_platform/environments"
// external:"file:///Users/mymomo/workspace/lanyilv/src/htdocs/lanyicj_platform/environments"
// $mid:1
// path:"/Users/mymomo/workspace/lanyilv/src/htdocs/lanyicj_platform/environments"
// scheme:"file"

const getAllProjects = () =>
  new Promise((resolve, reject) => {
    // getAllProjects
    const configs = getAllConfigs();
    const projectsList = configs
      .map(cfg => ({
        value: cfg.context,
        label: vscode.workspace.asRelativePath(cfg.context),
        description: '',
        detail: cfg.context,
      }))
      .sort((l, r) => l.label.localeCompare(r.label));

    vscode.window
      .showQuickPick(projectsList, {
        ignoreFocusOut: true,
        placeHolder: 'Select a folder...(ESC to cancel)',
      })
      .then(
        selection => {
          if (selection) {
            resolve({
              fsPath: selection.value,
            });
            return;
          }

          // cancel selection
          return null;
        },
        reject
      );
  });

const getActiveTarget = () =>
  new Promise((resolve, reject) => {
    const active = vscode.window.activeTextEditor;
    if (!active || !active.document) {
      throw new Error('Action must have a file or directory as target!');
    }

    resolve({
      fsPath: active.document.fileName,
    });
  });

const getTarget = item => {
  // command palette
  if (item === undefined) {
    return getAllProjects();
  }

  // short cut
  if (!item.fsPath) {
    return getActiveTarget();
  }

  return Promise.resolve(item);
};

const getFolderTarget = item => {
  // context menu
  if (item && item.fsPath) {
    return Promise.resolve(item);
  }

  return getAllProjects();
};

export const sync2RemoteCommand = checkRequire(createFileCommand(sync2Remote, getFolderTarget));
export const sync2LocalCommand = checkRequire(createFileCommand(sync2Local, getFolderTarget));

export const uploadCommand = checkRequire(createFileCommand(upload, getTarget));
export const downloadCommand = checkRequire(createFileCommand(download, getTarget));
