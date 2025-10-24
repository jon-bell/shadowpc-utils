# Comments Analytics Script

This script (`analyzeComments.ts`) performs analytics on the comments export data to provide insights into author engagement and mention patterns.

## Prerequisites

1. First run the comments export script to generate the data file:
   ```bash
   npm run getComments
   ```

2. This will create a file like `comments_export_YYYY-MM-DD.json`

## Usage

Run the analytics script with the comments export file:

```bash
npm run analyzeComments comments_export_2025-10-22.json
```

Or directly with tsx:

```bash
tsx src/analyzeComments.ts comments_export_2025-10-22.json
```

## Analytics Provided

### 1. Papers with Multiple Author-Visible Comments

**Console Output**: Lists all papers that have more than one comment visible to authors, including:
- Paper ID and title
- Number of author-visible comments
- Comment IDs

This helps identify papers with active discussion that authors can see.

### 2. Author Mentions and Comments Analytics

**CSV Output**: `author_analytics_YYYY-MM-DD.csv` with per-author per-paper data:

| Column | Description |
|--------|-------------|
| `paper_id` | Paper ID number |
| `paper_title` | Title of the paper |
| `author_name` | Author's real name |
| `author_email` | Author's email address |
| `mentions_count` | Number of times this author was mentioned with @ in comments for this paper |
| `comments_count` | Number of comments this author made on this paper |
| `mentioned_as_names` | List of names/pseudonyms used when mentioning this author |

## Key Features

### Smart Mention Detection
- **Regex Pattern**: `/@([A-Za-z][A-Za-z0-9\s\-\.]+?)(?=\s|$|[,\.!?;:])/g`
- **Handles Both Names and Pseudonyms**: Tracks mentions by real name (e.g., "@John Smith") and pseudonym (e.g., "@Reviewer1")
- **Name Normalization**: Case-insensitive matching for robust detection
- **Context Aware**: Stops at punctuation and whitespace boundaries

### Author-Visible Comments
- **Visibility Filter**: Only counts comments with `visibility: "au"` or no visibility restriction
- **Complete Coverage**: Analyzes all author-visible discussions

### Comprehensive Author Mapping
- **Real Names**: Maps author real names to their email addresses
- **Pseudonyms**: Also maps pseudonyms to the same author identity
- **Canonical Identity**: Maintains real name as the canonical identifier

## Example Output

### Console Output
```
=== Papers with Multiple Author-Visible Comments ===
Found 15 papers with more than one author-visible comment:

Paper 123: "Example Paper Title"
  - 4 author-visible comments
  - Comment IDs: 456, 789, 1011, 1213

Paper 124: "Another Paper"
  - 3 author-visible comments
  - Comment IDs: 567, 890, 1122
```

### CSV Output Sample
```csv
paper_id,paper_title,author_name,author_email,mentions_count,comments_count,mentioned_as_names
123,"Example Paper","John Smith","john@example.com",2,1,"John Smith; Reviewer1"
123,"Example Paper","Jane Doe","jane@example.com",0,3,""
124,"Another Paper","Bob Wilson","bob@example.com",1,0,"Bob Wilson"
```

## Summary Statistics

The script provides comprehensive statistics including:
- Total mentions found across all comments
- Total comments made by authors
- Number of author-paper pairs with mentions
- Number of author-paper pairs with comments
- Top 10 most mentioned authors with their mention counts and aliases

## Use Cases

### Conference Management
- **Engagement Analysis**: Identify which papers have active author discussions
- **Mention Tracking**: See how often authors are referenced in peer reviews
- **Communication Patterns**: Understand author participation in the review process

### Research Insights
- **Collaboration Patterns**: Analyze mention networks between authors
- **Review Quality**: Correlate mentions with review engagement
- **Author Responsiveness**: Track author participation in discussions

## Technical Notes

- **Memory Efficient**: Processes large comment datasets without loading everything into memory
- **Robust Parsing**: Handles various mention formats and edge cases
- **Data Integrity**: Maintains referential integrity between authors, papers, and mentions
- **CSV Safety**: Properly escapes quotes and commas in CSV output

## Error Handling

- **File Validation**: Checks for valid JSON input file
- **Missing Data**: Gracefully handles missing author information
- **Malformed Mentions**: Filters out single-character or invalid mentions
- **Progress Reporting**: Provides clear feedback on processing status
