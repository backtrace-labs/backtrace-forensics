export type T = number;

export function of(duration: T): T {
    return duration;
}

export function ofMilliseconds(ms: number): T {
    return of(ms);
}

export function ofSeconds(s: number): T {
    return ofMilliseconds(s * 1000);
}

export function ofMinutes(s: number): T {
    return ofSeconds(s * 60);
}

export function ofHours(s: number): T {
    return ofMinutes(s * 60);
}

export function ofDays(s: number): T {
    return ofHours(s * 24);
}

export function totalDays(duration: T) {
    return totalHours(duration) % 24;
}

export function totalHours(duration: T) {
    return totalMinutes(duration) / 60;
}

export function totalMinutes(duration: T) {
    return totalSeconds(duration) / 60;
}

export function totalSeconds(duration: T) {
    return totalMilliseconds(duration) / 1000;
}

export function totalMilliseconds(duration: T) {
    return duration;
}

export function days(duration: T) {
    return Math.floor(totalDays(duration));
}

export function hours(duration: T) {
    return Math.floor(totalHours(duration)) % 24;
}

export function minutes(duration: T) {
    return Math.floor(totalMinutes(duration)) % 60;
}

export function seconds(duration: T) {
    return Math.floor(totalSeconds(duration)) % 60;
}

export function milliseconds(duration: T) {
    return Math.floor(totalMilliseconds(duration)) % 1000;
}

export const WEEK = ofDays(7);
export const LONGEST_MONTH = ofDays(31);
export const LONGEST_QUARTER = ofDays(92);
export const LONGEST_YEAR = ofDays(366);
export const INFINITE = of(Infinity);
