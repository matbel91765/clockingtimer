import * as vscode from 'vscode';
import { TimerController } from './timerController';
import { UIComponents } from './uiComponents';
import { handleUserActivity, handleWorkspaceChange } from './eventHandlers';

let timerController: TimerController;
let uiComponents: UIComponents;

export function activate(context: vscode.ExtensionContext) {
    console.log('Votre extension "clockingtimer" est active.');

    // Création timerController sans uiComponents
    timerController = new TimerController(context);

    // Création uiComponents avec timerController
    uiComponents = new UIComponents(context, timerController);

    // Mise à jour du timerController avec uiComponents
    timerController.setUIComponents(uiComponents);

    context.subscriptions.push(vscode.commands.registerCommand('clockingtimer.toggleTimer', () => uiComponents.toggleTimer()));
    context.subscriptions.push(vscode.commands.registerCommand('clockingtimer.resetTimer', () => uiComponents.resetTimer()));

    vscode.workspace.onDidChangeTextDocument(() => handleUserActivity(timerController), null, context.subscriptions);
    vscode.window.onDidChangeActiveTextEditor(() => handleUserActivity(timerController), null, context.subscriptions);
    vscode.workspace.onDidChangeWorkspaceFolders((e) => handleWorkspaceChange(timerController));

    timerController.restorePreviousSession();
}

export function deactivate(context: vscode.ExtensionContext) {
    if (timerController) {
        timerController.dispose();
    }
    if (uiComponents) {
        uiComponents.dispose();
    }
}
