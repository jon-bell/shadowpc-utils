import { OpenAPI, CommentsService } from "./generated";
import { comment_visibility } from "./generated/models/comment_visibility";
import { comment_topic } from "./generated/models/comment_topic";
import { rateLimitedApiCall } from "./rateLimiter";
import dotenv from "dotenv";
import * as fs from "fs";
import { parse } from "csv-parse/sync";

dotenv.config({ path: '.env' });

// Configure OpenAPI with environment variables
OpenAPI.BASE = process.env.HOTCRP_API_URL || 'https://demo.hotcrp.com/api';
OpenAPI.TOKEN = process.env.HOTCRP_API_TOKEN;

interface ReviewRow {
    paper: string; // MainPCID from the main PC
    title: string;
    review: string;
    'Overall merit': string;
    'Paper summary': string;
    'Strengths': string;
    'Weaknesses': string;
    'Detailed comments for authors': string;
    'Questions for authors\' response': string;
    'Artifact assessment': string;
    'Comments on artifact assessment': string;
    'Metareview': string;
    'Recommendation': string;
}

interface DecisionRow {
    MainPCID: string;
    'Title.x': string;
    ICSE: string;
    ShadowPCID: string;
    ShadowPC: string;
}

interface PaperReviews {
    mainPCID: string;
    shadowPCID: string;
    title: string;
    mainPCDecision: string;
    reviews: ReviewRow[];
}

/**
 * Parse CSV file and return array of review rows
 */
function parseReviewsCSV(filePath: string): ReviewRow[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
        relax_column_count: true
    });
    
    return records as ReviewRow[];
}

/**
 * Parse decisions CSV file and return array of decision rows
 */
function parseDecisionsCSV(filePath: string): DecisionRow[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
        relax_column_count: true
    });
    
    return records as DecisionRow[];
}

/**
 * Create a map from MainPCID to decision info
 */
function createDecisionMap(decisions: DecisionRow[]): Map<string, { shadowPCID: string, mainPCDecision: string, title: string }> {
    const map = new Map<string, { shadowPCID: string, mainPCDecision: string, title: string }>();
    
    decisions.forEach(decision => {
        if (decision.MainPCID) {
            map.set(decision.MainPCID, {
                shadowPCID: decision.ShadowPCID,
                mainPCDecision: decision.ICSE,
                title: decision['Title.x']
            });
        }
    });
    
    return map;
}

/**
 * Group reviews by paper and map to shadow PC IDs
 */
function groupReviewsByPaper(
    reviews: ReviewRow[], 
    decisionMap: Map<string, { shadowPCID: string, mainPCDecision: string, title: string }>
): PaperReviews[] {
    const paperMap = new Map<string, PaperReviews>();
    
    reviews.forEach(review => {
        // Use paper column as MainPCID
        const mainPCID = review.paper;
        
        if (!mainPCID) {
            console.warn('Skipping review with no paper ID:', review);
            return;
        }
        
        // Look up the decision info
        const decisionInfo = decisionMap.get(mainPCID);
        
        if (!decisionInfo) {
            console.warn(`No decision mapping found for MainPCID ${mainPCID}, skipping`);
            return;
        }
        
        if (!paperMap.has(mainPCID)) {
            paperMap.set(mainPCID, {
                mainPCID: mainPCID,
                shadowPCID: decisionInfo.shadowPCID,
                title: review.title || decisionInfo.title,
                mainPCDecision: decisionInfo.mainPCDecision,
                reviews: []
            });
        }
        
        paperMap.get(mainPCID)!.reviews.push(review);
    });
    
    return Array.from(paperMap.values());
}

/**
 * Format a single review in markdown
 */
