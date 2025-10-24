/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { search_collection } from './search_collection';
import type { search_qt } from './search_qt';
import type { search_reviewer } from './search_reviewer';
import type { search_scoresort } from './search_scoresort';
import type { search_sort } from './search_sort';
import type { search_string } from './search_string';
/**
 * Search parameters
 */
export type search_parameters = {
    'q': search_string;
    't'?: search_collection;
    qt?: search_qt;
    sort?: search_sort;
    scoresort?: search_scoresort;
    reviewer?: search_reviewer;
};

