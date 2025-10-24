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
}

interface AuthorAnalytics {
    paper_id: number;
    paper_title: string;
    author_name: string;
    author_email: string;
    mentions_count: number;
    comments_count: number;
    mentioned_as_names: string[]; // Track what names/pseudonyms they were mentioned as
}

interface PaperWithMultipleAuthorComments {
    paper_id: number;
    paper_title: string;
    author_visible_comments_count: number;
    comment_ids: number[];
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

function isAuthorVisible(visibility?: string): boolean {
    // Comments visible to authors: 'au' (author-only) or no visibility restriction
    return visibility === 'au' || !visibility;
}

function findPapersWithMultipleAuthorComments(comments: CommentData[]): PaperWithMultipleAuthorComments[] {
    const paperComments = new Map<number, { title: string; comments: CommentData[] }>();
    
    // Group comments by paper
    comments.forEach(comment => {
        if (isAuthorVisible(comment.visibility)) {
            if (!paperComments.has(comment.paper_id)) {
                paperComments.set(comment.paper_id, {
                    title: comment.paper_title,
                    comments: []
                });
            }
            paperComments.get(comment.paper_id)!.comments.push(comment);
        }
    });
    
    // Find papers with more than one author-visible comment
    const results: PaperWithMultipleAuthorComments[] = [];
    paperComments.forEach((data, paperId) => {
        if (data.comments.length > 1) {
            results.push({
                paper_id: paperId,
                paper_title: data.title,
                author_visible_comments_count: data.comments.length,
                comment_ids: data.comments.map(c => c.comment_id)
            });
        }
    });
    
    return results.sort((a, b) => b.author_visible_comments_count - a.author_visible_comments_count);
}

function extractMentions(text: string): string[] {
    if (!text) return [];
    
    const mentions: string[] = [];
    
    // Match @mentions followed by any text until punctuation or end
    // This captures patterns like "@Jonathan Bell Hi" or "@Reviewer A can you"
    const mentionRegex = /@([A-Za-z][A-Za-z0-9\s\-\.]*?)(?=\s+[a-z]|\s*[,\.!?;:]|$)/g;
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
        const mention = match[1].trim();
        if (mention.length > 1) { // Avoid single character matches
            mentions.push(mention);
        }
    }
    
    return mentions;
}

function findBestAuthorMatch(mention: string, knownAuthors: Map<string, { name: string; email: string }>): { name: string; email: string } | null {
    const normalizedMention = mention.toLowerCase().trim();
    
    // First try exact match
    if (knownAuthors.has(normalizedMention)) {
        return knownAuthors.get(normalizedMention)!;
    }
    
    // Try partial matching - see if the mention is a prefix of any known author
    for (const [knownName, authorInfo] of knownAuthors) {
        if (knownName.startsWith(normalizedMention)) {
            return authorInfo;
        }
    }
    
    // Try word-based matching - see if all words in mention appear in order in any known author
    const mentionWords = normalizedMention.split(/\s+/);
    if (mentionWords.length > 1) {
        for (const [knownName, authorInfo] of knownAuthors) {
            const knownWords = knownName.split(/\s+/);
            let mentionWordIndex = 0;
            
            for (const knownWord of knownWords) {
                if (mentionWordIndex < mentionWords.length && 
                    knownWord.startsWith(mentionWords[mentionWordIndex])) {
                    mentionWordIndex++;
                }
            }
            
            // If we matched all words in the mention, this is likely a match
            if (mentionWordIndex === mentionWords.length) {
                return authorInfo;
            }
        }
    }
    
    return null;
}

