# Atulyam ClinicPro v2

Production hospital management system for **Atulyam Hospital**.

## Core modules

- Hospital dashboard and operational overview
- Patient registration, search and history
- OPD consultation and prescription workflow
- IPD admission, ward/bed management and clinical care
- IPD vitals, clinical notes, medications and investigations
- Discharge summary and discharge workflow
- IPD billing, charges, payments and receipts
- Laboratory orders, sample collection and reporting workflow
- Medicine master and prescription integration
- Disease templates
- Staff management and secure staff login
- GPS-based attendance and administrator corrections
- Staff performance dashboard
- Attendance and operational reports
- Hospital settings and printable clinical documents

## Technology

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Prisma 7 + PostgreSQL
- Supabase/PostgreSQL-compatible database
- bcryptjs for password verification
- HTTP-only staff session cookies

## Local development

```bash
npm install
npm run dev
```

The development server normally runs at `http://localhost:3000` (or the port selected by Next.js).

## Validation

Run the production code-quality checks before deployment:

```bash
npm run typecheck
npm run lint
npm run check
npm run build
```

## Production environment

Configure `DATABASE_URL` in the deployment environment. Never commit `.env` files, database credentials, session secrets, passwords, or patient data.

The application uses PostgreSQL through the Prisma PostgreSQL adapter. Do not reset or replace the production database during routine deployments.

## Health check

After deployment, open:

`/api/health`

A healthy response reports both the application and database as available. A database failure returns HTTP 503.

## Security notes

- Staff routes and staff APIs require a valid server-side staff session.
- Staff passwords are stored as bcrypt hashes rather than plaintext passwords.
- Staff sessions use hashed random tokens and expire automatically.
- API responses are configured as non-cacheable.
- Production security headers are enabled by Next.js configuration.
- The obsolete SQLite backup endpoint is intentionally not exposed; production data is PostgreSQL data and must be backed up using the database provider's supported backup/export mechanism.
- GPS attendance verifies the submitted location against the configured hospital location, but browser GPS cannot be treated as tamper-proof identity verification.

## Deployment checklist

1. Confirm `DATABASE_URL` points to the intended production database.
2. Run `npm run check` locally.
3. Run `npm run build` locally before a major deployment.
4. Deploy without destructive database commands.
5. Verify `/api/health` returns HTTP 200.
6. Test administrator login.
7. Test staff login/logout and session expiry.
8. Test patient → OPD → prescription/print.
9. Test patient → IPD → clinical workflow → billing → discharge.
10. Test laboratory order → collection → result/report.
11. Test attendance check-in/check-out and administrator correction.
12. Confirm reports and dashboard numbers use the live production database.

## Hospital

**Atulyam Hospital**  
Nagra Road, Near Garwar Police Station, Ballia, Uttar Pradesh  
Phone: 9162981453
