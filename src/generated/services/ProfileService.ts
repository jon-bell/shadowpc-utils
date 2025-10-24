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
export class ProfileService {
    /**
     * @param p
     * @param formData
     * @returns minimal_response
     * @returns error_response
     * @throws ApiError
     */
    public static postClickthrough(
        p?: pid,
        formData?: {
            accept?: any;
            clickthrough_id: any;
            clickthrough_type: any;
            clickthrough_time: any;
        },
    ): CancelablePromise<minimal_response | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/clickthrough',
            query: {
                'p': p,
            },
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
        });
    }
}
