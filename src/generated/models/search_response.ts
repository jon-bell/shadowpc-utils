/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { encoded_search_parameters } from './encoded_search_parameters';
import type { hotlist } from './hotlist';
import type { pid } from './pid';
import type { tag_annotation } from './tag_annotation';
/**
 * Search result
 */
export type search_response = {
    ids: Array<pid>;
    groups: Array<tag_annotation>;
    hotlist: hotlist;
    search_params: encoded_search_parameters;
};

