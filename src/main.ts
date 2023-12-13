import * as vscode from 'vscode';
import { TimerController } from './timerController';
import { UIComponents } from './uiComponents';
import { handleUserActivity, handleWorkspaceChange } from './eventHandlers';

// Définissez timerController et uiComponents ici pour qu'ils soient accessibles dans les fonctions activate et deactivate
let timerController: TimerController;
let uiComponents: UIComponents;

export function activate(context: vscode.ExtensionContext) {
    console.log('Votre extension "clockingtimer" est active.');

    // Créez d'abord timerController sans uiComponents
    timerController = new TimerController(context);

    // Créez ensuite uiComponents avec timerController
    uiComponents = new UIComponents(context, timerController);

    // Maintenant, mettez à jour timerController avec uiComponents
    timerController.setUIComponents(uiComponents);

    context.subscriptions.push(vscode.commands.registerCommand('clockingtimer.toggleTimer', () => uiComponents.toggleTimer()));
    context.subscriptions.push(vscode.commands.registerCommand('clockingtimer.resetTimer', () => uiComponents.resetTimer()));

    vscode.workspace.onDidChangeTextDocument(() => handleUserActivity(timerController), null, context.subscriptions);
    vscode.window.onDidChangeActiveTextEditor(() => handleUserActivity(timerController), null, context.subscriptions);
    vscode.workspace.onDidChangeWorkspaceFolders((e) => handleWorkspaceChange(timerController));

    timerController.restorePreviousSession();
}

export function deactivate(context: vscode.ExtensionContext) {
    // Assurez-vous que timerController et uiComponents sont arrêtés et disposés proprement
    if (timerController) {
        timerController.dispose();
    }
    if (uiComponents) {
        uiComponents.dispose();
    }
}
