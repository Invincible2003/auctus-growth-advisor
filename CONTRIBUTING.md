# Contributing to AUCTUS
*Brand Owner: Made by Aryan Pandey*

We welcome contributions to AUCTUS! Please review these guidelines before submitting a pull request.

## 🤝 Workflow & Branching
1. Fork the repository and create your feature branch:
   `git checkout -b feature/amazing-feature`
2. Commit your changes with descriptive messages matching standard commit structures:
   - `feat: add ARIMA sales forecasting option`
   - `fix: correct layout alignment on mobile gauge`
3. Push to your branch and submit a Pull Request.

## ⚙️ Development Guidelines
### Python Backend (FastAPI)
- Write all routes inside `backend/app/api/`.
- Ensure all business operations register audit logs to the `audit_logs` table.
- Adhere to PEP 8 standards. Run tests using `pytest` inside the `backend` folder before submitting.

### React Frontend
- Adhere to the Tailwind-blue/cyan dark theme styling. Use glassmorphism variables.
- Write React components in TypeScript using `.tsx`.
- Double check that your code passes TypeScript lint and builds with `npm run build` inside `frontend`.
