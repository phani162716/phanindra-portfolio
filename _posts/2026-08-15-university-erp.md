---
title: "University ERP: the whole loop in one repo"
excerpt: "A student portal that covers login, academics, fees, and a hall ticket you can verify with a QR code."
categories:
  - projects
tags:
  - erp
  - typescript
  - react
  - prisma
toc: true
---

University software is usually a spreadsheet, a 2005 portal, or five vendors that do not talk to each other. I wanted one system that covers the loop a student actually walks: login, register, attend, pay, sit the exam, print the hall ticket.

The result is [university-erp-portal](https://github.com/phani162716/university-erp-portal).

## Stack

| Layer | Choice |
| --- | --- |
| UI | React, TypeScript, Tailwind |
| API | Express |
| Data | Prisma, SQLite locally, PostgreSQL / Supabase when deployed |
| Auth | JWT, bcrypt, RBAC, login rate limits |
| Docs | PDF hall tickets, fee receipts, bonafide certificates |

Dark mode is the default. The layout works on a phone.

## Roles

The interesting part is not the dashboard cards. It is who is allowed to touch what.

- **Student** — profile, academics, registration, timetable, attendance, exams, results, fees, hostel, transport, assignments, documents
- **Faculty** — roster, mark attendance, assignments
- **Admin** — stats, people/course overview, audit logs

The role enum also has room for exam, finance, hostel, transport, and HR. I would rather have the names now than pretend a single `admin` flag will last.

## Documents and QR

A hall ticket that cannot be checked is just a PDF. Generated documents get a public verification path at `/verify/:id`. Scan the code, see whether the paper is real.

That one feature changes how the rest of the app feels. The system is no longer only for people already logged in. It has an edge that faces the world.

## What I refused to skip

- Passwords are hashed. They never come back out of the API.
- Login is rate-limited.
- Responses strip `passwordHash`.
- Audit logs exist for admin work.

None of that is impressive. All of it is the difference between a coursework demo and something you could hand to a college.

## Run it

```bash
npm install
cd server
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

Frontend on `:5173`, API on `:5000`. Demo accounts are in the README. Do not use those passwords anywhere else.

## What I will write next

The schema. Why student records, fee ledgers, and document verification do not belong in the same vague `User` blob — and what happens when you try.
