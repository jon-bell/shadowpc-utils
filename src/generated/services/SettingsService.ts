/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { error_response } from '../models/error_response';
import type { minimal_response } from '../models/minimal_response';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SettingsService {
    /**
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getSettings(): CancelablePromise<(minimal_response & {
        settings: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/settings',
        });
    }
    /**
     * @param dryRun
     * @param reset
     * @param filename
     * @param formData
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static postSettings(
        dryRun?: any,
        reset?: any,
        filename?: any,
        formData?: {
            settings?: any;
        },
    ): CancelablePromise<(minimal_response & {
        dry_run?: any;
        change_list?: any;
        settings: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/settings',
            query: {
                'dry_run': dryRun,
                'reset': reset,
                'filename': filename,
            },
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
        });
    }
    /**
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getReviewfieldlibrary(): CancelablePromise<(minimal_response & {
        samples: any;
        types: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reviewfieldlibrary',
        });
    }
    /**
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getSettingdescriptions(): CancelablePromise<(minimal_response & {
        setting_descriptions: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/settingdescriptions',
        });
    }
    /**
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getSubmissionfieldlibrary(): CancelablePromise<(minimal_response & {
        samples: any;
        types: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/submissionfieldlibrary',
        });
    }
}
