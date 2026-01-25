$env:PGPASSWORD = "Blablade2ori@"
Get-Content  "C:\Users\gaby8\Documents\GitHub\Job-Platform\scripts\seed_jobs.sql" | & psql "host=aws-1-eu-west-1.pooler.supabase.com port=5432 dbname=postgres user=postgres.rnewhkfijcjefzyejlbc sslmode=require"
