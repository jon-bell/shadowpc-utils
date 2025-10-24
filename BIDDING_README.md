# HotCRP Bidding Data Export

This script (`getBidding.ts`) exports review preferences (bidding data) from a HotCRP conference system into CSV format.

## Prerequisites

1. Set up your environment variables in `.env`:
   ```
   HOTCRP_API_URL=https://your-conference.hotcrp.com/api
   HOTCRP_API_TOKEN=your_api_token_here
   ```

2. Ensure you have the necessary permissions to access PC member data and review preferences.

## Usage

Run the script using npm:

```bash
npm run getBidding
```

Or directly with tsx:

```bash
tsx src/getBidding.ts
```

## Output Files

The script generates two CSV files with timestamps:

### 1. Wide CSV (`bidding_wide_YYYY-MM-DD.csv`)

Contains one row per paper with columns:
- `paper_id`: Paper ID
- `paper_title`: Paper title
- `bidder_1_name`, `bidder_1_email`, `bidder_1_preference`: First bidder's details
- `bidder_2_name`, `bidder_2_email`, `bidder_2_preference`: Second bidder's details
- ... (continues for all bidders)

Bidders are sorted by preference value (highest first).

### 2. Summary CSV (`bidding_summary_YYYY-MM-DD.csv`)

Contains one row per PC member with columns:
- `name`: PC member name
- `email`: PC member email
- `total_preferences`: Total number of papers they expressed preferences for
- `positive_preferences`: Number of papers with positive preference values

## How It Works

1. **Fetches PC Members**: Uses `UsersService.getPc()` to get all program committee members
2. **Fetches Papers**: Uses `SubmissionsService.getPapers('all')` to get all papers
3. **Fetches Preferences**: For each paper, calls `ReviewPreferencesService.getRevpref(pid)` once to get all preferences for that paper
4. **Generates CSVs**: Processes the data into two different CSV formats

## Rate Limiting

The script includes a 100ms delay between API requests to be respectful to the HotCRP server. This is much more efficient than the previous approach as it makes only one API call per paper instead of one per paper-reviewer combination.

## Error Handling

- Missing preferences are silently skipped (many paper-reviewer combinations may not have explicit preferences)
- API errors are logged but don't stop the entire process
- Progress is reported every 10 papers processed

## Notes

- Preference values are typically integers where positive values indicate interest and negative values indicate conflicts or lack of interest
- The script handles CSV escaping for names and titles that contain quotes or commas
- Files are saved in the current working directory with date stamps to avoid overwrites
