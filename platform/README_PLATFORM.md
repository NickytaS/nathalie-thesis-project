# Platform Setup Guide: MigrateOptima

This platform is built with Next.js 14+ and interacts directly with your local Docker Engine to choreograph migrations for your thesis.

## 1. Quick Install
If you are setting this up for the first time, run these commands inside the `platform` directory:

```bash
# Core Dependencies
npm install

# Migration Orchestration
npm install dockerode
npm install lucide-react

# Types for Development
npm install --save-dev @types/dockerode
```

## 2. Infrastructure Requirements
- **Docker Desktop**: Must be running.
- **Expose Docker Socket**: Ensure "Expose daemon on tcp://localhost:2375 without TLS" is **OFF** (we use the default named pipe `//./pipe/docker_engine` on Windows).

## 3. Environment Setup
The orchestrator is currently configured to look for the configuration files in:
`c:/Users/banknote/Desktop/bullshit-nofocus/config`

If you move the project, you must update the `Binds` path in `src/lib/docker-orchestrator.ts`.

## 4. Running the Dashboard
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to see the real-time migration cards.

## 5. Planned Dependencies (Phase 4 Extension)
As we expand the platform, we will add:
- `bullmq`: For background job processing.
- `ioredis`: For queue management.
- `prisma`: For database persistence of migration stats.
