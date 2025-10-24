import { OpenAPI, SubmissionsService } from "./generated";
import { HotCRPJSONPaper } from "./types";
import { rateLimitedApiCall } from "./rateLimiter";
import dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import * as archiver from "archiver";

dotenv.config({path: '.env'});

OpenAPI.BASE = process.env.HOTCRP_API_URL || 'https://demo.hotcrp.com/api';
OpenAPI.TOKEN = process.env.HOTCRP_API_TOKEN;

interface ValidationResult {
    paper: HotCRPJSONPaper;
    paperFilePath: string | null;
    isValid: boolean;
    errors: string[];
    alreadyExists: boolean;
}

interface ExistingPaper {
    pid: number;
    title: string;
}

async function fetchExistingPapers(): Promise<ExistingPaper[]> {
    try {
        console.log('Fetching existing papers from HotCRP...');
        
        // Fetch all papers using the search API
        const response = await rateLimitedApiCall(() => SubmissionsService.getPapers('all'));
        
        if ('papers' in response && response.papers) {
            const existingPapers: ExistingPaper[] = response.papers.map((paper: any) => ({
                pid: paper.pid || 0,
                title: paper.title || ''
            }));
            
            console.log(`Found ${existingPapers.length} existing papers in HotCRP`);
            return existingPapers;
        }
        
        console.log('No existing papers found or error in response');
        return [];
    } catch (error) {
        console.warn('Warning: Could not fetch existing papers:', error);
        return [];
    }
}

async function processSubmissions() {
    try {
        // Read the JSON data file
        console.log('Reading icse2026-data.json...');
        const jsonData = fs.readFileSync('icse2026-data.json', 'utf8');
        const papers: HotCRPJSONPaper[] = JSON.parse(jsonData);
        
        console.log(`Found ${papers.length} submissions to validate and process\n`);
        
        // Fetch existing papers first
        const existingPapersFromAPI = await fetchExistingPapers();
        console.log('');
        
        // Phase 1: Validate all papers
        console.log('=== Phase 1: Validating all papers ===');
        const validationResults = await validateAllPapers(papers, existingPapersFromAPI);
        
        const validPapers = validationResults.filter(result => result.isValid && !result.alreadyExists);
        const invalidPapers = validationResults.filter(result => !result.isValid);
        const alreadyExistingPapers = validationResults.filter(result => result.alreadyExists);
        
        console.log(`\n=== Validation Summary ===`);
        console.log(`✓ Valid papers (new): ${validPapers.length}`);
        console.log(`📋 Papers already exist: ${alreadyExistingPapers.length}`);
        console.log(`✗ Invalid papers: ${invalidPapers.length}`);
        console.log(`Total papers: ${papers.length}`);
        
        if (alreadyExistingPapers.length > 0) {
            console.log('\nPapers that already exist (will be skipped):');
            alreadyExistingPapers.forEach(result => {
                console.log(`  PID ${result.paper.pid}: ${result.paper.title}`);
            });
        }
        
        if (invalidPapers.length > 0) {
            console.log('\nInvalid papers:');
            invalidPapers.forEach(result => {
                console.log(`  PID ${result.paper.pid}: ${result.errors.join(', ')}`);
            });
        }
        
        if (validPapers.length === 0) {
            console.log('\n❌ No valid papers found. Aborting.');
            return;
        }
        
        // Ask for confirmation (in a real scenario, you might want user input)
        console.log(`\n=== Phase 2: Processing ${validPapers.length} valid papers ===`);
        
        // Process only valid papers
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < validPapers.length; i++) {
            const validationResult = validPapers[i];
            const paper = validationResult.paper;
            
            let zipFilePath: string | null = null;
            try {
                console.log(`Processing ${i + 1}/${validPapers.length} - PID ${paper.pid}: ${paper.title}`);
                
                // Create ZIP file with data.json and PDF
                zipFilePath = await createSubmissionZip(paper, validationResult.paperFilePath!);
                
                // Submit to HotCRP with ZIP file as multipart/form-data and notifications disabled
                const response = await submitPaperWithZip(zipFilePath, {
                    dryRun: false,
                    disableUsers: false,
                    addTopics: true,
                    notify: false, // DISABLED
                    notifyAuthors: false, // DISABLED
                    reason: 'Automated import from icse2026-data.json'
                });
                console.log(`✓ Successfully processed submission ${paper.pid}`);
                successCount++;
                
                // Rate limiting is handled by rateLimitedApiCall, no need for manual delay
                
            } catch (error) {
                console.error(`✗ Error processing submission ${paper.pid}:`, error);
                errorCount++;
            } finally {
                // Always clean up temporary ZIP file
                if (zipFilePath && fs.existsSync(zipFilePath)) {
                    try {
                        fs.unlinkSync(zipFilePath);
                    } catch (cleanupError) {
                        console.warn(`Warning: Could not delete temp file ${zipFilePath}:`, cleanupError);
                    }
                }
                // return;
            }
        }
        
        console.log('\n=== Final Processing Summary ===');
        console.log(`Successfully processed: ${successCount} submissions`);
        console.log(`Failed during processing: ${errorCount} submissions`);
        console.log(`Skipped (already exist): ${alreadyExistingPapers.length} submissions`);
        console.log(`Skipped (validation failed): ${invalidPapers.length} submissions`);
        console.log(`Total submissions: ${papers.length}`);
        
        // Clean up temp directory
        const tempDir = 'temp-zips';
        if (fs.existsSync(tempDir)) {
            const remainingFiles = fs.readdirSync(tempDir);
            if (remainingFiles.length > 0) {
                console.log(`\nCleaning up ${remainingFiles.length} remaining temp files...`);
                remainingFiles.forEach(file => {
                    fs.unlinkSync(path.join(tempDir, file));
                });
            }
            fs.rmdirSync(tempDir);
        }
        
    } catch (error) {
        console.error('Error reading or parsing icse2026-data.json:', error);
    }
}