function buildAuthorNameMap(
    comments: CommentData[], 
    pcMembers?: ReviewerInfo[]
): Map<string, { name: string; email: string }> {
    const authorMap = new Map<string, { name: string; email: string }>();
    const mentionedNames = new Map<string, string>(); // normalized -> original case
    
    // First pass: collect all authors who have made comments
    comments.forEach(comment => {
        if (comment.author && comment.author_email) {
            // Add real name
            const normalizedName = comment.author.toLowerCase().trim();
            authorMap.set(normalizedName, {
                name: comment.author,
                email: comment.author_email
            });
            
            // Add pseudonym if it exists and is different
            if (comment.author_pseudonym && comment.author_pseudonym !== comment.author) {
                const normalizedPseudonym = comment.author_pseudonym.toLowerCase().trim();
                authorMap.set(normalizedPseudonym, {
                    name: comment.author, // Keep real name as canonical
                    email: comment.author_email
                });
            }
        }
    });
    
    // Add all PC members (potential reviewers)
    if (pcMembers) {
        pcMembers.forEach(member => {
            if (member.name && member.email) {
                const normalizedName = member.name.toLowerCase().trim();
                // Only add if not already present (commenters take precedence)
                if (!authorMap.has(normalizedName)) {
                    authorMap.set(normalizedName, {
                        name: member.name,
                        email: member.email
                    });
                }
                
                // Add pseudonym if it exists and is different
                if (member.pseudonym && member.pseudonym !== member.name) {
                    const normalizedPseudonym = member.pseudonym.toLowerCase().trim();
                    if (!authorMap.has(normalizedPseudonym)) {
                        authorMap.set(normalizedPseudonym, {
                            name: member.name, // Keep real name as canonical
                            email: member.email
                        });
                    }
                }
            }
        });
    }
    
    // Second pass: collect all mentioned names from comment text
    comments.forEach(comment => {
        if (comment.text) {
            const mentions = extractMentions(comment.text);
            mentions.forEach(mention => {
                const normalizedMention = mention.toLowerCase().trim();
                // Keep the first occurrence of each mention (preserves original case)
                if (!mentionedNames.has(normalizedMention)) {
                    mentionedNames.set(normalizedMention, mention);
                }
            });
        }
    });
    
    // Third pass: for mentioned names not in authorMap, try intelligent matching or create synthetic entries
    mentionedNames.forEach((originalMention, normalizedMention) => {
        if (!authorMap.has(normalizedMention)) {
            // Try to find a matching known author
            const matchedAuthor = findBestAuthorMatch(originalMention, authorMap);
            
            if (matchedAuthor) {
                // Map this mention to the matched author
                authorMap.set(normalizedMention, matchedAuthor);
            } else {
                // Create a synthetic entry - we don't have their real email, so use a synthetic one
                authorMap.set(normalizedMention, {
                    name: originalMention, // Use the original case from the mention
                    email: `${normalizedMention.replace(/\s+/g, '.')}@mentioned.only` // Synthetic email to identify mentioned-only authors
                });
            }
        }
    });
    
    return authorMap;
}

function analyzeAuthorMentionsAndComments(
    comments: CommentData[], 
    pcMembers?: ReviewerInfo[]
): AuthorAnalytics[] {
    const authorMap = buildAuthorNameMap(comments, pcMembers);
    const analytics = new Map<string, Map<number, AuthorAnalytics>>();
    
    // Initialize analytics for all author-paper combinations from commenters
    const paperAuthors = new Map<number, Set<string>>();
    
    comments.forEach(comment => {
        if (comment.author && comment.author_email) {
            if (!paperAuthors.has(comment.paper_id)) {
                paperAuthors.set(comment.paper_id, new Set());
            }
            paperAuthors.get(comment.paper_id)!.add(comment.author_email);
        }
    });
    
    // Initialize analytics structure for commenters
    paperAuthors.forEach((authors, paperId) => {
        const paperTitle = comments.find(c => c.paper_id === paperId)?.paper_title || '';
        authors.forEach(authorEmail => {
            const authorName = comments.find(c => c.author_email === authorEmail)?.author || '';
            
            if (!analytics.has(authorEmail)) {
                analytics.set(authorEmail, new Map());
            }
            
            analytics.get(authorEmail)!.set(paperId, {
                paper_id: paperId,
                paper_title: paperTitle,
                author_name: authorName,
                author_email: authorEmail,
                mentions_count: 0,
                comments_count: 0,
                mentioned_as_names: []
            });
        });
    });
    
    // Helper function to ensure an author-paper combination exists in analytics
    const ensureAuthorPaperExists = (authorEmail: string, authorName: string, paperId: number, paperTitle: string) => {
        if (!analytics.has(authorEmail)) {
            analytics.set(authorEmail, new Map());
        }
        
        if (!analytics.get(authorEmail)!.has(paperId)) {
            analytics.get(authorEmail)!.set(paperId, {
                paper_id: paperId,
                paper_title: paperTitle,
                author_name: authorName,
                author_email: authorEmail,
                mentions_count: 0,
                comments_count: 0,
                mentioned_as_names: []
            });
        }
    };
    
    // Process each comment
    comments.forEach(comment => {
        // Count comments by author
        if (comment.author_email && analytics.has(comment.author_email)) {
            const authorAnalytics = analytics.get(comment.author_email)!;
            if (authorAnalytics.has(comment.paper_id)) {
                authorAnalytics.get(comment.paper_id)!.comments_count++;
            }
        }
        
        // Count mentions in comment text
        if (comment.text) {
            const mentions = extractMentions(comment.text);
            
            mentions.forEach(mention => {
                const normalizedMention = mention.toLowerCase().trim();
                
                // Check if this mention matches any known author (by name or pseudonym)
                if (authorMap.has(normalizedMention)) {
                    const authorInfo = authorMap.get(normalizedMention)!;
                    
                    // Ensure this author-paper combination exists in analytics
                    // (this handles the case where someone is mentioned but never comments)
                    ensureAuthorPaperExists(
                        authorInfo.email, 
                        authorInfo.name, 
                        comment.paper_id, 
                        comment.paper_title
                    );
                    
                    const authorAnalytics = analytics.get(authorInfo.email)!;
                    const paperAnalytics = authorAnalytics.get(comment.paper_id)!;
                    paperAnalytics.mentions_count++;
                    
                    // Track what name/pseudonym they were mentioned as
                    if (!paperAnalytics.mentioned_as_names.includes(mention)) {
                        paperAnalytics.mentioned_as_names.push(mention);
                    }
                }
            });
        }
    });
    
    // Flatten to array
    const results: AuthorAnalytics[] = [];
    analytics.forEach(paperMap => {
        paperMap.forEach(analytics => {
            results.push(analytics);
        });
    });
    
    return results.sort((a, b) => {
        if (a.paper_id !== b.paper_id) return a.paper_id - b.paper_id;
        return a.author_name.localeCompare(b.author_name);
    });
}

