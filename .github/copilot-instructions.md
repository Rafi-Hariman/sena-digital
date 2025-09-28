# Copilot Instructions for woocommerce-main

## Project Overview
- This is an Angular-based web application with a modular structure under `src/app/`.
- The project uses Angular CLI conventions but includes custom routing, guards, interceptors, and a service-oriented architecture.
- The codebase is organized by feature modules (e.g., `dashboard`, `dashboard-admin`, `generate-undangan`, `login-page`, `register`).
- Assets and global styles are in `src/assets/` and `src/styles/`.

## Key Architectural Patterns
- **Routing:**
  - Main routing is handled in `app-routing.module.ts` and `app.routing.ts`.
  - Guards (e.g., `auth.guard.ts`) protect routes and manage authentication state.
- **Services:**
  - Business logic and API calls are encapsulated in services (e.g., `dashboard.service.ts`, `toast.service.ts`).
  - Use Angular's dependency injection for service usage.
- **Interceptors:**
  - HTTP interceptors (e.g., `auth.interceptor.ts`) are used for auth token injection and error handling.
- **Component Structure:**
  - Components are grouped by feature for maintainability.
  - Shared components and utilities are in `src/app/shared/` and `src/app/components/`.

## Developer Workflows
- **Build:**
  - Use `ng build` for production builds. Configurations are in `angular.json` and `tsconfig.*.json`.
- **Serve:**
  - Use `ng serve` for local development. Proxy settings are in `proxy.conf.json` if needed.
- **Test:**
  - Run `ng test` for unit tests (see `karma.conf.js`).
- **Lint:**
  - Use Angular CLI linting or `eslint` if configured.

## Project-Specific Conventions
- **File Naming:**
  - Use kebab-case for files and folders.
  - Suffix files with `.component.ts`, `.service.ts`, `.module.ts`, etc., according to Angular standards.
- **Styling:**
  - Global styles in `src/styles/`, feature/component styles in `.scss` files alongside components.
- **Environment Config:**
  - Use `src/environments/environment.ts` and `environment.prod.ts` for environment-specific variables.

## Integration Points
- **External APIs:**
  - API endpoints and tokens are managed in environment files and services.
- **MCP Integration:**
  - `.vscode/mcp.json` configures Model Context Protocol servers for memory, everything, sequential-thinking, and fetch capabilities.

## Examples
- To add a new feature module, create a folder in `src/app/`, add a module, routing, components, and register in `app.module.ts`.
- To add a new service, place it in `src/app/services/` or the relevant feature folder, and provide it in the module or root.

## References
- Main entry: `src/main.ts`, root module: `src/app/app.module.ts`
- Routing: `src/app/app-routing.module.ts`, `src/app/app.routing.ts`
- Services: `src/app/services/`, `src/app/dashboard.service.ts`, `src/app/toast.service.ts`
- Guards/Interceptors: `src/app/auth.guard.ts`, `src/app/auth.interceptor.ts`
- MCP config: `.vscode/mcp.json`

---
If any conventions or workflows are unclear, please request clarification or examples from the project owner.
