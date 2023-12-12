import * as vscode from 'vscode';

let startTime: Date | undefined;
let isTimerRunning: boolean = false;
let timerButton: vscode.StatusBarItem;
let timerDisplay: vscode.StatusBarItem;
let timerInterval: NodeJS.Timer | undefined;
let extensionContext: vscode.ExtensionContext;
let activityTimeout: NodeJS.Timeout | undefined;
let totalTimeDisplay: vscode.StatusBarItem;
let totalElapsedTime: number = 0;
let elapsedSessionTime: number = 0;

export function activate(context: vscode.ExtensionContext) {
    extensionContext = context;
    console.log('Votre extension "clockingtimer" est active.');

    // Créer le bouton "Start Timer"
    timerButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    timerButton.command = 'clockingtimer.toggleTimer';
    timerButton.show();

    // Créer l'affichage du chronomètre
    timerDisplay = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
    timerDisplay.show();

    // Créer l'affichage du temps total
    totalElapsedTime = context.workspaceState.get<number>('totalElapsedTime') || 0;
    totalTimeDisplay = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 98);
    totalTimeDisplay.text = `Total Time: ${formatElapsedTime(totalElapsedTime)}`;
    totalTimeDisplay.show();

    let savedTime = context.workspaceState.get<number>('elapsedTime');
    if (savedTime && savedTime > 0) {
        startTime = new Date(Date.now() - savedTime);
        startTimer();
    } else {
        timerButton.text = `$(clock) Start Timer`;
        timerDisplay.text = `Timer: 00h 00m 00s`;
    }

    let toggleTimerCommand = vscode.commands.registerCommand('clockingtimer.toggleTimer', toggleTimer);
    context.subscriptions.push(toggleTimerCommand, timerButton, timerDisplay);

    let resetTimerCommand = vscode.commands.registerCommand('clockingtimer.resetTimer', resetTimer);
    context.subscriptions.push(resetTimerCommand);

    vscode.workspace.onDidChangeTextDocument(onUserActivity, null, context.subscriptions);
    vscode.window.onDidChangeActiveTextEditor(onUserActivity, null, context.subscriptions);
}

function toggleTimer() {
    if (isTimerRunning) {
        stopTimer();
        timerButton.text = `$(clock) Start Timer`;
    } else {
        startTimer();
        timerButton.text = `$(clock) Stop Timer`;
    }
}

function startTimer() {
    if (!isTimerRunning) {
        startTime = new Date();
        timerInterval = setInterval(updateTimerDisplay, 1000);
        timerButton.text = `$(clock) Stop Timer`; // Met à jour le texte pour "Stop Timer"
        isTimerRunning = true;
    }
}

function stopTimer() {
    if (isTimerRunning && startTime) {
        clearInterval(timerInterval as NodeJS.Timeout);
        timerInterval = undefined;

        let sessionTime = new Date().getTime() - startTime.getTime();
        elapsedSessionTime += sessionTime;
        totalElapsedTime += sessionTime; // Ajouter le temps de session au temps total
        extensionContext.workspaceState.update('elapsedTime', elapsedSessionTime);
        extensionContext.workspaceState.update('totalElapsedTime', totalElapsedTime); // Mettre à jour le temps total

        totalTimeDisplay.text = `Total Time: ${formatElapsedTime(totalElapsedTime)}`; // Mettre à jour l'affichage du temps total

        timerButton.text = `$(clock) Start Timer`;
        isTimerRunning = false;
    }
}

function resetTimer() {
    clearInterval(timerInterval as NodeJS.Timeout);
    timerInterval = undefined;
    startTime = undefined;
    elapsedSessionTime = 0;
    isTimerRunning = false;
    timerDisplay.text = `Timer: 00h 00m 00s`;
    timerButton.text = `$(clock) Start Timer`;
    extensionContext.workspaceState.update('elapsedTime', undefined);
}

function updateTimerDisplay() {
    if (startTime) {
        const currentTime = new Date();
        const elapsedMillis = currentTime.getTime() - startTime.getTime() + elapsedSessionTime;
        timerDisplay.text = `Timer: ${formatElapsedTime(elapsedMillis)}`;
    }
}

function onUserActivity() {
    if (!isTimerRunning) {
        startTimer();
    }

    clearTimeout(activityTimeout);
    activityTimeout = setTimeout(() => {
        if (isTimerRunning) {
            stopTimer();
        }
    }, 30000); // 30 secondes d'inactivité
}

function formatElapsedTime(elapsedMillis: number): string {
    let seconds = Math.floor(elapsedMillis / 1000);
    let minutes = Math.floor(seconds / 60);
    seconds %= 60;
    let hours = Math.floor(minutes / 60);
    minutes %= 60;
    return `${hours}h ${minutes}m ${seconds}s`;
}

export function deactivate() {
    if (timerInterval) {
        clearInterval(timerInterval as NodeJS.Timeout);
    }
    if (timerButton) {
        timerButton.dispose();
    }
    if (timerDisplay) {
        timerDisplay.dispose();
    }
    if (totalTimeDisplay) {
        totalTimeDisplay.dispose();
    }
}
