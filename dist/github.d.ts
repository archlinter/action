import { JsRegression } from '@archlinter/core';
export declare function upsertComment(token: string, body: string): Promise<void>;
export declare function createAnnotations(regressions: JsRegression[]): void;
export declare function setSummary(body: string): Promise<void>;
