-- Phase 3E: Add @unique constraint to UserStory.jiraId
-- Enables upsert-based de-duplication when syncing stories from Jira
-- (prevents duplicate rows on re-sync via POST /api/jira/stories/:projectId)

CREATE UNIQUE INDEX IF NOT EXISTS "UserStory_jiraId_key" ON "UserStory"("jiraId");
