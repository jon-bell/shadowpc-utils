import { OpenAPI, SubmissionsService, CommentsService, ReviewsService, UsersService } from "./generated";
import type { comment } from "./generated/models/comment";
import type { CommentsExport, CommentData, ReviewerInfo, ReviewerAssignment } from "./types";
import { rateLimitedApiCall } from "./rateLimiter";
import dotenv from "dotenv";
import * as fs from "fs";

dotenv.config({path: '.env'});

// Configure OpenAPI with environment variables from main.ts
OpenAPI.BASE = process.env.HOTCRP_API_URL || 'https://demo.hotcrp.com/api';
OpenAPI.TOKEN = process.env.HOTCRP_API_TOKEN;

interface Paper {
    pid: number;
    title: string;
}

interface ReviewData {
    review_id?: string;
    reviewer_name?: string;
    reviewer_email?: string;
    reviewer_pseudonym?: string;
    reviewer_contact_id?: number;
    review_text?: string;
    review_scores?: any;
    review_status?: string;
    review_submitted?: boolean;
    review_modified_at?: number;
    review_modified_at_text?: string;
}

async function fetchAllPapers(): Promise<Paper[]> {
    try {
        console.log('Fetching all papers...');
        const response = await rateLimitedApiCall(() => SubmissionsService.getPapers('all'));
        
        if ('papers' in response && response.papers) {
            const papers: Paper[] = response.papers.map((paper: any) => ({
                pid: paper.pid || 0,
                title: paper.title || ''
            }));
            
            console.log(`Found ${papers.length} papers`);
            return papers;
        }
        
        console.log('No papers found or error in response');
        return [];
    } catch (error) {
        console.error('Error fetching papers:', error);
        return [];
    }
}

async function fetchReviewsForPaper(paper: Paper): Promise<{ reviews: ReviewData[], reviewers: ReviewerInfo[] }> {
    // For now, skip the reviews endpoint since it's causing errors
    // We'll rely on getting reviewer information from comments and PC members list
    // This is more reliable and still provides the data we need for mention matching
    
    console.log(`Skipping reviews endpoint for paper ${paper.pid} (using comment-based reviewer detection instead)`);
    return { reviews: [], reviewers: [] };
}

async function fetchCommentsForPaper(paper: Paper): Promise<CommentData[]> {
    try {
        // Call getComment without 'c' parameter to get all comments for the paper
        const response = await rateLimitedApiCall(() => CommentsService.getComment(paper.pid, true)); // content=true to include comment text
        
        const comments: CommentData[] = [];
        
        if ('comments' in response && response.comments) {
            response.comments.forEach((comment: comment) => {
                const commentData: CommentData = {
                    // Paper information
                    paper_id: paper.pid,
                    paper_title: paper.title,
                    
                    // Comment metadata
                    comment_id: comment.cid,
                    ordinal: comment.ordinal,
                    visibility: comment.visibility,
                    topic: comment.topic,
                    blind: comment.blind,
                    draft: comment.draft,
                    response: comment.response,
                    by_author: comment.by_author,
                    by_shepherd: comment.by_shepherd,
                    format: comment.format,
                    tags: comment.tags,
                    
                    // Author information
                    author: comment.author,
                    author_email: comment.author_email,
                    author_hidden: comment.author_hidden,
                    author_pseudonym: comment.author_pseudonym,
                    author_pseudonymous: comment.author_pseudonymous,
                    
                    // Timing information
                    modified_at: comment.modified_at,
                    modified_at_text: comment.modified_at_text,
                    modified_at_obscured: comment.modified_at_obscured,
                    
                    // Comment content
                    text: comment.text,
                    word_count: comment.word_count,
                    
                    // Attachments
                    docs: comment.docs
                };
                
                comments.push(commentData);
            });
        }
        
        return comments;
    } catch (error) {
        console.warn(`Warning: Could not fetch comments for paper ${paper.pid}:`, error);
        return [];
    }
}

async function fetchPCMembers(): Promise<ReviewerInfo[]> {
    try {
        console.log('Fetching PC members...');
        const response = await rateLimitedApiCall(() => UsersService.getPc());
        
        if ('pc' in response && response.pc) {
            const pcMembers: ReviewerInfo[] = response.pc.map((member: any) => ({
                name: member.name || `${member.given_name || ''} ${member.family_name || ''}`.trim(),
                email: member.email || '',
                pseudonym: member.pseudonym,
                contact_id: member.contactId || member.uid || member.id
            }));
            
            console.log(`Found ${pcMembers.length} PC members`);
            return pcMembers;
        }
        
        console.log('No PC members found or error in response');
        return [];
    } catch (error) {
        console.error('Error fetching PC members:', error);
        return [];
    }
}

