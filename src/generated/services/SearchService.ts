/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { error_response } from '../models/error_response';
import type { minimal_response } from '../models/minimal_response';
import type { pid } from '../models/pid';
import type { search_collection } from '../models/search_collection';
import type { search_qt } from '../models/search_qt';
import type { search_response } from '../models/search_response';
import type { search_reviewer } from '../models/search_reviewer';
import type { search_scoresort } from '../models/search_scoresort';
import type { search_sort } from '../models/search_sort';
import type { search_string } from '../models/search_string';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SearchService {
    /**
     * Retrieve search results
     * Return IDs of submissions that match a search.
     *
     * Pass the search query in the `q` parameter. The list of matching IDs is
     * returned in the `ids` response property.
     *
     * The `t`, `qt`, `reviewer`, `sort`, and `scoresort` parameters can also affect
     * the search. `t` defines the collection of submissions to search. `t=viewable`
     * checks all submissions the user can view; the default collection is often
     * narrower (a typical default is `t=s`, which searches complete submissions).
     *
     * The `groups` response property is an array of annotations that apply to the
     * search, and is returned for `THEN` searches, `LEGEND` searches, and searches
     * on tags with annotations. Each annotation contains a position `pos`, and may
     * also have a `legend`, a `search`, an `annoid`, and other properties. `pos` is
     * an integer index into the `ids` array; it ranges from 0 to the number of items
     * in that array. Annotations with a given `pos` should appear *before* the paper
     * at that index in the `ids` array. For instance, this response might be
     * returned for the search `10-12 THEN 15-18`:
     *
     * ```json
     * {
         * "ok": true,
         * "message_list": [],
         * "ids": [10, 12, 18],
         * "groups": [
             * {
                 * "pos": 0,
                 * "legend": "10-12",
                 * "search": "10-12"
                 * },
                 * {
                     * "pos": 2,
                     * "legend": "15-18",
                     * "search": "15-18"
                     * }
                     * ]
                     * }
                     * ```
                     *
                     * @param q
                     * @param t
                     * @param qt
                     * @param sort
                     * @param scoresort
                     * @param reviewer
                     * @param report
                     * @param warnMissing
                     * @returns any
                     * @returns error_response
                     * @throws ApiError
                     */
                    public static getSearch(
                        q: search_string,
                        t?: search_collection,
                        qt?: search_qt,
                        sort?: search_sort,
                        scoresort?: search_scoresort,
                        reviewer?: search_reviewer,
                        report?: any,
                        warnMissing?: any,
                    ): CancelablePromise<(minimal_response & search_response) | error_response> {
                        return __request(OpenAPI, {
                            method: 'GET',
                            url: '/search',
                            query: {
                                'q': q,
                                't': t,
                                'qt': qt,
                                'sort': sort,
                                'scoresort': scoresort,
                                'reviewer': reviewer,
                                'report': report,
                                'warn_missing': warnMissing,
                            },
                        });
                    }
                    /**
                     * Retrieve search results as field HTML
                     * @param f
                     * @param q
                     * @param session
                     * @param t
                     * @param qt
                     * @param reviewer
                     * @param sort
                     * @param scoresort
                     * @returns any
                     * @returns error_response
                     * @throws ApiError
                     */
                    public static getFieldhtml(
                        f: any,
                        q: search_string,
                        session?: any,
                        t?: search_collection,
                        qt?: search_qt,
                        reviewer?: search_reviewer,
                        sort?: search_sort,
                        scoresort?: search_scoresort,
                    ): CancelablePromise<(minimal_response & {
                        fields: any;
                        data: any;
                        stat?: any;
                        classes?: any;
                        attr?: any;
                    }) | error_response> {
                        return __request(OpenAPI, {
                            method: 'GET',
                            url: '/fieldhtml',
                            query: {
                                'f': f,
                                'session': session,
                                'q': q,
                                't': t,
                                'qt': qt,
                                'reviewer': reviewer,
                                'sort': sort,
                                'scoresort': scoresort,
                            },
                        });
                    }
                    /**
                     * Retrieve list field text
                     * @returns minimal_response
                     * @returns error_response
                     * @throws ApiError
                     */
                    public static getFieldtext(): CancelablePromise<minimal_response | error_response> {
                        return __request(OpenAPI, {
                            method: 'GET',
                            url: '/fieldtext',
                        });
                    }
                    /**
                     * Retrieve available search actions
                     * @returns any
                     * @returns error_response
                     * @throws ApiError
                     */
                    public static getSearchactions(): CancelablePromise<(minimal_response & {
                        actions: any;
                    }) | error_response> {
                        return __request(OpenAPI, {
                            method: 'GET',
                            url: '/searchactions',
                        });
                    }
                    /**
                     * Perform search action
                     * @param q
                     * @param p
                     * @param action
                     * @param t
                     * @param qt
                     * @param sort
                     * @param report
                     * @param scoresort
                     * @param reviewer
                     * @returns minimal_response
                     * @returns error_response
                     * @throws ApiError
                     */
                    public static getSearchaction(
                        q: search_string,
                        p?: pid,
                        action?: any,
                        t?: search_collection,
                        qt?: search_qt,
                        sort?: search_sort,
                        report?: any,
                        scoresort?: search_scoresort,
                        reviewer?: search_reviewer,
                    ): CancelablePromise<minimal_response | error_response> {
                        return __request(OpenAPI, {
                            method: 'GET',
                            url: '/searchaction',
                            query: {
                                'p': p,
                                'action': action,
                                'q': q,
                                't': t,
                                'qt': qt,
                                'sort': sort,
                                'report': report,
                                'scoresort': scoresort,
                                'reviewer': reviewer,
                            },
                        });
                    }
                    /**
                     * @returns minimal_response
                     * @returns error_response
                     * @throws ApiError
                     */
                    public static getGraphdata(): CancelablePromise<minimal_response | error_response> {
                        return __request(OpenAPI, {
                            method: 'GET',
                            url: '/graphdata',
                        });
                    }
                    /**
                     * @returns any
                     * @returns error_response
                     * @throws ApiError
                     */
                    public static getNamedsearch(): CancelablePromise<(minimal_response & {
                        searches: any;
                    }) | error_response> {
                        return __request(OpenAPI, {
                            method: 'GET',
                            url: '/namedsearch',
                        });
                    }
                    /**
                     * @returns any
                     * @returns error_response
                     * @throws ApiError
                     */
                    public static postNamedsearch(): CancelablePromise<(minimal_response & {
                        searches: any;
                    }) | error_response> {
                        return __request(OpenAPI, {
                            method: 'POST',
                            url: '/namedsearch',
                        });
                    }
                    /**
                     * @returns any
                     * @returns error_response
                     * @throws ApiError
                     */
                    public static getSearchcompletion(): CancelablePromise<(minimal_response & {
                        searchcompletion: any;
                    }) | error_response> {
                        return __request(OpenAPI, {
                            method: 'GET',
                            url: '/searchcompletion',
                        });
                    }
                    /**
                     * @param report
                     * @param q
                     * @returns any
                     * @returns error_response
                     * @throws ApiError
                     */
                    public static getViewoptions(
                        report?: any,
                        q?: search_string,
                    ): CancelablePromise<(minimal_response & {
                        report: any;
                        display_current: any;
                        display_default: any;
                        display_difference: any;
                        display_default_message_list: any;
                    }) | error_response> {
                        return __request(OpenAPI, {
                            method: 'GET',
                            url: '/viewoptions',
                            query: {
                                'report': report,
                                'q': q,
                            },
                        });
                    }
                    /**
                     * @param report
                     * @param q
                     * @param formData
                     * @returns any
                     * @returns error_response
                     * @throws ApiError
                     */
                    public static postViewoptions(
                        report?: any,
                        q?: search_string,
                        formData?: {
                            display: any;
                        },
                    ): CancelablePromise<(minimal_response & {
                        report: any;
                        display_current: any;
                        display_default: any;
                        display_difference: any;
                        display_default_message_list: any;
                    }) | error_response> {
                        return __request(OpenAPI, {
                            method: 'POST',
                            url: '/viewoptions',
                            query: {
                                'report': report,
                                'q': q,
                            },
                            formData: formData,
                            mediaType: 'application/x-www-form-urlencoded',
                        });
                    }
                }
