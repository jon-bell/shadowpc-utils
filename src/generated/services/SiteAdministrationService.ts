/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { error_response } from '../models/error_response';
import type { minimal_response } from '../models/minimal_response';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SiteAdministrationService {
    /**
     * @param email
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getAccount(
        email: any,
    ): CancelablePromise<(minimal_response & {
        email: any;
        disabled: any;
        placeholder: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/account',
            query: {
                'email': email,
            },
        });
    }
    /**
     * @param email
     * @param disable
     * @param enable
     * @param sendinfo
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static postAccount(
        email: any,
        disable?: any,
        enable?: any,
        sendinfo?: any,
    ): CancelablePromise<(minimal_response & {
        email: any;
        disabled: any;
        placeholder: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/account',
            query: {
                'email': email,
                'disable': disable,
                'enable': enable,
                'sendinfo': sendinfo,
            },
        });
    }
    /**
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getNamedformula(): CancelablePromise<(minimal_response & {
        formulas: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/namedformula',
        });
    }
    /**
     * @param formData
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static postNamedformula(
        formData?: {
            formula: any;
        },
    ): CancelablePromise<(minimal_response & {
        formulas: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/namedformula',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
        });
    }
}
