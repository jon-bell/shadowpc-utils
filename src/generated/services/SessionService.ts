/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { error_response } from '../models/error_response';
import type { minimal_response } from '../models/minimal_response';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SessionService {
    /**
     * @param job
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getJob(
        job: any,
    ): CancelablePromise<(minimal_response & {
        update_at: any;
        status?: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/job',
            query: {
                'job': job,
            },
        });
    }
    /**
     * @param formData
     * @returns minimal_response
     * @returns error_response
     * @throws ApiError
     */
    public static postJserror(
        formData?: {
            error: any;
            url?: any;
            lineno?: any;
            colno?: any;
            stack?: any;
        },
    ): CancelablePromise<minimal_response | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/jserror',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
        });
    }
    /**
     * @returns minimal_response
     * @returns error_response
     * @throws ApiError
     */
    public static postOauthtoken(): CancelablePromise<minimal_response | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/oauthtoken',
        });
    }
    /**
     * @returns minimal_response
     * @returns error_response
     * @throws ApiError
     */
    public static postReauth(): CancelablePromise<minimal_response | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/reauth',
        });
    }
    /**
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getSession(): CancelablePromise<(minimal_response & {
        sessioninfo: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/session',
        });
    }
    /**
     * @param v
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static postSession(
        v: any,
    ): CancelablePromise<(minimal_response & {
        sessioninfo: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/session',
            query: {
                'v': v,
            },
        });
    }
    /**
     * @param formData
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static postStashmessages(
        formData?: {
            message_list: any;
        },
    ): CancelablePromise<(minimal_response & {
        _smsg: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/stashmessages',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
        });
    }
    /**
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getWhoami(): CancelablePromise<(minimal_response & {
        email?: any;
        given_name?: any;
        family_name?: any;
        affiliation?: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/whoami',
        });
    }
}
