import { OpenAPI, SubmissionsService, UsersService, ReviewPreferencesService } from "./generated";
import { rateLimitedApiCall } from "./rateLimiter";
import dotenv from "dotenv";
import * as fs from "fs";

dotenv.config({path: '.env'});

// Configure OpenAPI with environment variables from main.ts
OpenAPI.BASE = process.env.HOTCRP_API_URL || 'https://demo.hotcrp.com/api';
OpenAPI.TOKEN = process.env.HOTCRP_API_TOKEN;

interface PCMember {
    email: string;
    name: string;
    userId?: number;
}

interface Paper {
    pid: number;
    title: string;
}

interface ReviewPreference {
    pid: number;
    userId: string;
    email: string;
    name: string;
    pref: number;
    prefexp?: string;
}

interface BiddingData {
    papers: Paper[];
    pcMembers: PCMember[];
    preferences: ReviewPreference[];
}

async function fetchPCMembers(): Promise<PCMember[]> {
    try {
        console.log('Fetching PC members...');
        const response = await rateLimitedApiCall(() => UsersService.getPc());
        
        if ('pc' in response && response.pc) {
            const pcMembers: PCMember[] = response.pc.map((member: any) => ({
                email: member.email || '',
                name: member.name || `${member.given_name || ''} ${member.family_name || ''}`.trim(),
                userId: member.contactId || member.uid || member.id
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

async function fetchReviewPreferences(papers: Paper[], pcMembers: PCMember[]): Promise<ReviewPreference[]> {
    const preferences: ReviewPreference[] = [];
    const totalRequests = papers.length * pcMembers.length;
    let completedRequests = 0;
    
    console.log(`Fetching review preferences for ${papers.length} papers and ${pcMembers.length} PC members (${totalRequests} total requests)...`);
    
    for (const paper of papers) {
        for (const member of pcMembers) {
            try {
                // Use email as the user identifier if userId is not available
                const userIdentifier = member.userId || member.email;
                const response = await rateLimitedApiCall(() => ReviewPreferencesService.getRevpref(paper.pid, userIdentifier));
                
                if ('pref' in response && response.pref !== undefined) {
                    preferences.push({
                        pid: paper.pid,
                        userId: userIdentifier.toString(),
                        email: member.email,
                        name: member.name,
                        pref: response.pref,
                        prefexp: response.prefexp
                    });
                }
                
                completedRequests++;
                if (completedRequests % 100 === 0) {
                    console.log(`Progress: ${completedRequests}/${totalRequests} requests completed`);
                }
                
                // Rate limiting is handled by rateLimitedApiCall, no need for manual delay
                
            } catch (error) {
                // Silently continue - many combinations may not have preferences set
                completedRequests++;
            }
        }
    }
    
    console.log(`Collected ${preferences.length} review preferences`);
    return preferences;
}

function generateWideCSV(data: BiddingData): string {
    const { papers, preferences } = data;
    
    // Group preferences by paper
    const preferencesByPaper = new Map<number, ReviewPreference[]>();
    preferences.forEach(pref => {
        if (!preferencesByPaper.has(pref.pid)) {
            preferencesByPaper.set(pref.pid, []);
        }
        preferencesByPaper.get(pref.pid)!.push(pref);
    });
    
    // Find maximum number of bidders for any paper to determine column count
    let maxBidders = 0;
    preferencesByPaper.forEach(prefs => {
        maxBidders = Math.max(maxBidders, prefs.length);
    });
    
    // Generate header
    const headers = ['paper_id', 'paper_title'];
    for (let i = 1; i <= maxBidders; i++) {
        headers.push(`bidder_${i}_name`, `bidder_${i}_email`, `bidder_${i}_preference`);
    }
    
    // Generate rows
    const rows: string[] = [headers.join(',')];
    
    papers.forEach(paper => {
        const paperPrefs = preferencesByPaper.get(paper.pid) || [];
        // Sort by preference value (descending) to put most interested bidders first
        paperPrefs.sort((a, b) => b.pref - a.pref);
        
        const row = [
            paper.pid.toString(),
            `"${paper.title.replace(/"/g, '""')}"` // Escape quotes in CSV
        ];
        
        // Add bidder data
        for (let i = 0; i < maxBidders; i++) {
            if (i < paperPrefs.length) {
                const pref = paperPrefs[i];
                row.push(
                    `"${pref.name.replace(/"/g, '""')}"`,
                    pref.email,
                    pref.pref.toString()
                );
            } else {
                row.push('', '', '');
            }
        }
        
        rows.push(row.join(','));
    });
    
    return rows.join('\n');
}

function generateSummaryCSV(data: BiddingData): string {
    const { pcMembers, preferences } = data;
    
    // Group preferences by user
    const preferencesByUser = new Map<string, ReviewPreference[]>();
    preferences.forEach(pref => {
        if (!preferencesByUser.has(pref.email)) {
            preferencesByUser.set(pref.email, []);
        }
        preferencesByUser.get(pref.email)!.push(pref);
    });
    
    // Generate header
    const headers = ['name', 'email', 'total_preferences', 'positive_preferences'];
    const rows: string[] = [headers.join(',')];
    
    // Generate rows for each PC member
    pcMembers.forEach(member => {
        const userPrefs = preferencesByUser.get(member.email) || [];
        const totalPrefs = userPrefs.length;
        const positivePrefs = userPrefs.filter(pref => pref.pref > 0).length;
        
        const row = [
            `"${member.name.replace(/"/g, '""')}"`,
            member.email,
            totalPrefs.toString(),
            positivePrefs.toString()
        ];
        
        rows.push(row.join(','));
    });
    
    return rows.join('\n');
}

async function main() {
    try {
        console.log('=== HotCRP Bidding Data Export ===\n');
        
        // Fetch all required data
        console.log('Phase 1: Fetching basic data...');
        const [papers, pcMembers] = await Promise.all([
            fetchAllPapers(),
            fetchPCMembers()
        ]);
        
        if (papers.length === 0) {
            console.error('No papers found. Aborting.');
            return;
        }
        
        if (pcMembers.length === 0) {
            console.error('No PC members found. Aborting.');
            return;
        }
        
        console.log('\nPhase 2: Fetching review preferences...');
        const preferences = await fetchReviewPreferences(papers, pcMembers);
        
        const biddingData: BiddingData = {
            papers,
            pcMembers,
            preferences
        };
        
        console.log('\nPhase 3: Generating CSV files...');
        
        // Generate wide CSV
        const wideCSV = generateWideCSV(biddingData);
        const wideFilename = `bidding_wide_${new Date().toISOString().split('T')[0]}.csv`;
        fs.writeFileSync(wideFilename, wideCSV);
        console.log(`✓ Wide CSV saved to: ${wideFilename}`);
        
        // Generate summary CSV
        const summaryCSV = generateSummaryCSV(biddingData);
        const summaryFilename = `bidding_summary_${new Date().toISOString().split('T')[0]}.csv`;
        fs.writeFileSync(summaryFilename, summaryCSV);
        console.log(`✓ Summary CSV saved to: ${summaryFilename}`);
        
        console.log('\n=== Export Complete ===');
        console.log(`Papers processed: ${papers.length}`);
        console.log(`PC members processed: ${pcMembers.length}`);
        console.log(`Total preferences found: ${preferences.length}`);
        console.log(`Files generated: ${wideFilename}, ${summaryFilename}`);
        
    } catch (error) {
        console.error('Error in main process:', error);
    }
}

// Run the script
main().catch(console.error);
