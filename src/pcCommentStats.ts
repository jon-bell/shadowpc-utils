import * as fs from "fs";

interface CommentData {
    paper_id: number;
    paper_title: string;
    comment_id: number;
    ordinal?: string;
    visibility?: string;
    topic?: string;
    blind?: boolean;
    draft?: boolean;
    response?: string;
    by_author?: boolean;
    by_shepherd?: boolean;
    format?: number;
    tags?: string;
    author?: string;
    author_email?: string;
    author_hidden?: boolean;
    author_pseudonym?: string;
    author_pseudonymous?: boolean;
    modified_at?: number;
    modified_at_text?: string;
    modified_at_obscured?: boolean;
    text?: string;
    word_count?: number;
    docs?: Array<any>;
}

interface ReviewerInfo {
    name?: string;
    email?: string;
    pseudonym?: string;
    contact_id?: number;
}

interface ReviewerAssignment {
    reviewer_name: string;
    reviewer_email: string;
    assigned_papers: number[];
}

interface CommentsExport {
    export_info: {
        timestamp: string;
        total_papers: number;
        total_comments: number;
        total_pc_members?: number;
        api_base: string;
    };
    comments: CommentData[];
    pc_members?: ReviewerInfo[];
    reviewer_assignments?: ReviewerAssignment[];
}

interface PCMemberStats {
    name: string;
    email: string;
    
    // Overall stats
    total_comments: number;
    papers_with_comments: number;
    
    // Practice phase (before Sept 18, 2025)
    practice_comments: number;
    practice_papers: number;
    
    // Peer Review phase (Sept 18 - Sept 27, 2025)
    peer_review_comments: number;
    peer_review_papers: number;
    
    // Discussion phase (after Sept 27, 2025)
    discussion_comments: number;
    discussion_papers: number;
    
    // Assignment stats
    papers_assigned: number;
    papers_assigned_without_comments: number;
    uncommented_paper_ids: number[];  // List of paper IDs assigned but not commented on
}

