/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { comment_topic } from './comment_topic';
import type { comment_visibility } from './comment_visibility';
import type { pid } from './pid';
import type { style_classes } from './style_classes';
/**
 * Comment representation
 */
export type comment = {
    object: string;
    pid: pid;
    cid: number;
    ordinal?: string;
    editable?: boolean;
    viewer_owned?: boolean;
    visibility?: comment_visibility;
    topic?: comment_topic;
    blind?: boolean;
    draft?: boolean;
    collapsed?: boolean;
    response?: string;
    author_editable?: boolean;
    by_author?: boolean;
    by_shepherd?: boolean;
    format?: number;
    review_token?: string;
    tags?: string;
    color_classes?: style_classes;
    author?: string;
    author_email?: string;
    author_hidden?: boolean;
    author_pseudonym?: string;
    author_pseudonymous?: boolean;
    modified_at?: number;
    modified_at_obscured?: boolean;
    modified_at_text?: string;
    text?: string;
    docs?: Array<any>;
    word_count?: number;
};

