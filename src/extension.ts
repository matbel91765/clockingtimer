import * as vscode from 'vscode';

let startTime: Date | undefined;
let isTimerRunning: boolean = false;
let timerButton: vscode.StatusBarItem;
let timerDisplay: vscode.StatusBarItem;
let timerInterval: NodeJS.Timer | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('Votre extension "clockingtimer" est active.');

    // Créer le bouton "Start Timer"
    timerButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    timerButton.text = `$(clock) Stop Timer`;
    timerButton.command = 'clockingtimer.toggleTimer';
    timerButton.show();

    // Créer l'affichage du chronomètre
    timerDisplay = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
    timerDisplay.text = `Timer: 00h 00m 00s`;
    timerDisplay.show();

    let toggleTimerCommand = vscode.commands.registerCommand('clockingtimer.toggleTimer', toggleTimer);
    context.subscriptions.push(toggleTimerCommand, timerButton, timerDisplay);

    // Démarrer le timer automatiquement si nécessaire
    startTimer();
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
        startTime = startTime ? new Date(Date.now() - (new Date().getTime() - startTime.getTime())) : new Date();
        timerInterval = setInterval(updateTimerDisplay, 1000);
        updateTimerDisplay();
        isTimerRunning = true;
    }
}

function stopTimer() {
    if (isTimerRunning) {
        if (timerInterval) {
            clearInterval(timerInterval as NodeJS.Timeout);
            timerInterval = undefined;
        }
        isTimerRunning = false;
    }
}

function updateTimerDisplay() {
    if (!startTime) {return;}
    const currentTime = new Date();
    const elapsedMillis = currentTime.getTime() - startTime.getTime();
    timerDisplay.text = `Timer: ${formatElapsedTime(elapsedMillis)}`;
}

function formatElapsedTime(elapsedMillis: number): string {
    let seconds = Math.floor(elapsedMillis / 1000);
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    let hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
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
}