async function validateAllPapers(papers: HotCRPJSONPaper[], existingPapers: ExistingPaper[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    // Create a set of existing titles for faster lookup (normalize for comparison)
    const existingTitles = new Set(existingPapers.map(p => normalizeTitle(p.title)));
    
    for (let i = 0; i < papers.length; i++) {
        const paper = papers[i];
        const errors: string[] = [];
        
        console.log(`Validating ${i + 1}/${papers.length} - PID ${paper.pid}`);
        
        // Check if paper already exists (by title comparison)
        const normalizedTitle = normalizeTitle(paper.title);
        const alreadyExists = existingTitles.has(normalizedTitle);
        
        if (alreadyExists) {
            console.log(`  → Already exists: ${paper.title}`);
        } else {
            // Only validate if it doesn't already exist
            
            // Validate required fields
            if (!paper.title || paper.title.trim() === '') {
                errors.push('Missing or empty title');
            }
            
            if (!paper.abstract || paper.abstract.trim() === '') {
                errors.push('Missing or empty abstract');
            }
            
            if (!paper.authors || paper.authors.length === 0) {
                errors.push('No authors specified');
            }
            
            // Find paper file using the correct naming pattern
            const paperFilePath = findPaperFile(paper);
            if (!paperFilePath) {
                errors.push(`Paper file not found (expected: icse2026-paper${paper.pid}.pdf)`);
            }
        }
        
        results.push({
            paper,
            paperFilePath: alreadyExists ? null : findPaperFile(paper),
            isValid: errors.length === 0,
            errors,
            alreadyExists
        });
    }
    
    return results;
}

function normalizeTitle(title: string): string {
    // Normalize title for comparison: lowercase, remove extra spaces, trim
    return title.toLowerCase().replace(/\s+/g, ' ').trim();
}

function findPaperFile(paper: HotCRPJSONPaper): string | null {
    const papersDir = 'icse2026-papers';
    
    if (!fs.existsSync(papersDir)) {
        return null;
    }
    
    // Use the correct naming pattern: icse2026-paper<id>.pdf
    const filename = `icse2026-paper${paper.pid}.pdf`;
    const filepath = path.join(papersDir, filename);
    
    if (fs.existsSync(filepath)) {
        return filepath;
    }
    
    return null;
}

async function createSubmissionZip(paper: HotCRPJSONPaper, paperFilePath: string): Promise<string> {
    const tempDir = 'temp-zips';
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }
    
    const zipFilePath = path.join(tempDir, `submission-${paper.pid}-${Date.now()}.zip`);
    const pdfFileName = `paper.pdf`;
    
    // Create the data.json payload
    const dataJson: any = {
        object: "paper",
        pid: "new", // Let HotCRP assign new ID
        title: paper.title,
        abstract: paper.abstract,
        authors: paper.authors.map(author => ({
            name: `${author.first} ${author.last}`,
            email: author.email,
            affiliation: author.affiliation,
            contact: author.contact
        })),
        topics: paper.topics,
        submission: { content_file: pdfFileName }, // Reference to PDF file in ZIP
        status: "submitted"
    };
    
    // Add other fields if they exist
    if (paper.primary_area) dataJson.primary_area = paper.primary_area;
    if (paper.secondary_area) dataJson.secondary_area = paper.secondary_area;
    if (paper.information_about_artifact_availability) {
        dataJson.information_about_artifact_availability = paper.information_about_artifact_availability;
    }
    
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver.create('zip', { zlib: { level: 9 } });
        
        output.on('close', () => {
            console.log(`  - Created ZIP file: ${path.basename(zipFilePath)} (${archive.pointer()} bytes)`);
            resolve(zipFilePath);
        });
        
        archive.on('error', (err: Error) => {
            reject(err);
        });
        
        archive.pipe(output);
        
        // Add data.json to ZIP
        archive.append(JSON.stringify(dataJson, null, 2), { name: 'data.json' });
        
        // Add PDF file to ZIP
        archive.file(paperFilePath, { name: pdfFileName });
        
        archive.finalize();
    });
}

