export type T = number;

export function of(timestamp: T): T {
    return timestamp;
}

export function now() {
    return of(Date.now());
}

export function ofMilliseconds(ms: number): T {
    return of(ms);
}

export function ofSeconds(s: number): T {
    return ofMilliseconds(s * 1000);
}

export function ofDate(date: Date): T {
    return ofMilliseconds(date.getTime());
}

export function milliseconds(timestamp: T) {
    return timestamp * 1;
}

export function seconds(timestamp: T) {
    return Math.floor(timestamp / 1000);
}
