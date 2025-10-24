import * as fs from "fs";

interface AuthorStats {
    author_name: string;
    author_email: string;
    total_comments: number;
    total_mentions: number;
    papers_with_comments: number;
    papers_with_mentions: number;
}

interface AuthorAnalyticsRow {
    paper_id: number;
    paper_title: string;
    author_name: string;
    author_email: string;
    mentions_count: number;
    comments_count: number;
    mentioned_as_names: string;
}

function parseCSV(filename: string): AuthorAnalyticsRow[] {
    try {
        const content = fs.readFileSync(filename, 'utf8');
        const lines = content.trim().split('\n');
        
        if (lines.length < 2) {
            throw new Error('CSV file must have at least a header and one data row');
        }
        
        const header = lines[0];
        const expectedHeaders = ['paper_id', 'paper_title', 'author_name', 'author_email', 'mentions_count', 'comments_count', 'mentioned_as_names'];
        
        // Basic header validation
        if (!expectedHeaders.every(h => header.includes(h))) {
            console.warn('Warning: CSV headers may not match expected format');
        }
        
        const rows: AuthorAnalyticsRow[] = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Parse CSV line (handling quoted fields)
            const fields = parseCSVLine(line);
            
            if (fields.length >= 6) {
                rows.push({
                    paper_id: parseInt(fields[0]) || 0,
                    paper_title: fields[1],
                    author_name: fields[2],
                    author_email: fields[3],
                    mentions_count: parseInt(fields[4]) || 0,
                    comments_count: parseInt(fields[5]) || 0,
                    mentioned_as_names: fields[6] || ''
                });
            }
        }
        
        return rows;
    } catch (error) {
        console.error(`Error reading CSV file ${filename}:`, error);
        process.exit(1);
    }
}

function parseCSVLine(line: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
        const char = line[i];
        
        if (char === '"') {
            if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                // Escaped quote
                current += '"';
                i += 2;
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
                i++;
            }
        } else if (char === ',' && !inQuotes) {
            // Field separator
            fields.push(current);
            current = '';
            i++;
        } else {
            current += char;
            i++;
        }
    }
    
    // Add the last field
    fields.push(current);
    
    return fields;
}

function aggregateAuthorStats(rows: AuthorAnalyticsRow[]): AuthorStats[] {
    const authorMap = new Map<string, AuthorStats>();
    
    rows.forEach(row => {
        const email = row.author_email;
        
        if (!authorMap.has(email)) {
            authorMap.set(email, {
                author_name: row.author_name,
                author_email: email,
                total_comments: 0,
                total_mentions: 0,
                papers_with_comments: 0,
                papers_with_mentions: 0
            });
        }
        
        const stats = authorMap.get(email)!;
        stats.total_comments += row.comments_count;
        stats.total_mentions += row.mentions_count;
        
        if (row.comments_count > 0) {
            stats.papers_with_comments++;
        }
        
        if (row.mentions_count > 0) {
            stats.papers_with_mentions++;
        }
    });
    
    return Array.from(authorMap.values()).sort((a, b) => a.author_name.localeCompare(b.author_name));
}

function filterAuthors(authors: AuthorStats[], maxComments: number, minMentions: number): AuthorStats[] {
    return authors.filter(author => 
        author.total_comments < maxComments && author.total_mentions > minMentions
    );
}

