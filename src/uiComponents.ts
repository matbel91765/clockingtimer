import * as vscode from 'vscode';
import { TimerController } from './timerController';

export class UIComponents {
    private timerButton: vscode.StatusBarItem;
    private timerDisplay: vscode.StatusBarItem;
    private totalTimeDisplay: vscode.StatusBarItem;

    constructor(private context: vscode.ExtensionContext, private timerController: TimerController) {
        this.timerButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 98);
        this.timerButton.command = 'clockingtimer.toggleTimer';
        this.timerButton.show();

        this.timerDisplay = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
        this.timerDisplay.show();

        this.totalTimeDisplay = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1); 
        this.totalTimeDisplay.text = `Total Time: ${this.formatElapsedTime(this.timerController.totalElapsedTime)}`;
        this.totalTimeDisplay.show();

        // Mettre à jour l'UI selon l'état initial du TimerController
        this.updateUI();
    }

    toggleTimer() {
        this.timerController.toggleTimer();
        this.updateUI();
    }

    resetTimer() {
        this.timerController.resetTimer();
        this.updateUI();
    }

    dispose() {
        if (this.timerButton) {
            this.timerButton.dispose();
        }
        if (this.timerDisplay) {
            this.timerDisplay.dispose();
        }
        if (this.totalTimeDisplay) {
            this.totalTimeDisplay.dispose();
        }
    }

    public handleTimerStateChange() {
        this.updateUI();
    }

    public updateTimerDisplay(elapsedMillis: number) {
        this.timerDisplay.text = `Timer: ${this.formatElapsedTime(elapsedMillis)}`;
    }

    private updateUI() {
        if (this.timerController.isTimerRunning) {
            this.timerButton.text = `$(clock) Stop Timer`;
        } else {
            this.timerButton.text = `$(clock) Start Timer`;
            // Mettez à jour le timerDisplay pour montrer le temps écoulé jusqu'à l'arrêt
            this.timerDisplay.text = `Timer: ${this.formatElapsedTime(this.timerController.elapsedSessionTime)}`;
        }
        // Mettre à jour totalTimeDisplay indépendamment de l'état du chronomètre
        this.totalTimeDisplay.text = `Total Time: ${this.formatElapsedTime(this.timerController.totalElapsedTime)}`;
    }
    

    private formatElapsedTime(elapsedMillis: number): string {
        let seconds = Math.floor(elapsedMillis / 1000);
        let minutes = Math.floor(seconds / 60);
        seconds %= 60;
        let hours = Math.floor(minutes / 60);
        minutes %= 60;
        return `${hours}h ${minutes}m ${seconds}s`;
    }
}