function loadCommentsData(filename: string): CommentsExport {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error loading comments file ${filename}:`, error);
        process.exit(1);
    }
}

function getCommentPhase(comment: CommentData): 'practice' | 'peer_review' | 'discussion' | 'unknown' {
    if (!comment.modified_at) return 'unknown';
    
    // Convert Unix timestamp to Date
    const commentDate = new Date(comment.modified_at * 1000);
    
    // Define phase boundaries
    const practiceEnd = new Date('2025-09-18T00:00:00Z');
    const peerReviewEnd = new Date('2025-09-27T00:00:00Z');
    
    if (commentDate < practiceEnd) {
        return 'practice';
    } else if (commentDate < peerReviewEnd) {
        return 'peer_review';
    } else {
        return 'discussion';
    }
}

function calculatePCMemberStats(
    comments: CommentData[], 
    pcMembers: ReviewerInfo[], 
    reviewerAssignments?: ReviewerAssignment[]
): PCMemberStats[] {
    const stats: PCMemberStats[] = [];
    
    // Create a map of email to assigned papers for quick lookup
    // Note: Papers 1-4 are special/practice papers and are excluded from the assignment analysis
    const assignmentMap = new Map<string, number[]>();
    if (reviewerAssignments) {
        reviewerAssignments.forEach(assignment => {
            assignmentMap.set(assignment.reviewer_email, assignment.assigned_papers);
        });
    }
    
    // Initialize stats for all PC members
    pcMembers.forEach(member => {
        if (member.name && member.email) {
            const allAssignedPapers = assignmentMap.get(member.email) || [];
            // Filter out papers 1-4 (special papers that don't count)
            const assignedPapers = allAssignedPapers.filter(paperId => paperId > 4);
            stats.push({
                name: member.name,
                email: member.email,
                total_comments: 0,
                papers_with_comments: 0,
                practice_comments: 0,
                practice_papers: 0,
                peer_review_comments: 0,
                peer_review_papers: 0,
                discussion_comments: 0,
                discussion_papers: 0,
                papers_assigned: assignedPapers.length,
                papers_assigned_without_comments: 0,
                uncommented_paper_ids: []
            });
        }
    });
    
    // Count comments for each PC member by phase
    stats.forEach(pcMember => {
        const memberComments = comments.filter(comment => 
            comment.author_email === pcMember.email || 
            comment.author === pcMember.name
        );
        
        pcMember.total_comments = memberComments.length;
        
        // Count unique papers where this PC member commented (overall)
        const uniquePapers = new Set(memberComments.map(comment => comment.paper_id));
        pcMember.papers_with_comments = uniquePapers.size;
        
        // Group comments by phase
        const practiceComments = memberComments.filter(c => getCommentPhase(c) === 'practice');
        const peerReviewComments = memberComments.filter(c => getCommentPhase(c) === 'peer_review');
        const discussionComments = memberComments.filter(c => getCommentPhase(c) === 'discussion');
        
        // Count comments and unique papers per phase
        pcMember.practice_comments = practiceComments.length;
        pcMember.practice_papers = new Set(practiceComments.map(c => c.paper_id)).size;
        
        pcMember.peer_review_comments = peerReviewComments.length;
        pcMember.peer_review_papers = new Set(peerReviewComments.map(c => c.paper_id)).size;
        
        pcMember.discussion_comments = discussionComments.length;
        pcMember.discussion_papers = new Set(discussionComments.map(c => c.paper_id)).size;
        
        // Calculate papers assigned without discussion comments
        const allAssignedPapers = assignmentMap.get(pcMember.email) || [];
        // Filter out papers 1-4 (special papers that don't count)
        const assignedPapers = allAssignedPapers.filter(paperId => paperId > 4);
        const discussionPapersSet = new Set(discussionComments.map(c => c.paper_id));
        const uncommentedPapers = assignedPapers.filter(
            paperId => !discussionPapersSet.has(paperId)
        );
        pcMember.papers_assigned_without_comments = uncommentedPapers.length;
        pcMember.uncommented_paper_ids = uncommentedPapers;
    });
    
    // Sort by total comments (descending)
    return stats.sort((a, b) => b.total_comments - a.total_comments);
}

function generateStatsCSV(stats: PCMemberStats[]): string {
    // Find the maximum number of uncommented papers to determine column count
    const maxUncommentedPapers = Math.max(...stats.map(s => s.uncommented_paper_ids.length), 0);
    
    const headers = [
        'name', 
        'email', 
        'total_comments', 
        'papers_with_comments',
        'practice_comments',
        'practice_papers',
        'peer_review_comments',
        'peer_review_papers',
        'discussion_comments',
        'discussion_papers',
        'papers_assigned',
        'papers_assigned_without_comments'
    ];
    
    // Add columns for each uncommented paper
    for (let i = 1; i <= maxUncommentedPapers; i++) {
        headers.push(`uncommented_paper_${i}`);
    }
    
    const rows = [headers.join(',')];
    
    stats.forEach(stat => {
        const row = [
            `"${stat.name.replace(/"/g, '""')}"`,
            stat.email,
            stat.total_comments.toString(),
            stat.papers_with_comments.toString(),
            stat.practice_comments.toString(),
            stat.practice_papers.toString(),
            stat.peer_review_comments.toString(),
            stat.peer_review_papers.toString(),
            stat.discussion_comments.toString(),
            stat.discussion_papers.toString(),
            stat.papers_assigned.toString(),
            stat.papers_assigned_without_comments.toString()
        ];
        
        // Add uncommented paper IDs
        for (let i = 0; i < maxUncommentedPapers; i++) {
            if (i < stat.uncommented_paper_ids.length) {
                row.push(stat.uncommented_paper_ids[i].toString());
            } else {
                row.push('');  // Empty cell if this PC member has fewer uncommented papers
            }
        }
        
        rows.push(row.join(','));
    });
    
    return rows.join('\n');
}

