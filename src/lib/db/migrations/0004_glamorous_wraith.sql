DO $$ BEGIN
 CREATE TYPE "invite_status" AS ENUM('pending', 'used', 'expired', 'revoked');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organisation_invites" (
	"id" varchar PRIMARY KEY NOT NULL,
	"invite_token" varchar NOT NULL,
	"email" varchar NOT NULL,
	"status" "invite_status" DEFAULT 'pending' NOT NULL,
	"organisation_id" varchar NOT NULL,
	"invited_by_user_id" varchar NOT NULL,
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organisation_invites" ADD CONSTRAINT "organisation_invites_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organisation_invites" ADD CONSTRAINT "organisation_invites_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