async function fetchReviewerAssignments(pcMembers: ReviewerInfo[]): Promise<ReviewerAssignment[]> {
    const assignments: ReviewerAssignment[] = [];
    let processedReviewers = 0;
    
    console.log(`Fetching reviewer assignments for ${pcMembers.length} PC members...`);
    
    for (const pcMember of pcMembers) {
        try {
            if (!pcMember.email) {
                console.warn(`Skipping PC member without email: ${pcMember.name}`);
                continue;
            }
            
            // Use the papers search API with re: query to find papers assigned to this reviewer
            const response = await rateLimitedApiCall(() => 
                SubmissionsService.getPapers(`re:primary:${pcMember.email}`, false, undefined, undefined, undefined, undefined, pcMember.email)
            );
            
            const assignedPapers: number[] = [];
            if ('papers' in response && response.papers) {
                response.papers.forEach((paper: any) => {
                    if (paper.pid) {
                        assignedPapers.push(paper.pid);
                    }
                });
            }
            
            // Only add assignment if the reviewer has papers assigned
            if (assignedPapers.length > 0) {
                assignments.push({
                    reviewer_name: pcMember.name,
                    reviewer_email: pcMember.email,
                    reviewer_contact_id: pcMember.contact_id,
                    assigned_papers: assignedPapers
                });
            }
            
            processedReviewers++;
            if (processedReviewers % 10 === 0) {
                console.log(`Progress: ${processedReviewers}/${pcMembers.length} reviewers processed`);
            }
        } catch (error) {
            console.warn(`Warning: Could not fetch assignments for ${pcMember.email}:`, error);
        }
    }
    
    console.log(`Collected assignments for ${assignments.length} reviewers with papers assigned`);
    return assignments;
}

async function fetchAllComments(papers: Paper[]): Promise<CommentData[]> {
    const allComments: CommentData[] = [];
    let processedPapers = 0;
    
    console.log(`Fetching comments for ${papers.length} papers...`);
    
    for (const paper of papers) {
        const comments = await fetchCommentsForPaper(paper);
        allComments.push(...comments);
        
        processedPapers++;
        if (processedPapers % 10 === 0) {
            console.log(`Progress: ${processedPapers}/${papers.length} papers processed, ${allComments.length} comments collected so far`);
        }
        
        // Rate limiting is handled by rateLimitedApiCall, no need for manual delay
    }
    
    console.log(`Collected ${allComments.length} comments from ${processedPapers} papers`);
    return allComments;
}

async function main() {
    try {
        console.log('=== HotCRP Comments Export ===\n');
        
        // Fetch all papers
        console.log('Phase 1: Fetching papers...');
        const papers = await fetchAllPapers();
        
        if (papers.length === 0) {
            console.error('No papers found. Aborting.');
            return;
        }
        
        // Fetch PC members first
        console.log('\nPhase 2: Fetching PC members...');
        const pcMembers = await fetchPCMembers();
        
        // Fetch comments and reviewer assignments in parallel
        console.log('\nPhase 3: Fetching comments and reviewer assignments...');
        const [comments, reviewerAssignments] = await Promise.all([
            fetchAllComments(papers),
            fetchReviewerAssignments(pcMembers)
        ]);
        
        const exportData: CommentsExport = {
            export_info: {
                timestamp: new Date().toISOString(),
                total_papers: papers.length,
                total_comments: comments.length,
                total_pc_members: pcMembers.length,
                total_reviewer_assignments: reviewerAssignments.length,
                api_base: OpenAPI.BASE || 'unknown'
            },
            comments: comments,
            pc_members: pcMembers,
            reviewer_assignments: reviewerAssignments
        };
        
        // Save to JSON file
        console.log('\nPhase 4: Saving to JSON file...');
        const filename = `comments_export_${new Date().toISOString().split('T')[0]}.json`;
        fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
        
        console.log('\n=== Export Complete ===');
        console.log(`Papers processed: ${papers.length}`);
        console.log(`Comments exported: ${comments.length}`);
        console.log(`PC members exported: ${pcMembers.length}`);
        console.log(`Reviewer assignments exported: ${reviewerAssignments.length}`);
        console.log(`File saved: ${filename}`);
        
        // Print summary statistics
        const commentsByVisibility = comments.reduce((acc, comment) => {
            const visibility = comment.visibility || 'unknown';
            acc[visibility] = (acc[visibility] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const commentsByTopic = comments.reduce((acc, comment) => {
            const topic = comment.topic || 'unknown';
            acc[topic] = (acc[topic] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        console.log('\n=== Summary Statistics ===');
        console.log('Comments by visibility:', commentsByVisibility);
        console.log('Comments by topic:', commentsByTopic);
        console.log(`Draft comments: ${comments.filter(c => c.draft).length}`);
        console.log(`Comments by authors: ${comments.filter(c => c.by_author).length}`);
        console.log(`Blind comments: ${comments.filter(c => c.blind).length}`);
        
        // Reviewer assignment statistics
        const totalAssignedPapers = reviewerAssignments.reduce((sum, assignment) => sum + assignment.assigned_papers.length, 0);
        const avgPapersPerReviewer = reviewerAssignments.length > 0 ? (totalAssignedPapers / reviewerAssignments.length).toFixed(2) : '0';
        const maxPapersAssigned = reviewerAssignments.length > 0 ? Math.max(...reviewerAssignments.map(a => a.assigned_papers.length)) : 0;
        const minPapersAssigned = reviewerAssignments.length > 0 ? Math.min(...reviewerAssignments.map(a => a.assigned_papers.length)) : 0;
        
        console.log('\n=== Reviewer Assignment Statistics ===');
        console.log(`Total reviewer assignments: ${reviewerAssignments.length}`);
        console.log(`Total papers assigned: ${totalAssignedPapers}`);
        console.log(`Average papers per reviewer: ${avgPapersPerReviewer}`);
        console.log(`Max papers assigned to one reviewer: ${maxPapersAssigned}`);
        console.log(`Min papers assigned to one reviewer: ${minPapersAssigned}`);
        
    } catch (error) {
        console.error('Error in main process:', error);
    }
}

// Run the script
main().catch(console.error);