function generateAnalyticsCSV(analytics: AuthorAnalytics[]): string {
    const headers = [
        'paper_id',
        'paper_title',
        'author_name',
        'author_email',
        'mentions_count',
        'comments_count',
        'mentioned_as_names'
    ];
    
    const rows = [headers.join(',')];
    
    analytics.forEach(item => {
        const row = [
            item.paper_id.toString(),
            `"${item.paper_title.replace(/"/g, '""')}"`,
            `"${item.author_name.replace(/"/g, '""')}"`,
            item.author_email,
            item.mentions_count.toString(),
            item.comments_count.toString(),
            `"${item.mentioned_as_names.join('; ').replace(/"/g, '""')}"`
        ];
        rows.push(row.join(','));
    });
    
    return rows.join('\n');
}

function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Usage: tsx src/analyzeComments.ts <comments_export_file.json>');
        process.exit(1);
    }
    
    const filename = args[0];
    console.log(`=== Analyzing Comments from ${filename} ===\n`);
    
    // Load data
    const data = loadCommentsData(filename);
    console.log(`Loaded ${data.comments.length} comments from ${data.export_info.total_papers} papers\n`);
    
    // Analysis 1: Papers with multiple author-visible comments
    console.log('=== Papers with Multiple Author-Visible Comments ===');
    const multiCommentPapers = findPapersWithMultipleAuthorComments(data.comments);
    
    console.log(`Found ${multiCommentPapers.length} papers with more than one author-visible comment:\n`);
    
    multiCommentPapers.forEach(paper => {
        console.log(`Paper ${paper.paper_id}: "${paper.paper_title}"`);
        console.log(`  - ${paper.author_visible_comments_count} author-visible comments`);
        console.log(`  - Comment IDs: ${paper.comment_ids.join(', ')}`);
        console.log('');
    });
    
        // Analysis 2: Author mentions and comments analytics
        console.log('=== Generating Author Analytics ===');
        const analytics = analyzeAuthorMentionsAndComments(data.comments, data.pc_members);
    
    // Generate CSV
    const csvContent = generateAnalyticsCSV(analytics);
    const csvFilename = `author_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    fs.writeFileSync(csvFilename, csvContent);
    
    console.log(`Generated CSV: ${csvFilename}`);
    console.log(`Total author-paper combinations: ${analytics.length}`);
    
    // Summary statistics
    const totalMentions = analytics.reduce((sum, item) => sum + item.mentions_count, 0);
    const totalComments = analytics.reduce((sum, item) => sum + item.comments_count, 0);
    const authorsWithMentions = analytics.filter(item => item.mentions_count > 0).length;
    const authorsWithComments = analytics.filter(item => item.comments_count > 0).length;
    
    console.log('\n=== Summary Statistics ===');
    console.log(`Total mentions found: ${totalMentions}`);
    console.log(`Total comments by authors: ${totalComments}`);
    console.log(`Author-paper pairs with mentions: ${authorsWithMentions}`);
    console.log(`Author-paper pairs with comments: ${authorsWithComments}`);
    
    // Top mentioned authors
    const topMentioned = analytics
        .filter(item => item.mentions_count > 0)
        .sort((a, b) => b.mentions_count - a.mentions_count)
        .slice(0, 10);
    
    if (topMentioned.length > 0) {
        console.log('\n=== Top 10 Most Mentioned Authors (by paper) ===');
        topMentioned.forEach((item, index) => {
            console.log(`${index + 1}. ${item.author_name} (Paper ${item.paper_id}): ${item.mentions_count} mentions`);
            if (item.mentioned_as_names.length > 0) {
                console.log(`   Mentioned as: ${item.mentioned_as_names.join(', ')}`);
            }
        });
    }
}

// Run the analysis
main();
