# HotCRP Comments Export

This script (`getComments.ts`) exports all comments from a HotCRP conference system into a comprehensive JSON file with complete metadata.

## Prerequisites

1. Set up your environment variables in `.env`:
   ```
   HOTCRP_API_URL=https://your-conference.hotcrp.com/api
   HOTCRP_API_TOKEN=your_api_token_here
   ```

2. Ensure you have the necessary permissions to access comments across all papers.

## Usage

Run the script using npm:

```bash
npm run getComments
```

Or directly with tsx:

```bash
tsx src/getComments.ts
```

## Output File

The script generates a single JSON file: `comments_export_YYYY-MM-DD.json`

### File Structure

```json
{
  "export_info": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "total_papers": 150,
    "total_comments": 450,
    "total_pc_members": 50,
    "total_reviewer_assignments": 45,
    "api_base": "https://conference.hotcrp.com/api"
  },
  "comments": [
    {
      "paper_id": 123,
      "paper_title": "Example Paper Title",
      "comment_id": 456,
      "ordinal": "1",
      "visibility": "pc",
      "topic": "rev",
      "blind": false,
      "draft": false,
      "response": null,
      "by_author": false,
      "by_shepherd": false,
      "format": 0,
      "tags": "tag1 tag2",
      "author": "John Reviewer",
      "author_email": "john@example.com",
      "author_hidden": false,
      "author_pseudonym": null,
      "author_pseudonymous": false,
      "modified_at": 1642248600,
      "modified_at_text": "15 Jan 2024 10:30:00 UTC",
      "modified_at_obscured": false,
      "text": "This is the comment text...",
      "word_count": 25,
      "docs": []
    }
  ],
  "pc_members": [
    {
      "name": "John Reviewer",
      "email": "john@example.com",
      "pseudonym": null,
      "contact_id": 789
    }
  ],
  "reviewer_assignments": [
    {
      "reviewer_name": "John Reviewer",
      "reviewer_email": "john@example.com",
      "reviewer_contact_id": 789,
      "assigned_papers": [123, 124, 125]
    }
  ]
}
```

## Comment Metadata Fields

### Paper Information
- `paper_id`: Paper ID number
- `paper_title`: Title of the paper

### Comment Identity
- `comment_id`: Unique comment ID
- `ordinal`: Comment ordering within paper

### Visibility & Access
- `visibility`: Who can see the comment (`admin`, `pc`, `rev`, `au`)
- `topic`: Comment topic (`paper`, `rev`, `dec`)
- `blind`: Whether comment is anonymous
- `draft`: Whether comment is still a draft

### Author Information
- `author`: Author name (if visible)
- `author_email`: Author email (if visible)
- `author_hidden`: Whether author identity is hidden
- `author_pseudonym`: Pseudonym used (if any)
- `author_pseudonymous`: Whether using pseudonym
- `by_author`: Whether comment is by paper author
- `by_shepherd`: Whether comment is by shepherd

### Timing
- `modified_at`: Unix timestamp of last modification
- `modified_at_text`: Human-readable modification time
- `modified_at_obscured`: Whether timing is obscured

### Content
- `text`: The actual comment text
- `word_count`: Number of words in comment
- `format`: Text format indicator
- `tags`: Associated tags
- `response`: Response type (if applicable)
- `docs`: Attached documents

## PC Members

The export includes all PC members with their contact information:
- `name`: PC member's full name
- `email`: PC member's email address
- `pseudonym`: Pseudonym (if any)
- `contact_id`: Unique contact identifier

## Reviewer Assignments

The export includes paper assignments for each PC member:
- `reviewer_name`: Reviewer's full name
- `reviewer_email`: Reviewer's email address
- `reviewer_contact_id`: Unique contact identifier
- `assigned_papers`: Array of paper IDs assigned to this reviewer

**Note**: Only PC members who have at least one paper assignment are included in the reviewer_assignments list.

## How It Works

1. **Fetches Papers**: Uses `SubmissionsService.getPapers('all')` to get all papers
2. **Fetches PC Members**: Uses `UsersService.getPc()` to get all PC members
3. **Fetches Comments**: For each paper, calls `CommentsService.getComment(pid, true)` to get all comments with content
4. **Fetches Reviewer Assignments**: For each PC member, uses `SubmissionsService.getPapers('all', reviewer=email)` to find assigned papers
5. **Processes Metadata**: Extracts all available metadata fields from each comment and assignment
6. **Generates JSON**: Creates a structured JSON export with summary statistics

## Rate Limiting

The script includes a 100ms delay between API requests to be respectful to the HotCRP server.

## Summary Statistics

The script provides summary statistics including:

### Comment Statistics
- Comments by visibility level
- Comments by topic
- Number of draft comments
- Number of comments by authors
- Number of blind comments

### Reviewer Assignment Statistics
- Total reviewer assignments (PC members with papers)
- Total papers assigned across all reviewers
- Average papers per reviewer
- Maximum papers assigned to one reviewer
- Minimum papers assigned to one reviewer

## Error Handling

- Missing comments are silently skipped
- API errors for individual papers are logged but don't stop the process
- Progress is reported every 10 papers processed

## Notes

- The script preserves all metadata available in the HotCRP comment system
- Attachments are included in the `docs` field but file content is not downloaded
- The export includes both published and draft comments (if accessible)
- Timing information may be obscured based on conference settings
- Author information visibility depends on user permissions and comment settings

---

# PC Member Comment Statistics

The `pcCommentStats.ts` script analyzes the exported comments to generate statistics for each PC member.

## Usage

```bash
tsx src/pcCommentStats.ts comments_export_2025-10-24.json
```

This will generate a CSV file: `pc_comment_stats_YYYY-MM-DD.csv`

## Output Columns

The generated CSV includes the following columns for each PC member:

### Identification
- `name`: PC member's name
- `email`: PC member's email address

### Overall Statistics
- `total_comments`: Total number of comments made by this PC member
- `papers_with_comments`: Number of unique papers where this PC member has commented

### Phase-Specific Statistics

The analysis divides comments into three phases:
1. **Practice Phase** (before Sept 18, 2025)
2. **Peer Review Phase** (Sept 18-27, 2025)
3. **Discussion Phase** (after Sept 27, 2025)

For each phase:
- `practice_comments` / `peer_review_comments` / `discussion_comments`: Number of comments in this phase
- `practice_papers` / `peer_review_papers` / `discussion_papers`: Number of unique papers commented on in this phase

### Assignment Statistics
- `papers_assigned`: Total number of papers assigned to this PC member for review (excludes papers 1-4, which are special/practice papers)
- `papers_assigned_without_comments`: Number of assigned papers where the PC member has not made any comments during the discussion phase (excludes papers 1-4)
- `uncommented_paper_1`, `uncommented_paper_2`, etc.: Paper IDs for each paper assigned but not commented on during discussion phase (number of columns equals the maximum number of uncommented papers across all PC members)

## Summary Statistics

The script also prints summary statistics including:
- Overall participation rates
- Average comments per PC member
- Phase-based participation rates
- Top commenters by phase
- Members without comments