function formatReview(review: ReviewRow): string {
    const sections: string[] = [];
    
    // Review header
    sections.push(`## Review ${review.review.replace(review.paper, '')}`);
    sections.push('');
    
    // Overall merit
    if (review['Overall merit']) {
        sections.push(`**Overall merit:** ${review['Overall merit']}`);
        sections.push('');
    }
    
    // Paper summary
    if (review['Paper summary']) {
        sections.push(`### Paper Summary`);
        sections.push(review['Paper summary']);
        sections.push('');
    }
    
    // Strengths
    if (review['Strengths']) {
        sections.push(`### Strengths`);
        sections.push(review['Strengths']);
        sections.push('');
    }
    
    // Weaknesses
    if (review['Weaknesses']) {
        sections.push(`### Weaknesses`);
        sections.push(review['Weaknesses']);
        sections.push('');
    }
    
    // Detailed comments for authors
    if (review['Detailed comments for authors']) {
        sections.push(`### Detailed Comments for Authors`);
        sections.push(review['Detailed comments for authors']);
        sections.push('');
    }
    
    // Questions for authors' response
    if (review['Questions for authors\' response']) {
        sections.push(`### Questions for Authors' Response`);
        sections.push(review['Questions for authors\' response']);
        sections.push('');
    }
    
    // Artifact assessment
    if (review['Artifact assessment']) {
        sections.push(`### Artifact Assessment`);
        sections.push(review['Artifact assessment']);
        sections.push('');
    }
    
    // Comments on artifact assessment
    if (review['Comments on artifact assessment']) {
        sections.push(`### Comments on Artifact Assessment`);
        sections.push(review['Comments on artifact assessment']);
        sections.push('');
    }
    
    // Metareview
    if (review['Metareview']) {
        sections.push(`### Metareview`);
        sections.push(review['Metareview']);
        sections.push('');
    }
    
    // Recommendation
    if (review['Recommendation']) {
        sections.push(`**Recommendation:** ${review['Recommendation']}`);
        sections.push('');
    }
    
    return sections.join('\n');
}

/**
 * Format all reviews for a paper into a single comment
 */
function formatPaperComment(paper: PaperReviews, header: string = ''): string {
    const sections: string[] = [];
    
    // Add header if provided
    if (header) {
        sections.push(header);
        sections.push('');
    }
    
    // Add main PC decision
    sections.push(`**Main PC Decision:** ${paper.mainPCDecision}`);
    sections.push('');
    sections.push('---');
    sections.push('');
    
    // Add each review
    paper.reviews.forEach((review, index) => {
        if (index > 0) {
            sections.push('---');
            sections.push('');
        }
        sections.push(formatReview(review));
    });
    
    return sections.join('\n');
}

/**
 * Post a comment to a paper
 */
async function postCommentToPaper(paperId: number, commentText: string): Promise<void> {
    try {
        console.log(`Posting comment to paper ${paperId}...`);
        
        const response = await rateLimitedApiCall(() => 
            CommentsService.postComment(
                paperId,
                'new', // c parameter - 'new' to create a new comment
                true, // override
                undefined, // delete
                {
                    text: commentText,
                    visibility: comment_visibility.PC, // visible to authors
                    topic: comment_topic.REV, // review thread
                    draft: false,
                    blind: false
                }
            )
        );
        
        console.log('Comment posted successfully!');
        console.log('Response:', JSON.stringify(response, null, 2));
    } catch (error) {
        console.error('Error posting comment:', error);
        throw error;
    }
}

