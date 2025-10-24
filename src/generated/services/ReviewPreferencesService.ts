/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { error_response } from '../models/error_response';
import type { minimal_response } from '../models/minimal_response';
import type { pid } from '../models/pid';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReviewPreferencesService {
    /**
     * @param p
     * @param u
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getRevpref(
        p: pid,
        u?: any,
    ): CancelablePromise<(minimal_response & {
        value: any;
        pref: any;
        prefexp?: any;
        topic_score?: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/{p}/revpref',
            path: {
                'p': p,
            },
            query: {
                'u': u,
            },
        });
    }
    /**
     * @param p
     * @param u
     * @param formData
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static postRevpref(
        p: pid,
        u?: any,
        formData?: {
            pref: any;
        },
    ): CancelablePromise<(minimal_response & {
        value: any;
        pref: any;
        prefexp?: any;
        topic_score?: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/{p}/revpref',
            path: {
                'p': p,
            },
            query: {
                'u': u,
            },
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
        });
    }
}
