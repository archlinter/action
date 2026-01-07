import { JsDiffResult } from '@archlinter/core';
export interface RunOptions {
    baseline: string;
    failOn: string;
    workingDirectory: string;
}
export declare function runArchlintDiff(options: RunOptions): Promise<JsDiffResult>;
