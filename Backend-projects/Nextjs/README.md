# GitConnect — Next.js + TypeScript + Tailwind + Appwrite

GitConnect is a small social network for developers (profiles, posts, comments, likes). This repository is a near-complete implementation using Next.js (TypeScript), Tailwind CSS and Appwrite for the backend.

This README covers:
- Local setup
- Required Appwrite setup (collections + fields)
- Environment variables
- Deploying to Vercel (step-by-step)
- Post-deploy checklist and placeholders for your live URL and GitHub repository

If you want, I can complete the Appwrite collection creation automatically using the Appwrite CLI or provide ready-to-run serverless functions; tell me which you prefer.

---

Local setup
1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` at the project root and add the variables listed in the next section.

3. Run the dev server:

```bash
npm run dev
```

Open http://localhost:3000 to preview.

Environment variables (required)
Create `.env.local` with at least:

- NEXT_PUBLIC_APPWRITE_ENDPOINT — Appwrite endpoint, e.g. https://cloud.appwrite.io or your self-hosted URL
- NEXT_PUBLIC_APPWRITE_PROJECT — Appwrite project ID
- NEXT_PUBLIC_APPWRITE_DATABASE — Appwrite database ID used for collections
- NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILES — Collection ID for developer profiles
- NEXT_PUBLIC_APPWRITE_COLLECTION_POSTS — Collection ID for posts
- NEXT_PUBLIC_APPWRITE_COLLECTION_COMMENTS — Collection ID for comments

Optional: any additional Appwrite keys you create for server-side functions.

Appwrite setup (quick guide)
1. Create an Appwrite project through the Console.
2. Create a Database (note its ID) and create the following collections (schema suggestions below):

Profiles collection (profiles)
- name: String
- bio: Text
- location: String
- githubUsername: String
- userId: String (stores Appwrite user id)

Posts collection (posts)
- body: Text
- author: String
- likes: Integer (default 0)
- dislikes: Integer (default 0)
- createdAt: DateTime

Comments collection (comments)
- postId: String (store post document id)
- text: Text
- createdAt: DateTime

Make sure the collection IDs you create are the values you put in `.env.local`.

Serverless functions (recommended)
- To avoid race conditions in likes/dislikes and to fetch GitHub repos without exposing secrets or hitting rate limits on client, consider adding Appwrite serverless functions. Example functions:
	- fetch-github-repos: given a GitHub username, returns repos (server-side cached)
	- inc-post-like: safely increments like count for a post (atomic)

I can provide these functions as Node.js handlers if you want them added.

Deployment to Vercel (step-by-step)
1. Commit and push your repository to GitHub (or another Git provider).

```bash
git add .
git commit -m "Add GitConnect scaffold"
git push origin main
```

2. Create a Vercel account and click "New Project" → Import Git Repository (select this repository).

3. In the Vercel project settings, under Environment Variables, add the same variables from your `.env.local`:

- NEXT_PUBLIC_APPWRITE_ENDPOINT
- NEXT_PUBLIC_APPWRITE_PROJECT
- NEXT_PUBLIC_APPWRITE_DATABASE
- NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILES
- NEXT_PUBLIC_APPWRITE_COLLECTION_POSTS
- NEXT_PUBLIC_APPWRITE_COLLECTION_COMMENTS

4. Build settings (Vercel detects Next.js automatically). Default build command is:

```
npm run build
```

and the output will be served by Vercel automatically.

5. Deploy. Vercel will run the build and publish the site to a domain like `https://your-project.vercel.app`.

Updating README with live URL and repo link
Once deployed, update the placeholders below with the real values.

- Live site: REPLACE_WITH_LIVE_URL
- GitHub repo: REPLACE_WITH_GITHUB_REPO

Post-deploy checklist
- Verify environment variables are correctly set on Vercel.
- Ensure Appwrite CORS allows requests from your deployed app URL (set in Appwrite console).
- Create sample data in Appwrite Console (profiles, posts, comments) or register users via the signup page.

Troubleshooting
- If you get 401/403 from Appwrite: confirm project ID and endpoint, and check CORS settings.
- If like/dislike counts behave inconsistently under load: migrate increment logic to an Appwrite serverless function to ensure atomic updates.

Example: Add the environment variables locally (macOS / Linux)

```bash
cat > .env.local <<EOF
NEXT_PUBLIC_APPWRITE_ENDPOINT="https://cloud.appwrite.io"
NEXT_PUBLIC_APPWRITE_PROJECT="your_project_id"
NEXT_PUBLIC_APPWRITE_DATABASE="your_database_id"
NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILES="your_profiles_collection_id"
NEXT_PUBLIC_APPWRITE_COLLECTION_POSTS="your_posts_collection_id"
NEXT_PUBLIC_APPWRITE_COLLECTION_COMMENTS="your_comments_collection_id"
EOF
```

Need me to deploy?
- I can deploy this repository to Vercel for you if you provide either: (A) repository access or (B) confirm you want me to create the Vercel project steps and I will supply the exact commands and step-by-step checklist.

---

If you want, next I'll:
- Add serverless example functions (safe likes & GitHub fetching)
- Add structured education/experience editing UI on the profile (arrays with add/remove)
- Wire automated tests and a CI step

When you're ready, tell me if you'd like me to deploy the app to Vercel (I can provide a deployment PR and step instructions) or if you'd like to handle deployment locally and paste the live URL here so I can update the README.

