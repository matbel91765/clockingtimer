import * as vscode from 'vscode';
import { UIComponents } from './uiComponents';

export class TimerController {
    private _startTime: Date | undefined;
    private _timerInterval: NodeJS.Timer | undefined;
    private _elapsedSessionTime: number = 0;
    private _totalElapsedTime: number;
    private _isTimerRunning: boolean = false;
    private uiComponents?: UIComponents;

    constructor(private context: vscode.ExtensionContext, uiComponents?: UIComponents) {
        if (uiComponents) {
            this.uiComponents = uiComponents;
        }
        this._totalElapsedTime = context.workspaceState.get<number>('totalElapsedTime') || 0;
    }

    get isTimerRunning(): boolean {
        return this._isTimerRunning;
    }

    get startTime(): Date | undefined {
        return this._startTime;
    }

    get vscodeContext(): vscode.ExtensionContext {
        return this.context;
    }

    get elapsedSessionTime(): number {
        return this._elapsedSessionTime;
    }

    set elapsedSessionTime(value: number) {
        this._elapsedSessionTime = value;
    }

    get totalElapsedTime(): number {
        return this._totalElapsedTime;
    }

    set totalElapsedTime(value: number) {
        this._totalElapsedTime = value;
    }

    toggleTimer() {
        if (this._isTimerRunning) {
            this.stopTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        if (!this._isTimerRunning) {
            this._startTime = new Date();
        }
        this._timerInterval = setInterval(() => this.updateTimer(), 1000);
        this._isTimerRunning = true;
        if (this.uiComponents) {
            this.uiComponents.handleTimerStateChange();
        }
    }

    stopTimer() {
        if (this._isTimerRunning && this._startTime) {
            clearInterval(this._timerInterval as NodeJS.Timeout);
            this._timerInterval = undefined;

            let sessionTime = new Date().getTime() - this._startTime.getTime();
            this._elapsedSessionTime += sessionTime;
            this._totalElapsedTime += sessionTime;
            this.context.workspaceState.update('elapsedTime', this._elapsedSessionTime);
            this.context.workspaceState.update('totalElapsedTime', this._totalElapsedTime);

            this._isTimerRunning = false;
        }
        if (this.uiComponents) {
            this.uiComponents.handleTimerStateChange();
        }
    }

    dispose() {
        if (this._timerInterval) {
            clearInterval(this._timerInterval as NodeJS.Timeout);
            this._timerInterval = undefined;
        }

        // Toute autre nettoyage nécessaire
    }

    resetTimer() {
        clearInterval(this._timerInterval as NodeJS.Timeout);
        this._timerInterval = undefined;
        this._startTime = undefined;
        this._elapsedSessionTime = 0;
        this._totalElapsedTime = 0;
        this._isTimerRunning = false;

        this.context.workspaceState.update('elapsedTime', undefined);
        this.context.workspaceState.update('totalElapsedTime', undefined);
        if (this.uiComponents) {
            this.uiComponents.handleTimerStateChange();
        }
    }

    private updateTimer() {
        if (this._startTime) {
            const currentTime = new Date();
            const elapsedMillis = currentTime.getTime() - this._startTime.getTime() + this._elapsedSessionTime;
            if (this.uiComponents) {
                this.uiComponents.updateTimerDisplay(elapsedMillis);
            }
        }
    }

    restorePreviousSession() {
        let savedTime = this.context.workspaceState.get<number>('elapsedTime');
        if (savedTime && savedTime > 0) {
            this._startTime = new Date(Date.now() - savedTime);
            this.startTimer();
        }
    }

    setUIComponents(uiComponents: UIComponents) {
        this.uiComponents = uiComponents;
    }
}
