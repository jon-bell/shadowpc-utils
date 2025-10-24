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
export class NotificationsService {
    /**
     * @param from
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getEvents(
        from?: any,
    ): CancelablePromise<(minimal_response & {
        from: any;
        to: any;
        rows: any;
        more: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/events',
            query: {
                'from': from,
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
    public static postFollow(
        p: pid,
        u?: any,
        formData?: {
            following: any;
        },
    ): CancelablePromise<(minimal_response & {
        following: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/{p}/follow',
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
