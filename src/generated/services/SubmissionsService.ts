/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { error_response } from '../models/error_response';
import type { minimal_response } from '../models/minimal_response';
import type { paper } from '../models/paper';
import type { pid } from '../models/pid';
import type { search_collection } from '../models/search_collection';
import type { search_qt } from '../models/search_qt';
import type { search_reviewer } from '../models/search_reviewer';
import type { search_scoresort } from '../models/search_scoresort';
import type { search_sort } from '../models/search_sort';
import type { search_string } from '../models/search_string';
import type { upload_token } from '../models/upload_token';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SubmissionsService {
    /**
     * Retrieve submission
     * Return a submission object specified by `p`, a submission ID.
     *
     * All visible information about submission fields, tags, and overall status are
     * returned in the `paper` response property, which defines a submission object.
     * Error messages—for instance, about permission errors or nonexistent
     * submissions—are returned in `message_list`.
     *
     * Submission objects are formatted based on the submission form. They have an
     * `object` property set to `"paper"`, a `pid`, and a `status`. Other properties
     * are provided based on which submission fields exist and whether the accessing
     * user can see them.
     *
     * @param p
     * @param forceShow False to not override administrator conflict
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getPaper(
        p?: pid,
        forceShow?: boolean,
    ): CancelablePromise<(minimal_response & {
        paper?: paper;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/paper',
            query: {
                'p': p,
                'forceShow': forceShow,
            },
        });
    }
    /**
     * Create or modify submission
     * Create or modify a submission specified by `p`, a submission ID.
     *
     * Setting `p=new` will create a new submission; the response will contain the
     * chosen submission ID.
     *
     * The modification may be specified:
     *
     * 1. As a JSON request body (when the request body has content-type
     * `application/json`).
     * 2. As a ZIP archive (when the request body has content-type
     * `application/zip`). The archive must contain a file named `data.json`; it
     * may contain other files too.
     * 3. As a JSON-formatted request parameter named `json` (when the request body
     * has content-type `application/x-www-form-urlencoded` or
     * `multipart/form-data`).
     * 4. As a previously-uploaded JSON or ZIP file, represented by a upload token in
     * the `upload` parameter.
     *
     * In all of these, the modification is defined by a JSON submission object. The
     * properties of this object define the modifications applied to the submission.
     * The object need not specify all submission properties; absent properties
     * remain unchanged.
     *
     * The `p` request parameter is optional. If it is unset, HotCRP uses the `pid`
     * from the supplied JSON. If both the `p` parameter and the JSON `pid` property
     * are present, however, then they must match.
     *
     * To test a modification, supply a `dry_run=1` parameter. This will test the
     * uploaded JSON but make no changes to the database.
     *
     *
     * ### ZIP and form uploads
     *
     * A ZIP upload should contain a file named `data.json` (`PREFIX-data.json` is
     * also acceptable). This file’s content is parsed as JSON. Submission fields in
     * the JSON can refer to other files in the ZIP. For instance, this shell session
     * uploads a new submission with content `paper.pdf`:
     *
     * ```
     * $ cat data.json
     * {
         * "object": "paper",
         * "pid": "new",
         * "title": "Aught: A Methodology for the Visualization of Scheme",
         * "authors": [{"name": "Nevaeh Gomez", "email": "ngomez@example.edu"}],
         * "submission": {"content_file": "paper.pdf"},
         * "status": "submitted"
         * }
         * $ zip upload.zip data.json paper.pdf
         * $ curl -H "Authorization: bearer hct_XXX" --data-binary @upload.zip -H "Content-Type: application/zip" SITEURL/api/paper
         * ```
         *
         * This shell session does the same, but using `multipart/form-data`.
         *
         * ```
         * $ curl -H "Authorization: bearer hct_XXX" -F "json=<data.json" -F paper.pdf=@paper.pdf SITEURL/api/paper
         * ```
         *
         * ### Responses
         *
         * If the modification succeeds, the response’s `paper` property contains the
         * modified submission object.
         *
         * The `change_list` property is a list of names of the modified fields. New
         * submissions have `"pid"` as the first item in the list. `change_list` contains
         * fields that the request *attempted* to modify; successful requests, erroneous
         * requests, and dry-run requests can all return nonempty `change_list`s.
         *
         * The `valid` property is `true` if and only if the modification was valid. In
         * non-dry-run requests, `valid: true` indicates that database changes were
         * committed.
         *
         * Dry-run requests return `change_list` and `valid` properties, but not `paper`
         * properties, since no modifications are performed.
         *
         *
         * ### Administrator use
         *
         * Administrators can use this endpoint to set some submission properties, such
         * as `decision`, that have other endpoints as well.
         *
         * Administrators can choose specific IDs for new submissions; just set `p` (or
         * JSON `pid`) to the chosen ID. Such a request will either modify an existing
         * submission or create a new submission with that ID. To avoid overwriting an
         * existing submission, set the JSON’s `status`.`if_unmodified_since` to `0`.
         *
         * @param p
         * @param dryRun True checks input for errors, but does not save changes
         * @param disableUsers True disables any newly-created users (site
         * administrators only)
         * @param addTopics True automatically adds topics from input papers
         * (site administrators only)
         * @param notify False disables all email notifications (site
         * administrators only)
         * @param notifyAuthors False disables email notifications to authors
         * (paper administrators only)
         * @param reason Optional text included in notification emails
         * @param json
         * @param upload Upload token for large input file
         * @param forceShow
         * @returns any
         * @returns error_response
         * @throws ApiError
         */
        public static postPaper(
            p?: pid,
            dryRun?: boolean,
            disableUsers?: boolean,
            addTopics?: boolean,
            notify?: boolean,
            notifyAuthors?: boolean,
            reason?: string,
            json?: string,
            upload?: upload_token,
            forceShow?: boolean,
        ): CancelablePromise<(minimal_response & {
            /**
             * JSON version of modified paper
             */
            paper?: paper;
            /**
             * True for `dry_run` requests
             */
            dry_run?: boolean;
            /**
             * List of changed fields
             */
            change_list?: Array<string>;
            /**
             * True if the modification was valid
             */
            valid?: boolean;
        }) | error_response> {
            return __request(OpenAPI, {
                method: 'POST',
                url: '/paper',
                query: {
                    'p': p,
                    'dry_run': dryRun,
                    'disable_users': disableUsers,
                    'add_topics': addTopics,
                    'notify': notify,
                    'notify_authors': notifyAuthors,
                    'reason': reason,
                    'json': json,
                    'upload': upload,
                    'forceShow': forceShow,
                },
            });
        }
        /**
         * Delete submission
         * Delete the submission specified by `p`, a submission ID.
         *
         * @param p
         * @param dryRun True checks input for errors, but does not save changes
         * @param notify False disables all email notifications (site
         * administrators only)
         * @param notifyAuthors False disables email notifications to authors
         * (paper administrators only)
         * @param reason Optional text included in notification emails
         * @param ifUnmodifiedSince Don’t delete if modified since this time
         * @param forceShow
         * @returns minimal_response
         * @returns error_response
         * @throws ApiError
         */
        public static deletePaper(
            p: pid,
            dryRun?: boolean,
            notify?: boolean,
            notifyAuthors?: boolean,
            reason?: string,
            ifUnmodifiedSince?: string,
            forceShow?: boolean,
        ): CancelablePromise<minimal_response | error_response> {
            return __request(OpenAPI, {
                method: 'DELETE',
                url: '/{p}/paper',
                path: {
                    'p': p,
                },
                query: {
                    'dry_run': dryRun,
                    'notify': notify,
                    'notify_authors': notifyAuthors,
                    'reason': reason,
                    'if_unmodified_since': ifUnmodifiedSince,
                    'forceShow': forceShow,
                },
            });
        }
        /**
         * Retrieve multiple submissions
         * Retrieve submission objects matching a search.
         *
         * The search is specified in the `q` parameter; all matching visible papers are
         * returned. Other search parameters (`t`, `qt`) are accepted too. The response
         * property `papers` is an array of matching submission objects.
         *
         * Since searches silently filter out non-viewable submissions, `/papers?q=1010`
         * and `/paper?p=1010` can return different error messages. The `/paper` request
         * might return an error like `Submission #1010 does not exist` or `You aren’t
         * allowed to view submission #1010`, whereas the `/papers` request will return
         * no errors. To obtain warnings for missing submissions that were explicitly
         * listed in a query, supply a `warn_missing=1` parameter.
         *
         * @param q
         * @param warnMissing Get warnings for missing submissions
         * @param t
         * @param qt
         * @param scoresort
         * @param sort
         * @param reviewer
         * @param forceShow
         * @returns any
         * @returns error_response
         * @throws ApiError
         */
        public static getPapers(
            q: search_string,
            warnMissing?: boolean,
            t?: search_collection,
            qt?: search_qt,
            scoresort?: search_scoresort,
            sort?: search_sort,
            reviewer?: search_reviewer,
            forceShow?: boolean,
        ): CancelablePromise<(minimal_response & {
            papers?: Array<paper>;
        }) | error_response> {
            return __request(OpenAPI, {
                method: 'GET',
                url: '/papers',
                query: {
                    'warn_missing': warnMissing,
                    'q': q,
                    't': t,
                    'qt': qt,
                    'scoresort': scoresort,
                    'sort': sort,
                    'reviewer': reviewer,
                    'forceShow': forceShow,
                },
            });
        }
        /**
         * Create or modify multiple submissions
         * Create or modify multiple submissions.
         *
         * This administrator-only endpoint modifies multiple submissions at once. Its
         * request formats are similar to that of `POST /{p}/paper`: it can accept a
         * JSON, ZIP, or form-encoded request body with a `json` parameter, and ZIP and
         * form-encoded requests can also include attached files.
         *
         * The JSON provided for `/papers` should be an *array* of JSON objects. Response
         * properties `papers`, `change_lists`, and `valid` are arrays with the same
         * number of elements as the input JSON; component *i* of each response property
         * contains the result for the *i*th submission object in the input JSON.
         *
         * Alternately, you can provide a `q` search query parameter and a *single* JSON
         * object. The JSON object must not have a `pid` property. The JSON modification
         * will be applied to all papers returned by the `q` search query.
         *
         * The response `message_list` contains messages relating to all modified
         * submissions. To filter out the messages for a single submission, use the
         * messages’ `landmark` properties. `landmark` is set to the integer index of the
         * relevant submission in the input JSON.
         *
         *
         * @param dryRun True checks input for errors, but does not save changes
         * @param disableUsers True disables any newly-created users (administrators only)
         * @param addTopics True automatically adds topics from input papers (administrators only)
         * @param notify False does not notify contacts of changes (administrators only)
         * @param json
         * @param upload Defines upload token for large input file
         * @param q Search query for match requests
         * @param t Collection to search; defaults to `viewable`
         * @param qt
         * @param sort
         * @param scoresort
         * @param reviewer
         * @param notifyAuthors
         * @param reason
         * @param forceShow
         * @returns any
         * @returns error_response
         * @throws ApiError
         */
        public static postPapers(
            dryRun?: boolean,
            disableUsers?: boolean,
            addTopics?: boolean,
            notify?: boolean,
            json?: string,
            upload?: upload_token,
            q?: search_string,
            t?: search_collection,
            qt?: search_qt,
            sort?: search_sort,
            scoresort?: search_scoresort,
            reviewer?: search_reviewer,
            notifyAuthors?: any,
            reason?: any,
            forceShow?: boolean,
        ): CancelablePromise<(minimal_response & {
            /**
             * List of JSON versions of modified papers
             */
            papers?: Array<paper>;
            /**
             * True for `dry_run` requests
             */
            dry_run?: boolean;
            /**
             * List of lists of changed fields
             */
            change_lists?: Array<Array<string>>;
            /**
             * List of validity checks
             */
            valid?: Array<boolean>;
        }) | error_response> {
            return __request(OpenAPI, {
                method: 'POST',
                url: '/papers',
                query: {
                    'dry_run': dryRun,
                    'disable_users': disableUsers,
                    'add_topics': addTopics,
                    'notify': notify,
                    'json': json,
                    'upload': upload,
                    'q': q,
                    't': t,
                    'qt': qt,
                    'sort': sort,
                    'scoresort': scoresort,
                    'reviewer': reviewer,
                    'notify_authors': notifyAuthors,
                    'reason': reason,
                    'forceShow': forceShow,
                },
            });
        }
    }