async function main() {
    const args = process.argv.slice(2);
    
    // Filter out flags
    const csvFiles = args.filter(arg => !arg.startsWith('--'));
    const shouldPost = args.includes('--post');
    
    if (csvFiles.length < 2) {
        console.error('Usage: tsx src/postReviews.ts <reviews.csv> <decisions.csv> [--post]');
        console.error('');
        console.error('Arguments:');
        console.error('  reviews.csv    CSV file with review data (must have "paper" column for MainPCID)');
        console.error('  decisions.csv  CSV file mapping MainPCID to ShadowPCID and decisions');
        console.error('');
        console.error('Options:');
        console.error('  --post         Actually post to HotCRP (default: just print to console)');
        console.error('');
        console.error('Example:');
        console.error('  npm run postReviews icse2026-aureviews.csv icse26-decisions-with-shadow.csv');
        process.exit(1);
    }
    
    const reviewsFile = csvFiles[0];
    const decisionsFile = csvFiles[1];
    
    console.log(`=== Reading reviews from ${reviewsFile} ===`);
    console.log(`=== Reading decisions from ${decisionsFile} ===\n`);
    
    // Parse both CSVs
    const reviews = parseReviewsCSV(reviewsFile);
    console.log(`Loaded ${reviews.length} reviews`);
    
    const decisions = parseDecisionsCSV(decisionsFile);
    console.log(`Loaded ${decisions.length} decision mappings\n`);
    
    // Create decision map
    const decisionMap = createDecisionMap(decisions);
    
    // Group by paper using decision map
    const papers = groupReviewsByPaper(reviews, decisionMap);
    console.log(`Found ${papers.length} papers with matching decisions\n`);
    
    if (papers.length === 0) {
        console.error('No papers found after mapping. Check that Paper IDs in reviews match MainPCID in decisions.');
        process.exit(1);
    }
    
    // Add your header here
    const header = '# ICSE PC Reviews\n\nBelow are all the reviews that were submitted for this paper, and the decision. Please remember that you are bound by confidentiality to not share these reviews or decision with anyone else.\n\nPlease also keep in mind that there is no ground-truth for what the outcome of each paper should be, and that the decision is based on the reviews and the discussion.';
    
    // Track results
    const results = {
        total: papers.length,
        successful: 0,
        failed: 0,
        errors: [] as Array<{ mainPCID: string, shadowPCID: string, title: string, error: string }>
    };
    
    // Process all papers
    for (let i = 0; i < papers.length; i++) {
        const paper = papers[i];
        const paperNum = i + 1;
        
        console.log(`\n[${paperNum}/${papers.length}] Processing Paper: ${paper.title}`);
        console.log(`  Main PC ID: ${paper.mainPCID}`);
        console.log(`  Shadow PC ID: ${paper.shadowPCID} (will post to this ID)`);
        console.log(`  Main PC Decision: ${paper.mainPCDecision}`);
        console.log(`  Number of reviews: ${paper.reviews.length}`);
        
        // Format the comment
        const commentText = formatPaperComment(paper, header);
        
        if (shouldPost) {
            // Post to HotCRP using Shadow PC ID
            const shadowPaperId = parseInt(paper.shadowPCID);
            if (isNaN(shadowPaperId)) {
                console.error(`  ❌ ERROR: Invalid Shadow PC paper ID: ${paper.shadowPCID}`);
                results.failed++;
                results.errors.push({
                    mainPCID: paper.mainPCID,
                    shadowPCID: paper.shadowPCID,
                    title: paper.title,
                    error: `Invalid Shadow PC paper ID: ${paper.shadowPCID}`
                });
                continue;
            }
            
            try {
                await postCommentToPaper(shadowPaperId, commentText);
                console.log(`  ✅ Successfully posted to Shadow PC paper ${shadowPaperId}`);
                results.successful++;
            } catch (error) {
                console.error(`  ❌ ERROR posting comment:`, error);
                results.failed++;
                results.errors.push({
                    mainPCID: paper.mainPCID,
                    shadowPCID: paper.shadowPCID,
                    title: paper.title,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        } else {
            // Just print preview for first paper only in test mode
            if (i === 0) {
                console.log('\n=== FORMATTED COMMENT PREVIEW (first paper only) ===\n');
                console.log(commentText);
                console.log('\n=== END OF PREVIEW ===\n');
            }
            console.log(`  📝 Would post to Shadow PC paper ${paper.shadowPCID} (test mode)`);
            results.successful++;
        }
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total papers: ${results.total}`);
    console.log(`Successful: ${results.successful}`);
    console.log(`Failed: ${results.failed}`);
    
    if (results.errors.length > 0) {
        console.log('\nErrors:');
        results.errors.forEach((err, idx) => {
            console.log(`\n${idx + 1}. Main PC ${err.mainPCID} / Shadow PC ${err.shadowPCID}`);
            console.log(`   Title: ${err.title}`);
            console.log(`   Error: ${err.error}`);
        });
    }
    
    if (!shouldPost) {
        console.log('\n💡 This was a test run. To actually post to HotCRP, run with --post flag');
    }
    
    // Exit with error code if any failed
    if (results.failed > 0) {
        process.exit(1);
    }
}

// Run the script
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

