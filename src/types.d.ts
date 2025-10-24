
export interface HotCRPJSONPaper {
    object:                                                                   string;
    pid:                                                                      number;
    submission_class:                                                         string;
    title:                                                                    string;
    abstract:                                                                 string;
    authors:                                                                  Author[];
    confirmation_author_list:                                                 boolean;
    topics:                                                                   string[];
    primary_area:                                                             string;
    secondary_area:                                                           string;
    submission:                                                               Submission;
    information_about_artifact_availability:                                  string;
    supplementary_material:                                                   Submission;
    compliance_acm_ieee_policies:                                             boolean;
    compliance_double_anonymous_formatting_other_icse_2026_specific_policies: boolean;
    acm_open:                                                                 string;
    pc_conflicts:                                                             PCConflicts;
    collaborators:                                                            string;
    confirmation_accuracy_conflicts_interest:                                 boolean;
    confirmation_other_personal_conflicts_interest:                           boolean;
    "paper_resubmission_icse_2026_rejected_paper?":                           string;
    shadow_pc_opt:                                                            boolean;
    status:                                                                   string;
    submitted:                                                                boolean;
    submitted_at:                                                             number;
    modified_at:                                                              number;
    tags:                                                                     Tag[];
}

export interface Author {
    email:       string;
    first:       string;
    last:        string;
    affiliation: string;
    contact:     boolean;
}

export interface PCConflicts {
}

export interface Submission {
    mimetype:  string;
    hash:      string;
    timestamp: number;
    size:      number;
    pages?:    number;
    filename?: string;
}

export interface Tag {
    tag:   string;
    value: number;
}

// ============================================================================
// Comments Export Types
// ============================================================================

/**
 * Main export structure for HotCRP comments, PC members, and reviewer assignments
 */
export interface CommentsExport {
    export_info: ExportInfo;
    comments: CommentData[];
    pc_members: ReviewerInfo[];
    reviewer_assignments: ReviewerAssignment[];
}

/**
 * Metadata about the export
 */
export interface ExportInfo {
    /** ISO 8601 timestamp of when the export was created */
    timestamp: string;
    /** Total number of papers in the conference */
    total_papers: number;
    /** Total number of comments exported */
    total_comments: number;
    /** Total number of PC members */
    total_pc_members: number;
    /** Number of PC members with at least one paper assignment */
    total_reviewer_assignments: number;
    /** Base URL of the HotCRP API */
    api_base: string;
}

/**
 * Complete comment data including paper context and metadata
 */
export interface CommentData {
    // Paper information
    /** Paper ID number */
    paper_id: number;
    /** Title of the paper */
    paper_title: string;
    
    // Comment metadata
    /** Unique comment ID */
    comment_id: number;
    /** Comment ordering within paper */
    ordinal?: string;
    /** Who can see the comment: 'admin', 'pc', 'rev', 'au' */
    visibility?: string;
    /** Comment topic/thread: 'paper', 'rev', 'dec' */
    topic?: string;
    /** Whether comment is anonymous */
    blind?: boolean;
    /** Whether comment is still a draft */
    draft?: boolean;
    /** Response type (if applicable) */
    response?: string;
    /** Whether comment is by paper author */
    by_author?: boolean;
    /** Whether comment is by shepherd */
    by_shepherd?: boolean;
    /** Text format indicator */
    format?: number;
    /** Associated tags */
    tags?: string;
    
    // Author information
    /** Author name (if visible) */
    author?: string;
    /** Author email (if visible) */
    author_email?: string;
    /** Whether author identity is hidden */
    author_hidden?: boolean;
    /** Pseudonym used (if any) */
    author_pseudonym?: string;
    /** Whether using pseudonym */
    author_pseudonymous?: boolean;
    
    // Timing information
    /** Unix timestamp of last modification */
    modified_at?: number;
    /** Human-readable modification time */
    modified_at_text?: string;
    /** Whether timing is obscured */
    modified_at_obscured?: boolean;
    
    // Comment content
    /** The actual comment text */
    text?: string;
    /** Number of words in comment */
    word_count?: number;
    
    // Attachments
    /** Attached documents */
    docs?: Array<any>;
}

/**
 * PC member/reviewer information
 */
export interface ReviewerInfo {
    /** Reviewer's full name */
    name?: string;
    /** Reviewer's email address */
    email?: string;
    /** Pseudonym (if any) */
    pseudonym?: string;
    /** Unique contact identifier */
    contact_id?: number;
}

/**
 * Paper assignments for a reviewer
 */
export interface ReviewerAssignment {
    /** Reviewer's full name */
    reviewer_name?: string;
    /** Reviewer's email address */
    reviewer_email?: string;
    /** Unique contact identifier */
    reviewer_contact_id?: number;
    /** Array of paper IDs assigned to this reviewer */
    assigned_papers: number[];
}