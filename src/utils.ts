export function formatElapsedTime(elapsedMillis: number): string {
    let seconds = Math.floor(elapsedMillis / 1000);
    let minutes = Math.floor(seconds / 60);
    seconds %= 60;
    let hours = Math.floor(minutes / 60);
    minutes %= 60;

    const hoursFormatted = hours.toString().padStart(2, '0');
    const minutesFormatted = minutes.toString().padStart(2, '0');
    const secondsFormatted = seconds.toString().padStart(2, '0');

    return `${hoursFormatted}h ${minutesFormatted}m ${secondsFormatted}s`;
}
