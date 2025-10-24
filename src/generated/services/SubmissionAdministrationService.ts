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
export class SubmissionAdministrationService {
    /**
     * Assignments
     * @param redirect
     * @param p
     * @param formData
     * @returns minimal_response
     * @returns error_response
     * @throws ApiError
     */
    public static postAssign(
        redirect?: string,
        p?: pid,
        formData?: {
            assignments: any;
        },
    ): CancelablePromise<minimal_response | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/assign',
            query: {
                'redirect': redirect,
                'p': p,
            },
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
        });
    }
    /**
     * Retrieve submission decision
     * @param p
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getDecision(
        p: pid,
    ): CancelablePromise<(minimal_response & {
        decision: any;
        decision_html: any;
        editable?: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/{p}/decision',
            path: {
                'p': p,
            },
        });
    }
    /**
     * Change submission decision
     * @param p
     * @param formData
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static postDecision(
        p: pid,
        formData?: {
            decision: any;
        },
    ): CancelablePromise<(minimal_response & {
        decision: any;
        decision_html: any;
        editable?: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/{p}/decision',
            path: {
                'p': p,
            },
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
        });
    }
    /**
     * Retrieve submission discussion lead
     * @param p
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getLead(
        p: pid,
    ): CancelablePromise<(minimal_response & {
        lead: any;
        lead_html: any;
        color_classes?: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/{p}/lead',
            path: {
                'p': p,
            },
        });
    }
    /**
     * Change submission discussion lead
     * @param p
     * @param formData
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static postLead(
        p: pid,
        formData?: {
            lead: any;
        },
    ): CancelablePromise<(minimal_response & {
        lead: any;
        lead_html: any;
        color_classes?: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/{p}/lead',
            path: {
                'p': p,
            },
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
        });
    }
    /**
     * Retrieve submission administrator
     * @param p
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getManager(
        p: pid,
    ): CancelablePromise<(minimal_response & {
        manager: any;
        manager_html: any;
        color_classes?: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/{p}/manager',
            path: {
                'p': p,
            },
        });
    }
    /**
     * Change submission administrator
     * @param p
     * @param formData
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static postManager(
        p: pid,
        formData?: {
            manager: any;
        },
    ): CancelablePromise<(minimal_response & {
        manager: any;
        manager_html: any;
        color_classes?: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/{p}/manager',
            path: {
                'p': p,
            },
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
        });
    }
    /**
     * Change review round
     * @param p
     * @returns minimal_response
     * @returns error_response
     * @throws ApiError
     */
    public static postReviewround(
        p: pid,
    ): CancelablePromise<minimal_response | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/{p}/reviewround',
            path: {
                'p': p,
            },
        });
    }
    /**
     * Retrieve submission shepherd
     * @param p
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getShepherd(
        p: pid,
    ): CancelablePromise<(minimal_response & {
        shepherd: any;
        shepherd_html: any;
        color_classes?: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/{p}/shepherd',
            path: {
                'p': p,
            },
        });
    }
    /**
     * Change submission shepherd
     * @param p
     * @param formData
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static postShepherd(
        p: pid,
        formData?: {
            shepherd: any;
        },
    ): CancelablePromise<(minimal_response & {
        shepherd: any;
        shepherd_html: any;
        color_classes?: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/{p}/shepherd',
            path: {
                'p': p,
            },
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
        });
    }
}
