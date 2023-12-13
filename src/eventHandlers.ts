import { TimerController } from './timerController';

let activityTimeout: NodeJS.Timeout | undefined;

export function handleUserActivity(timerController: TimerController) {
    if (!timerController.isTimerRunning) {
        timerController.startTimer();
    }

    clearTimeout(activityTimeout);
    activityTimeout = setTimeout(() => {
        if (timerController.isTimerRunning) {
            timerController.stopTimer();
        }
    }, 30000); // 30 secondes d'inactivité
}

export function handleWorkspaceChange(timerController: TimerController) {
    if (timerController.isTimerRunning && timerController.startTime) {
        let sessionTime = new Date().getTime() - timerController.startTime.getTime();
        timerController.elapsedSessionTime += sessionTime;
        timerController.totalElapsedTime += sessionTime;
        
        // Utilisation du getter pour accéder à context
        timerController.vscodeContext.workspaceState.update('elapsedTime', timerController.elapsedSessionTime);
        timerController.vscodeContext.workspaceState.update('totalElapsedTime', timerController.totalElapsedTime);
    }
}
