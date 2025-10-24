import { OpenAPI, ReviewPreferencesService, UsersService } from "./generated";
import { rateLimitedApiCall } from "./rateLimiter";
import dotenv from "dotenv";

dotenv.config({path: '.env'});

// Configure OpenAPI with environment variables
OpenAPI.BASE = process.env.HOTCRP_API_URL || 'https://demo.hotcrp.com/api';
OpenAPI.TOKEN = process.env.HOTCRP_API_TOKEN;

async function testPreferencesForPaper20() {
    console.log('=== Testing Review Preferences for Paper 20 ===\n');
    
    try {
        console.log('1. Fetching preferences for paper 20 (no user specified)...');
        const response = await rateLimitedApiCall(() => ReviewPreferencesService.getRevpref(20, "*"));
        
        console.log('\n--- Raw Response ---');
        console.log(JSON.stringify(response, null, 2));
        
        console.log('\n--- Response Analysis ---');
        console.log('Response type:', typeof response);
        console.log('Response keys:', Object.keys(response));
        
        if ('value' in response) {
            console.log('Has "value" property:', typeof response.value);
            if (response.value) {
                console.log('Value keys:', Object.keys(response.value));
                console.log('Value content:', JSON.stringify(response.value, null, 2));
            }
        }
        
        if ('pref' in response) {
            console.log('Has "pref" property:', typeof response.pref);
            console.log('Pref content:', JSON.stringify(response.pref, null, 2));
        }
        
        if ('prefexp' in response) {
            console.log('Has "prefexp" property:', typeof response.prefexp);
            console.log('Prefexp content:', JSON.stringify(response.prefexp, null, 2));
        }
        
        if ('topic_score' in response) {
            console.log('Has "topic_score" property:', typeof response.topic_score);
            console.log('Topic score content:', JSON.stringify(response.topic_score, null, 2));
        }
        
    } catch (error) {
        console.error('Error fetching preferences for paper 20:', error);
    }
    
    console.log('\n=== Testing with specific user ===\n');
    
    try {
        // First get PC members to find a valid user ID
        console.log('2. Fetching PC members to get a valid user ID...');
        const pcResponse = await rateLimitedApiCall(() => UsersService.getPc());
        
        if ('pc' in pcResponse && pcResponse.pc && pcResponse.pc.length > 0) {
            const firstPCMember = pcResponse.pc[0];
            console.log('First PC member:', JSON.stringify(firstPCMember, null, 2));
            
            // Try with the first PC member
            const userIdentifier = firstPCMember.contactId || firstPCMember.uid || firstPCMember.id || firstPCMember.email;
            console.log(`\n3. Fetching preferences for paper 20 with user: ${userIdentifier}...`);
            
            const userResponse = await rateLimitedApiCall(() => ReviewPreferencesService.getRevpref(20, userIdentifier));
            
            console.log('\n--- User-Specific Response ---');
            console.log(JSON.stringify(userResponse, null, 2));
            
        } else {
            console.log('No PC members found in response');
        }
        
    } catch (error) {
        console.error('Error fetching user-specific preferences:', error);
    }
}

// Run the test
testPreferencesForPaper20().catch(console.error);
