/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { error_response } from '../models/error_response';
import type { minimal_response } from '../models/minimal_response';
import type { pid } from '../models/pid';
import type { rid } from '../models/rid';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReviewsService {
    /**
     * @param p
     * @returns minimal_response
     * @returns error_response
     * @throws ApiError
     */
    public static getReview(
        p: pid,
    ): CancelablePromise<minimal_response | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/{p}/review',
            path: {
                'p': p,
            },
        });
    }
    /**
     * @param p
     * @returns minimal_response
     * @returns error_response
     * @throws ApiError
     */
    public static postReview(
        p: pid,
    ): CancelablePromise<minimal_response | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/{p}/review',
            path: {
                'p': p,
            },
        });
    }
    /**
     * @param p
     * @returns minimal_response
     * @returns error_response
     * @throws ApiError
     */
    public static getReviewhistory(
        p: pid,
    ): CancelablePromise<minimal_response | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/{p}/reviewhistory',
            path: {
                'p': p,
            },
        });
    }
    /**
     * @param p
     * @param r
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static postAcceptreview(
        p: pid,
        r: rid,
    ): CancelablePromise<(minimal_response & {
        action: any;
        review_site_relative: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/{p}/acceptreview',
            path: {
                'p': p,
            },
            query: {
                'r': r,
            },
        });
    }
    /**
     * @param p
     * @param r
     * @param email
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static postClaimreview(
        p: pid,
        r: rid,
        email: any,
    ): CancelablePromise<(minimal_response & {
        action: any;
        review_site_relative: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/{p}/claimreview',
            path: {
                'p': p,
            },
            query: {
                'r': r,
                'email': email,
            },
        });
    }
    /**
     * @param p
     * @param r
     * @param formData
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static postDeclinereview(
        p: pid,
        r: rid,
        formData?: {
            reason?: any;
        },
    ): CancelablePromise<(minimal_response & {
        action: any;
        reason?: any;
        review_site_relative: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/{p}/declinereview',
            path: {
                'p': p,
            },
            query: {
                'r': r,
            },
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
        });
    }
    /**
     * @param p
     * @param round
     * @param formData
     * @returns minimal_response
     * @returns error_response
     * @throws ApiError
     */
    public static postRequestreview(
        p: pid,
        round?: any,
        formData?: {
            email: any;
            given_name?: any;
            family_name?: any;
            name?: any;
            affiliation?: any;
            override?: any;
            reason?: any;
        },
    ): CancelablePromise<minimal_response | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/{p}/requestreview',
            path: {
                'p': p,
            },
            query: {
                'round': round,
            },
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
        });
    }
    /**
     * @param p
     * @param r
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getReviewrating(
        p: pid,
        r: rid,
    ): CancelablePromise<(minimal_response & {
        ratings?: any;
        user_rating?: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/{p}/reviewrating',
            path: {
                'p': p,
            },
            query: {
                'r': r,
            },
        });
    }
    /**
     * @param p
     * @param r
     * @param formData
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static postReviewrating(
        p: pid,
        r: rid,
        formData?: {
            user_rating: any;
        },
    ): CancelablePromise<(minimal_response & {
        ratings?: any;
        user_rating?: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/{p}/reviewrating',
            path: {
                'p': p,
            },
            query: {
                'r': r,
            },
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
        });
    }
    /**
     * @returns minimal_response
     * @returns error_response
     * @throws ApiError
     */
    public static getReviewtoken(): CancelablePromise<minimal_response | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reviewtoken',
        });
    }
    /**
     * @returns minimal_response
     * @returns error_response
     * @throws ApiError
     */
    public static postReviewtoken(): CancelablePromise<minimal_response | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/reviewtoken',
        });
    }
}
