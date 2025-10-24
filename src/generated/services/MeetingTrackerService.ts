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
export class MeetingTrackerService {
    /**
     * @param track
     * @param p
     * @param trackerStartAt
     * @param formData
     * @returns minimal_response
     * @returns error_response
     * @throws ApiError
     */
    public static postTrack(
        track: any,
        p?: pid,
        trackerStartAt?: any,
        formData?: {
            'hotlist-info'?: any;
        },
    ): CancelablePromise<minimal_response | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/track',
            query: {
                'p': p,
                'track': track,
                'tracker_start_at': trackerStartAt,
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
    public static getTrackerstatus(): CancelablePromise<minimal_response | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/trackerstatus',
        });
    }
    /**
     * @param formData
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static postTrackerconfig(
        formData?: {
            stopall?: any;
            tr?: any;
            has_tr?: any;
        },
    ): CancelablePromise<(minimal_response & {
        tracker?: any;
        tracker_recent?: any;
        tracker_status?: any;
        now?: any;
        tracker_status_at: any;
        tracker_eventid: any;
        new_trackerid?: any;
        tracker_site?: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/trackerconfig',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
        });
    }
}