interface SubmissionOptions {
    dryRun?: boolean;
    disableUsers?: boolean;
    addTopics?: boolean;
    notify?: boolean;
    notifyAuthors?: boolean;
    reason?: string;
}

async function submitPaperWithZip(zipFilePath: string, options: SubmissionOptions): Promise<any> {
    const fileContent = fs.readFileSync(zipFilePath);
    const fileSize = fileContent.length;
    
    console.log(`  - Submitting ZIP file (${fileSize} bytes) as zip file...`);

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (options.dryRun !== undefined) queryParams.set('dry_run', options.dryRun.toString());
    if (options.disableUsers !== undefined) queryParams.set('disable_users', options.disableUsers.toString());
    if (options.addTopics !== undefined) queryParams.set('add_topics', options.addTopics.toString());
    if (options.notify !== undefined) queryParams.set('notify', options.notify.toString());
    if (options.notifyAuthors !== undefined) queryParams.set('notify_authors', options.notifyAuthors.toString());
    if (options.reason) queryParams.set('reason', options.reason);
    
    // Build the full URL
    const baseUrl = OpenAPI.BASE;
    const url = `${baseUrl}/paper?${queryParams.toString()}`;
    console.log(url);
    
    // Create headers
    const headers: Record<string, string> = {};
    if (OpenAPI.TOKEN) {
        headers['Authorization'] = `Bearer ${OpenAPI.TOKEN}`;
    }
    headers['Content-Type'] = 'application/zip';
    
    // Make the request with rate limiting
    const response = await rateLimitedApiCall(() => fetch(url, {
        method: 'POST',
        headers: headers,
        body: fileContent
    }));
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`  - Submission complete`);
    return result;
}

// Run the main function
processSubmissions().catch(console.error);   