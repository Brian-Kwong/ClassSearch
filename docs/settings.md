# Settings

Once logged in, you can access the settings menu by clicking the gear icon in the bottom right corner of the application window. This will open the settings dialog where you can customize various aspects of the application.

## Caching

By default the application caches results for improve performance and reduce number of API requests to your institution. Cached results are stored in the application user data directory. You can chose what to cache and duration of different cache results in this menu.

### Enable Caching

Global switch to enable or disable caching for the application.

### Cache Duration

You can set the duration of each cache type. The following cache types are available:

- **Course Data Caching Duration**: How long (in minutes) are course search results cached. After this duration, new searches will fetch fresh data will be requested from your institution.
- **Professor Ratings Caching Duration**: How long (in days) are professor ratings are cached. After this duration, new searches will fetch fresh professor ratings from Rate My Professor or PolyRatings.
- **Class Details Caching Duration**: How long (in days) are detailed class information (such as course description, prerequisites, etc) are cached. After this duration, new searches will fetch fresh class details from your institution.
- **Max Number of Search History Entries**: The maximum number of previous search queries to store in history. Older entries will be removed when this limit is reached.

### Clear Cache

Button to clear all cached data immediately. This will remove all cached course data, professor ratings, and class details regardless of their individual cache durations.

## View Settings

- **Results Per Page**: Set the number of search results to display per page. Increasing this number may improve browsing efficiency but could impact performance on slower devices.

- **Prefetch when Hovering**: When enabled, hovering over a course card in the search results will prefetch additional details about that course. This can make viewing course details faster, but may increase data usage.

- **Prefetch Delay**: Set the delay (in milliseconds) before prefetching course details when hovering over a course card. A shorter delay will make details load faster, but may lead to unnecessary data usage if you frequently hover over cards without clicking.

## Other Settings

- **Dark Mode**: Toggle between light and dark themes for the application interface. By default, the application will follow your system's dark mode preference.

- **Auto Check for Updates**: When enabled, the application will automatically check for updates on startup. If a new version is available, you will be notified[^1].

[^1]: Automatic updates are not currently supported. You will need to manually download and install the latest version from the [releases page](https://github.com/yourusername/yourrepository/releases).