function printTable(authors: AuthorStats[], maxComments: number, minMentions: number) {
    if (authors.length === 0) {
        console.log(`\n📊 No PC members found with < ${maxComments} comments and > ${minMentions} mentions\n`);
        return;
    }
    
    console.log(`\n📊 PC Members with < ${maxComments} comments and > ${minMentions} mentions:\n`);
    
    // Calculate column widths
    const nameWidth = Math.max(15, Math.max(...authors.map(a => a.author_name.length)) + 2);
    const emailWidth = Math.max(20, Math.max(...authors.map(a => a.author_email.length)) + 2);
    const commentsWidth = 10;
    const mentionsWidth = 10;
    const papersCommentsWidth = 15;
    const papersMentionsWidth = 15;
    
    // Print header
    const headerSeparator = '─'.repeat(nameWidth + emailWidth + commentsWidth + mentionsWidth + papersCommentsWidth + papersMentionsWidth + 17);
    
    console.log('┌' + headerSeparator + '┐');
    console.log('│' + 
        ' Name'.padEnd(nameWidth) + '│' +
        ' Email'.padEnd(emailWidth) + '│' +
        ' Comments'.padEnd(commentsWidth) + '│' +
        ' Mentions'.padEnd(mentionsWidth) + '│' +
        ' Papers w/Comm'.padEnd(papersCommentsWidth) + '│' +
        ' Papers w/Ment'.padEnd(papersMentionsWidth) + '│'
    );
    console.log('├' + headerSeparator + '┤');
    
    // Print rows
    authors.forEach((author, index) => {
        const name = author.author_name.length > nameWidth - 2 ? 
            author.author_name.substring(0, nameWidth - 5) + '...' : 
            author.author_name;
        
        const email = author.author_email.length > emailWidth - 2 ? 
            author.author_email.substring(0, emailWidth - 5) + '...' : 
            author.author_email;
        
        console.log('│' + 
            ` ${name}`.padEnd(nameWidth) + '│' +
            ` ${email}`.padEnd(emailWidth) + '│' +
            ` ${author.total_comments}`.padEnd(commentsWidth) + '│' +
            ` ${author.total_mentions}`.padEnd(mentionsWidth) + '│' +
            ` ${author.papers_with_comments}`.padEnd(papersCommentsWidth) + '│' +
            ` ${author.papers_with_mentions}`.padEnd(papersMentionsWidth) + '│'
        );
        
        // Add separator between rows (except for last row)
        if (index < authors.length - 1) {
            console.log('├' + headerSeparator + '┤');
        }
    });
    
    console.log('└' + headerSeparator + '┘');
    
    // Summary statistics
    console.log(`\n📈 Summary:`);
    console.log(`   • Found ${authors.length} PC members matching criteria`);
    console.log(`   • Average comments per person: ${(authors.reduce((sum, a) => sum + a.total_comments, 0) / authors.length).toFixed(1)}`);
    console.log(`   • Average mentions per person: ${(authors.reduce((sum, a) => sum + a.total_mentions, 0) / authors.length).toFixed(1)}`);
    console.log(`   • Total comments by this group: ${authors.reduce((sum, a) => sum + a.total_comments, 0)}`);
    console.log(`   • Total mentions of this group: ${authors.reduce((sum, a) => sum + a.total_mentions, 0)}`);
    
    // Highlight most mentioned with few comments
    const sortedByRatio = [...authors].sort((a, b) => {
        const ratioA = a.total_mentions / Math.max(1, a.total_comments);
        const ratioB = b.total_mentions / Math.max(1, b.total_comments);
        return ratioB - ratioA;
    });
    
    if (sortedByRatio.length > 0) {
        const top = sortedByRatio[0];
        const ratio = top.total_mentions / Math.max(1, top.total_comments);
        console.log(`\n🎯 Highest mention-to-comment ratio: ${top.author_name} (${ratio.toFixed(1)}:1)`);
    }
    
    console.log('');
}

function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
        console.error('Usage: tsx src/filterAuthors.ts <author_analytics.csv> <max_comments> <min_mentions>');
        console.error('');
        console.error('Example: tsx src/filterAuthors.ts author_analytics_2025-10-22.csv 5 3');
        console.error('  (Find PC members with < 5 comments and > 3 mentions)');
        process.exit(1);
    }
    
    const filename = args[0];
    const maxComments = parseInt(args[1]);
    const minMentions = parseInt(args[2]);
    
    if (isNaN(maxComments) || isNaN(minMentions)) {
        console.error('Error: max_comments and min_mentions must be valid numbers');
        process.exit(1);
    }
    
    if (maxComments < 0 || minMentions < 0) {
        console.error('Error: max_comments and min_mentions must be non-negative');
        process.exit(1);
    }
    
    console.log(`🔍 Analyzing author data from: ${filename}`);
    console.log(`📋 Criteria: < ${maxComments} comments AND > ${minMentions} mentions`);
    
    // Load and parse data
    const rows = parseCSV(filename);
    console.log(`📊 Loaded ${rows.length} author-paper combinations`);
    
    // Aggregate by author
    const authorStats = aggregateAuthorStats(rows);
    console.log(`👥 Found ${authorStats.length} unique authors`);
    
    // Filter by criteria
    const filteredAuthors = filterAuthors(authorStats, maxComments, minMentions);
    
    // Print results
    printTable(filteredAuthors, maxComments, minMentions);
}

// Run the script
main();
