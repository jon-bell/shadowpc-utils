/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { tag } from './tag';
/**
 * Annotation for tag or submission group
 */
export type tag_annotation = {
    /**
     * Position of annotation in associated submission list
     */
    pos?: number;
    annoid: number;
    tag?: tag;
    tagval?: number;
    blank?: boolean;
    legend?: string;
};

