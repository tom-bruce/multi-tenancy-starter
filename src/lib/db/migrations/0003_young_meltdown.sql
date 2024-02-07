DO $$ BEGIN
 CREATE TYPE "organisation_role" AS ENUM('member', 'admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "organisation_role" "organisation_role" DEFAULT 'member' NOT NULL;