function printSummaryStats(stats: PCMemberStats[]) {
    const totalComments = stats.reduce((sum, stat) => sum + stat.total_comments, 0);
    const totalPapersWithComments = stats.reduce((sum, stat) => sum + stat.papers_with_comments, 0);
    const activeCommenters = stats.filter(stat => stat.total_comments > 0).length;
    const veryActiveCommenters = stats.filter(stat => stat.total_comments >= 5).length;
    
    // Phase-specific totals
    const practiceComments = stats.reduce((sum, stat) => sum + stat.practice_comments, 0);
    const peerReviewComments = stats.reduce((sum, stat) => sum + stat.peer_review_comments, 0);
    const discussionComments = stats.reduce((sum, stat) => sum + stat.discussion_comments, 0);
    
    const practicePapers = stats.reduce((sum, stat) => sum + stat.practice_papers, 0);
    const peerReviewPapers = stats.reduce((sum, stat) => sum + stat.peer_review_papers, 0);
    const discussionPapers = stats.reduce((sum, stat) => sum + stat.discussion_papers, 0);
    
    console.log('\n=== Overall Summary Statistics ===');
    console.log(`Total PC members: ${stats.length}`);
    console.log(`PC members with comments: ${activeCommenters} (${(activeCommenters/stats.length*100).toFixed(1)}%)`);
    console.log(`PC members with 5+ comments: ${veryActiveCommenters} (${(veryActiveCommenters/stats.length*100).toFixed(1)}%)`);
    console.log(`Total comments by PC members: ${totalComments}`);
    console.log(`Average comments per PC member: ${(totalComments/stats.length).toFixed(1)}`);
    console.log(`Average papers commented on per PC member: ${(totalPapersWithComments/stats.length).toFixed(1)}`);
    
    console.log('\n=== Phase-Based Statistics ===');
    console.log(`📚 Practice Phase (before Sept 18, 2025):`);
    console.log(`   Comments: ${practiceComments} | Papers: ${practicePapers} | Avg per PC: ${(practiceComments/stats.length).toFixed(1)}`);
    
    console.log(`🔍 Peer Review Phase (Sept 18-27, 2025):`);
    console.log(`   Comments: ${peerReviewComments} | Papers: ${peerReviewPapers} | Avg per PC: ${(peerReviewComments/stats.length).toFixed(1)}`);
    
    console.log(`💬 Discussion Phase (after Sept 27, 2025):`);
    console.log(`   Comments: ${discussionComments} | Papers: ${discussionPapers} | Avg per PC: ${(discussionComments/stats.length).toFixed(1)}`);
    
    // Phase participation rates
    const practiceParticipants = stats.filter(stat => stat.practice_comments > 0).length;
    const peerReviewParticipants = stats.filter(stat => stat.peer_review_comments > 0).length;
    const discussionParticipants = stats.filter(stat => stat.discussion_comments > 0).length;
    
    console.log('\n=== Phase Participation Rates ===');
    console.log(`📚 Practice: ${practiceParticipants}/${stats.length} PC members (${(practiceParticipants/stats.length*100).toFixed(1)}%)`);
    console.log(`🔍 Peer Review: ${peerReviewParticipants}/${stats.length} PC members (${(peerReviewParticipants/stats.length*100).toFixed(1)}%)`);
    console.log(`💬 Discussion: ${discussionParticipants}/${stats.length} PC members (${(discussionParticipants/stats.length*100).toFixed(1)}%)`);
    
    // Top commenters by phase
    console.log('\n=== Most Active by Phase ===');
    
    const topPractice = stats.filter(s => s.practice_comments > 0).sort((a, b) => b.practice_comments - a.practice_comments).slice(0, 3);
    if (topPractice.length > 0) {
        console.log('📚 Top Practice commenters:');
        topPractice.forEach((stat, i) => {
            console.log(`   ${i + 1}. ${stat.name}: ${stat.practice_comments} comments on ${stat.practice_papers} papers`);
        });
    }
    
    const topPeerReview = stats.filter(s => s.peer_review_comments > 0).sort((a, b) => b.peer_review_comments - a.peer_review_comments).slice(0, 3);
    if (topPeerReview.length > 0) {
        console.log('🔍 Top Peer Review commenters:');
        topPeerReview.forEach((stat, i) => {
            console.log(`   ${i + 1}. ${stat.name}: ${stat.peer_review_comments} comments on ${stat.peer_review_papers} papers`);
        });
    }
    
    const topDiscussion = stats.filter(s => s.discussion_comments > 0).sort((a, b) => b.discussion_comments - a.discussion_comments).slice(0, 3);
    if (topDiscussion.length > 0) {
        console.log('💬 Top Discussion commenters:');
        topDiscussion.forEach((stat, i) => {
            console.log(`   ${i + 1}. ${stat.name}: ${stat.discussion_comments} comments on ${stat.discussion_papers} papers`);
        });
    }
    
    // Silent members
    const silentMembers = stats.filter(stat => stat.total_comments === 0);
    if (silentMembers.length > 0) {
        console.log(`\n📊 ${silentMembers.length} PC members have not made any comments`);
    }
}

function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Usage: tsx src/pcCommentStats.ts <comments_export_file.json>');
        console.error('');
        console.error('Example: tsx src/pcCommentStats.ts comments_export_2025-10-22.json');
        process.exit(1);
    }
    
    const filename = args[0];
    console.log(`=== PC Member Comment Statistics ===`);
    console.log(`Analyzing data from: ${filename}\n`);
    
    // Load data
    const data = loadCommentsData(filename);
    console.log(`Loaded ${data.comments.length} comments from ${data.export_info.total_papers} papers`);
    
    if (!data.pc_members || data.pc_members.length === 0) {
        console.error('Error: No PC members found in the export data. Make sure to use a comments export that includes PC member data.');
        process.exit(1);
    }
    
    console.log(`Found ${data.pc_members.length} PC members\n`);
    
    // Calculate statistics
    const stats = calculatePCMemberStats(data.comments, data.pc_members, data.reviewer_assignments);
    
    // Generate CSV
    const csvContent = generateStatsCSV(stats);
    const csvFilename = `pc_comment_stats_${new Date().toISOString().split('T')[0]}.csv`;
    fs.writeFileSync(csvFilename, csvContent);
    
    console.log(`✓ CSV saved to: ${csvFilename}`);
    
    // Print summary statistics
    printSummaryStats(stats);
    
    console.log('');
}

// Run the script
main();
